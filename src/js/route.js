import { parse, stringify } from 'qs';

function partition(array, test) {
    return array.reduce(([pass, fail], value) => {
        return test(value) ? [[...pass, value], fail] : [pass, [...fail, value]];
    }, [[], []]);
}

function extractSegments(template) {
    return template.match(/{[^}?]+\??}/g)?.map((segment) => ({
        name: segment.replace(/{|\??}/g, ''),
        optional: /\?}$/.test(segment),
    })) ?? [];
};

/**
 * Extract values from a hydrated path/URL given its template and delimiter.
 * @param {string} hydrated - Path or URL, e.g. `/venues/1/events/5`.
 * @param {string} template - Template, e.g.`/venues/{venue}/events/{event?}`.
 * @param {string} delimiter - Template delimiter, e.g. `/`.
 * @return {Object} Parameter values, e.g. `{ venue: 1, event: 5 }`.
 */
function dehydrate(hydrated, template = '', delimiter) {
    const [values, segments] = [hydrated, template].map(s => s.split(delimiter));

    // Replace each parameter segment in the template with its value in the hydrated string
    return segments.reduce((result, current, i) => {
        return /^{[^}?]+\??}$/.test(current) && values[i]
            ? { ...result, [current.replace(/^{|\??}$/g, '')]: values[i] }
            : result;
    }, {});
}


function substituteBindings(params, bindings = {}) {
    return Object.entries(params).reduce((result, [key, value]) => {
        return {
            ...result,
            [key]: (bindings[key] && value && typeof value === 'object') ? value[bindings[key]] : value,
        };
    }, {})
}

class Router extends String {
    name = undefined;
    route = undefined;
    bindings = {};
    relative = false;

    config = {};

    urlParams = {};
    queryParams = {};

    constructor(name, params, absolute = true, config) {
        super();

        this.name = name;
        this.relative = !absolute;
        this.config = config ?? Ziggy;
        this.ziggy = this.config; // v0.9

        if (name) {
            if (!this.config.namedRoutes[this.name]) {
                throw new Error(`Ziggy error: route '${this.name}' is not in the route list.`);
            }

            this.route = this.config.namedRoutes[this.name];
            this.bindings = this.route.bindings ?? {};
            this.urlParams = this._parseParameters(this.route, params);
        }
    }

    _parseParameters(route, params = {}) {
        // If 'params' is a single string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        let defaults, segments;

        if (route) {
            [defaults, segments] = partition(
                extractSegments(this._template(route)),
                ({ name }) => Object.keys(this.config.defaultParameters).includes(name)
            );

            defaults = defaults.reduce((result, { name }, i) => ({ ...result, [name]: this.config.defaultParameters[name] }), {});
        }

        // If there is only one template segment, and the parameters are an object, that object is
        // ambiguous—it could be parameter keys and values, or it could just be the one parameter
        // itself. We can inspect it to find out, and if it's the parameter itself, we wrap it
        // in an object with its key.
        if (
            segments?.length === 1
            && !Object.keys(params).includes(segments[0].name)
            && Object.keys(params).includes(Object.values(this.bindings)[0])
        ) {
            params = { [segments[0].name]: params };
        }

        // If the parameters are an array they have to be in order, so we can transform them into
        // an object by just keying them with the template segments in the order they appear
        return Array.isArray(params)
            ? params.reduce((result, current, i) => ({ ...result, [segments[i].name]: current }), defaults)
            : { ...defaults, ...params };
    }

    /**
     * Get the origin of the URI for this Ziggy instance (everything before the path).
     *
     * @return {string} the URI origin
     */
    _origin(route = this.route) {
        // If we're building a relative URL, there is no origin
        if (this.relative) {
            return '';
        }

        // If the route has a domain defined, construct the origin based on the route definition and Ziggy's config
        if (route?.domain) {
            return `${this.config.baseProtocol}://`
                + route.domain.replace(/\/$/, '')
                + (this.config.basePort ? `:${this.config.basePort}` : '');
        }

        // Otherwise, the origin is the app domain (Ziggy's 'baseUrl')
        return this.config.baseUrl.replace(/\/$/, '');
    }

    _template(route = this.route) {
        return `${this._origin(route)}/${route.uri.replace(/^\//, '')}`;
    }

    withQuery(params) {
        this.queryParams = { ...this.queryParams, ...params };
        return this;
    }

    _compile() {
        const template = this._template();
        const segments = extractSegments(template);

        // Return early if there's nothing to replace (e.g. '/' or '/posts')
        if (!segments.length) {
            return template;
        }

        const params = substituteBindings(this.urlParams, this.bindings);

        return template.replace(/{([^}?]+)\??}/g, (_, segment) => {
            if (!segments.find(({ name }) => name === segment).optional && [null, undefined].includes(params[segment])) {
                throw new Error(`Ziggy error: '${segment}' parameter is required for route '${this.name}'.`);
            }

            return encodeURIComponent(params[segment] ?? '');
        }).replace(/\/$/, '');
    }

    _compileQuery() {
        let diff = Object.keys(this.urlParams).filter((key) => !extractSegments(this._template()).some(s => s.name === key));
        let remainingParams = diff.reduce((result, current) => ({ ...result, [current]: this.urlParams[current] }), this.queryParams);

        return stringify(remainingParams, {
            encodeValuesOnly: true,
            skipNulls: true,
            addQueryPrefix: true,
            arrayFormat: 'indices',
        });
    }

    /**
     * Get the name of the route matching the current URL, or check whether the given named route matches.
     * @param {string} name - The route name to check.
     * @param {(Object|Array|string|number)} params - Parameter values to check in addition to the route name.
     * @param {boolean} exact - Whether all current parameters must be passed in order to match.
     * @return {(string|boolean)} The name of the current route, or whether the given route name matches.
     */
    current(name, params, exact = false) {
        const url = (({ host, pathname }) => `${host}${pathname}`.replace(/\/?$/, ''))(window.location);

        // Find the first route in Ziggy's list of named routes that matches the current URL
        const [current, route] = Object.entries(this.config.namedRoutes)
            // Ignore POST, PATCH, etc. because we can't be currently 'on' them in a browser
            .filter(([_, route]) => route.methods.includes('GET'))
            .find(([_, route]) => {
                // Transform this route's template into a regex that will match a hydrated URL, by
                // replacing its segments with matchers for (optional) path segment values
                const pattern = this._template(route)
                    .replace(/\/{[^}?]*\?}/g, '(\/[^/?]+)?')
                    .replace(/{[^}]+}/g, '[^/?]+')
                    .replace(/\/?$/, '')
                    .split('://').pop();

                // Test the pattern against the current URL, ignoring the protocol and query,
                // e.g. `ziggy.dev/posts/[^/?]+/tags(/[^/?]+)?` vs. ziggy.dev/posts/12/tags/javascript
                return new RegExp(`^${pattern}$`).test(url.split('?').shift());
            });

        // If no name was passed, return the name of the current route
        if (!name) {
            return current;
        }

        // Perform basic wildcard substitution on the passed name, so that e.g. `events.*` matches `events.show`
        const match = new RegExp(`^${name.replace('.', '\\.').replace('*', '.*')}$`).test(current);

        // Check whether the parameter values for the current URL match those passed to `current()`. If
        // the `exact` flag was enabled, ensure that *all* current parameters were passed.
        if (match && params) {
            params = substituteBindings(this._parseParameters(route, params), route.bindings);

            return Object.entries(this._getParams(route)).every(([key, value]) => {
                return exact ? params[key] == value : (params[key] == value || !params.hasOwnProperty(key));
            });
        }

        return match;
    }

    /**
     * Check whether the given named route exists.
     * @param {string} name - The route name to search for.
     * @return {boolean} Whether the route exists.
     */
    has(name) {
        return Object.keys(this.config.namedRoutes).includes(name);
    }

    /**
     * Get all the parameters and their values for the current URL, given the matching route.
     * @param {Object} route - Ziggy route definition object.
     * @return {Object} Parameters.
     */
    _getParams(route) {
        let pathname = window.location.pathname
            .replace(this.config.baseUrl.split('://')[1].split('/')[1], '') // remove subdirectories
            .replace(/^\/+/, '');

        return {
            ...dehydrate(window.location.host, route.domain, '.'), // domain parameters
            ...dehydrate(pathname, route.uri, '/'), // route parameters
            ...parse(window.location.search?.replace(/^\?/, '')) // query parameters
        };
    }

    /**
     * Get all the parameters and values for the current URL.
     * @return {Object} Parameters.
     */
    get params() {
        return this._getParams(this.config.namedRoutes[this.current()]);
    }

    url() {
        return this._compile() + this._compileQuery();
    }

    toString() {
        return this.url();
    }

    valueOf() {
        return this.url();
    }

    /**
     * @deprecated Pass parameters as the second argument to `route()`.
     */
    with(params) {
        this.urlParams = this._parseParameters(this.route, params);
        return this;
    }

    /**
     * @deprecated Use `has()` instead.
     */
    check(name) {
        return this.has(name);
    }

    /**
     * @deprecated Call `url()` directly.
     */
    parse() {
        return this.url();
    }

    /**
     * @deprecated
     */
    trimParam(param) {
        return param.replace(/{|\??}/g, '');
    }

    /**
     * @deprecated
     */
    extractParams(hydrated, template, delimiter) {
        return dehydrate(hydrated, template, delimiter);
    }
}

export default function route(name, params, absolute, config) {
    return new Router(name, params, absolute, config);
}

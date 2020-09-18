import { parse, stringify } from 'qs';

/**
 * Given a Laravel route URI, extract an array of segment 'tokens' with
 * each parameter's name and whether it's optional.
 */
function extractSegments(template) {
    return template.match(/{[^}?]+\??}/g)?.map((segment) => ({
        name: segment.replace(/{|\??}/g, ''),
        optional: /\?}$/.test(segment),
    })) ?? [];
};

/**
 * Given the hydrated string, template, and delimiter, extract parameter values
 * from part of a path or URL.
 *
 * E.g. dehydrate('bar/baz', '{foo}/{bing?}', '/') -> { foo: 'bar', bing: 'baz' }
 */
function dehydrate(hydrated, template = '', delimiter) {
    const [values, segments] = [hydrated, template].map(s => s.split(delimiter));

    // Return an object of parameter names and values, ignoring
    // values that don't correspond to a route segment
    return segments.reduce((result, current, i) => {
        return /^{[^}?]+\??}$/.test(current) && values[i]
            ? { ...result, [current.replace(/^{|\??}$/g, '')]: values[i] }
            : result;
    }, {});
}

/**
 * Given parameters and bindings, flatten the parameters into
 * an object where all the values are strings or integers.
 */
function substituteBindings(params, bindings = {}) {
    return Object.entries(params).reduce((result, [key, value]) => {
        // Check if the binding key is in the object, if not throw smth like 'key `id` missing from object passed as `event` prop to route `events.venues.show`' -- test for this too!

        const bound = value && typeof value === 'object' && bindings[key];

        if (bound && !value.hasOwnProperty(bindings[key])) {
            throw new Error(`Ziggy error: for parameter '${key}' is missing route model binding key ${bindings[key]}.`)
        }

        return { ...result, [key]: bound ? value[bindings[key]] : value };
    }, {})
}

class Router extends String {
    name = undefined;
    relative = false;
    config = {};

    route = undefined;

    urlParams = {};
    queryParams = {};

    constructor(name, params, absolute = true, config) {
        super();

        this.name = name;
        this.relative = !absolute;
        this.config = config ?? Ziggy;

        if (name) {
            if (!this.config.namedRoutes[this.name]) {
                throw new Error(`Ziggy error: route '${this.name}' is not in the route list.`);
            }

            this.route = this.config.namedRoutes[this.name];
            this.urlParams = this._parseParameters(params);
        }
    }

    /**
     * Parse route parameters into a simple object.
     */
    _parseParameters(params = {}, route = this.route) {
        // If 'params' is a string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        // Partition the segments into those with default values and those without
        let [defaults, segments] = extractSegments(this._template(route)).reduce(([defaults, segments], value) => {
            return Object.keys(this.config.defaultParameters).includes(value.name)
                ? [[...defaults, value], segments]
                : [defaults, [...segments, value]];
        }, [[], []]);

        defaults = defaults.reduce((result, { name }, i) => ({ ...result, [name]: this.config.defaultParameters[name] }), {});

        if (Array.isArray(params)) {
            // If the parameters are an array they have to be in order, so we can transform them into
            // an object by just keying them with the template segments in the order they appear
            params = params.reduce((result, current, i) => ({ ...result, [segments[i].name]: current }), defaults);
        } else if (segments.length === 1 && !params[segments[0].name] && params[Object.values(route.bindings ?? {})[0]]) {
            // If there is only one template segment and the parameters are an object, that object is
            // ambiguous—it could be parameter keys and values, or it could just be the one parameter
            // itself; we can inspect it to find out, and if it's the parameter itself, we wrap it
            // in an object with its key
            params = { [segments[0].name]: params };
        }

        return substituteBindings({ ...defaults, ...params }, route.bindings);
    }

    /**
     * Get the origin template for the given route.
     */
    _origin(route = this.route) {
        // If we're building a relative URL, there is no origin
        if (this.relative) {
            return '';
        }

        // If the route has a domain defined, construct the origin
        // based on the config and route definition
        if (route.domain) {
            return `${this.config.baseProtocol}://`
                + route.domain.replace(/\/$/, '')
                + (this.config.basePort ? `:${this.config.basePort}` : '');
        }

        // Otherwise, the origin is the app domain
        return this.config.baseUrl.replace(/\/$/, '');
    }

    /**
     * Get the complete URL template for the given route.
     */
    _template(route = this.route) {
        return `${this._origin(route)}/${route.uri.replace(/^\//, '')}`;
    }

    /**
     * Compile the URL.
     */
    _compile() {
        const template = this._template(this.route);
        const segments = extractSegments(template);

        // Return early if there's nothing to replace (e.g. '/' or '/posts')
        if (!segments.length) {
            return template;
        }

        return template.replace(/{([^}?]+)\??}/g, (_, segment) => {
            // Error if a required parameter is missing
            if (!segments.find(({ name }) => name === segment).optional && [null, undefined].includes(this.urlParams[segment])) {
                throw new Error(`Ziggy error: '${segment}' parameter is required for route '${this.name}'.`);
            }

            return encodeURIComponent(this.urlParams[segment] ?? '');
        }).replace(/\/$/, '');
    }

    /**
     * Compile the query string.
     */
    _compileQuery() {
        const segments = extractSegments(this._template(this.route));

        // Get passed parameters that do NOT correspond to route segments
        const unhandled = Object.keys(this.urlParams)
            .filter((key) => !segments.some(({ name }) => name === key))
            .reduce((result, current) => ({ ...result, [current]: this.urlParams[current] }), this.queryParams);

        return stringify(unhandled, {
            addQueryPrefix: true,
            arrayFormat: 'indices',
            encodeValuesOnly: true,
            skipNulls: true,
        });
    }

    /**
     * Given its route definition, extract all parameters from the current URL.
     */
    _getParametersFromCurrentUrl(route) {
        let pathname = window.location.pathname
            .replace(this.config.baseUrl.split('://')[1].split('/')[1], '') // remove subdirectories
            .replace(/^\/+/, '');

        return {
            ...dehydrate(window.location.host, route.domain, '.'), // domain parameters
            ...dehydrate(pathname, route.uri, '/'), // route parameters
            ...parse(window.location.search?.replace(/^\?/, '')), // query parameters
        };
    }

    /**
     * Get the name of the route matching the current URL, or, given a route name
     * and parameters, check if the current URL and parameters match that route.
     */
    current(name, params) {
        const url = (({ host, pathname }) => `${host}${pathname}`.replace(/\/$/, ''))(window.location);

        // Find the first named route that matches the current URL, ignoring
        // POST, PATCH, etc. because we can't be 'on' them in a browser
        const [current, route] = Object.entries(this.config.namedRoutes)
            .filter(([_, route]) => route.methods.includes('GET'))
            .find(([_, route]) => {
                // Transform the route's template into a regex that will match a hydrated URL, by
                // replacing its *segments* with matchers for path segment *values*
                const pattern = this._template(route)
                    .replace(/\/{[^}?]*\?}/g, '(\/[^/?]+)?')
                    .replace(/{[^}]+}/g, '[^/?]+')
                    .replace(/\/$/, '')
                    .split('://').pop();

                // Test the pattern against the current URL, ignoring the protocol and query,
                // e.g. `ziggy.dev/posts/[^/?]+/tags(/[^/?]+)?` vs. `ziggy.dev/posts/12/tags/javascript`
                return new RegExp(`^${pattern}$`).test(url.split('?').shift());
            });

        // If no name was passed, return the name of the current route
        if (!name) {
            return current;
        }

        // Test the passed name against the current route, matching some basic
        // wildcards so that `events.*` matches `events.show`, etc.
        const match = new RegExp(`^${name.replace('.', '\\.').replace('*', '.*')}$`).test(current);

        // If parameters were passed, check that their values match in the current URL
        if (match && params) {
            params = this._parseParameters(params, route);

            return Object.entries(this._getParametersFromCurrentUrl(route)).every(([key, value]) => {
                return params.hasOwnProperty(key) ? params[key] == value : true;
            });
        }

        return match;
    }

    /**
     * Extract all parameters from the current URL.
     */
    get params() {
        return this._getParametersFromCurrentUrl(this.config.namedRoutes[this.current()]);
    }

    /**
     * Check whether the given named route exists.
     */
    has(name) {
        return Object.keys(this.config.namedRoutes).includes(name);
    }

    /**
     * Append query parameters.
     */
    withQuery(params) {
        this.queryParams = { ...this.queryParams, ...params };

        return this;
    }

    /**
     * Get the compiled URL.
     */
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
        this.urlParams = this._parseParameters(params);

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
     * @deprecated Use the regex directly.
     */
    trimParam(param) {
        return param.replace(/{|\??}/g, '');
    }

    /**
     * @deprecated Implement your own version of `dehydrate()`.
     */
    extractParams(hydrated, template, delimiter) {
        return dehydrate(hydrated, template, delimiter);
    }
}

export default function route(name, params, absolute, config) {
    return new Router(name, params, absolute, config);
}

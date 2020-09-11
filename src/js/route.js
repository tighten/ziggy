import { parse, stringify } from 'qs';

function partition(array, test) {
    return array.reduce(([pass, fail], value) => {
        return test(value) ? [[...pass, value], fail] : [pass, [...fail, value]];
    }, [[], []]);
}

function extractSegments(template) {
    return template
        .match(/{[^}?]+\??}/g)
        ?.map((segment) => ({
            name: segment.replace(/{|\??}/g, ''),
            optional: /\?}$/.test(segment),
        })) ?? [];
};

class Router extends String {
    constructor(name, params, absolute = true, customZiggy) {
        super();

        this.name = name;
        this.relative = !absolute;
        this.ziggy = customZiggy ?? Ziggy;

        if (this.name && !this.ziggy.namedRoutes[this.name]) {
            throw new Error(`Ziggy Error: route '${this.name}' is not found in the route list`);
        }

        this.route = this.ziggy.namedRoutes[this.name];
        this.bindings = this.ziggy.namedRoutes[this.name]?.bindings;
        this.urlParams = this._parseParameters(this.route, params);
        this.queryParams = {};
        this.hydrated = '';
    }

    _parseParameters(route, params = {}) {
        // If 'params' is a single string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        let defaults, segments;

        if (route) {
            [defaults, segments] = partition(
                extractSegments(this._compileTemplate(route)),
                (s) => Object.keys(this.ziggy.defaultParameters).includes(s.name)
            );

            defaults = defaults.reduce((result, current, i) => ({ ...result, [current.name]: this.ziggy.defaultParameters[current.name] }), {});
        }

        // We need an early strategy for determining if a key is 'missing' or if it just appears to be,
        // based on the shape of the parameters object passed in.
        // -> If there is more than one segment and the params are one object, that object must have keys for every segment
        // -> If there's only one segment (AND for each individual segment if there are many)...
        //      -> If it HAS a binding registered and the params are an object, that object MUST have the binding key
        //      -> If it does NOT have a binding registered, the params CANNOT be an object

        if (segments?.length === 1
            && !Object.keys(params).includes(segments[0].name)
            && Object.keys(params).includes(Object.values(this.bindings ?? {})[0])
        ) {
            params = { [segments[0].name]: params };
        }

        // If the parameters are an array they have to be in order, so we can
        // transform them into an object simply by keying them with the route
        // template segments in the order they appear
        return Array.isArray(params)
            ? params.reduce((result, current, i) => ({ ...result, [segments[i].name]: current }), defaults)
            : { ...defaults, ...params };
    }

    _compileOrigin(route = this.route) {
        // If we're building a relative URL, there is no origin
        if (this.relative) {
            return '';
        }

        // If the current route doesn't have a domain, the origin is the app domain (Ziggy's 'baseUrl')
        if (!route?.domain) {
            return this.ziggy.baseUrl.replace(/\/$/, '');
        }

        // Otherwise, construct the origin based on the route definition and Ziggy's config
        return `${this.ziggy.baseProtocol}://`
            + route.domain.replace(/\/$/, '')
            + (this.ziggy.basePort ? `:${this.ziggy.basePort}` : '');
    }

    _compileTemplate(route = this.route) {
        return `${this._compileOrigin(route)}/${route.uri.replace(/^\//, '')}`;
    }

    // get segments() {
    //     return this.name ? extractSegments(this._compileTemplate()) : [];
    // }

    with(params) {
        this.urlParams = this._parseParameters(this.route, params);
        return this;
    }

    withQuery(params) {
        Object.assign(this.queryParams, params);
        return this;
    }

    hydrateUrl() {
        const template = this._compileTemplate();

        // Return early if there's nothing to replace (e.g. '/' or '/posts')
        if (!extractSegments(template).length) {
            return template;
        }

        return template.replace(/{([^}?]+)\??}/g, (_, segment) => {
            switch (typeof this.urlParams[segment]) {
                case 'string':
                case 'number':
                    return encodeURIComponent(this.urlParams[segment]);
                case 'object':
                    if (this.urlParams[segment] === null) {
                        if (!extractSegments(template).filter(s => s.name === segment).shift().optional) {
                            throw new Error(`Ziggy Error: '${segment}' key is required for route '${this.name}'`);
                        }
                        return '';
                    }
                    return encodeURIComponent(this.urlParams[segment][this.bindings[segment]]);
                case 'undefined':
                    if (!extractSegments(template).filter(s => s.name === segment).shift().optional) {
                        throw new Error(`Ziggy Error: '${segment}' key is required for route '${this.name}'`);
                    }
                    return '';
            }
        }).replace(/\/$/, '');
    }

    constructQuery() {
        let diff = Object.keys(this.urlParams).filter((key) => !extractSegments(this._compileTemplate()).some(s => s.name === key));
        let remainingParams = diff.reduce((result, current) => ({ ...result, [current]: this.urlParams[current] }), this.queryParams ?? {});

        return stringify(remainingParams, {
            encodeValuesOnly: true,
            skipNulls: true,
            addQueryPrefix: true,
            arrayFormat: 'indices'
        });
    }

    current(name, params, exact = false) {
        const url = (({ host, pathname }) => `${host}${pathname}`.replace(/\/?$/, ''))(window.location);

        // Loop over every named route and see if it matches the current URL
        const [n, route] = Object.entries(this.ziggy.namedRoutes).filter(([_, route]) => { // bindings??
            if (!route.methods.includes('GET')) {
                return false;
            }

            // Transform this route's template into a regex that will match a hydrated URL
            // by replacing its segments with matchers for (optional) path segment values
            const pattern = this._compileTemplate(route)
                .replace(/\/{[^}?]*\?}/g, '(\/[^/?]+)?')
                .replace(/{[^}]+}/g, '[^/?]+')
                .replace(/\/?$/, '')
                .split('://').pop();

            // Test this pattern against the current URL, ignoring the protocol and query,
            // e.g. `ziggy.dev/posts/[^/?]+/tags/(/[^/?]+)?` vs. ziggy.dev/posts/12/tags/javascript
            return new RegExp(`^${pattern}$`).test(url.split('?')[0]);
        })[0];

        if (name) {
            let match = new RegExp(`^${name.replace('.', '\\.').replace('*', '.*')}$`).test(n);

            if (match && params) {
                let currentParams = this.params;
                let hydratedParams = this._parseParameters(route, params);
                let hydratedBindings = route.bindings ?? {};
                return exact ? Object.entries(currentParams).every(([k, v]) => {
                    switch (typeof hydratedParams[k]) {
                        case 'string':
                        case 'number':
                            return hydratedParams[k] == v;
                        case 'object':
                            return hydratedParams[k][hydratedBindings[k]] == v;
                    }
                }) : Object.entries(hydratedParams).every(([k, v]) => {
                    switch (typeof v) {
                        case 'string':
                        case 'number':
                            return currentParams[k] == v;
                        case 'object':
                            return currentParams[k] == v[hydratedBindings[k]];
                    }
                });
            }

            return match;
        }

        return n;
    }

    check(name) {
        let routeNames = Object.keys(this.ziggy.namedRoutes);

        return routeNames.includes(name);
    }

    extractParams(hydrated, template = '', delimiter) {
        const [values, segments] = [hydrated, template].map(s => s.split(delimiter));

        // Replace each parameter segment in the template with its value in the hydrated uri
        return segments.reduce((result, current, i) => {
            return /^{[^}?]+\??}$/.test(current) && values[i]
                ? { ...result, [current.replace(/^{|\??}$/g, '')]: values[i] }
                : result;
        }, {});
    }

    get params() {
        const route = this.ziggy.namedRoutes[this.current()];

        let pathname = window.location.pathname
            // .replace(this.ziggy.baseUrl.replace(/^\w*?:\/\/[^/]+/, ''), '')
            .replace(this.ziggy.baseUrl.split('://')[1].split('/')[1], '') // subfolders
            .replace(/^\/+/, '');

        return {
            ...this.extractParams(window.location.host, route.domain, '.'), // (sub)domain params
            ...this.extractParams(pathname, route.uri, '/'), // path params
            ...parse(window.location.search?.replace(/^\?/, '')) // query params
        };
    }

    parse() {
        return this.hydrateUrl() + this.constructQuery();
    }

    url() {
        return this.parse();
    }

    toString() {
        return this.url();
    }

    trimParam(param) {
        return param.replace(/{|}|\?/g, '');
    }

    valueOf() {
        return this.url();
    }
}

export default function route(name, params, absolute, customZiggy) {
    return new Router(name, params, absolute, customZiggy);
}

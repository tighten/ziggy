import { stringify } from 'qs';

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
        this.urlParams = this.normalizeParams(params);
        this.queryParams = {};
        this.hydrated = '';
    }

    normalizeParams(params = {}) {
        // If 'params' is a single string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        let defaults, segments;

        if (this.template) {
            [defaults, segments] = partition(
                extractSegments(this.template),
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

    get origin() {
        // If we're building a relative URL, there is no origin
        if (this.relative) {
            return '';
        }

        // If the current route doesn't have a domain, the origin is the app domain (Ziggy's 'baseUrl')
        if (!this.route.domain) {
            return this.ziggy.baseUrl.replace(/\/$/, '');
        }

        // Otherwise, construct the origin based on the route definition and Ziggy's config
        return `${this.ziggy.baseProtocol}://`
            + this.route.domain.replace(/\/$/, '')
            + (this.ziggy.basePort ? `:${this.ziggy.basePort}` : '');
    }

    get template() {
        /// @todo don't ever even call this if this.name isn't set
        return this.name ? `${this.origin}/${this.route.uri.replace(/^\//, '')}` : '';
    }

    with(params) {
        this.urlParams = this.normalizeParams(params);
        return this;
    }

    withQuery(params) {
        Object.assign(this.queryParams, params);
        return this;
    }

    hydrateUrl() {
        this.segments = extractSegments(this.template);

        // Return early if there's nothing to replace (e.g. '/' or '/posts')
        if (!this.segments.length) {
            this.hydrated = this.template;
            return this.hydrated;
        }

        this.hydrated = this.template.replace(/{([^}?]+)\??}/g, (_, segment) => {
            switch (typeof this.urlParams[segment]) {
                case 'string':
                case 'number':
                    return encodeURIComponent(this.urlParams[segment]);
                case 'object':
                    if (this.urlParams[segment] === null) {
                        if (!this.segments.filter(s => s.name === segment).shift().optional) {
                            throw new Error(`Ziggy Error: '${segment}' key is required for route '${this.name}'`);
                        }
                        return '';
                    }
                    return encodeURIComponent(this.urlParams[segment][this.bindings[segment]]);
                case 'undefined':
                    if (!this.segments.filter(s => s.name === segment).shift().optional) {
                        throw new Error(`Ziggy Error: '${segment}' key is required for route '${this.name}'`);
                    }
                    return '';
            }
        });

        this.hydrated = this.hydrated.replace(/\/$/, '');

        return this.hydrated;
    }

    matchUrl() {
        const url = (
            ({ hostname, port, pathname }) => `${hostname}${port ? `:${port}` : ''}${pathname}`.replace(/\/?$/, '')
        )(window.location);

        const urlPattern = this.template
            .replace(/\/\{[^\}]*\?\}/g, '(\/[^/?]+)?')
            .replace(/\{[^\}]*\}/gi, '[^/?]+')
            .replace(/\/?$/, '')
            .split('://').pop();

        return new RegExp(`^${urlPattern}$`).test(url.split('?').shift());
    }

    constructQuery() {
        let diff = Object.keys(this.urlParams).filter((key) => !this.segments.some(s => s.name === key));
        let remainingParams = diff.reduce((result, current) => ({ ...result, [current]: this.urlParams[current] }), this.queryParams ?? {});

        return stringify(remainingParams, {
            encodeValuesOnly: true,
            skipNulls: true,
            addQueryPrefix: true,
            arrayFormat: 'indices'
        });
    }

    current(name = null) {
        const currentRoute = Object.keys(this.ziggy.namedRoutes).filter(name => {
            return this.ziggy.namedRoutes[name].methods.includes('GET')
                ? new Router(name, undefined, undefined, this.ziggy).matchUrl()
                : false;
        })[0];

        if (name) {
            return new RegExp(`^${name.replace('.', '\\.').replace('*', '.*')}$`, 'i').test(currentRoute);
        }

        return currentRoute;
    }

    check(name) {
        let routeNames = Object.keys(this.ziggy.namedRoutes);

        return routeNames.includes(name);
    }

    extractParams(uri, template, delimiter) {
        const uriParts = uri.split(delimiter);
        const templateParts = template.split(delimiter);

        return templateParts.reduce((params, param, i) => {
            return /^{[^}]+}$/.test(param) && uriParts[i]
                ? { ...params, [this.trimParam(param)]: uriParts[i] }
                : params;
        }, {});
    }

    get params() {
        const namedRoute = this.ziggy.namedRoutes[this.current()];

        let pathname = window.location.pathname
            .replace(this.ziggy.baseUrl.split('://')[1].split('/')[1], '')
            .replace(/^\/+/, '');

        return Object.assign(
            this.extractParams(window.location.hostname, namedRoute.domain || '', '.'),
            this.extractParams(pathname, namedRoute.uri, '/')
        );
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

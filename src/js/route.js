import { parse, stringify } from 'qs';

const ts = [/\/$/, ''];

class Route {
    absolute = true;
    bindings = {};

    constructor(name, definition, config) {
        Object.entries({ name, ...definition, ...config }).map(([key, value]) => this[key] = value);
    }

    get template() {
        const origin = !this.absolute ? '' : this.domain
            ? `${this.baseProtocol}://${this.domain.replace(...ts)}${this.basePort ? `:${this.basePort}` : ''}`
            : this.baseUrl.replace(...ts);

        return `${origin}/${this.uri}`.replace(...ts);
    }

    get segments() {
        return this.template.match(/{[^}?]+\??}/g)?.map((segment) => ({
            name: segment.replace(/{|\??}/g, ''),
            required: !/\?}$/.test(segment),
        })) ?? [];
    }

    get current() {
        if (!this.methods.includes('GET')) return false;

        const url = (({ host, pathname }) => `${host}${pathname}`.replace(...ts))(window.location);

        const pattern = this.template
            .replace(/\/{[^}?]*\?}/g, '(\/[^/?]+)?')
            .replace(/{[^}]+}/g, '[^/?]+')
            .replace(/^\w*:\/\//, '');

        return new RegExp(`^${pattern}$`).test(url.split('?').shift());
    }

    compile(params) {
        if (!this.segments.length) return this.template;

        return this.template.replace(/{([^}?]+)\??}/g, (_, segment) => {
            if (this.segments.find(({ name }) => name === segment).required && [null, undefined].includes(params[segment])) {
                throw new Error(`Ziggy error: '${segment}' parameter is required for route '${this.name}'.`)
            }

            return encodeURIComponent(params[segment] ?? '');
        }).replace(...ts);
    }
}

class Router extends String {
    constructor(name, params, absolute = true, config) {
        super();

        this.config = config ?? Ziggy;

        if (name) {
            if (!this.config.namedRoutes[name]) {
                throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
            }

            this._route = new Route(name, this.config.namedRoutes[name], { ...this.config, absolute });
            this._params = this._parse(params);
        }
    }

    _parse(params = {}, route = this._route) {
        // If 'params' is a string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        // Separate segments with and without defaults, and fill in the default values
        const segments = route.segments.filter(({ name }) => !this.config.defaultParameters[name]);
        const defaults = route.segments.filter(({ name }) => this.config.defaultParameters[name])
            .reduce((result, { name }, i) => ({ ...result, [name]: this.config.defaultParameters[name] }), {});

        if (Array.isArray(params)) {
            // If the parameters are an array they have to be in order, so we can transform them into
            // an object by just keying them with the template segments in the order they appear
            params = params.reduce((result, current, i) => ({ ...result, [segments[i].name]: current }), defaults);
        } else if (segments.length === 1 && !params[segments[0].name] && params[Object.values(route.bindings)[0]]) {
            // If there is only one template segment and the parameters are an object, that object is
            // ambiguous—it could be parameter keys and values, or it could just be the one parameter
            // itself; we can inspect it to find out, and if it's the parameter itself, we wrap it
            // in an object with its key
            params = { [segments[0].name]: params };
        }

        // Substitute bindings
        return Object.entries({ ...defaults, ...params }).reduce((result, [key, value]) => {
            const bound = value && typeof value === 'object' && route.bindings[key];

            if (bound && !value.hasOwnProperty(route.bindings[key])) {
                throw new Error(`Ziggy error: object passed as '${key}' parameter is missing route model binding key '${route.bindings[key]}'.`)
            }

            return { ...result, [key]: bound ? value[route.bindings[key]] : value };
        }, {})
    }

    _locationParams(route) {
        let pathname = window.location.pathname
            .replace(this.config.baseUrl.replace(/^\w*:\/\/[^/]+/, ''), '') // remove subdirectories
            .replace(/^\/+/, '');

        const dehydrate = (hydrated, template = '', delimiter) => {
            const [values, segments] = [hydrated, template].map(s => s.split(delimiter));

            // Return an object of parameter names and values, ignoring
            // values that don't correspond to a route segment
            return segments.reduce((result, current, i) => {
                return /^{[^}?]+\??}$/.test(current) && values[i]
                    ? { ...result, [current.replace(/^{|\??}$/g, '')]: values[i] }
                    : result;
            }, {});
        }

        return {
            ...dehydrate(window.location.host, route.domain, '.'), // domain parameters
            ...dehydrate(pathname, route.uri, '/'), // route parameters
            ...parse(window.location.search?.replace(/^\?/, '')), // query parameters
        };
    }

    current(name, params) {
        // Find the first named route that matches the current URL
        const [current, route] = Object.entries(this.config.namedRoutes).find(
            ([_, route]) => new Route(name, route, this.config).current
        );

        // If a name wasn't passed, return the name of the current route
        if (!name) return current;

        // Test the passed name against the current route, matching some basic
        // wildcards so that `events.*` matches `events.show`, etc.
        const match = new RegExp(`^${name.replace('.', '\\.').replace('*', '.*')}$`).test(current);

        if (!params) return match;

        // If parameters were passed, check that their values match in the current URL
        params = this._parse(params, new Route(current, route, this.config));

        return Object.entries(this._locationParams(route))
            .filter(([key]) => params.hasOwnProperty(key))
            .every(([key, value]) => params[key] == value);
    }

    get params() {
        return this._locationParams(this.config.namedRoutes[this.current()]);
    }

    has(name) {
        return Object.keys(this.config.namedRoutes).includes(name);
    }

    withQuery(params) {
        this.queryParams = { ...this.queryParams, ...params };
        return this;
    }

    url() {
        // Get passed parameters that do NOT correspond to route segments
        const unhandled = Object.keys(this._params)
            .filter((key) => !this._route.segments.some(({ name }) => name === key))
            .reduce((result, current) => ({ ...result, [current]: this._params[current] }), this.queryParams);

        return this._route.compile(this._params) + stringify(unhandled, {
            addQueryPrefix: true,
            arrayFormat: 'indices',
            encodeValuesOnly: true,
            skipNulls: true,
        });
    }

    toString() {
        return this.url();
    }

    valueOf() {
        return this.url();
    }

    // @deprecated Pass parameters as the second argument to `route()`
    with(params) {
        this._params = this._parse(params);
        return this;
    }

    // @deprecated Use `has()` instead.
    check(name) {
        return this.has(name);
    }
}

export default function route(name, params, absolute, config) {
    return new Router(name, params, absolute, config);
}

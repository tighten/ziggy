import { parse, stringify } from 'qs';

class Route {
    absolute = true;
    bindings = {};

    constructor(name, definition, config) {
        Object.entries({ name, ...definition, ...config }).map(([key, value]) => this[key] = value);
    }

    // Get a template of the complete URL for this route, e.g. https://{team}.ziggy.dev/user/{user}
    get template() {
        // If  we're building a relative URL there's no origin, otherwise: if this route has a custom
        // domain we construct the origin with that, and if not we use the app URL
        const origin = !this.absolute ? '' : this.domain
            ? `${this.baseProtocol}://${this.domain.replace(/\/$/, '')}${this.basePort ? `:${this.basePort}` : ''}`
            : this.baseUrl.replace(/\/$/, '');

        return `${origin}/${this.uri}`.replace(/\/$/, '');
    }

    // Get an array of objects representing the parameters that this route accepts,
    // e.g. [{ name: 'team', required: true }, { name: 'user', required: false }]
    get segments() {
        return this.template.match(/{[^}?]+\??}/g)?.map((segment) => ({
            name: segment.replace(/{|\??}/g, ''),
            required: !/\?}$/.test(segment),
        })) ?? [];
    }

    // Get whether this route's template matches the given URL
    current(url) {
        if (!this.methods.includes('GET')) return false;

        // Transform the route's template into a regex that will match a hydrated URL, by
        // replacing its parameter segments with matchers for parameter values
        const pattern = this.template
            .replace(/\/{[^}?]*\?}/g, '(\/[^/?]+)?')
            .replace(/{[^}]+}/g, '[^/?]+')
            .replace(/^\w*:\/\//, '');

        return new RegExp(`^${pattern}$`).test(url.split('?').shift());
    }

    // Hydrate and return a complete URL for this route with the given parameters
    compile(params) {
        if (!this.segments.length) return this.template;

        return this.template.replace(/{([^}?]+)\??}/g, (_, segment) => {
            if ([null, undefined].includes(params[segment]) && this.segments.find(({ name }) => name === segment).required) {
                throw new Error(`Ziggy error: '${segment}' parameter is required for route '${this.name}'.`)
            }

            return encodeURIComponent(params[segment] ?? '');
        }).replace(/\/$/, '');
    }
}

class Router extends String {
    constructor(name, params, absolute = true, config) {
        super();

        this._config = config ?? Ziggy ?? globalThis?.Ziggy;

        if (name) {
            if (!this._config.namedRoutes[name]) {
                throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
            }

            this._route = new Route(name, this._config.namedRoutes[name], { ...this._config, absolute });
            this._params = this._parse(params);
        }
    }

    // Parse parameters of any type into a simple object with their keys and values
    _parse(params = {}, route = this._route) {
        // If `params` is a single string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        // Separate segments with and without defaults, and fill in the default values
        const segments = route.segments.filter(({ name }) => !this._config.defaultParameters[name]);
        const defaults = route.segments.filter(({ name }) => this._config.defaultParameters[name])
            .reduce((result, { name }, i) => ({ ...result, [name]: this._config.defaultParameters[name] }), {});

        if (Array.isArray(params)) {
            // If the parameters are an array they have to be in order, so we can transform them into
            // an object by keying them with the template segments in the order they appear
            params = params.reduce((result, current, i) => ({ ...result, [segments[i].name]: current }), defaults);
        } else if (segments.length === 1 && !params[segments[0].name] && params[Object.values(route.bindings)[0]]) {
            // If there is only one parameter template segment and `params` is an object, that
            // object is ambiguous—it could be the parameter key and value, or it could be an
            // object representing just the parameter value; we can inspect it to find out,
            // and if it's the parameter value, wrap it in an object with its key
            params = { [segments[0].name]: params };
        }

        // Substitute any registered route model bindings for this route
        return Object.entries({ ...defaults, ...params }).reduce((result, [key, value]) => {
            const bound = value && typeof value === 'object' && route.bindings[key];

            if (bound && !value.hasOwnProperty(route.bindings[key])) {
                throw new Error(`Ziggy error: object passed as '${key}' parameter is missing route model binding key '${route.bindings[key]}'.`)
            }

            return { ...result, [key]: bound ? value[route.bindings[key]] : value };
        }, {})
    }

    // Get the parameter values from the current window URL, based on the given route definition
    _dehydrate(route) {
        let pathname = window.location.pathname
            .replace(this._config.baseUrl.replace(/^\w*:\/\/[^/]+/, ''), '') // Remove subdirectories
            .replace(/^\/+/, '');

        // Given the hydrated string, template, and delimiter, extract and return
        // an object of parameter names and values from part of a path or URL
        const dehydrate = (hydrated, template = '', delimiter) => {
            const [values, segments] = [hydrated, template].map(s => s.split(delimiter));

            return segments.reduce((result, current, i) => {
                // Ignore values that are empty or don't correspond to a route segment
                return /^{[^}?]+\??}$/.test(current) && values[i]
                    ? { ...result, [current.replace(/^{|\??}$/g, '')]: values[i] }
                    : result;
            }, {});
        }

        return {
            ...dehydrate(window.location.host, route.domain, '.'), // Domain parameters
            ...dehydrate(pathname, route.uri, '/'), // Path parameters
            ...parse(window.location.search?.replace(/^\?/, '')), // Query parameters
        };
    }

    // Get the name of the route matching the current window URL, or, given a route name
    // and parameters, check if the current window URL and parameters match that route
    current(name, params) {
        const url = (({ host, pathname }) => `${host}${pathname}`.replace(/\/$/, ''))(window.location);

        // Find the first named route that matches the current URL
        const [current, route] = Object.entries(this._config.namedRoutes).find(
            ([_, route]) => new Route(name, route, this._config).current(url)
        );

        // If a name wasn't passed, return the name of the current route
        if (!name) return current;

        // Test the passed name against the current route, matching some
        // basic wildcards, e.g. `events.*` matches `events.show`
        const match = new RegExp(`^${name.replace('.', '\\.').replace('*', '.*')}$`).test(current);

        if (!params) return match;

        // If parameters were passed, check that their values match in the current window URL
        params = this._parse(params, new Route(current, route, this._config));

        return Object.entries(this._dehydrate(route))
            // Only check the parameters that were passed into this method
            .filter(([key]) => params.hasOwnProperty(key))
            // Use weak equality because all values in the current window URL will be strings
            .every(([key, value]) => params[key] == value);
    }

    // Get the parameter values from the current window URL
    get params() {
        return this._dehydrate(this._config.namedRoutes[this.current()]);
    }

    // Check whether the given named route exists
    has(name) {
        return Object.keys(this._config.namedRoutes).includes(name);
    }

    // Add query parameters to be appended to the hydrated URL
    withQuery(params) {
        this._queryParams = { ...this._queryParams, ...params };
        return this;
    }

    // Get the compiled URL for the current route and parameters, as a plain string
    url() {
        // Get passed parameters that do not correspond to any route segments...
        const unhandled = Object.keys(this._params)
            .filter((key) => !this._route.segments.some(({ name }) => name === key))
            .reduce((result, current) => ({ ...result, [current]: this._params[current] }), this._queryParams);

        // ...and append them in the query
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

    // @deprecated - Pass parameters as the second argument to `route()`
    with(params) {
        this._params = this._parse(params);
        return this;
    }

    // @deprecated - Use `has()` instead
    check(name) {
        return this.has(name);
    }
}

export default function route(name, params, absolute, config) {
    return new Router(name, params, absolute, config);
}

import { stringify } from 'qs';
import Route from './Route';

/**
 * A collection of Laravel routes. This class constitutes Ziggy's main API.
 */
export default class Router extends String {
    /**
     * @param {String} [name] - Route name.
     * @param {(String|Number|Array|Object)} [params] - Route parameters.
     * @param {Boolean} [absolute] - Whether to include the URL origin.
     * @param {Object} [config] - Ziggy configuration.
     */
    constructor(name, params, absolute = true, config) {
        super();

        this._config = config ?? (typeof Ziggy !== 'undefined' ? Ziggy : globalThis?.Ziggy);
        this._config = { ...this._config, absolute };

        if (name) {
            if (!this._config.routes[name]) {
                throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
            }

            this._route = new Route(name, this._config.routes[name], this._config);
            this._params = this._parse(params);
        }
    }

    /**
     * Get the compiled URL string for the current route and parameters.
     *
     * @example
     * // with 'posts.show' route 'posts/{post}'
     * (new Router('posts.show', 1)).toString(); // 'https://ziggy.dev/posts/1'
     *
     * @return {String}
     */
    toString() {
        // Get parameters that don't correspond to any route segments to append them to the query
        const unhandled = Object.keys(this._params)
            .filter((key) => !this._route.parameterSegments.some(({ name }) => name === key))
            .filter((key) => key !== '_query')
            .reduce((result, current) => ({ ...result, [current]: this._params[current] }), {});

        return this._route.compile(this._params) + stringify({ ...unhandled, ...this._params['_query'] }, {
            addQueryPrefix: true,
            arrayFormat: 'indices',
            encodeValuesOnly: true,
            skipNulls: true,
            encoder: (value, encoder) => typeof value === 'boolean' ? Number(value) : encoder(value),
        });
    }

    /**
     * Get the parameters, values, and metadata from the given URL.
     *
     * @param {String} [url] - The URL to inspect, defaults to the current window URL.
     * @return {{ name: string, params: Object, query: Object, route: Route }}
     */
    _unresolve(url) {
        if (!url) {
            url = this._currentUrl();
        } else if (this._config.absolute && url.startsWith('/')) {
            // If we are using absolute URLs and a relative URL
            // is passed, prefix the host to make it absolute
            url = this._location().host + url;
        }

        let matchedParams = {};
        const [name, route] = Object.entries(this._config.routes).find(
          ([name, route]) => (matchedParams = new Route(name, route, this._config).matchesUrl(url))
        ) || [undefined, undefined];

        return { name, ...matchedParams, route };
    }

    _currentUrl() {
        const { host, pathname, search } = this._location();

        return (
            this._config.absolute
                ? host + pathname
                : pathname.replace(this._config.url.replace(/^\w*:\/\/[^/]+/, ''), '').replace(/^\/+/, '/')
        ) + search;
    }

    /**
     * Get the name of the route matching the current window URL, or, given a route name
     * and parameters, check if the current window URL and parameters match that route.
     *
     * @example
     * // at URL https://ziggy.dev/posts/4 with 'posts.show' route 'posts/{post}'
     * route().current(); // 'posts.show'
     * route().current('posts.index'); // false
     * route().current('posts.show'); // true
     * route().current('posts.show', { post: 1 }); // false
     * route().current('posts.show', { post: 4 }); // true
     *
     * @param {String} [name] - Route name to check.
     * @param {(String|Number|Array|Object)} [params] - Route parameters.
     * @return {(Boolean|String|undefined)}
     */
    current(name, params) {
        const { name: current, params: currentParams, query, route } = this._unresolve();

        // If a name wasn't passed, return the name of the current route
        if (!name) return current;

        // Test the passed name against the current route, matching some
        // basic wildcards, e.g. passing `events.*` matches `events.show`
        const match = new RegExp(`^${name.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`).test(current);

        if ([null, undefined].includes(params) || !match) return match;

        const routeObject = new Route(current, route, this._config);

        params = this._parse(params, routeObject);
        const routeParams = { ...currentParams, ...query };

        // If the current window URL has no route parameters, and the passed parameters are empty, return true
        if (Object.values(params).every(p => !p) && !Object.values(routeParams).some(v => v !== undefined)) return true;

        // Check that all passed parameters match their values in the current window URL
        // Use weak equality because all values in the current window URL will be strings
        return Object.entries(params).every(([key, value]) => routeParams[key] == value);
    }

    /**
     * Get an object representing the current location (by default this will be
     * the JavaScript `window` global if it's available).
     *
     * @return {Object}
     */
    _location() {
        const { host = '', pathname = '', search = '' } = typeof window !== 'undefined' ? window.location : {};

        return {
            host: this._config.location?.host ?? host,
            pathname: this._config.location?.pathname ?? pathname,
            search: this._config.location?.search ?? search,
        };
    }

    /**
     * Get all parameter values from the current window URL.
     *
     * @example
     * // at URL https://tighten.ziggy.dev/posts/4?lang=en with 'posts.show' route 'posts/{post}' and domain '{team}.ziggy.dev'
     * route().params; // { team: 'tighten', post: 4, lang: 'en' }
     *
     * @return {Object}
     */
    get params() {
        const { params, query } = this._unresolve();

        return { ...params, ...query };
    }

    /**
     * Check whether the given route exists.
     *
     * @param {String} name
     * @return {Boolean}
     */
    has(name) {
        return Object.keys(this._config.routes).includes(name);
    }

    /**
     * Parse Laravel-style route parameters of any type into a normalized object.
     *
     * @example
     * // with route parameter names 'event' and 'venue'
     * _parse(1); // { event: 1 }
     * _parse({ event: 2, venue: 3 }); // { event: 2, venue: 3 }
     * _parse(['Taylor', 'Matt']); // { event: 'Taylor', venue: 'Matt' }
     * _parse([4, { uuid: 56789, name: 'Grand Canyon' }]); // { event: 4, venue: 56789 }
     *
     * @param {(String|Number|Array|Object)} params - Route parameters.
     * @param {Route} route - Route instance.
     * @return {Object} Normalized complete route parameters.
     */
    _parse(params = {}, route = this._route) {
        // If `params` is a string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        // Separate segments with and without defaults, and fill in the default values
        const segments = route.parameterSegments.filter(({ name }) => !this._config.defaults[name]);

        if (Array.isArray(params)) {
            // If the parameters are an array they have to be in order, so we can transform them into
            // an object by keying them with the template segment names in the order they appear
            params = params.reduce((result, current, i) => segments[i]
                ? ({ ...result, [segments[i].name]: current })
                : typeof current === 'object'
                    ? ({ ...result, ...current })
                    : ({ ...result, [current]: '' }), {});
        } else if (
            segments.length === 1
            && !params[segments[0].name]
            && (params.hasOwnProperty(Object.values(route.bindings)[0]) || params.hasOwnProperty('id'))
        ) {
            // If there is only one template segment and `params` is an object, that object is
            // ambiguous—it could contain the parameter key and value, or it could be an object
            // representing just the value (e.g. a model); we can inspect it to find out, and
            // if it's just the parameter value, we can wrap it in an object with its key
            params = { [segments[0].name]: params };
        }

        return {
            ...this._defaults(route),
            ...this._substituteBindings(params, route),
        };
    }

    /**
     * Populate default parameters for the given route.
     *
     * @example
     * // with default parameters { locale: 'en', country: 'US' } and 'posts.show' route '{locale}/posts/{post}'
     * defaults(...); // { locale: 'en' }
     *
     * @param {Route} route
     * @return {Object} Default route parameters.
     */
    _defaults(route) {
        return route.parameterSegments.filter(({ name }) => this._config.defaults[name])
            .reduce((result, { name }, i) => ({ ...result, [name]: this._config.defaults[name] }), {});
    }

    /**
     * Substitute Laravel route model bindings in the given parameters.
     *
     * @example
     * _substituteBindings({ post: { id: 4, slug: 'hello-world', title: 'Hello, world!' } }, { bindings: { post: 'slug' } }); // { post: 'hello-world' }
     *
     * @param {Object} params - Route parameters.
     * @param {Object} route - Route definition.
     * @return {Object} Normalized route parameters.
     */
    _substituteBindings(params, { bindings, parameterSegments }) {
        return Object.entries(params).reduce((result, [key, value]) => {
            // If the value isn't an object, or if the key isn't a named route parameter,
            // there's nothing to substitute so we return it as-is
            if (!value || typeof value !== 'object' || Array.isArray(value) || !parameterSegments.some(({ name }) => name === key)) {
                return { ...result, [key]: value };
            }

            if (!value.hasOwnProperty(bindings[key])) {
                if (value.hasOwnProperty('id')) {
                    // As a fallback, we still accept an 'id' key not explicitly registered as a binding
                    bindings[key] = 'id';
                } else {
                    throw new Error(`Ziggy error: object passed as '${key}' parameter is missing route model binding key '${bindings[key]}'.`)
                }
            }

            return { ...result, [key]: value[bindings[key]] };
        }, {});
    }

    valueOf() {
        return this.toString();
    }

    /**
     * @deprecated since v1.0, use `has()` instead.
     */
    check(name) {
        return this.has(name);
    }
}

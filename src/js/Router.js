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

        this._config = config ?? ((globalThis ?? window ?? global).Ziggy);
        this._config = { ...this._config, absolute };

        if (name) {
            this._name = name;
            this._params = params;
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
        return this.resolve({name: this._name, params: this._params});
    }

    /**
     * Get the compiled URL string for the named route and parameters.
     *
     * @param {string} [name] Route name
     * @param {Object|string} [params] Route parameters
     * @param {Object} [query] Query parameters
     * @returns {string}
     */
    resolve({name, params, query}) {
        if (!name) {
            return window.location.toString();
        }

        if (!this._config.routes[name]) {
            throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
        }

        const route = new Route(name, this._config.routes[name], this._config);
        const segments = route.parameterSegments;
        const {_query, ...parsedParams} = this._parse(params, route);

        // Get parameters that don't correspond to any route segments to append them to the query
        const unhandled = Object.keys(parsedParams)
            .filter((key) => !segments.some(({ name }) => name === key))
            .reduce((result, current) => ({ ...result, [current]: parsedParams[current] }), {});

        return route.compile(parsedParams) + stringify({ ...unhandled, ..._query, ...query }, {
            addQueryPrefix: true,
            arrayFormat: 'indices',
            encodeValuesOnly: true,
            skipNulls: true,
            encoder: (value, encoder) => typeof value === 'boolean' ? Number(value) : encoder(value),
        });
    }

    /**
     * Find the first route that matches the URL
     *
     * @param {string} [url] The url to resolve, defaults to the current url
     * @returns {{name: string, params: Object, query: Object, route: Route}}
     */
    unresolve(url) {
        if (!url) {
            url = this._currentUrl();
        } else if (this._config.absolute && url.startsWith('/')) {
            const loc = this._location();
            url += loc.host;
        }
        let matchedParams = {};
        const [name, route] = Object.entries(this._config.routes).find(
            (entry) => (matchedParams = new Route(entry[0], entry[1], this._config).matchesUrl(url))
        ) || [undefined, undefined];

        const {query, params} = matchedParams;
        return {name, params, query, route};
    }

    _currentUrl() {
        const loc = this._location();

        return (this._config.absolute ? loc.host + loc.pathname :
            loc.pathname.replace(this._config.url.replace(/^\w*:\/\/[^/]+/, ''), '').replace(/^\/+/, '/')
        ) + loc.search;

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
        const {name: current, params: currentParams, query, route} = this.unresolve();

        const matchedParams = {...currentParams, ...query};

        if (!name) {
            return current;
        }

        // Test the passed name against the current route, matching some
        // basic wildcards, e.g. passing `events.*` matches `events.show`
        const match = new RegExp(`^${name.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`).test(current);

        if ([null, undefined].includes(params) || !match) {
            return match;
        }

        const routeObject = new Route(current, route, this._config);
        const routeParams = JSON.parse(JSON.stringify(matchedParams)); // Remove undefined params

        params = this._parse(params, routeObject);

        // If the current window URL has no route parameters, and the passed parameters are empty, return true
        if (Object.values(params).every(p => !p) && !Object.values(routeParams).length) {
            return true;
        }

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
        const {params, query} = this.unresolve();
        return {...params, ...query};
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
    _parse(params = {}, route) {
        // If `params` is a string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        // Separate segments with and without defaults, and fill in the default values
        const segments = route.parameterSegments.filter(({ name }) => !this._config.defaults[name]);

        if (Array.isArray(params)) {
            // If the parameters are an array they have to be in order, so we can transform them into
            // an object by keying them with the template segment names in the order they appear
            params = params.reduce((result, current, i) => segments[i] ? ({ ...result, [segments[i].name]: current }) : typeof current === 'object' ? ({ ...result, ...current }) : ({ ...result, [current]: '' }), {});
        } else if (
            segments.length === 1
            && !params[segments[0].name]
            && ({}.hasOwnProperty.call(params, Object.values(route.bindings)[0]) || {}.hasOwnProperty.call(params, 'id'))
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
            .reduce((result, { name }) => ({ ...result, [name]: this._config.defaults[name] }), {});
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

            if (!{}.hasOwnProperty.call(value, bindings[key])) {
                if ({}.hasOwnProperty.call(value, 'id')) {
                    // As a fallback, we still accept an 'id' key not explicitly registered as a binding
                    bindings[key] = 'id';
                } else {
                    throw new Error(`Ziggy error: object passed as '${key}' parameter is missing route model binding key '${bindings[key]}'.`);
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

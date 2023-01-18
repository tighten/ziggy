import { stringify } from 'qs';
import Route from './Route';
import type { RouteDefinition, ZiggyConfig } from '.'

const Ziggy: ZiggyConfig = {
    url: 'https://google.com',
    absolute: false,
    defaults: {},
    routes: {
        home: {
            uri: '/',
            methods: ['GET', 'HEAD'],
        },
    },
};

type RouteParam = string | number | Record<string, any>;
type RouteParamList = Record<string, RouteParam>;
type RouteParams = RouteParam | Array<RouteParam> | RouteParamList;
type NormalizedRouteParams = Record<string, string|number>;

export default class Router {
    #config: ZiggyConfig;
    #route: Route|undefined;
    #params: object|undefined;

    constructor(name?: string|undefined, params?: RouteParams, absolute: boolean = true, config?: ZiggyConfig) {
        this.#config = config ?? Ziggy ?? globalThis?.Ziggy;
        this.#config.absolute = absolute;

        if (name) {
            if (Object.hasOwn(this.#config.routes, name)) {
                this.#route = new Route(name, this.#config.routes[name] as RouteDefinition, this.#config);
                this.#params = this._parse(params);
            } else {
                throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
            }
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
    toString(): string {
        // Get parameters that don't correspond to any route segments to append them to the query
        const unhandled = Object.keys(this.#params)
            .filter((key) => !this.#route.parameterSegments.some(({ name }) => name === key))
            .filter((key) => key !== '_query')
            .reduce((result, current) => ({ ...result, [current]: this.#params[current] }), {});

        return this.#route.compile(this.#params) + stringify({ ...unhandled, ...this.#params['_query'] }, {
            addQueryPrefix: true,
            arrayFormat: 'indices',
            encodeValuesOnly: true,
            skipNulls: true,
            encoder: (value, encoder) => typeof value === 'boolean' ? Number(value) : encoder(value),
        });
    }

    /**
     * Get the parameters, values, and metadata from the given URL.
     */
    _unresolve(url?: string): { name?: string, params?: object, query?: object, route?: Route } {
        if (!url) {
            url = this._currentUrl();
        } else if (this.#config.absolute && url.startsWith('/')) {
            // If we are using absolute URLs and a relative URL
            // is passed, prefix the host to make it absolute
            url = this._location().host + url;
        }

        let matchedParams = {};
        const [name, route] = Object.entries(this.#config.routes).find(
          ([name, route]) => (matchedParams = new Route(name, route, this.#config).matchesUrl(url))
        ) || [undefined, undefined];

        return { name, ...matchedParams, route };
    }

    _currentUrl() {
        const { host, pathname, search } = this._location();

        return (
            this.#config.absolute
                ? host + pathname
                : pathname.replace(this.#config.url.replace(/^\w*:\/\/[^/]+/, ''), '').replace(/^\/+/, '/')
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
    current(name?: string, params?: any) {
        const { name: current, params: currentParams, query, route } = this._unresolve();

        // If a name wasn't passed, return the name of the current route
        if (!name) return current;

        // Test the passed name against the current route, matching some
        // basic wildcards, e.g. passing `events.*` matches `events.show`
        const match = new RegExp(`^${name.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`).test(current);

        if ([null, undefined].includes(params) || !match) return match;

        const routeObject = new Route(current, route, this.#config);

        params = this._parse(params, routeObject);
        const routeParams = { ...currentParams, ...query };

        // If the current window URL has no route parameters, and the passed parameters are empty, return true
        if (Object.values(params).every(p => !p) && !Object.values(routeParams).some(v => v !== undefined)) return true;

        // Check that all passed parameters match their values in the current window URL
        // Use weak equality because all values in the current window URL will be strings
        return Object.entries(params).every(([key, value]) => routeParams[key] == value);
    }

    /**
     * Get an object representing the current location (by default this will be the JavaScript `window` global if it's available).
     */
    _location(): { host: string, pathname: string, search: string } {
        const { host = '', pathname = '', search = '' } = typeof window !== 'undefined' ? window.location : {};

        return {
            host: this.#config.location?.host ?? host,
            pathname: this.#config.location?.pathname ?? pathname,
            search: this.#config.location?.search ?? search,
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
     */
    has(name: string): boolean {
        return Object.hasOwn(this.#config.routes, name);
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
     * @param {Route} route - Route instance.
     * @return {Object} Normalized complete route parameters.
     */
    _parse(params: RouteParams, route = this.#route): object {
        if (!route) {
            return {};
        }

        // If `params` is a plain string or number, wrap it in an array
        if (typeof params === 'string' || typeof params === 'number') {
            params = [params];
        }

        // Separate segments with and without defaults
        const segments = route.parameterSegments.filter(({ name }) => !this.#config.defaults[name]);

        if (params instanceof Array) {
            // If the parameters are an array they must be in order, so we can transform them into
            // an object by keying them with the template segment names in the order they appear
            params = params.reduce((allParameters: RouteParamList, parameterValue: RouteParam, position: number): RouteParamList => {
                const segment = segments[position];

                // If there is a route parameter segment at this index, this parameterValue belongs to it
                if (segment) {
                    return { ...allParameters, [segment.name]: parameterValue };
                }

                // Parameter values with no matching route segment will be appended later as part of the query string,
                // we are building an object so for plain values we use the value as the key and set it to an empty string
                return {
                    ...allParameters,
                    ...(typeof parameterValue === 'object' ? parameterValue : { [parameterValue]: '' }),
                };
            }, {});
        } else if (segments.length === 1) {
            const firstSegment = segments[0];
            // If there is only one route parameter segment and `params` is an object, that object is
            // ambiguous—it could contain the parameter key and value, or it could be an object
            // representing just the value (e.g. a model); we can inspect it to find out, and
            // if it's just the parameter value, we can wrap it in an object with its key
            const routeBindingKey = Object.values(route.bindings)[0];
            if (
                firstSegment
                && !Object.hasOwn(params, firstSegment.name)
                && ((routeBindingKey && Object.hasOwn(params, routeBindingKey)) || Object.hasOwn(params, 'id'))
            ) {
                params = { [firstSegment.name]: params }; // TODO Why the whole object here, why not params[bindingkey]? - Because if we get this far, they passed a model object and we only want to keep the id
                params;
            }
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
    _defaults(route: Route) {
        return route.parameterSegments.filter(({ name }) => this.#config.defaults[name])
            .reduce((result, { name }) => ({ ...result, [name]: this.#config.defaults[name] }), {});
    }

    /**
     * Substitute Laravel route model bindings within the given parameters.
     *
     * @example _substituteBindings({ post: { id: 4, slug: 'hello-world', title: 'Hello, world!' } }, { bindings: { post: 'slug' } }); // { post: 'hello-world' }
     */
    _substituteBindings(params: RouteParamList, { bindings, parameterSegments }: Route): RouteParamList {
        return Object.entries(params).reduce((result, [key, value]: [string, RouteParam]) => {
            // If the value isn't an object, or if the key isn't a named route parameter,
            // there's nothing to substitute so we return it as-is
            if (!value || value instanceof Array || typeof value !== 'object' || !parameterSegments.some(({ name }) => name === key)) {
                return { ...result, [key]: value };
            }

            if (!Object.hasOwn(value, bindings[key] as string|number)) { // |bool?
                if (Object.hasOwn(value, 'id')) {
                    // As a fallback, we still accept an 'id' key not explicitly registered as a binding
                    bindings[key] = 'id';
                } else {
                    throw new Error(`Ziggy error: object passed as '${key}' parameter is missing route model binding key '${bindings[key]}'.`)
                }
            }

            return { ...result, [key]: value[bindings[key] as string|number] }; // |bool?
        }, {});
    }
}

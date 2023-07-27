/// <reference types="qs" />
import { Config, NormalizedRouteParams, ParameterValue, RouteDefinition, RouteMatchResult, RouteName, RouteParams, RouteParamsObject } from '.';
import Route from './Route';
declare type _Unresolve = RouteMatchResult & {
    name: string;
    route: RouteDefinition;
};
declare global {
    var Ziggy: Config;
}
/**
 * A collection of Laravel routes. This class constitutes Ziggy's main API.
 */
export default class Router<Name extends RouteName> extends String {
    private readonly _config;
    private readonly _params;
    private readonly _route;
    /**
     * @param name Route name.
     * @param params Route parameters.
     * @param absolute Whether to include the URL origin.
     * @param config Ziggy configuration.
     */
    constructor(name?: Name, params?: RouteParams<Name>, absolute?: boolean, config?: Config);
    /**
     * Get the compiled URL string for the current route and parameters.
     *
     * @example
     * // with 'posts.show' route 'posts/{post}'
     * (new Router('posts.show', 1)).toString(); // 'https://ziggy.dev/posts/1'
     *
     * @return {String}
     */
    toString(): string;
    /**
     * Get the parameters, values, and metadata from the given URL.
     *
     * @param {String} [url] - The URL to inspect, defaults to the current window URL.
     * @return {{ name: string, params: Object, query: Object, route: Route }}
     */
    _unresolve(url?: string): _Unresolve;
    _currentUrl(): string;
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
     * @param name Route name to check.
     * @param params Route parameters.
     */
    current<CurrentName extends RouteName = Name>(name?: CurrentName, params?: RouteParams<CurrentName> | null): boolean | string | void;
    /**
     * Get an object representing the current location (by default this will be
     * the JavaScript `window` global if it's available).
     *
     * @return {Object}
     */
    _location(): {
        host: string;
        pathname: string;
        search: string;
    };
    /**
     * Get all parameter values from the current window URL.
     *
     * @example
     * // at URL https://tighten.ziggy.dev/posts/4?lang=en with 'posts.show' route 'posts/{post}' and domain '{team}.ziggy.dev'
     * route().params; // { team: 'tighten', post: 4, lang: 'en' }
     *
     * @return {Object}
     */
    get params(): {
        [x: string]: ParameterValue | string[] | import("qs").ParsedQs | import("qs").ParsedQs[];
        _query?: Record<string, any>;
    };
    /**
     * Check whether the given route exists.
     *
     * @param {String} name
     * @return {Boolean}
     */
    has(name: any): boolean;
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
     * @param {CurrentName} route - Route instance.
     * @return {Object} Normalized complete route parameters.
     */
    _parse<CurrentName extends RouteName = Name>(params: ParameterValue | RouteParams<CurrentName>, route: Route<CurrentName>): NormalizedRouteParams<CurrentName>;
    /**
     * Populate default parameters for the given route.
     *
     * @example
     * // with default parameters { locale: 'en', country: 'US' } and 'posts.show' route '{locale}/posts/{post}'
     * defaults(...); // { locale: 'en' }
     *
     * @param {Name} route
     * @return {Object} Default route parameters.
     */
    _defaults(route: any): any;
    /**
     * Substitute Laravel route model bindings in the given parameters.
     *
     * @example
     * _substituteBindings({ post: { id: 4, slug: 'hello-world', title: 'Hello, world!' } }, { bindings: { post: 'slug' } }); // { post: 'hello-world' }
     *
     * @param params Route parameters.
     * @param route Route definition.
     * @return Normalized route parameters.
     */
    _substituteBindings<CurrentName extends RouteName = Name>(params: RouteParamsObject<CurrentName>, { bindings, parameterSegments }: Route<CurrentName>): NormalizedRouteParams<CurrentName>;
    valueOf(): string;
    /**
     * @deprecated since v1.0, use `has()` instead.
     */
    check(name: any): boolean;
}
export {};

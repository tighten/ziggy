import { stringify, parse as qsparse } from 'qs';

declare global {
  var Ziggy: Ziggy;
}

export type Ziggy = {
    url: string;
    port?: string|number;
    absolute: boolean;
    location?: URL,
    defaults: Record<string, string|number>; // |boolean?
    routes: Record<string, RouteDefinition>,
    // routes: RouteCollection;
};

type RouteDefinition = {
    uri: string;
    methods: Array<'GET'|'HEAD'|'POST'|'PUT'|'PATCH'|'DELETE'>;
    domain?: string;
    // Does this need to handle booleans too? Are defaults/bindings only for route parameters (inside the path) or can they do query params too? -- No, defaults and bindings are not for query params
    bindings?: Record<string, string|number>; // |boolean?
    wheres?: Record<string, string>;
};

export type Router = {
    params: object;
    current(): string|undefined;
    current(name: string): boolean;
    current(name: string, params: object): boolean;
    has(name: string): boolean;
}

function location(config: Ziggy): { host: string, pathname: string, search: string } {
    const { host = '', pathname = '', search = '' } = typeof window !== 'undefined' ? window.location : {};
    return {
        host: config.location?.host ?? host,
        pathname: config.location?.pathname ?? pathname,
        search: config.location?.search ?? search,
    };
}

/**
 * Get the current URL.
 */
function currentUrl(config: Ziggy): string {
    const { host, pathname, search } = location(config);
    return (
        config.absolute
            ? host + pathname
            : pathname.replace(config.url.replace(/^\w*:\/\/[^/]+/, ''), '').replace(/^\/+/, '/')
    ) + search;
}

/**
     * Get a 'template' of the complete URL for this route.
     *
     * @example https://{team}.ziggy.dev/user/{user}
     */
function template(route: RouteDefinition, config: Ziggy): string {
    // If  we're building just a path there's no origin, otherwise: if this route has a
    // domain configured we construct the origin with that, if not we use the app URL
    const origin = !config.absolute ? '' : route.domain
        // Todo is there a TS way to ensure this will always always always match? (remove `?.`)
        ? `${config.url.match(/^\w+:\/\//)?.[0]}${route.domain}${config.port ? `:${config.port}` : ''}`
        : config.url;

    return `${origin}/${route.uri}`.replace(/\/+$/, '');
}

type UrlRouteMatchResult = { matched: false }|{ matched: true, params: Record<string, string>, query: object }
/**
     * Get whether this route's template matches the given URL.
     */
function attemptUrlRouteMatch(url: string, route: RouteDefinition, config: Ziggy): UrlRouteMatchResult {
    // It's impossible to be 'on' a POST/etc. URL in the browser
    if (route.methods.includes('GET')) {
        // Transform the route's template into a regex that will match a hydrated URL,
        // by replacing its parameter segments with matchers for parameter values
        const pattern = template(route, config)
            .replace(/(\/?){([^}?]*)(\??)}/g, (_, slash, segment, optional) => {
                const regex = `(?<${segment}>${route.wheres?.[segment]?.replace(/(^\^)|(\$$)/g, '') || '[^/?]+'})`;
                return optional ? `(${slash}${regex})?` : `${slash}${regex}`;
            })
            .replace(/^\w+:\/\//, '');

        const [location, query] = url.replace(/^\w+:\/\//, '').split('?');

        const matches = new RegExp(`^${pattern}/?$`).exec(location as string); // todo

        if (matches?.groups) {
            return {
                matched: true,
                params: matches.groups,
                query: qsparse(query as string), // todo
            };
        }
    };

    return { matched: false };
}

type ParsedUrlInfo = {
    matched: false,
}|{
    matched: true,
    name: string,
    params: object,
    query: object,
    route: RouteDefinition,
};
/**
 * Get route parameters, values, and metadata from the given URL.
 */
// Get rid of all `?`!
function parseCurrentUrl(config: Ziggy): ParsedUrlInfo {
    const url = currentUrl(config);
    let params = { params: {}, query: {} };
    const [name, route] = Object.entries(config.routes).find(([name, route]) => {
        const result = attemptUrlRouteMatch(url, route, config)
        if (result.matched) {
            params = { params: result.params, query: result.query }
        }
        return result.matched
    }) || [];
    return name && route ? { matched: true, name, route, ...params } : { matched: false };
}

function route(): Router;
function route(name: string, params?: object, absolute?: boolean, config?: Ziggy): string;
function route(name?: string, params?: object, absolute?: boolean, config?: Ziggy): Router|string {
    // Re-assignment necessary to convince TypeScript it can't be undefined https://stackoverflow.com/a/57386066/6484459
    const resolvedConfig = config ?? Ziggy ?? globalThis?.Ziggy;

    /**
     * Get the name of the route matching the current window URL, or, given a route name
     * and parameters, check if the current window URL and parameters match that route.
     */
    function current(): string|undefined
    function current(name: string): boolean
    function current(name: string, params: object): boolean
    function current(name?: string, params?: object): string|undefined|boolean {
        const current = parseCurrentUrl(resolvedConfig);
        if (!current.matched) {
            return undefined;
        }
        if (!name) {
            return current.name;
        }
        const match = new RegExp(`^${name.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`).test(current.name);
        if (!params || !match) {
            return match;
        }
        //
        return false;
    }

    const router: Router = {
        get params(): Record<string, any> { // should the `any` in this record actually be RouteParam?
            const parsed = parseCurrentUrl(resolvedConfig);
            return parsed.matched ? { ...parsed.params, ...parsed.query } : {};
        },
        current,
        has(name: string): boolean {
            return Object.hasOwn(resolvedConfig.routes, name)
        },
    };

    return name ? '' : router;
}

export { route };

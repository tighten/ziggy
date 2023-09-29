import { stringify, parse as qsparse } from 'qs';

type RouteDefinition = {
    uri: string;
    methods: Array<'GET'|'HEAD'|'POST'|'PUT'|'PATCH'|'DELETE'>;
    domain?: string;
    // Does this need to handle booleans too? Are defaults/bindings only for route parameters (inside the path) or can they do query params too? -- No, defaults and bindings are not for query params
    bindings?: Record<string, string|number>; // |boolean?
    wheres?: Record<string, string>;
};

type Ziggy = {
    url: string;
    port?: string|number;
    absolute: boolean;
    location?: string | URL,
    defaults: Record<string, string|number>; // |boolean?
    routes: Record<string, RouteDefinition>,
    // routes: RouteCollection;
};

declare global {
    var Ziggy: Ziggy;
}

type RouteName = keyof typeof Ziggy['routes'];

type Router = {
    params: object;
    current(): string|undefined;
    current(name: string): boolean;
    current(name: string, params: object): boolean;
    has(name: string): boolean;
    check(name: string): boolean;
}

/*
    (\/?)          # optional preceding `/`
    {              # entire route parameter wrapped in `{}`
        ([^}?]+)   # parameter name inside `{}` with any characters except `}` or `?`
        (\??)      # optional trailing `?` to indicate that the parameter itself is optional
    }
 */
const PARAMETERS = /(\/?){([^}?]+)(\??)}/g;

/**
 * Get a 'template' of the complete URL for this route.
 *
 * @example
 * https://{team}.ziggy.dev/user/{user}
 */
function template(route: RouteDefinition, config: Ziggy) {
    // if we're building a relative URL (path only) there's no origin, otherwise: if this route
    // has a domain configured we construct the origin with that, if not we use the app URL
    const origin = config.absolute
        ? (route.domain ? `${/^\w+:\/\//.exec(config.url)}${route.domain}${config.port ? `:${config.port}` : ''}` : config.url)
        : '';
    return `${origin}/${route.uri}`.replace(/\/+$/, '');
}

type UrlRouteMatchResult = { matched: false }|{ matched: true, params: Record<string, string>, query: object }
/**
     * Get whether this route's template matches the given URL.
     */
function attemptUrlRouteMatch(url: URL, route: RouteDefinition, config: Ziggy): UrlRouteMatchResult {
    // It's impossible to be 'on' a POST/etc. URL in the browser
    if (route.methods.includes('GET')) {
        // Transform the route's template into a regex that will match a hydrated URL,
        // by replacing its parameter segments with matchers for parameter values
        const pattern = template(route, config)
            .replace(PARAMETERS, (_, slash, segment, optional) => {
                const regex = `(?<${segment}>${route.wheres?.[segment]?.replace(/(^\^)|(\$$)/g, '') || '[^/?]+'})`;
                return optional ? `(${slash}${regex})?` : `${slash}${regex}`;
            })
            .replace(/^\w+:\/\//, '');

        const matches = new RegExp(`^${pattern}/?$`).exec(`${config.absolute ? url.host : ''}${url.pathname}`); // todo

        if (matches) {
            return {
                matched: true,
                params: matches.groups ?? {},
                query: qsparse(url.search.replace(/^\?/, '')), // todo just use url.searchParams?
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
    const url = new URL(config.location ?? window.location.href);
    let params = { params: {}, query: {} };
    const [name, route] = Object.entries(config.routes).find(([, route]) => {
        const result = attemptUrlRouteMatch(url, route, config)
        if (result.matched) {
            params = { params: result.params, query: result.query }
        }
        return result.matched
    }) || [];
    return name && route ? { matched: true, name, route, ...params } : { matched: false };
}

function defaults(route: RouteDefinition, config: Ziggy): object {
    return getParameters(route, config)
        .filter(({ name }) => Object.hasOwn(config.defaults, name))
        .reduce((defaults, param) => ({ ...defaults, [param.name]: config.defaults[param.name] }), {});
}

function getParameters(route: RouteDefinition, config: Ziggy) {
    // doesn't have to include the protocol or be formatted nicely, we just need the parameters
    const template = `${config.absolute ? (route.domain ?? config.url) : ''}${route.uri}`;
    // get the parameters
    const matches = template.matchAll(PARAMETERS);
    // return simple objects
    return Array.from(matches).map(([,, name, optional]) => ({ name: name!, required: !optional })) ?? [];
}

function substiteBindings(inputParams: object, route: RouteDefinition, config: Ziggy): object {
    return Object.entries(inputParams).reduce((result, [key, value]: [string, any]) => {
        if (!value || value instanceof Array || typeof value !== 'object' || !getParameters(route, config).some(({ name }) => name === key)) {
            return { ...result, [key]: value };
        }
        route.bindings ??= {};
        let bindingKey = route.bindings[key];
        if (!bindingKey || !Object.hasOwn(value, bindingKey)) {
            if (Object.hasOwn(value, 'id')) {
                route.bindings[key] = 'id';
            } else {
                throw new Error(`Ziggy error: object passed as '${key}' parameter is missing route model binding key '${bindingKey}'.`)
            }
        }
        return { ...result, [key]: value[route.bindings[key] ?? 0] }; // TODO
    }, {});
}

function normalizeInput(inputParams: any, route: RouteDefinition, config: Ziggy): Record<string, any> {
    if (typeof inputParams === 'string' || typeof inputParams === 'number') {
        inputParams = [inputParams];
    }
    const parameters = getParameters(route, config).filter(({ name }) => !Object.hasOwn(config.defaults, name));
    if (inputParams instanceof Array) {
        inputParams = inputParams.reduce((allParams, value, position) => {
            const parameter = parameters[position];
            if (parameter) {
                return { ...allParams, [parameter.name]: value };
            }
            return {
                ...allParams,
                ...(
                    typeof value === 'object'
                        ? value
                        : { [value]: '' }
                ),
            };
        }, {});
    } else {
        const firstParameterBindingKey = Object.values(route.bindings ?? {})[0];
        if (
            parameters.length === 1
            && parameters[0]
            && !Object.hasOwn(inputParams, parameters[0].name)
            && (
                firstParameterBindingKey && Object.hasOwn(inputParams, firstParameterBindingKey)
                || Object.hasOwn(inputParams, 'id')
            )
        ) {
            inputParams = { [parameters[0].name]: inputParams };
        }
    }

    return {
        ...defaults(route, config),
        ...substiteBindings(inputParams, route, config),
    };
}

function compileRouteUrl(name: string, inputParams: Record<string, any>, route: RouteDefinition, config: Ziggy): string {
    const routeTemplate = template(route, config);
    const segments = getParameters(route, config);

    if (!segments.length) return routeTemplate;

    return routeTemplate.replace(/{([^}?]+)(\??)}/g, (_, segment, optional) => {
        const parameterName = segment;
        // If the parameter is missing but is not optional, throw an error
        const param = inputParams[parameterName];
        if (!optional && (param === null || param === undefined)) {
            throw new Error(`Ziggy error: '${segment}' parameter is required for route '${name}'.`)
        }

        if (segments[segments.length - 1]?.name === segment && route.wheres?.[segment] === '.*') {
            return encodeURIComponent(inputParams[segment] ?? '').replace(/%2F/g, '/');
        }

        if (route.wheres?.[segment] && !new RegExp(`^${optional ? `(${route.wheres[segment]})?` : route.wheres[segment]}$`).test(inputParams[segment] ?? '')) {
            throw new Error(`Ziggy error: '${segment}' parameter does not match required format '${route.wheres[segment]}' for route '${name}'.`)
        }

        return encodeURIComponent(inputParams[segment] ?? '');
    }).replace(/\/+$/, '');
}

function compileUrl(name: string, inputParams: object|undefined, config: Ziggy): string {
    const route = config.routes[name];
    if (!route) {
        throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
    }
    const params = normalizeInput(inputParams ?? {}, route, config);
    const unhandled = Object.keys(params)
        .filter((key) => !getParameters(route, config).some(({ name }) => name === key))
        .filter((key) => key !== '_query')
        .reduce((result, current) => ({ ...result, [current]: params[current] }), {});
    return compileRouteUrl(name, params, route, config) + stringify({ ...unhandled, ...params['_query'] }, {
        addQueryPrefix: true,
        arrayFormat: 'indices',
        encodeValuesOnly: true,
        skipNulls: true,
        encoder: (value, encoder) => typeof value === 'boolean' ? (value ? '1' : '0') : encoder(value),
    });
}

function route(): Router;
function route(name: RouteName, params?: object, absolute?: boolean, config?: Ziggy): string;
function route(name?: RouteName, params?: object, absolute: boolean = true, config?: Ziggy): Router|string {
    // Check if this is still undefined and throw an error telling the user to set it up properly?
    const resolvedConfig = config ?? Ziggy ?? globalThis?.Ziggy;
    resolvedConfig.absolute = absolute;
    if (name) {
        return compileUrl(name, params, resolvedConfig);
    }

    /**
     * Get the name of the route matching the current window URL, or, given a route name
     * and parameters, check if the current window URL and parameters match that route.
     */
    function current(): string|undefined
    function current(name: string): boolean
    function current(name: string, params: object): boolean
    function current(name?: string, params?: object): string|undefined|boolean {
        // Move inner contents of this function into a wrapper that lives outside `route`?
        const current = parseCurrentUrl(resolvedConfig);
        if (!current.matched) {
            // The current URL doesn't match any named routes
            return name ? false : undefined;
        }
        if (!name) {
            // Called with no arguments, return the name of the current route
            return current.name;
        }
        const match = new RegExp(`^${name.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`).test(current.name);
        if (params === null || params === undefined || !match) {
            // Called with no parameters, so return whether or not the passed name matches,
            // or name doesn't match, so return without checking paramaters
            return match;
        }
        params = normalizeInput(params, current.route, resolvedConfig);
        const routeParams: Record<string, any> = { ...current.params, ...current.query };
        if (Object.values(params).every(p => !p) && !Object.values(routeParams).some(v => v !== undefined)) {
            return true;
        }
        return Object.entries(params).every(([key, value]) => routeParams[key] == value);
    }

    return {
        get params(): Record<string, any> { // should the `any` in this record actually be RouteParam?
            const parsed = parseCurrentUrl(resolvedConfig);
            return parsed.matched ? { ...parsed.params, ...parsed.query } : {};
        },
        current,
        has(name: string): boolean {
            return Object.hasOwn(resolvedConfig.routes, name)
        },
        check(name: string): boolean {
            return Object.hasOwn(resolvedConfig.routes, name)
        },
    };
}

// const Ziggy = {
//     url: 'foo',
//     absolute: false,
//     defaults: {},
//     routes: {
//         home: {
//             uri: '/',
//             methods: ['GET'],
//         },
//         posts: {
//             uri: 'blog',
//             methods: ['GET'],
//         },
//     },
// };

// route('home');
// // @ts-expect-error
// route('users');

export { route };

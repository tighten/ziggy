import Router from './Router';

export type RouteDefinition = {
    uri: string;
    methods: Array<'GET'|'HEAD'|'POST'|'PUT'|'PATCH'|'DELETE'>;
    domain?: string;
    // Does this need to handle booleans too? Are defaults/bindings only for route parameters (inside the path) or can they do query params too? -- No, defaults and bindings are not for query params
    bindings?: Record<string, string|number>; // |boolean?
    wheres?: Record<string, string>;
};

export type RouteParameterSegment = {
    name: string;
    required: boolean;
};

type RouteCollection = {
    [name: string]: RouteDefinition;
};

export type ZiggyConfig = {
    url: string;
    port?: string|number;
    absolute: boolean;
    location?: URL,
    defaults: Record<string, string|number>; // |boolean?
    routes: RouteCollection;
};

declare global {
  var Ziggy: ZiggyConfig;
}

function route(): Router;
function route(name: string, params?: object, absolute?: boolean, config?: ZiggyConfig): string;
function route(name?: string, params?: object, absolute?: boolean, config?: ZiggyConfig): Router|string {
    const router = new Router(name, params, absolute, config);

    return name ? router.toString() : router;
}

export { route };

// https://github.com/tsconfig/bases/blob/main/bases/recommended.json

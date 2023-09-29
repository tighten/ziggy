type RouteDefinition = {
    uri: string;
    methods: Array<'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>;
    domain?: string;
    bindings?: Record<string, string | number>;
    wheres?: Record<string, string>;
};
type Ziggy = {
    url: string;
    port?: string | number;
    absolute: boolean;
    location?: string | URL;
    defaults: Record<string, string | number>;
    routes: Record<string, RouteDefinition>;
};
declare global {
    var Ziggy: Ziggy;
}
type RouteName = keyof typeof Ziggy['routes'];
type Router = {
    params: object;
    current(): string | undefined;
    current(name: string): boolean;
    current(name: string, params: object): boolean;
    has(name: string): boolean;
    check(name: string): boolean;
};
declare function route(): Router;
declare function route(name: RouteName, params?: object, absolute?: boolean, config?: Ziggy): string;
export { route };

declare global {
    var Ziggy: Ziggy;
}
export type Ziggy = {
    url: string;
    port?: string | number;
    absolute: boolean;
    location?: URL;
    defaults: Record<string, string | number>;
    routes: Record<string, RouteDefinition>;
};
type RouteDefinition = {
    uri: string;
    methods: Array<'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>;
    domain?: string;
    bindings?: Record<string, string | number>;
    wheres?: Record<string, string>;
};
export type Router = {
    params: object;
    current(): string | undefined;
    current(name: string): boolean;
    current(name: string, params: object): boolean;
    has(name: string): boolean;
    check(name: string): boolean;
};
type RouteName = string;
declare function route(): Router;
declare function route(name: RouteName, params?: object, absolute?: boolean, config?: Ziggy): string;
export { route };

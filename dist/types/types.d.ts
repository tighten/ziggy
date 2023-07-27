import { ParsedQs } from "qs";
/**
 * Offers the route lookup to be merged with declarations emitted from ts generator
 */
export interface RouteLookup {
}
declare type _ParameterBindingDefinition = {
    name: string;
    binding: string;
} | {
    name: string;
};
declare type _BindingOrValue<T extends _ParameterBindingDefinition> = T extends {
    binding: string;
} ? ParameterBinding<T['binding']> : ParameterValue;
/** Type of the values a parameter can be passed as. */
export declare type ParameterValue = string | number;
/** A parameter as object or primitive */
export declare type ParameterBinding<Name extends string> = {
    [K in Name]: ParameterValue;
} | ParameterValue;
/** Ordered array containing the paramters required to hydrate a route */
export declare type RouteParamsArray<Name extends RouteName> = Name extends keyof RouteLookup ? _RouteParamsArray<RouteLookup[Name]> : GenericRouteParamsArray;
declare type _RouteParamsArray<T extends readonly _ParameterBindingDefinition[]> = {
    [K in keyof T]: _BindingOrValue<T[K]> | null;
};
/** Object containing the paramters required to hydrate a route.  */
export declare type RouteParamsObject<Name extends RouteName> = Name extends keyof RouteLookup ? _RouteParamsObject<RouteLookup[Name]> & QueryObject : GenericRouteParamsObject & QueryObject;
declare type _RouteParamsObject<T extends readonly _ParameterBindingDefinition[]> = {
    [Item in T[number] as Item['name']]?: _BindingOrValue<Item> | null;
};
/** Object containing the normalized paramters required to hydrate a route.  */
export declare type NormalizedRouteParams<Route extends RouteName> = Route extends keyof RouteLookup ? Record<keyof RouteParamsObject<Route>, ParameterValue> & _NormalizedRouteParams : _NormalizedRouteParams;
export declare type _NormalizedRouteParams = Record<keyof any, ParameterValue> & QueryObject;
export declare type GenericRouteParamsArray = _BindingOrValue<_ParameterBindingDefinition>[];
export declare type GenericRouteParamsObject = QueryObject & Record<keyof any, any>;
export declare type GenericRouteParams = GenericRouteParamsArray | GenericRouteParamsObject | ParameterValue;
export declare type QueryObject = {
    _query?: Record<string, any>;
};
/**
 * Holds any known route name or an arbitrary string.
 */
export declare type RouteName = keyof RouteLookup | (string & {});
/**
 * The parameters type to hydrate a route.
 */
export declare type RouteParams<Name extends RouteName = RouteName> = RouteParamsArray<Name> | RouteParamsObject<Name> | ParameterValue;
/**
 * Normalized route parameters
 */
export interface Config {
    routes: {
        [key: string]: RouteDefinition;
    };
    url: string;
    port: number | null;
    location?: Location;
    defaults: {
        [key: string]: ParameterValue;
    };
}
export declare type RouteMethods = "GET" | "HEAD" | "POST" | "PATCH" | "PUT" | "OPTIONS" | "DELETE";
export interface RouteConfig extends Config {
    absolute?: boolean;
}
export interface RouteDefinition {
    wheres?: any;
    bindings?: Record<string, string>;
    uri: string;
    domain?: string;
    methods: RouteMethods[];
}
export interface RouteMatchResult {
    params: NormalizedRouteParams<string>;
    query: ParsedQs;
}
export {};

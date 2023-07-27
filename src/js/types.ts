import { ParsedQs } from "qs";

/**
 * Offers the route lookup to be merged with declarations emitted from ts generator
 */
export interface RouteLookup {
    //
}

type _ParameterBindingDefinition = { name: string, binding: string } | { name: string }
type _BindingOrValue<T extends _ParameterBindingDefinition> = T extends { binding: string } ? ParameterBinding<T['binding']> : ParameterValue

/** Type of the values a parameter can be passed as. */
export type ParameterValue = string | number;
/** A parameter as object or primitive */
export type ParameterBinding<Name extends string> = { [K in Name]: ParameterValue } | ParameterValue;

/** Ordered array containing the paramters required to hydrate a route */
export type RouteParamsArray<Name extends RouteName> = Name extends keyof RouteLookup ? _RouteParamsArray<RouteLookup[Name]> : GenericRouteParamsArray;
type _RouteParamsArray<T extends readonly _ParameterBindingDefinition[]> = { [K in keyof T]: _BindingOrValue<T[K]> | null };

/** Object containing the paramters required to hydrate a route.  */
export type RouteParamsObject<Name extends RouteName> = Name extends keyof RouteLookup ? _RouteParamsObject<RouteLookup[Name]> & QueryObject : GenericRouteParamsObject & QueryObject;
type _RouteParamsObject<T extends readonly _ParameterBindingDefinition[]> = { [Item in T[number]as Item['name']]?: _BindingOrValue<Item> | null };

/** Object containing the normalized paramters required to hydrate a route.  */
export type NormalizedRouteParams<Route extends RouteName> = Route extends keyof RouteLookup ? Record<keyof RouteParamsObject<Route>, ParameterValue> & _NormalizedRouteParams : _NormalizedRouteParams;
export type _NormalizedRouteParams = Record<keyof any, ParameterValue> & QueryObject;

export type GenericRouteParamsArray = _BindingOrValue<_ParameterBindingDefinition>[];
export type GenericRouteParamsObject = QueryObject & Record<keyof any, any>;
export type GenericRouteParams = GenericRouteParamsArray | GenericRouteParamsObject | ParameterValue;

export type QueryObject = { _query?: Record<string, any> };
/**
 * Holds any known route name or an arbitrary string.
 */
export type RouteName = keyof RouteLookup | (string & {});
/**
 * The parameters type to hydrate a route.
 */
export type RouteParams<Name extends RouteName = RouteName> = RouteParamsArray<Name> | RouteParamsObject<Name> | ParameterValue;
/**
 * Normalized route parameters
 */
// export type NormalizedRouteParams<Name extends RouteName = RouteName> = (Name extends keyof RouteLookup ? Record<RouteLookup[Name][number]['name'], ParameterValue> : Record<string, ParameterValue>) & { _query: Record<string, ParameterValue> };




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

export type RouteMethods =
    | "GET"
    | "HEAD"
    | "POST"
    | "PATCH"
    | "PUT"
    | "OPTIONS"
    | "DELETE";

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


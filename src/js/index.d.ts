/**
 * A list of routes and their parameters and bindings.
 *
 * Extended and filled by the route list generated automatically by Ziggy.
 */
export interface RouteList {
    //
}

/**
 * A route name registered with Ziggy.
 */
type KnownRouteName = keyof RouteList;

/**
 * A route name, or any string.
 */
type RouteName = KnownRouteName | (string & {});

/**
 * Information about a single route parameter.
 */
type ParameterInfo = { name: string, binding?: string };

/**
 * A primitive route parameter value.
 */
type ParameterValue = string | number;

/**
 * A route parameter value, possibly nested inside an object under its binding key.
 */
type ValueOrBoundValue<I extends ParameterInfo> = I extends { binding: string }
    ? { [K in I['binding']]: ParameterValue } | ParameterValue
    : ParameterValue
// type A = ValueOrBoundValue<{ name: 'foo', binding: 'bar' }>;
// = ParameterValue | { bar: ParameterValue }

/**
 * An object containing a special '_query' key to target the query string of a URL.
 */
type HasQueryParam = { _query?: Record<string, any> };
/**
 * An object of parameters for an unknown route.
 */
type GenericRouteParamsObject = Record<keyof any, any> & HasQueryParam;
/**
 * An object of parameters for a specific named route registered with Ziggy.
 */
type KnownRouteParamsObject<I extends readonly ParameterInfo[]> = { [T in I[number] as T['name']]?: ValueOrBoundValue<T> | string } & HasQueryParam;
/**
 * An object of route parameters.
 */
type RouteParamsObject<N extends RouteName> = N extends KnownRouteName ? KnownRouteParamsObject<RouteList[N]> : GenericRouteParamsObject;

/**
 * An array of parameters for an unknown route.
 */
type GenericRouteParamsArray = ValueOrBoundValue<ParameterInfo>[];
/**
 * An array of parameters for a specific named route registered with Ziggy.
 */
type KnownRouteParamsArray<I extends readonly ParameterInfo[]> = { [K in keyof I]: ValueOrBoundValue<I[K]> | string };
// type B = KnownRouteParamsArray<[{ name: 'post', binding: 'uuid' }]>;
// = [ParameterValue | { uuid: ParameterValue }]
/**
 * An array of route parameters.
 */
type RouteParamsArray<N extends RouteName> = N extends KnownRouteName ? KnownRouteParamsArray<RouteList[N]> : GenericRouteParamsArray;

/**
 * All possible parameter arguments for a route.
 */
type RouteParams<N extends RouteName> = ParameterValue | RouteParamsObject<N> | RouteParamsArray<N>;

/**
 * Ziggy's route helper.
 */
// TODO
export function route<T extends RouteName>(
    name: T,
    params?: RouteParams<T> | undefined,
    absolute?: boolean,
    config?: object,
): string;
export function route(): any;

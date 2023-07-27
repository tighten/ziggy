import { NormalizedRouteParams, RouteConfig, RouteDefinition, RouteMatchResult, RouteName } from ".";
/**
 * A Laravel route. This class represents one route and its configuration and metadata.
 */
export default class Route<Name extends RouteName> {
    readonly name: Name;
    readonly definition: RouteDefinition;
    readonly config: RouteConfig;
    readonly bindings: Record<string, string>;
    readonly wheres: any;
    /**
     * @param name - Route name.
     * @param definition - Route definition.
     * @param config - Ziggy configuration.
     */
    constructor(name: Name, definition: RouteDefinition, config: RouteConfig);
    /**
     * Get a 'template' of the complete URL for this route.
     *
     * @example
     * https://{team}.ziggy.dev/user/{user}
     *
     * @return Route template.
     */
    get template(): string;
    /**
     * Get a template of the origin for this route.
     *
     * @example
     * https://{team}.ziggy.dev/
     *
     * @return Route origin template.
     */
    get origin(): string;
    /**
     * Get an array of objects representing the parameters that this route accepts.
     *
     * @example
     * [{ name: 'team', required: true }, { name: 'user', required: false }]
     *
     * @return {Array} Parameter segments.
     */
    get parameterSegments(): {
        name: string;
        required: boolean;
    }[];
    /**
     * Get whether this route's template matches the given URL.
     *
     * @param url - URL to check.
     * @return If this route matches, returns the matched parameters.
     */
    matchesUrl(url: string): RouteMatchResult | false;
    /**
     * Hydrate and return a complete URL for this route with the given parameters.
     */
    compile(params: NormalizedRouteParams<Name>): string;
}

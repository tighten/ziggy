import { parse } from "qs";
import { NormalizedRouteParams, RouteConfig, RouteDefinition, RouteMatchResult, RouteName } from ".";

/**
 * A Laravel route. This class represents one route and its configuration and metadata.
 */
export default class Route<Name extends RouteName> {
    readonly bindings: Record<string, string>;
    readonly wheres: any;

    /**
     * @param name - Route name.
     * @param definition - Route definition.
     * @param config - Ziggy configuration.
     */
    constructor(public readonly name: Name, public readonly definition: RouteDefinition, public readonly config: RouteConfig) {
        this.bindings = definition.bindings ?? {};
        this.wheres = definition.wheres ?? {};
    }

    /**
     * Get a 'template' of the complete URL for this route.
     *
     * @example
     * https://{team}.ziggy.dev/user/{user}
     *
     * @return Route template.
     */
    get template(): string {
        return `${this.origin}/${this.definition.uri}`.replace(/\/+$/, "");
    }

    /**
     * Get a template of the origin for this route.
     *
     * @example
     * https://{team}.ziggy.dev/
     *
     * @return Route origin template.
     */
    get origin(): string {
        // If  we're building just a path there's no origin, otherwise: if this route has a
        // domain configured we construct the origin with that, if not we use the app URL
        return !this.config.absolute
            ? ""
            : this.definition.domain
                ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain
                }${this.config.port ? `:${this.config.port}` : ""}`
                : this.config.url;
    }

    /**
     * Get an array of objects representing the parameters that this route accepts.
     *
     * @example
     * [{ name: 'team', required: true }, { name: 'user', required: false }]
     *
     * @return {Array} Parameter segments.
     */
    get parameterSegments() {
        return (
            this.template.match(/{[^}?]+\??}/g)?.map((segment) => ({
                name: segment.replace(/{|\??}/g, ""),
                required: !/\?}$/.test(segment),
            })) ?? []
        );
    }

    /**
     * Get whether this route's template matches the given URL.
     *
     * @param url - URL to check.
     * @return If this route matches, returns the matched parameters.
     */
    matchesUrl(url: string): RouteMatchResult | false {
        if (!this.definition.methods.includes("GET")) return false;

        // Transform the route's template into a regex that will match a hydrated URL,
        // by replacing its parameter segments with matchers for parameter values
        const pattern = this.template
            .replace(/(\/?){([^}?]*)(\??)}/g, (_, slash, segment, optional) => {
                const regex = `(?<${segment}>${this.wheres[segment]?.replace(/(^\^)|(\$$)/g, "") ||
                    "[^/?]+"
                    })`;
                return optional ? `(${slash}${regex})?` : `${slash}${regex}`;
            })
            .replace(/^\w+:\/\//, "");

        const [location, query] = url.replace(/^\w+:\/\//, "").split("?");

        const matches = new RegExp(`^${pattern}/?$`).exec(location);

        if (matches) {
            for (const k in matches.groups) {
                matches.groups[k] =
                    typeof matches.groups[k] === "string"
                        ? decodeURIComponent(matches.groups[k])
                        : matches.groups[k];
            }
            return { params: matches.groups, query: parse(query) };
        }

        return false;
    }

    /**
     * Hydrate and return a complete URL for this route with the given parameters.
     */
    compile(params: NormalizedRouteParams<Name>): string {
        const segments = this.parameterSegments;

        if (!segments.length) return this.template;

        return this.template
            .replace(/{([^}?]+)(\??)}/g, (_, segment: keyof typeof params & string, optional) => {
                // If the parameter is missing but is not optional, throw an error
                if (!optional && [null, undefined].includes(params[segment])) {
                    throw new Error(
                        `Ziggy error: '${segment}' parameter is required for route '${this.name}'.`
                    );
                }

                if (
                    segments[segments.length - 1].name === segment &&
                    this.wheres[segment] === ".*"
                ) {
                    return encodeURIComponent(params[segment] ?? "").replace(
                        /%2F/g,
                        "/"
                    );
                }

                if (
                    this.wheres[segment] &&
                    !new RegExp(
                        `^${optional
                            ? `(${this.wheres[segment]})?`
                            : this.wheres[segment]
                        }$`
                    ).test(params[segment] as string ?? "")
                ) {
                    throw new Error(
                        `Ziggy error: '${segment}' parameter does not match required format '${this.wheres[segment]}' for route '${this.name}'.`
                    );
                }

                return encodeURIComponent(params[segment] ?? "");
            })
            .replace(`${this.origin}//`, `${this.origin}/`)
            .replace(/\/+$/, "");
    }
}

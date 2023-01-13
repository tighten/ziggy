import { parse } from 'qs';
import type { RouteDefinition, RouteParameterSegment, ZiggyConfig } from '.';

/**
 * A Laravel route. This class represents one route and its configuration and metadata.
 */
export default class Route {
    name: string;
    definition: RouteDefinition;
    bindings: Record<string, string|number>;
    wheres: Record<string, string>;
    config: ZiggyConfig;

    constructor(name: string, definition: RouteDefinition, config: ZiggyConfig) {
        this.name = name;
        this.definition = definition;
        this.bindings = definition.bindings ?? {};
        this.wheres = definition.wheres ?? {};
        this.config = config;
    }

    /**
     * Get a 'template' of the complete URL for this route.
     *
     * @example https://{team}.ziggy.dev/user/{user}
     */
    get template(): string {
        // If  we're building just a path there's no origin, otherwise: if this route has a
        // domain configured we construct the origin with that, if not we use the app URL
        const origin = !this.config.absolute ? '' : this.definition.domain
            ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain}${this.config.port ? `:${this.config.port}` : ''}`
            : this.config.url;

        return `${origin}/${this.definition.uri}`.replace(/\/+$/, '');
    }

    /**
     * Get an array of objects representing the parameters that this route accepts.
     */
    get parameterSegments(): Array<RouteParameterSegment> {
        return this.template.match(/{[^}?]+\??}/g)?.map((segment) => ({
            name: segment.replace(/{|\??}/g, ''),
            required: !/\?}$/.test(segment),
        })) ?? [];
    }

    /**
     * Get whether this route's template matches the given URL.
     */
    matchesUrl(url: string): { params: any, query: any }|false {
        if (!this.definition.methods.includes('GET')) return false;

        // Transform the route's template into a regex that will match a hydrated URL,
        // by replacing its parameter segments with matchers for parameter values
        const pattern = this.template
            .replace(/(\/?){([^}?]*)(\??)}/g, (_, slash, segment, optional) => {
                const regex = `(?<${segment}>${this.wheres[segment]?.replace(/(^\^)|(\$$)/g, '') || '[^/?]+'})`;
                return optional ? `(${slash}${regex})?` : `${slash}${regex}`;
            })
            .replace(/^\w+:\/\//, '');

        const [location, query] = url.replace(/^\w+:\/\//, '').split('?');

        const matches = new RegExp(`^${pattern}/?$`).exec(location);

        return matches ? { params: matches.groups, query: parse(query) } : false;
    }

    /**
     * Hydrate and return a complete URL for this route with the given parameters.
     */
    compile(params: any): string {
        const segments = this.parameterSegments;

        if (!segments.length) return this.template;

        return this.template.replace(/{([^}?]+)(\??)}/g, (_, segment, optional) => {
            // If the parameter is missing but is not optional, throw an error
            if (!optional && [null, undefined].includes(params[segment])) {
                throw new Error(`Ziggy error: '${segment}' parameter is required for route '${this.name}'.`)
            }

            if (segments[segments.length - 1]?.name === segment && this.wheres[segment] === '.*') {
                return encodeURIComponent(params[segment] ?? '').replace(/%2F/g, '/');
            }

            if (this.wheres[segment] && !new RegExp(`^${optional ? `(${this.wheres[segment]})?` : this.wheres[segment]}$`).test(params[segment] ?? '')) {
                throw new Error(`Ziggy error: '${segment}' parameter does not match required format '${this.wheres[segment]}' for route '${this.name}'.`)
            }

            return encodeURIComponent(params[segment] ?? '');
        }).replace(/\/+$/, '');
    }
}

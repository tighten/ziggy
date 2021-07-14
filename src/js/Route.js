/**
 * A Laravel route. This class represents one route and its configuration and metadata.
 */
export default class Route {
    /**
     * @param {String} name - Route name.
     * @param {Object} definition - Route definition.
     * @param {Object} config - Ziggy configuration.
     */
    constructor(name, definition, config) {
        this.name = name;
        this.definition = definition;
        this.bindings = definition.bindings ?? {};
        this.config = config;
    }

    /**
     * Get a 'template' of the complete URL for this route.
     *
     * @example
     * https://{team}.ziggy.dev/user/{user}
     *
     * @return {String} Route template.
     */
    get template() {
        // If  we're building just a path there's no origin, otherwise: if this route has a
        // domain configured we construct the origin with that, if not we use the app URL
        const origin = !this.config.absolute ? '' : this.definition.domain
            ? `${this.config.url.match(/^\w+:\/\//)[0]}${this.definition.domain}${this.config.port ? `:${this.config.port}` : ''}`
            : this.config.url;

        return `${origin}/${this.definition.uri}`.replace(/\/+$/, '');
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
        return this.template.match(/{[^}?]+\??}/g)?.map((segment) => ({
            name: segment.replace(/{|\??}/g, ''),
            required: !/\?}$/.test(segment),
        })) ?? [];
    }

    /**
     * Get whether this route's template matches the given URL.
     *
     * @param {String} url - URL to check.
     * @return {Boolean} Whether this route matches.
     */
    matchesUrl(url) {
        if (!this.definition.methods.includes('GET')) return false;

        // Transform the route's template into a regex that will match a hydrated URL,
        // by replacing its parameter segments with matchers for parameter values
        const pattern = this.template
            .replace(/\/{[^}?]*\?}/g, '(\/[^/?]+)?')
            // TODO: the above line with the leading slash is necessary to pick up completely optional *segments*,
            // like in `/pages/{subPage?}`, so that those are handled first before the more permissive patterns
            // below, but there's probably a way to do this in one shot
            .replace(/{[^}?]*\?}/g, '([^/?]+)?')
            .replace(/{[^}]+}/g, '[^/?]+')
            .replace(/^\w+:\/\//, '');

        return new RegExp(`^${pattern}$`).test(url.replace(/\/+$/, '').split('?').shift());
    }

    /**
     * Hydrate and return a complete URL for this route with the given parameters.
     *
     * @param {Object} params
     * @return {String}
     */
    compile(params) {
        if (!this.parameterSegments.length) return this.template;

        return this.template.replace(/{([^}?]+)\??}/g, (_, segment) => {
            // If the parameter is missing but is not optional, throw an error
            if ([null, undefined].includes(params[segment]) && this.parameterSegments.find(({ name }) => name === segment).required) {
                throw new Error(`Ziggy error: '${segment}' parameter is required for route '${this.name}'.`)
            }

            return encodeURIComponent(params[segment] ?? '');
        }).replace(/\/+$/, '');
    }
}

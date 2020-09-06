import UrlBuilder from './UrlBuilder';
import { stringify } from 'qs';

function partition(array, test) {
    return array.reduce(([pass, fail], value) => {
        return test(value) ? [[...pass, value], fail] : [pass, [...fail, value]];
    }, [[], []]);
}

function extractSegments(template) {
    return template
        .match(/{[^}?]+\??}/g)
        ?.map((segment) => ({
            name: segment.replace(/{|\??}/g, ''),
            optional: /\?}$/.test(segment),
        })) ?? [];
};

class Router extends String {
    constructor(name, params, absolute, customZiggy = null) {
        super();

        this.name = name;
        this.absolute = absolute;
        this.ziggy = customZiggy ? customZiggy : Ziggy;
        this.urlBuilder = this.name ? new UrlBuilder(name, absolute, this.ziggy) : null;
        this.template = this.urlBuilder ? this.urlBuilder.construct() : '';
        this.bindings = this.ziggy.namedRoutes[this.name]?.bindings;
        this.urlParams = this.normalizeParams(params);
        this.queryParams = {};
        this.hydrated = '';
    }

    normalizeParams(params = {}) {
        // If 'params' is a single string or integer, wrap it in an array
        params = ['string', 'number'].includes(typeof params) ? [params] : params;

        let defaults, segments;

        if (this.template) {
            [defaults, segments] = partition(
                extractSegments(this.template),
                (s) => Object.keys(this.ziggy.defaultParameters).includes(s.name)
            );

            defaults = defaults.reduce((result, current, i) => ({ ...result, [current.name]: this.ziggy.defaultParameters[current.name] }), {});
        }

        // We need an early strategy for determining if a key is 'missing' or if it just appears to be,
        // based on the shape of the parameters object passed in.
        // -> If there is more than one segment and the params are one object, that object must have keys for every segment
        // -> If there's only one segment (AND for each individual segment if there are many)...
        //      -> If it HAS a binding registered and the params are an object, that object MUST have the binding key
        //      -> If it does NOT have a binding registered, the params CANNOT be an object

        if (segments?.length === 1
            && !Object.keys(params).includes(segments[0].name)
            && Object.keys(params).includes(Object.values(this.bindings ?? {})[0])
        ) {
            params = { [segments[0].name]: params };
        }

        // If the parameters are an array they have to be in order, so we can
        // transform them into an object simply by keying them with the route
        // template segments in the order they appear
        return Array.isArray(params)
            ? params.reduce((result, current, i) => ({ ...result, [segments[i].name]: current }), defaults)
            : { ...defaults, ...params };
    }

    with(params) {
        this.urlParams = this.normalizeParams(params);
        return this;
    }

    withQuery(params) {
        Object.assign(this.queryParams, params);
        return this;
    }

    hydrateUrl() {
        if (this.hydrated) return this.hydrated;

        this.segments = extractSegments(this.template);

        let hydrated = this.template.replace(/{([^}?]+)\??}/g, (_, segment) => {
            switch (typeof this.urlParams[segment]) {
                case 'string':
                case 'number':
                    return encodeURIComponent(this.urlParams[segment]);
                case 'object':
                    if (this.urlParams[segment] === null) {
                        if (this.segments.filter(s => s.name === segment).shift().optional) {
                            return '';
                        } else {
                            throw new Error(`Ziggy Error: '${segment}' key is required for route '${this.name}'`);
                        }
                    }
                    return encodeURIComponent(this.urlParams[segment][this.bindings[segment]]);
                case 'undefined':
                    if (this.segments.filter(s => s.name === segment).shift().optional) {
                        return '';
                    } else {
                        throw new Error(`Ziggy Error: '${segment}' key is required for route '${this.name}'`);
                    }
            }
        });

        if (this.urlBuilder != null && this.urlBuilder.path !== '') {
          hydrated = hydrated.replace(/\/+$/, '');
        }

        this.hydrated = hydrated;

        return this.hydrated;
    }

    matchUrl() {
        let windowUrl =
            window.location.hostname +
            (window.location.port ? ':' + window.location.port : '') +
            window.location.pathname;

        // Strip out optional parameters
        let optionalTemplate = this.template
            .replace(/(\/\{[^\}]*\?\})/g, '/')
            .replace(/(\{[^\}]*\})/gi, '[^/?]+')
            .replace(/\/?$/, '')
            .split('://')[1];

        let searchTemplate = this.template
            .replace(/(\{[^\}]*\})/gi, '[^/?]+')
            .split('://')[1];
        let urlWithTrailingSlash = windowUrl.replace(/\/?$/, '/');

        const regularSearch = new RegExp('^' + searchTemplate + '/$').test(
            urlWithTrailingSlash
        );
        const optionalSearch = new RegExp('^' + optionalTemplate + '/$').test(
            urlWithTrailingSlash
        );

        return regularSearch || optionalSearch;
    }

    constructQuery() {
        let diff = Object.keys(this.urlParams).filter((key) => !this.segments.some(s => s.name === key));
        let remainingParams = diff.reduce((result, current) => ({ ...result, [current]: this.urlParams[current] }), this.queryParams ?? {});

        return stringify(remainingParams, {
            encodeValuesOnly: true,
            skipNulls: true,
            addQueryPrefix: true,
            arrayFormat: 'indices'
        });
    }

    current(name = null) {
        let routeNames = Object.keys(this.ziggy.namedRoutes);

        let currentRoute = routeNames.filter(name => {
            if (this.ziggy.namedRoutes[name].methods.indexOf('GET') === -1) {
                return false;
            }

            return new Router(
                name,
                undefined,
                undefined,
                this.ziggy
            ).matchUrl();
        })[0];

        if (name) {
            const pattern = new RegExp(
                '^' + name.replace('.', '\\.').replace('*', '.*') + '$',
                'i'
            );
            return pattern.test(currentRoute);
        }

        return currentRoute;
    }

    check(name) {
        let routeNames = Object.keys(this.ziggy.namedRoutes);

        return routeNames.includes(name);
    }

    extractParams(uri, template, delimiter) {
        const uriParts = uri.split(delimiter);
        const templateParts = template.split(delimiter);

        return templateParts.reduce(
            (params, param, i) =>
                param.indexOf('{') === 0 &&
                param.indexOf('}') !== -1 &&
                uriParts[i]
                    ? Object.assign(params, {
                          [this.trimParam(param)]: uriParts[i]
                      })
                    : params,
            {}
        );
    }

    get params() {
        const namedRoute = this.ziggy.namedRoutes[this.current()];

        let pathname = window.location.pathname
            .replace(this.ziggy.baseUrl.split('://')[1].split('/')[1], '')
            .replace(/^\/+/, '');

        return Object.assign(
            this.extractParams(
                window.location.hostname,
                namedRoute.domain || '',
                '.'
            ),
            this.extractParams(
                pathname,
                namedRoute.uri,
                '/'
            )
        );
    }

    parse() {
        return this.hydrateUrl() + this.constructQuery();
    }

    url() {
        return this.parse();
    }

    toString() {
        return this.url();
    }

    trimParam(param) {
        return param.replace(/{|}|\?/g, '');
    }

    valueOf() {
        return this.url();
    }
}

export default function route(name, params, absolute, customZiggy) {
    return new Router(name, params, absolute, customZiggy);
}

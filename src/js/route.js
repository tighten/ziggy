import UrlBuilder from './UrlBuilder';
import { stringify } from 'qs';

class Router extends String {
    constructor(name, params, absolute, customZiggy = null) {
        super();

        this.name = name;
        this.absolute = absolute;
        this.ziggy = customZiggy ? customZiggy : Ziggy;
        this.urlBuilder = this.name ? new UrlBuilder(name, absolute, this.ziggy) : null;
        this.template = this.urlBuilder ? this.urlBuilder.construct() : '';
        this.urlParams = this.normalizeParams(params);
        this.queryParams = {};
        this.hydrated = '';
    }

    normalizeParams(params) {
        if (typeof params === 'undefined') return {};

        // If you passed in a string or integer, wrap it in an array
        params = typeof params !== 'object' ? [params] : params;

        // If the tags object contains an ID and there isn't an ID param in the
        // url template, they probably passed in a single model object and we should
        // wrap this in an array. This could be slightly dangerous and I want to find
        // a better solution for this rare case.

        if (
            params.hasOwnProperty('id') &&
            this.template.indexOf('{id}') == -1
        ) {
            params = [params.id];
        }

        this.numericParamIndices = Array.isArray(params);
        return Object.assign({}, params);
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

        let hydrated = this.template.replace(
            /{([^}]+)}/gi,
            (tag, i) => {
                let keyName = this.trimParam(tag),
                    defaultParameter,
                    tagValue;

                if (this.ziggy.defaultParameters.hasOwnProperty(keyName)) {
                    defaultParameter = this.ziggy.defaultParameters[keyName];
                }

                // If a default parameter exists, and a value wasn't
                // provided for it manually, use the default value
                if (defaultParameter && !this.urlParams[keyName]) {
                    delete this.urlParams[keyName];
                    return defaultParameter;
                }

                // We were passed an array, shift the value off the
                // object and return that value to the route
                if (this.numericParamIndices) {
                    this.urlParams = Object.values(this.urlParams);

                    tagValue = this.urlParams.shift();
                } else {
                    tagValue = this.urlParams[keyName];
                    delete this.urlParams[keyName];
                }

                // The value is null or defined; is this param
                // optional or not
                if (tagValue == null) {
                    if (tag.indexOf('?') === -1) {
                        throw new Error(
                            "Ziggy Error: '" +
                                keyName +
                                "' key is required for route '" +
                                this.name +
                                "'"
                        );
                    } else {
                        return '';
                    }
                }

                // If an object was passed and has an id, return it
                if (tagValue.id) {
                    return encodeURIComponent(tagValue.id);
                }

                return encodeURIComponent(tagValue);
            }
        );

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
        if (
            Object.keys(this.queryParams).length === 0 &&
            Object.keys(this.urlParams).length === 0
        ) {
            return '';
        }

        let remainingParams = Object.assign(this.urlParams, this.queryParams);

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

        return Object.assign(
            this.extractParams(
                window.location.hostname,
                namedRoute.domain || '',
                '.'
            ),
            this.extractParams(
                window.location.pathname.slice(1),
                namedRoute.uri,
                '/'
            )
        );
    }

    parse() {
        this.return = this.hydrateUrl() + this.constructQuery();
    }

    url() {
        this.parse();
        return this.return;
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

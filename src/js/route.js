import UrlBuilder from './UrlBuilder';

class Router extends String {
    constructor(name, params, absolute, customZiggy=null) {
        super();

        this.name           = name;
        this.absolute       = absolute;
        this.ziggy          = customZiggy ? customZiggy : Ziggy;
        this.template       = this.name ? new UrlBuilder(name, absolute, this.ziggy).construct() : '';
        this.urlParams      = this.normalizeParams(params);
        this.queryParams    = this.normalizeParams(params);
    }

    normalizeParams(params) {
	    if (typeof params === 'undefined')
            return {};

        // If you passed in a string or integer, wrap it in an array
        params = typeof params !== 'object' ? [params] : params;

        // If passed Param is Observable Object [Vue]
        if(Object.keys(params).length < 1)
            return {};

        // If the tags object contains an ID and there isn't an ID param in the
        // url template, they probably passed in a single model object and we should
        // wrap this in an array. This could be slightly dangerous and I want to find
        // a better solution for this rare case.

        if (params.hasOwnProperty('id') && this.template.indexOf('{id}') == -1) {
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
        let tags = this.urlParams,
            paramsArrayKey = 0,
            params = this.template.match(/{([^}]+)}/gi),
            needDefaultParams = false;

        if (params && params.length != Object.keys(tags).length) {
            needDefaultParams = true
        }

        /**
         * include prefix slash to 'params' that we want to change
         */
        return this.template.replace(/\/{([^}]+)}/gi,
            (tag, i) => {
                /**
                 * change tag|Full Match to  Capturing Group
                 * that will escape 'prefix slash' after Trimming
                 */
		        let keyName = this.trimParam(i),
                    key = this.numericParamIndices ? paramsArrayKey : keyName,
                    defaultParameter = this.ziggy.defaultParameters[keyName];

                if (defaultParameter && needDefaultParams) {
                    if (this.numericParamIndices) {
                        tags = Object.values(tags)
                        tags.splice(key, 0, defaultParameter)
                    } else {
                        tags[key] = defaultParameter
                    }
                }

                paramsArrayKey++;
                if (typeof tags[key] !== 'undefined') {
                    delete this.queryParams[key];
                    /**
                     * return params with id if Available
                     */
                    if(typeof tags[key].id !== 'undefined'){
                        /**
                         * without slash in params, 
                         * we can save encode URI Component
                         */
                        return '/'+ encodeURIComponent(tags[key].id);
                    }
                    /**
                     * return params value when id unavailable
                     */
                    return '/' + encodeURIComponent(tags[key]);
                }
                if (tag.indexOf('?') === -1) {
                    throw new Error(`Ziggy Error: '${keyName}' key is required for route '${this.name}'`);
                } else {
                    return '';
                }
            }
        );
    }

    matchUrl() {
        let windowUrl = window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname;

        // Strip out optional parameters
        let optionalTemplate = this.template.replace(/(\/\{[^\}]*\?\})/g, '/')
            .replace(/(\{[^\}]*\})/gi, '[^\/\?]+')
            .replace(/\/?$/, '')
            .split('://')[1];

        let searchTemplate = this.template.replace(/(\{[^\}]*\})/gi, '[^\/\?]+').split('://')[1];
        let urlWithTrailingSlash = windowUrl.replace(/\/?$/, '/');

        const regularSearch = new RegExp("^" + searchTemplate + "\/$").test(urlWithTrailingSlash);
        const optionalSearch = new RegExp("^" + optionalTemplate + "\/$").test(urlWithTrailingSlash);

        return regularSearch || optionalSearch;
    }

    constructQuery() {
        if (Object.keys(this.queryParams).length === 0)
            return '';

        let queryString = '?';

        Object.keys(this.queryParams).forEach(function(key, i) {
            if (this.queryParams[key] !== undefined && this.queryParams[key] !== null) {
                queryString = i === 0 ? queryString : queryString + '&';
                queryString += key + '=' + encodeURIComponent(this.queryParams[key]);
            }
        }.bind(this));

        return queryString;
    }

    go(urlToGo, params){
        this.name           = urlToGo;
        this.template       = new UrlBuilder(urlToGo, this.absolute, this.ziggy, true).construct();
        this.urlParams      = this.normalizeParams(params);
        this.queryParams    = this.normalizeParams(params);
        return this;
    }

    current(name = null) {
        let routeNames = Object.keys(this.ziggy.namedRoutes);

        let currentRoute = routeNames.filter(name => {
            if (this.ziggy.namedRoutes[name].methods.indexOf('GET') === -1) {
                return false;
            }

            return new Router(name, undefined, undefined, this.ziggy).matchUrl();
        })[0];

        if (name) {
            const pattern = new RegExp(name.replace('*', '.*').replace('.', '\.'), 'i');
            return pattern.test(currentRoute);
        }

        return currentRoute;
    }

    extractParams(uri, template, delimiter) {
        const uriParts = uri.split(delimiter);
        const templateParts = template.split(delimiter);

        return templateParts.reduce((params, param, i) => (
            param.indexOf('{') === 0 && param.indexOf('}') !== -1 && uriParts[i]
                ? Object.assign(params, { [this.trimParam(param)]: uriParts[i] })
                : params
        ), {});
    }

    get params() {
        const namedRoute = this.ziggy.namedRoutes[this.current()];

        return Object.assign(
            this.extractParams(window.location.hostname, namedRoute.domain || '', '.'),
            this.extractParams(window.location.pathname.slice(1), namedRoute.uri, '/'),
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

export default function route(name, params, absolute, customZiggy){
    return new Router(name, params, absolute, customZiggy);
};

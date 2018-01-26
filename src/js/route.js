import UrlBuilder from './UrlBuilder';

class Router extends String {
    constructor(name, params, absolute) {
        super();

        this.name           = name;
        this.absolute       = absolute;
        this.urlParams      = this.normalizeParams(params);
        this.queryParams    = this.normalizeParams(params);
    }

    normalizeParams(params) {
        if (typeof params === 'undefined')
            return {};

        params = typeof params !== 'object' ? [params] : params;
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
            template = new UrlBuilder(this.name, this.absolute).construct(),
            params = template.match(/{([^}]+)}/gi),
            needDefaultParams = false;
        
        if (params && params.length != Object.keys(tags).length) {
            needDefaultParams = true
        }

        return template.replace(
            /{([^}]+)}/gi,
            function (tag) {
                let keyName = tag.replace(/\{|\}/gi, '').replace(/\?$/, ''),
                    key = this.numericParamIndices ? paramsArrayKey : keyName,
                    defaultParameter = Ziggy.defaultParameters[keyName];

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
                    return tags[key].id || encodeURIComponent(tags[key]);
                }
                if (tag.indexOf('?') === -1) {
                    throw new Error(`Ziggy Error: '${keyName}' key is required for route '${this.name}'`);
                } else {
                    return '';
                }
            }.bind(this)
        );
    }

    matchUrl() {
        let tags = this.urlParams,
            paramsArrayKey = 0,
            template = new UrlBuilder(this.name, this.absolute).construct();

        let windowUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + window.location.pathname;

        let searchTemplate = template.replace(/(\{[^\}]*\})/gi, '[^\/\?]+');
        let urlWithTrailingSlash = windowUrl.replace(/\/?$/, '/');
        return new RegExp("^" + searchTemplate + "\/$").test(urlWithTrailingSlash);
    }

    constructQuery() {
        if (Object.keys(this.queryParams).length === 0)
            return '';

        let queryString = '?';

        Object.keys(this.queryParams).forEach(function(key, i) {
            queryString = i === 0 ? queryString : queryString + '&';
            queryString += key + '=' + encodeURIComponent(this.queryParams[key]);
        }.bind(this));

        return queryString;
    }

    current(name = null) {
        let routeNames = Object.keys(Ziggy.namedRoutes);

        let currentRoute = routeNames.filter(name => {
            return new Router(name).matchUrl();
        })[0];

        return name ? (name == currentRoute) : currentRoute;
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

    valueOf() {
        return this.url();
    }
}

export default function route(name, params, absolute) {
    return new Router(name, params, absolute);
};

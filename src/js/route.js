class Router extends String {

    constructor(name, params, absolute) {
        super();

        this.name = name;
        this.urlParams = this.normalizeParams(params);
        this.queryParams = this.normalizeParams(params);
        this.absolute = absolute === undefined ? true : absolute;
        this.domain = this.constructDomain();
        this.url = namedRoutes[this.name].uri.replace(/^\//, '');
    }

    normalizeParams(params) {
        if (params === undefined)
            return {};

        params = typeof params !== 'object' ? [params] : params;
        this.numericParamIndices = Array.isArray(params);

        return Object.assign({}, params);
    };


    constructDomain() {
        if (this.name === undefined) {
            throw new Error('Ziggy Error: You must provide a route name');
        } else if (namedRoutes[this.name] === undefined) {
            throw new Error(`Ziggy Error: route '${this.name}' is not found in the route list`);
        } else if (! this.absolute) {
            return '/';
        }

        let routeDomain = (namedRoutes[this.name].domain || baseDomain).replace(/\/+$/, '');
        if (basePort && (routeDomain.replace(/\/+$/, '') === baseDomain.replace(/\/+$/, ''))) {
            routeDomain = routeDomain + ':' + basePort;
        }

        return baseProtocol + '://' + routeDomain + '/';
    };


    with(params) {
        this.urlParams = this.normalizeParams(params);

        return this;
    };


    withQuery(params) {
        Object.assign(this.queryParams, params);

        return this;
    };


    constructUrl() {
        let url = this.domain + this.url,
            tags = this.urlParams,
            paramsArrayKey = 0;

        return url.replace(
            /{([^}]+)}/gi,
            function (tag) {
                let keyName = tag.replace(/\{|\}/gi, '').replace(/\?$/, ''),
                    key = this.numericParamIndices ? paramsArrayKey : keyName;

                paramsArrayKey++;
                if (typeof tags[key] !== 'undefined') {
                    delete this.queryParams[key];
                    return tags[key].id || tags[key];
                }
                if (tag.indexOf('?') === -1) {
                    throw new Error(`Ziggy Error: '${keyName}' key is required for route '${this.name}'`);
                } else {
                    return '';
                }
            }.bind(this)
        );
    };


    constructQuery() {
        if (Object.keys(this.queryParams).length === 0)
            return '';

        let queryString = '?';

        Object.keys(this.queryParams).forEach(function(key, i) {
            queryString = i === 0 ? queryString : queryString + '&';
            queryString += key + '=' + this.queryParams[key];
        }.bind(this));

        return queryString;
    };


    toString() {
        this.parse();
        return this.return;
    };


    valueOf() {
        this.parse();
        return this.return;
    };


    parse() {
        this.return = this.constructUrl() + this.constructQuery();
    };
}

export default function route(name, params, absolute) {
    return new Router(name, params, absolute);
};

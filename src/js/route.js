class Router extends String {

    constructor(name, params, absolute) {
        super();

        this.name = name;
        this.uriParams = this.normalizeParams(params);
        this.queryParams = this.normalizeParams(params);
        this.absolute = absolute === undefined ? true : absolute;
        this.domain = this.constructDomain();
        this.uri = Ziggy.namedRoutes[this.name].uri.replace(/^\//, '');
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
        } else if (Ziggy.namedRoutes[this.name] === undefined) {
            throw new Error(`Ziggy Error: route '${this.name}' is not found in the route list`);
        } else if (! this.absolute) {
            return '/';
        }

        let routeDomain = (Ziggy.namedRoutes[this.name].domain || Ziggy.baseDomain).replace(/\/+$/, '');
        if (Ziggy.basePort && (routeDomain.replace(/\/+$/, '') === Ziggy.baseDomain.replace(/\/+$/, ''))) {
            routeDomain = routeDomain + ':' + Ziggy.basePort;
        }

        return Ziggy.baseProtocol + '://' + routeDomain + '/';
    };

    with(params) {
        this.uriParams = this.normalizeParams(params);

        return this;
    };

    withQuery(params) {
        Object.assign(this.queryParams, params);

        return this;
    };

    constructUrl() {
        let url = this.domain + this.uri,
            tags = this.uriParams,
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

    parse() {
        this.return = this.constructUrl() + this.constructQuery();
    };

    url() {
        this.parse();
        return this.return;
    };

    toString() {
        return this.url();
    };

    valueOf() {
        return this.url();
    };
}

export default function route(name, params, absolute) {
    return new Router(name, params, absolute);
};

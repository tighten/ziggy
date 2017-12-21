class UrlBuilder {
    constructor(name, absolute) {

        this.name       = name;
        this.route      = Ziggy.namedRoutes[this.name];

        if (typeof this.name === 'undefined') {
            throw new Error('Ziggy Error: You must provide a route name');
        } else if (typeof this.route === 'undefined') {
            throw new Error(`Ziggy Error: route '${this.name}' is not found in the route list`);
        }

        this.absolute   = typeof absolute === 'undefined' ? true : absolute;
        this.domain     = this.setDomain();
        this.path       = this.route.uri.replace(/^\//, '');
    }

    setDomain() {
        if (! this.absolute)
            return '/';

        if (!this.route.domain)
            return Ziggy.baseUrl.replace(/\/?$/, '/');

        let host = (this.route.domain || Ziggy.baseDomain).replace(/\/+$/, '');

        if (Ziggy.basePort && (host.replace(/\/+$/, '') === Ziggy.baseDomain.replace(/\/+$/, '')))
            host = Ziggy.baseDomain + ':' + Ziggy.basePort;

        return Ziggy.baseProtocol + '://' + host + '/';
    }

    construct() {
        return this.domain + this.path
    }
}

export default UrlBuilder;

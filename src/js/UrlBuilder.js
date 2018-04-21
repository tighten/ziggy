class UrlBuilder {
    constructor(name, absolute, ziggyObject) {

        this.name = name;
        this.ziggy = ziggyObject;
        this.route = this.ziggy.namedRoutes[this.name];

        if (typeof this.name === 'undefined') {
            throw new Error('Ziggy Error: You must provide a route name');
        } else if (typeof this.route === 'undefined') {
            throw new Error(`Ziggy Error: route '${this.name}' is not found in the route list`);
        }

        this.absolute = typeof absolute === 'undefined' ? true : absolute;
        this.domain = this.setDomain();
        this.path = this.route.uri.replace(/^\//, '');
    }

    setDomain() {
        if (!this.absolute)
            return '/';

        if (!this.route.domain)
            return this.ziggy.baseUrl.replace(/\/?$/, '/');

        let host = (this.route.domain || this.ziggy.baseDomain).replace(/\/+$/, '');

        if (this.ziggy.basePort && (host.replace(/\/+$/, '') === this.ziggy.baseDomain.replace(/\/+$/, '')))
            host = this.ziggy.baseDomain + ':' + this.ziggy.basePort;

        return this.ziggy.baseProtocol + '://' + host + '/';
    }

    construct() {
        return this.domain + this.path
    }
}

export default UrlBuilder;

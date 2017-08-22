var Router = function(name, params, absolute) {
    this.name = name;
    this.params = params === undefined ? {} : params;
    this.absolute = absolute === undefined ? true : absolute;
    this.domain = this.constructDomain();
    this.url = namedRoutes[this.name].uri.replace(/^\//, '');
};

Router.prototype.toString = function() {
    this.parse();
    return this.return;
};

Router.prototype.constructDomain = function() {
    if(this.name === undefined) {
        throw 'Ziggy Error: You must provide a route name';
    }
    else if (namedRoutes[this.name] === undefined) {
        throw 'Ziggy Error: route "'+ this.name +'" is not found in the route list';
    }
    else {
        return (namedRoutes[this.name].domain || baseUrl).replace(/\/+$/,'') + '/';
    }
};

Router.prototype.with = function(params) {
    this.params = params;

    return this;
};

Router.prototype.parse = function() {
    this.return = this.constructUrl();
};

Router.prototype.constructUrl = function() {
    var tags = typeof this.params !== 'object' ? [this.params] : this.params,
    paramsArrayKey = 0;
    var url = this.domain + this.url;
    return url.replace(
        /{([^}]+)}/gi,
        function (tag) {
            var keyName = tag.replace(/[{}]/gi, '').replace(/\?$/, '');
            var key = Array.isArray(tags) ? paramsArrayKey : keyName;

            paramsArrayKey++;
            if (typeof tags[key] !== 'undefined') {
              return tags[key].id || tags[key];
            }
            if (tag.indexOf('?') === -1) {
              throw 'Ziggy Error: "' + keyName + '" key is required for route "' + this.name + '"';
            } else {
              return '';
            }
        }
    );
};

var route = function(name, params, absolute) {
    return new Router(name, params, absolute);
};

if (typeof exports !== 'undefined'){ exports.route = route }

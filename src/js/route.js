var Router = function(name, params, absolute) {
    this.name = name;
    this.urlParams = undefined ? {} : params;
    this.queryParams = undefined ? {} : params;
    this.absolute = absolute === undefined ? true : absolute;
    this.domain = this.constructDomain();
    this.url = namedRoutes[this.name].uri.replace(/^\//, '');
    this.queryString = '';

    this.return = '';

};

Router.prototype.toString = function() {
    this.parse();
    return this.return;
};

Router.prototype.constructDomain = function() {
    if (this.absolute)
        return (namedRoutes[this.name].domain || baseUrl).replace(/\/+$/,'') + '/';

    return '';
};

Router.prototype.with = function(params) {
    this.urlParams = params;

    return this;
};

// @todo Make withQuery merge params into this.queryParams and have constructQuery() generate the string on constructUrl()
Router.prototype.withQuery = function(params)
{
    if(this.url === null) {
        return this.url;
    }
  
    var queryString = '?';
  
    Object.keys(params).forEach(function(key, i) {
        queryString = i === 0 ? queryString : queryString + '&';
        queryString += key + '=' + params[key];
    });
    
    this.queryString = queryString;
    return this;
}

Router.prototype.parse = function() {
    this.return = this.constructUrl();
};

Router.prototype.constructUrl = function() {
    tags = typeof this.urlParams !== 'object' ? [this.urlParams] : this.urlParams,
    paramsArrayKey = 0;
    var url = this.domain + this.url;
    var hydratedUrl = url.replace(
        /\{([^}]+)\}/gi,
        function (tag) {
            var keyName = tag.replace(/\{|\}/gi, '').replace(/\?$/, '');
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

    return hydratedUrl + this.constructQuery();
}

var route = function(name, params, absolute) {
    return new Router(name, params, absolute);
};

if (typeof exports !== 'undefined'){ exports.route = route }
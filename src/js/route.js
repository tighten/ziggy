var route = function(name, params = {}, absolute = true) {
    var domain = (namedRoutes[name].domain || baseUrl).replace(/\/+$/,'') + '/',
        url = (absolute ? domain : '') + namedRoutes[name].uri.replace(/^\//, ''),
        params = typeof params !== 'object' ? [params] : params,
        paramsArrayKey = 0;

    return url.replace(
        /\{([^}]+)\}/gi,
        function (tag) {
            var key = Array.isArray(params) ? paramsArrayKey : tag.replace(/\{|\}/gi, '');
            paramsArrayKey++;
            if (params[key] === undefined) {
                throw 'Ziggy Error: "' + key + '" key is required for route "' + name + '"';
            }
            return params[key];
        }
    );
}

if (typeof exports !== 'undefined'){ exports.route = route }

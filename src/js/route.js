var route = function(name, params, absolute) {
    if (params === undefined) params = {};
    if (absolute === undefined) absolute = true;

    var domain = (namedRoutes[name].domain || baseUrl).replace(/\/+$/,'') + '/',
        url = (absolute ? domain : '') + namedRoutes[name].uri.replace(/^\//, ''),
        params = typeof params !== 'object' ? [params] : params,
        paramsArrayKey = 0;

    return url.replace(
        /\{([^}]+)\}/gi,
        function (tag) {
            var key = Array.isArray(params) ? paramsArrayKey : tag.replace(/\{|\}/gi, '').replace(/\?$/, '');
            paramsArrayKey++;
            if (typeof params[key] !== 'undefined') {
              return params[key].id || params[key];
            }
            if (tag.indexOf('?') === -1) {
              throw 'Ziggy Error: "' + key + '" key is required for route "' + name + '"';
            } else {
              return '';
            }
        }
    );
}

if (typeof exports !== 'undefined'){ exports.route = route }

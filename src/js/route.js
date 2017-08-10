var route = function(name, params = {}, absolute = true) {
    var domain = (namedRoutes[name].domain || baseUrl).replace(/\/+$/,'') + '/',
        url = (absolute ? domain : '') + namedRoutes[name].uri

    return url.replace(
        /\{([^}]+)\}/gi,
        function (tag) {
            var key = tag.replace(/\{|\}/gi, '');
            if (params[key] === undefined) {
                throw 'Ziggy Error: "' + key + '" key is required for route "' + name + '"';
            }
            return params[key];
        }
    );
}

if (typeof exports !== 'undefined'){ exports.route = route }
    var Ziggy = {
        namedRoutes: {"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"domain":null}},
        baseUrl: 'http://example.org/',
        baseProtocol: 'http',
        baseDomain: 'example.org',
        basePort: false,
        defaultParameters: []
    };

    if (typeof window.Ziggy !== 'undefined') {
        for (var name in window.Ziggy.namedRoutes) {
            Ziggy.namedRoutes[name] = window.Ziggy.namedRoutes[name];
        }
    }

    export {
        Ziggy
    }

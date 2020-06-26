    var Ziggy = {"baseUrl":"http:\/\/myapp.com\/","baseProtocol":"http","baseDomain":"myapp.com","basePort":null,"defaultParameters":[],"namedRoutes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"domain":null}}};

    if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
        for (var name in window.Ziggy.namedRoutes) {
            Ziggy.namedRoutes[name] = window.Ziggy.namedRoutes[name];
        }
    }

    export {
        Ziggy
    }

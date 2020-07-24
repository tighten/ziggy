var Ziggy = {"baseUrl":"http:\/\/ziggy.dev\/","baseProtocol":"http","baseDomain":"ziggy.dev","basePort":null,"defaultParameters":[],"namedRoutes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"domain":null,"bindings":[]}}};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    for (var name in window.Ziggy.namedRoutes) {
        Ziggy.namedRoutes[name] = window.Ziggy.namedRoutes[name];
    }
}

export { Ziggy };

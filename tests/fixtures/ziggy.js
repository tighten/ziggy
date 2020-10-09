var Ziggy = {"baseUrl":"http:\/\/ziggy.dev","baseProtocol":"http","baseDomain":"ziggy.dev","basePort":null,"defaultParameters":[],"routes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"]}}};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    for (var name in window.Ziggy.routes) {
        Ziggy.routes[name] = window.Ziggy.routes[name];
    }
}

export { Ziggy };

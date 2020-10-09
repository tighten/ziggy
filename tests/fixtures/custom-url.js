var Ziggy = {"baseUrl":"http:\/\/example.org","baseProtocol":"http","baseDomain":"example.org","basePort":null,"defaultParameters":{"locale":"en"},"routes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"]}}};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    for (var name in window.Ziggy.routes) {
        Ziggy.routes[name] = window.Ziggy.routes[name];
    }
}

export { Ziggy };

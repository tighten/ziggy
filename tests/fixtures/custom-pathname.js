const Ziggy = {"url":"http:\/\/ziggy.dev\/foo\/bar","port":null,"defaults":{"locale":"en"},"routes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"]}}};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    for (let name in window.Ziggy.routes) {
        Ziggy.routes[name] = window.Ziggy.routes[name];
    }
}

export { Ziggy };

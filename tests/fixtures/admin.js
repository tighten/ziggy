const Ziggy = {"url":"http:\/\/ziggy.dev","port":null,"defaults":[],"routes":{"admin.dashboard":{"uri":"admin","methods":["GET","HEAD"]}}};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    for (let name in window.Ziggy.routes) {
        Ziggy.routes[name] = window.Ziggy.routes[name];
    }
}

export { Ziggy };

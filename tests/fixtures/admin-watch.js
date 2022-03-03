const Ziggy = {"url":"http:\/\/ziggy.dev","port":null,"defaults":{},"routes":{"admin.dashboard":{"uri":"admin","methods":["GET","HEAD"]},"admin.second":{"uri":"admin\/second","methods":["GET","HEAD"]}}};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}

export { Ziggy };

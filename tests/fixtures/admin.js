var Ziggy = {
    namedRoutes: {"admin.dashboard":{"uri":"admin","methods":["GET","HEAD"],"domain":null}},
    baseUrl: 'https://ziggy.dev/',
    baseProtocol: 'https',
    baseDomain: 'ziggy.dev',
    basePort: false,
    defaultParameters: [],
};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    for (var name in window.Ziggy.namedRoutes) {
        Ziggy.namedRoutes[name] = window.Ziggy.namedRoutes[name];
    }
}

export { Ziggy };

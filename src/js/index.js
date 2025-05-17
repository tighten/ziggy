import Router from './Router.js';

export function route(name, params, absolute, config) {
    const router = new Router(name, params, absolute, config);

    return name ? router.toString() : router;
}

export const ZiggyVue = {
    install(app, options) {
        const r = (name, params, absolute, config = options) =>
            route(name, params, absolute, config);

        if (parseInt(app.version) > 2) {
            app.config.globalProperties.route = r;
            app.provide('route', r);
        } else {
            app.mixin({
                methods: {
                    route: r,
                },
            });
        }
    },
};

export function useRoute(defaultConfig) {
    if (
        !defaultConfig &&
        !globalThis.Ziggy &&
        typeof Ziggy === 'undefined' &&
        !document.getElementById('ziggy-routes-json')
    ) {
        throw new Error(
            'Ziggy error: missing configuration. Ensure that a `Ziggy` variable is defined globally or pass a config object into the useRoute hook.',
        );
    }

    return (name, params, absolute, config = defaultConfig) =>
        route(name, params, absolute, config);
}

import Router from './Router.js';

export function route(name, params, absolute, config) {
    const router = new Router(name, params, absolute, config);

    return name ? router.toString() : router;
}

export const ZiggyVue = {
    install(app, pluginOptions = {}) {
        const {
            globalRouteFnName = 'route',
            injectRouteFnName = 'route',
            ...options
        } = pluginOptions;

        const r = (name, params, absolute, config = options) =>
            route(name, params, absolute, config);

        if (parseInt(app.version) > 2) {
            app.config.globalProperties[globalRouteFnName] = r;
            app.provide(injectRouteFnName, r);
        } else {
            app.mixin({
                methods: {
                    [globalRouteFnName]: r,
                },
            });
        }
    },
};

export function useRoute(defaultConfig) {
    if (!defaultConfig && !globalThis.Ziggy && typeof Ziggy === 'undefined') {
        throw new Error(
            'Ziggy error: missing configuration. Ensure that a `Ziggy` variable is defined globally or pass a config object into the useRoute hook.',
        );
    }

    return (name, params, absolute, config = defaultConfig) =>
        route(name, params, absolute, config);
}

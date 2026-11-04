import Router from './Router.js';

export function route(name, params, absolute, config) {
    const router = new Router(name, params, absolute, config);

    return name ? router.toString() : router;
}

export const ZiggyVue = {
    install(app, options) {
        try {
            if (process.env.NODE_ENV !== 'production') {
                warnIfConfigDiffersFromRoutesDirective(options);
            }
        } catch (e) {
            // `process` isn't defined, so we can't tell whether this is a development build.
        }

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

function warnIfConfigDiffersFromRoutesDirective(options) {
    if (options?.url && globalThis.Ziggy?.url && options.url !== globalThis.Ziggy.url) {
        console.warn(
            `Ziggy warning: the config passed to ZiggyVue has a different URL (${options.url}) than the global Ziggy config set by @routes (${globalThis.Ziggy.url}). route() may generate different URLs depending on where it's called. Use either @routes or a config passed to .use(ZiggyVue), not both.`,
        );
    }
}

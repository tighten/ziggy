import Router from './Router.js';

export const route = (name, params, absolute, config) => {
    const router = new Router(name, params, absolute, config);

    return name ? router.toString() : router;
}

export const ZiggyVue = {
    install: (v, options) => {
        const r = (name, params, absolute, config = options) => route(name, params, absolute, config);

        v.config.globalProperties.route = r;

        if (parseInt(v.version) > 2) {
            v.provide('route', r);
        }
    },
};

export const useRoute = (defaultConfig) => {
    if (!defaultConfig && !globalThis.Ziggy && typeof Ziggy === 'undefined') {
        throw new Error('Ziggy error: missing configuration. Ensure that a `Ziggy` variable is defined globally or pass a config object into the useRoute hook.');
    }

    return (name, params, absolute, config = defaultConfig) => route(name, params, absolute, config);
};

export default route;

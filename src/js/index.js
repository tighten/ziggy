import Router from './Router.js';

export const route = (name, params, absolute, config) => {
    const router = new Router(name, params, absolute, config);

    return name ? router.toString() : router;
}

export const ZiggyVue = {
    install: (v, options) => v.mixin({
        methods: {
            route: (name, params, absolute, config = options) => route(name, params, absolute, config),
        },
    }),
};

export default route;

import Router from './Router';

// TODO: the compiled module exports '{ route: ..., ZiggyVue: ... }' and so in Blade,
// that's what the global `route` variable is set to. We need a way to have JS be
// able to `import { route } from 'ziggy'` and also still have the plain `route()`
// function available globally.

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

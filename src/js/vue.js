import route from './index.js';

export const ZiggyVue = {
    install(app, options) {
        const r = (name, params, absolute, config = options) => route(name, params, absolute, config);

        app.mixin({
            methods: {
                route: r,
            },
        });

        if (parseInt(app.version) > 2) {
            app.provide('route', r);
        }
    },
};

import route from './index.js';

export const ZiggyVue = {
    install: (v, options) => {
        const r = (name, params, absolute, config = options) => route(name, params, absolute, config);

        v.mixin({
            methods: {
                route: r,
            },
        });

        if (parseInt(v.version) > 2) {
            v.provide('route', r);
        }
    },
};

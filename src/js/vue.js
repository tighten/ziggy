import route from './index.js';

export const ZiggyVue = {
    install: (v, options) => v.mixin({
        methods: {
            route: (name, params, absolute, config = options) => route(name, params, absolute, config),
        },
    }),
};

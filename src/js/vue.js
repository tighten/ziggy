import route from './index.js';

export const ZiggyVue = {
    install: (v, options, property = 'route', exposeGlobal = true) => {
        const r = (name, params, absolute, config = options) => route(name, params, absolute, config);
        if (exposeGlobal) {
            v.config && (v.config.globalProperties[property] = r);
            v.mixin && v.mixin({
                methods: {
                    [property]: r,
                },
            });
        }
        v.provide && v.provide(property, r);
    },
};

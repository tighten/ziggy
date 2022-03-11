import route from './index.js';

export const ZiggyVue = {
    install: (v, options) => {
        const version = parseInt(v.version.split('.')[0]);
        const _route = (name, params, absolute, config = options) => route(name, params, absolute, config);

        v.mixin && version === 2 && (v.mixin({ methods: { route: _route } }));
        v.provide && version > 2 && (v.provide('route', _route));
    },
};

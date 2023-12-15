import route from './index.js';
import { usePage } from '@inertiajs/vue3';

export const ZiggyVue = {
    install(app, options) {
        options = options ?? usePage().props?.ziggy;

        const r = (name, params, absolute, config = options) =>
            route(name, params, absolute, config);

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

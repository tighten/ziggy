import Router from './Router';

export default function route(name, params, absolute, config) {
    const router = new Router(name, params, absolute, config);

    return name ? router.toString() : router;
}

export const Vue2Plugin = {
    install(Vue) {
        Vue.mixin({ methods: { route } })
    },
}

export const Vue3Plugin = {
    install: app => {
        app.mixin({ methods: { route } })
    }
}

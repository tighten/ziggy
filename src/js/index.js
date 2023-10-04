import Router from './Router';

function route(name, params, absolute, config) {
    const router = new Router(name, params, absolute, config);

    return name ? router.toString() : router;
}

export function useRoute(defaultConfig) {
    if (!defaultConfig && !globalThis.Ziggy && typeof Ziggy === 'undefined') {
        throw new Error('Ziggy error: missing configuration. Ensure that a `Ziggy` variable is defined globally or pass a config object into `useRoute()`.');
    }

    return (name, params, absolute, config = defaultConfig) => route(name, params, absolute, config);
};

export default route;

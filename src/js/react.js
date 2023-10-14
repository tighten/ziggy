import route from './index.js';

export function useRoute(defaultConfig) {
    // Check if defaultConfig is not provided and neither Ziggy nor globalThis.Ziggy exists
    if (!defaultConfig && (typeof Ziggy === 'undefined' && !globalThis.Ziggy)) {
        throw new Error('Ziggy error: missing configuration. Ensure that a `Ziggy` variable is defined globally or pass a config object into `useRoute()`.');
    }

    // Return the route function with the provided or default config
    return (name, params, absolute, config = defaultConfig) =>
        route(name, params, absolute, config);
}


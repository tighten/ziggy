import route from './index.js';

export const useRoute = (defaultConfig) => {
    if (!defaultConfig && !globalThis.Ziggy && typeof Ziggy === 'undefined') {
        throw new Error('Ziggy error: missing configuration. Ensure that a `Ziggy` variable is defined globally or pass a config object into the useRoute hook.');
    }

    return (name, params, absolute, config = defaultConfig) => route(name, params, absolute, config);
};

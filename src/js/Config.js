/**
 * Configuration manager for Ziggy routes.
 */
export default class Config {
    /**
     * Default configuration getter function.
     *
     * @private
     * @static
     * @type {Function}
     */
    static _configGetter = () => (typeof Ziggy !== 'undefined' ? Ziggy : globalThis?.Ziggy);

    /**
     * Default absolute URL flag.
     *
     * @private
     * @static
     * @type {Boolean}
     */
    static _absolute = true;

    /**
     * Create a new Config instance.
     *
     * @param {Object} [config] - Configuration object. If null, uses _configGetter.
     * @param {Boolean} [absolute] - Whether to use absolute URLs.
     * @throws {Error} If no configuration is provided and no global Ziggy object is defined.
     */
    constructor(config, absolute) {
        config = config || Config._configGetter();

        if (!config) {
            throw new Error('Ziggy error: Missing config. define `Ziggy` globally or pass it.');
        }

        absolute = typeof absolute !== 'undefined' ? absolute : Config._absolute;

        this._config = { ...config, absolute };
    }

    /**
     * Get the default Ziggy configuration.
     *
     * @return {Object|undefined} The configuration object.
     */
    static get() {
        return Config._configGetter();
    }

    /**
     * Set the default Ziggy configuration.
     *
     * @static
     * @param {Object|Function} config - Set Ziggy configuration object or getter function.
     * @throws {Error} If the config is not an object or a function.
     */
    static set(config) {
        if (typeof config === 'function') {
            Config._configGetter = config;
        } else if (typeof config === 'object' && config !== null) {
            Config._configGetter = () => config;
        } else {
            throw new Error('Ziggy error: Invalid config type. Expected an object or a function.');
        }
    }

    /**
     * Set the default absolute URL flag.
     *
     * @static
     * @param {Boolean} absolute - Whether to use absolute URLs.
     */
    static absolute(absolute) {
        Config._absolute = Boolean(absolute);
    }

    /**
     * Get the entire configuration object.
     *
     * @return {Object}
     */
    all() {
        return this._config;
    }

    /**
     * Get the base URL from the configuration.
     *
     * @return {String}
     */
    get url() {
        return this._config.url;
    }

    /**
     * Get the protocol of url with delimiter.
     *
     * @example
     * 'http://'
     * 'https://'
     *
     * @return {String}
     */
    get protocol() {
        return this.url.match(/^\w+:\/\//)[0];
    }

    /**
     * Get the port from the configuration.
     *
     * @return {Number|null}
     */
    get port() {
        return this._config.port;
    }

    /**
     * Get the defaults from the configuration.
     *
     * @return {Object}
     */
    get defaults() {
        return this._config.defaults;
    }

    /**
     * Picks specific keys from default parameters.
     *
     * @param {string[]} [keys] - An array of keys.
     * @return {Object}
     */
    default(keys) {
        const defaults = this.defaults || {};

        return keys.reduce((result, key) => {
            if (defaults.hasOwnProperty(key)) result[key] = defaults[key];

            return result;
        }, {});
    }

    /**
     * Get the routes from the configuration.
     *
     * @return {Object}
     */
    get routes() {
        return this._config.routes;
    }

    /**
     * Get a specific route by name.
     *
     * @param {String} [name] - The route name to retrieve.
     * @return {Object}
     * @throws {Error} If the route does not exist.
     */
    route(name) {
        if (!this.hasRoute(name)) {
            throw new Error(`Ziggy error: route '${name}' is not in the route list.`);
        }

        return this.routes[name];
    }

    /**
     * Check if a route exists.
     *
     * @param {String} [name] - The route name to check.
     * @return {Boolean}
     */
    hasRoute(name) {
        return this.routes.hasOwnProperty(name);
    }

    /**
     * Get the location from the configuration.
     *
     * @return {Object}
     */
    get location() {
        const windowLocation = typeof window !== 'undefined' ? window.location : {};
        let configLocation = this._config.location || {};

        if (typeof configLocation === 'string') {
            try {
                const { host, pathname, search } = new URL(configLocation);
                configLocation = { host, pathname, search };
            } catch (e) {
                configLocation = {};
            }
        }

        return {
            host: configLocation.host ?? windowLocation.host ?? '',
            pathname: configLocation.pathname ?? windowLocation.pathname ?? '',
            search: configLocation.search ?? windowLocation.search ?? '',
        };
    }

    /**
     * Get the absolute flag from the configuration.
     *
     * @return {Boolean}
     */
    get absolute() {
        return this._config.absolute;
    }
}

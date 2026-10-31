import Router from './Router.js';

const scopes = new WeakMap();

// Preserve null-prototype route parameters and own keys such as "__proto__".
// Prepared manifests are plain, acyclic data, like Ziggy's generated JSON.
function copyData(value, freeze = false, ancestors = new Set()) {
    if (value === null || typeof value !== 'object') {
        if (['function', 'symbol', 'bigint'].includes(typeof value)) {
            throw new TypeError('Ziggy error: prepared routes must contain plain, acyclic data.');
        }
        return value;
    }

    const prototype = Object.getPrototypeOf(value);
    if (
        ancestors.has(value) ||
        (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
    ) {
        throw new TypeError('Ziggy error: prepared routes must contain plain, acyclic data.');
    }

    ancestors.add(value);
    const result = Array.isArray(value) ? [] : Object.create(prototype);
    for (const key of Object.keys(value)) {
        Object.defineProperty(result, key, {
            value: copyData(value[key], freeze, ancestors),
            enumerable: true,
            configurable: true,
            writable: true,
        });
    }
    ancestors.delete(value);

    return freeze ? Object.freeze(result) : result;
}

class ScopedRouter extends Router {
    constructor(scope, name, params, absolute) {
        super(name, params, absolute, scope.config);
        scopes.set(this, scope);
    }

    _unresolve(url) {
        let normalized = url;
        if (!normalized) normalized = this._currentUrl();
        else if (this._config.absolute && normalized.startsWith('/')) {
            normalized = this._location().host + normalized;
        }

        const scope = scopes.get(this);
        if (
            !scope.last ||
            scope.last.url !== normalized ||
            scope.last.absolute !== this._config.absolute
        ) {
            // Assign only after a successful resolution; exceptions are not cached.
            const result = super._unresolve(url);
            scope.last = { url: normalized, absolute: this._config.absolute, result };
        }

        // Public parameter/query getters must not expose the retained result.
        return copyData(scope.last.result);
    }
}

/**
 * Prepare immutable route definitions once, then create an isolated route helper
 * for each request or navigation. No origin, defaults, location, or match result
 * is shared between the helpers returned by the factory.
 */
export default function prepareRoutes(routes) {
    if (!routes || typeof routes !== 'object' || Array.isArray(routes)) {
        throw new TypeError('Ziggy error: prepareRoutes expects a route registry.');
    }
    const prepared = copyData(routes, true);

    return (config) => {
        if (!config?.location || typeof config.location !== 'object') {
            throw new TypeError('Ziggy error: scoped routes require an explicit location.');
        }

        const scope = {
            config: Object.freeze({
                url: config.url,
                port: config.port,
                defaults: copyData(config.defaults ?? {}, true),
                routes: prepared,
                location: Object.freeze({
                    host: config.location.host ?? '',
                    pathname: config.location.pathname ?? '',
                    search: config.location.search ?? '',
                }),
            }),
        };

        return (name, params, absolute, override) => {
            // Named generation needs no reverse state. An explicit config also
            // keeps the existing helper's mutable semantics for that call.
            const router =
                name || override !== undefined
                    ? new Router(
                          name,
                          params,
                          absolute,
                          override === undefined ? scope.config : override,
                      )
                    : new ScopedRouter(scope, name, params, absolute);

            return name ? router.toString() : router;
        };
    };
}

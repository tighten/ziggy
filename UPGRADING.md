# Upgrade Guide

## Upgrading from `0.9.x` to `1.x`

Ziggy `1.0` includes significant changes and improvements, most of which shouldn't require any changes to existing code! **The behavior of the `@routes` Blade directive and the `route()` helper function has not changed**, so if you're just using those and not customizing or extending Ziggy at all, you likely won't have to do anything.

### Medium–high impact changes

**[PHP] Default `ziggy:generate` path changed**

The default output path of the `ziggy:generate` command has changed from `resources/assets/js/ziggy.js` to `resources/js/ziggy.js` to bring it in line with the changes to the `resources` directory structure introduced in Laravel 5.7. [#269](https://github.com/tighten/ziggy/pull/269)

**[PHP] `whitelist` and `blacklist` renamed**

All `whitelist` and `blacklist` functionality was renamed to `only` and `except`. [#300](https://github.com/tighten/ziggy/pull/300)

### Low impact changes

**[PHP] `Route` Facade macros removed**

The `Route` Facade macros `Route::only()` and `Route::except()` (previously `Route::whitelist()` and `Route::blacklist()`) were removed. [#306](https://github.com/tighten/ziggy/pull/306)

**[PHP] `RoutePayload` class renamed and refactored**

The `RoutePayload` class was renamed to `Ziggy` and its `->compile()` method was removed in favor of constructing a new instance and calling `->toArray()` or `->toJson()` ([#305](https://github.com/tighten/ziggy/pull/305)). Also:

- The application router instance is now resolved internally instead of being passed into the constructor, so `new Ziggy(...)` now takes only 2 arguments, `$group` and `$url`
- The default value of `$basePort` was changed from `false` to `null`

**[PHP] `getRoutePayload()` method removed**

The `getRoutePayload()` method on the `BladeRouteGenerator` and `CommandRouteGenerator` classes was removed. [#305](https://github.com/tighten/ziggy/pull/305)

**[JS] `RouteBuilder` class removed**

The `RouteBuilder` class was removed. Refer to the `template()` getter on the new `Route` class if you need to re-implement this functionality yourself. [#330](https://github.com/tightenco/ziggy/pull/330)

**[JS] `with()` and `check()` deprecated**

The `with()` and `check()` methods on the `Router` class (the object returned by the `route()` function) are deprecated. Instead of `with()`, pass parameters as the second argument to `route()`. Instead of `check()`, use `has()`. [#330](https://github.com/tightenco/ziggy/pull/330)

**[JS] several other methods and properties removed**

Several undocumented methods and properties on the `Router` class (the object returned by the `route()` function) were removed. Replace them with the suggestions below or refer to Ziggy's internals if you need to re-implement the functionality yourself. [#330](https://github.com/tightenco/ziggy/pull/330)

Removed properties:

- `name`: use the name you were passing into `route()` as the first argument.
- `absolute`: use the value you were passing into `route()` as the third argument.
- `ziggy`: use the global `Ziggy` configuraton object.
- `urlBuilder`: refer to the `template()` getter on the new `Route` class.
- `template`: refer to the `template()` getter on the new `Route` class.
- `urlParams`: use the value you were passing into `route()` as the second argument.
- `queryParams`: use the value you were passing into `route()` as the second argument or into `withQuery()`.
- `hydrated`: use the `url()` method.

Removed methods:

- `normalizeParams()`: refer to the internal `_parse()` method.
- `hydrateUrl()`: use `url()`.
- `matchUrl()`: use `current()` or refer to the `current()` method on the new `Route` class.
- `constructQuery()`: use or refer to `url()`.
- `extractParams()`: refer to the internal `_dehydrate()` method.
- `parse()`: use `url()`.
- `trimParam()`: use `.replace(/{|\??}/g, '')`.

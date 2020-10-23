# Upgrade Guide

## Upgrading from `0.9.x` to `1.x`

Ziggy `1.0` includes significant improvements and changes, most of which won't require any changes to existing code!

**TL;DR** – If all you're doing is dropping the `@routes` Blade directive into a view somewhere and using the Javascript `route()` helper function later, you only really need to worry about three things:

- `route()` with any arguments returns a string now, so:
  - Anywhere you're calling `.url()` to get a literal string, remove it.
  - Anywhere you're passing route paramaters using `.with()`, pass them as the second argument to `route()` instead.
  - Anywhere you're passing query paramaters using `.withQuery()`, pass them along with your route parameters in the second argument to `route()`. If any of their names collide with your route parameters, nest your query parameters under a `_query` key.

### Overview

- **High-impact changes**
  - [`route(...)` now returns a string](#)
  - [`url()` method removed](#)
- **Medium-impact changes**
  - [Default `ziggy:generate` path changed](#)
  - [`whitelist` and `blacklist` renamed](#)
- **Low-impact changes**
  - [`with()` and `withQuery()` methods removed](#)
  - [`Route` Facade macros removed](#)
  - [`RoutePayload` renamed to `Ziggy`](#user-content-route-payload-class-renamed)
  - [`getRoutePayload()` method removed](#)
  - [`UrlBuilder` class removed](#)
  - [`check()` method deprecated](#)
  - [Other undocumented methods removed](#)

### High impact changes

1. **The `route()` function now returns a literal string if it is passed any arguments.**

   If you are chaining methods onto `route(...)` _with arguments_, such as `route('posts.show').url()` or `route('home').withQuery(...)`, remove the chained methods. In the case of `route(...).url()` you can just remove `.url()` and nothing will change, for other methods see below.

   Calls specifically to `route()`, with no arguments, are not affected and will still return an instance of the `Router` class, so things like `route().current()` and `route().params` don't need to change.

   See [#336](https://github.com/tighten/ziggy/pull/336)

1. **The `url()` method on the `Router` class was removed** and can safely be deleted from projects that used it.

   Because of the above change to `route(...)`, the `url()` method is no longer necessary. You can safely remove it, e.g. by finding and replacing instances of `'.url()'` in your project with `''` (nothing).

   See [#336](https://github.com/tighten/ziggy/pull/336)

### Medium impact changes

1. **The default `ziggy:generate` path has changed to `resources/js/ziggy.js`**, Laravel's default javascript asset location.

   <details>
   <summary>Details</summary>

   The default output path of the `ziggy:generate` command has changed from `resources/assets/js/ziggy.js` to `resources/js/ziggy.js` to bring it in line with the changes to the `resources` directory structure introduced in Laravel 5.7.

   See[#269](https://github.com/tighten/ziggy/pull/269)
   </details>

1. **The `whitelist` and `blacklist` features were renamed** to `only` and `except`.

   <details>
   <summary>Details</summary>

   All `whitelist` and `blacklist` functionality, like the config keys and methods, was renamed to `only` and `except`.

   See [#300](https://github.com/tighten/ziggy/pull/300)
   </details>

### Low impact changes

1. **The `with()` and `withQuery()` methods were removed.**

   <details>
   <summary>Details</summary>

   The `with()` and `withQuery()` methods on the `Router` class (the object returned by the `route()` function if it is passed no arguments) are deprecated. Instead of `with()`, pass parameters as the second argument to `route()`. Instead of `withQuery()`, you can pass query parameters in the same object with regular parameters, as the second argument to `route()`. If you have query parameters and named parameters with the same name, use the new special `_query` key.

   See [#330](https://github.com/tightenco/ziggy/pull/330) and [#336](https://github.com/tightenco/ziggy/pull/336)
   </details>

1. **The `Route` Facade macros, `Route::whitelist()` and `Route::blacklist()`, were removed.**

   <details>
   <summary>Details</summary>

   The `Route` Facade macros, `Route::only()` and `Route::except()` (previously `Route::whitelist()` and `Route::blacklist()`) were removed. Instead of using these macros in your route files, set the routes to include/exclude in `config/ziggy.php`.

   See [#306](https://github.com/tighten/ziggy/pull/306)
   </details>

<div id="route-payload-class-renamed"></div>

1. **The `RoutePayload` class was renamed to `Ziggy`** and refactored.

   <details>
   <summary>Details</summary>

   The PHP `RoutePayload` class was renamed to `Ziggy` and its `->compile()` method was removed in favor of constructing a new instance and calling `->toArray()` or `->toJson()`. Also:

   - The application router instance is now resolved internally instead of being passed into the constructor, so `new Ziggy(...)` now takes only 2 arguments, `$group` and `$url`
   - The default value of `$basePort` was changed from `false` to `null`

   See [#305](https://github.com/tighten/ziggy/pull/305)
   </details>

1. **The `getRoutePayload()` method was removed.**

   <details>
   <summary>Details</summary>

   The `getRoutePayload()` method on the PHP `BladeRouteGenerator` and `CommandRouteGenerator` classes was removed.

   See [#305](https://github.com/tighten/ziggy/pull/305)
   </details>

1. **The `UrlBuilder` class was removed**

   <details>
   <summary>Details</summary>

   The Javascript `UrlBuilder` class was removed. Refer to the `template()` getter on the new `Route` class if you need to re-implement this functionality yourself.

   See [#330](https://github.com/tightenco/ziggy/pull/330)
   </details>

1. **The `check()` method was deprecated.**

   <details>
   <summary>Details</summary>

   Use `has()` instead.

   See [#330](https://github.com/tightenco/ziggy/pull/330)
   </details>

1. **Several undocumented methods and properties were removed** from the Javascript `Router` class.

   <details>
   <summary>Details</summary>

   Several undocumented methods and properties on the `Router` class (the object returned by the `route()` function when it's called with no arguments) were removed. Replace them with the suggestions below or refer to Ziggy's internals if you need to re-implement the functionality yourself.

   Removed properties:

   - `name`: use the name you were passing into `route()` as the first argument.
   - `absolute`: use the value you were passing into `route()` as the third argument.
   - `ziggy`: use the global `Ziggy` configuraton object.
   - `urlBuilder`: refer to the `template()` getter on the new `Route` class.
   - `template`: refer to the `template()` getter on the new `Route` class.
   - `urlParams`: use the value you were passing into `route()` as the second argument.
   - `queryParams`: use the value you were passing into `withQuery()`, or into `route()` as the second argument.
   - `hydrated`: use the returned URL string.

   Removed methods:

   - `normalizeParams()`: refer to the internal `_parse()` method.
   - `hydrateUrl()`: use the returned URL string.
   - `matchUrl()`: use `current()` or refer to the `current()` method on the new `Route` class.
   - `constructQuery()`: use the returned URL string.
   - `extractParams()`: refer to the `_dehydrate()` method on the `Router` class.
   - `parse()`: use the returned URL string.
   - `trimParam()`: use `.replace(/{|\??}/g, '')`.

   See [#330](https://github.com/tightenco/ziggy/pull/330)
   </details>

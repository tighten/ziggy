# Upgrade Guide

## Upgrading from `1.x` to `2.x`

- The PHP package namespace has changed from `Tightenco\Ziggy` to `Tighten\Ziggy` (note: the Composer package name, `tightenco/ziggy`, has not changed).
- The `makeDirectory` method of the `CommandRouteGenerator` class is now private, overriding it is no longer supported.
- The deprecated JavaScript `check()` method (e.g. `route().check('home')`) has been removed. Use `has()` instead.
- Ziggy's JavaScript now provides named exports only, with no default export. Replace `import route from 'ziggy-js'` with `import { route } from 'ziggy-js'`.
- Ziggy's Vue plugin and React hook have moved to the root of the module. Replace imports from `ziggy-js/vue` or `ziggy-js/react` with imports directly from `ziggy-js` (e.g. `import { route, ZiggyVue } from 'ziggy-js'`).
- Ziggy now only includes ES Module builds. The default build, which [supports all modern browsers](https://github.com/developit/microbundle/?tab=readme-ov-file#-modern-mode-), is `./dist/index.js` (this is the default when you import from `ziggy-js` or `vendor/tightenco/ziggy`). A legacy ES Module build using fewer new language features is included too, at `./dist/index.esm.js`. The third build, `./dist/route.umd.js`, is for internal use in Ziggy's `@routes` Blade directive.
- Ziggy now requires at least Laravel 9 and PHP 8.1.

## Upgrading from `0.9.x` to `1.x`

Ziggy `1.0` includes significant improvements and changes, most of which won't require any changes to existing code!

**TL;DR** – If all you're doing is dropping the `@routes` Blade directive into a view somewhere and using the Javascript `route()` helper function later, you only really need to worry about one thing:

- `route()` _with any arguments_ returns a string now, so:
  - Anywhere you're calling `.url()` to get a literal string, remove it.
  - Anywhere you're passing route paramaters using `.with()`, pass them as the second argument to `route()` instead.
  - Anywhere you're passing query paramaters using `.withQuery()`, pass them along with your route parameters in the second argument to `route()`. (If any of their names collide with your route parameters, nest your query parameters under a `_query` key.)

### Overview

- **New features**
  - [Added full route-model binding support](#user-content-route-model-binding)
  - [Added support for checking parameters with `current()`](#user-content-params-current)
- **High-impact changes**
  - [`route(...)` now returns a string](#user-content-route-string)
  - [`url()` method removed](#user-content-url-removed)
- **Medium-impact changes**
  - [Default `ziggy:generate` path changed](#user-content-generate-path-changed)
  - [`whitelist` and `blacklist` renamed](#user-content-whitelist-blacklist-renamed)
  - [Boolean query parameters are encoded as integers](#user-content-booleans-integers)
- **Low-impact changes**
  - [`with()` and `withQuery()` methods removed](#user-content-with-withquery-removed)
  - [`Route` Facade macros removed](#user-content-macros-removed)
  - [`RoutePayload` renamed to `Ziggy`](#user-content-route-payload-renamed)
  - [`getRoutePayload()` method removed](#user-content-getroutepayload-removed)
  - [`UrlBuilder` class removed](#user-content-urlbuilder-removed)
  - [`baseProtocol` and `baseDomain` properties removed](#user-content-base-protocol-domain-removed)
  - [`base` and other prefixes removed](#user-content-prefixes-removed)
  - [`filter()` method made fluent](#user-content-filter-fluent)
  - [Unused PHP methods removed](#user-content-unused-php-removed)
  - [Internal PHP methods made private](#user-content-internal-methods-private)
  - [Undocumented Javascript methods removed](#user-content-undocumented-methods-removed)
  - [Javascript build asset renamed to `index.js`](#user-content-export-index)
  - [`check()` method deprecated](#user-content-check-deprecated)

### New features

1. **Ziggy now fully supports Laravel's route-model binding functionality.** <span id="route-model-binding"></span>

   Previously, Ziggy could accept an object as a parameter and use its `id` key as the actual parameter value in the URL, allowing you to pass, for example, a Javascript object representing an instance of one of your Laravel models, directly into the `route()` function.

   This feature has been fleshed out to more fully support route-model binding in two key ways:
   - Ziggy now fully supports [custom scoped route-model binding](https://laravel.com/docs/8.x/routing#implicit-binding) defined in route definitions, e.g. `/users/{user}/posts/{post:uuid}`.
   - Ziggy now supports [implicit route-model binding](https://laravel.com/docs/8.x/routing#implicit-binding) defined by type-hinting controller methods and closures.

   For example, take the following model and route:

   ```php
   class Post extends Model
   {
        public function getRouteKeyName()
        {
            return 'slug';
        }
   }
   ```

   ```php
   Route::post('posts/{post}', function (Post $post) {
       return view('posts.show', ['post' => $post]);
   })->name('posts.update');
   ```

   In Ziggy v1, you can pass an object with a `slug` key into the `route()` helper, and the slug will be used as the route parameter value:

   ```js
   const post = { id: 15, slug: 'announcing-ziggy-v1', author: 'Jacob', published: false };

   route('posts.update', post); // 'https://ziggy.test/posts/announcing-ziggy-v1'
   ```

   See [#307](https://github.com/tighten/ziggy/pull/307) and [#315](https://github.com/tighten/ziggy/pull/315)

1. **Ziggy now supports matching parameters using `current()`.** <span id="params-current"></span>

   Ziggy's `current()` method, which can be passed a route name to check if the browser is currently 'on' that route, can now be passed an object of parameters as the second argument, and will return whether those parameter values match in the current URL.

   This addition makes the following checks possible:

   ```js
   // Route called 'events.venues.show', with URI '/events/{event}/venues/{venue}'
   // Window URL is https://myapp.com/events/1/venues/2?authors=all

   // Before (unchanged)
   route().current(); // 'events.venues.show'
   route().current('events.venues.show'); // true

   // New in Ziggy v1
   route().current('events.venues.show', { event: 1, venue: 2 }); // true
   route().current('events.venues.show', { authors: 'all' }); // true
   route().current('events.venues.show', { venue: 6 }); // false
   ```

   See [#314](https://github.com/tighten/ziggy/pull/314) and [#330](https://github.com/tighten/ziggy/pull/330)

### High impact changes

1. **The `route()` function now returns a literal string if it is passed any arguments.** <span id="route-string"></span>

   If you are chaining methods onto a `route(...)` call _with arguments_, such as `route('posts.show').url()` or `route('home').withQuery(...)`, remove the chained methods. In the case of `route(...).url()` you can just remove `.url()` and nothing will change, for other methods see below.

   Calls specifically to `route()`, with no arguments, are not affected and will still return an instance of the `Router` class, so things like `route().current()` and `route().params` still work as expected.

   See [#336](https://github.com/tighten/ziggy/pull/336)

1. **The `url()` method on the `Router` class was removed** and can safely be deleted from projects that used it. <span id="url-removed"></span>

   Because of the above change to `route(...)`, the `url()` method is no longer necessary. You can safely remove it, e.g. by finding and replacing instances of `'.url()'` in your project with `''` (nothing).

   See [#336](https://github.com/tighten/ziggy/pull/336)

### Medium impact changes

1. **The default `ziggy:generate` path has changed to `resources/js/ziggy.js`**, Laravel's default javascript asset location. <span id="generate-path-changed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The default output path of the `ziggy:generate` command has changed from `resources/assets/js/ziggy.js` to `resources/js/ziggy.js` to bring it in line with the changes to the `resources` directory structure introduced in Laravel 5.7.

   See [#269](https://github.com/tighten/ziggy/pull/269)
   </details>

1. **The `whitelist` and `blacklist` features were renamed** to `only` and `except`. <span id="whitelist-blacklist-renamed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   All `whitelist` and `blacklist` functionality, like the config keys and methods, was renamed to `only` and `except`.

   See [#300](https://github.com/tighten/ziggy/pull/300)
   </details>

1. **Boolean query parameters are now encoded as integers.** <span id="booleans-integers"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   Ziggy's `route()` function will now encode boolean query parameters as integers (`0`/`1`) instead of strings (`'true'`/`'false'`).

   See [#345](https://github.com/tighten/ziggy/pull/345)
   </details>

### Low impact changes

1. **The `with()` and `withQuery()` methods were removed.** <span id="with-withquery-removed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The `with()` and `withQuery()` methods on the `Router` class (the object returned by the `route()` function if it is passed no arguments) are deprecated. Instead of `with()`, pass parameters as the second argument to `route()`. Instead of `withQuery()`, you can pass query parameters in the same object with regular parameters, as the second argument to `route()`. If you have query parameters and named parameters with the same name, use the new special `_query` key.

   See [#330](https://github.com/tighten/ziggy/pull/330) and [#336](https://github.com/tighten/ziggy/pull/336)
   </details>

1. **The `Route` Facade macros, `Route::whitelist()` and `Route::blacklist()`, were removed.** <span id="macros-removed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The `Route` Facade macros, `Route::only()` and `Route::except()` (previously `Route::whitelist()` and `Route::blacklist()`) were removed. Instead of using these macros in your route files, set the routes to include/exclude in `config/ziggy.php`.

   See [#306](https://github.com/tighten/ziggy/pull/306)
   </details>

1. **The `RoutePayload` class was renamed to `Ziggy`** and refactored. <span id="route-payload-renamed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The PHP `RoutePayload` class was renamed to `Ziggy` and its `->compile()` method was removed in favor of constructing a new instance and calling `->toArray()` or `->toJson()`. Also:

   - The application router instance is now resolved internally instead of being passed into the constructor, so `new Ziggy(...)` now takes only 2 arguments, `$group` and `$url`
   - The default value of `$basePort` was changed from `false` to `null`

   <p></p>

   See [#305](https://github.com/tighten/ziggy/pull/305)
   </details>

1. **The `getRoutePayload()` method was removed.** <span id="getroutepayload-removed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The `getRoutePayload()` method on the PHP `BladeRouteGenerator` and `CommandRouteGenerator` classes was removed.

   See [#305](https://github.com/tighten/ziggy/pull/305)
   </details>

1. **The `UrlBuilder` class was removed.** <span id="urlbuilder-removed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The Javascript `UrlBuilder` class was removed. Refer to the `template()` getter on the new `Route` class if you need to re-implement this functionality yourself.

   See [#330](https://github.com/tighten/ziggy/pull/330)
   </details>

1. **The `baseProtocol` and `baseDomain` properties were removed** from Ziggy's global configuration object. <span id="base-protocol-domain-removed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The `baseProtocol` and `baseDomain` keys were removed from Ziggy's config. Both these values were inferred from the `baseUrl` property, which is set to your app URL. Refer to the `template()` getter on the new `Route` class if you need to re-implement this functionality yourself.

   See [#337](https://github.com/tighten/ziggy/pull/337)
   </details>

1. **`base` and other prefixes were removed** from config keys. <span id="prefixes-removed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The `namedRoutes`, `defaultParameters`, `baseUrl`, and `basePort` configuration properties were renamed to `routes`, `defaults`, `url`, and `port`.

   See [#338](https://github.com/tighten/ziggy/pull/338)
   </details>

1. **The `filter()` method on the `Ziggy` class is now 'fluent'** and returns an instance of `Ziggy`. <span id="filter-fluent"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The `filter()` method on the `Ziggy` class now returns an instance of `Ziggy` instead of a collection of routes.

   See [#341](https://github.com/tighten/ziggy/pull/341)
   </details>

1. **Unused PHP methods were removed.** <span id="unused-php-removed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The unused `appendRouteToList()` and `isListedAs()` methods, and the redundant/unnecessary `except()` and `only()` methods on the `Ziggy` class, were removed.

   See [#341](https://github.com/tighten/ziggy/pull/341)
   </details>

1. **Some internal methods on Ziggy's PHP classes were made private.** <span id="internal-methods-private"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The `nameKeyedRoutes()`, `resolveBindings()`, `applyFilters()`, and `group()` methods on the `Ziggy` class, and the `generate()` method on the `CommandRouteGenerator` class, are now private.

   See [#341](https://github.com/tighten/ziggy/pull/341)
   </details>

1. **Several undocumented methods and properties were removed** from the Javascript `Router` class. <span id="undocumented-methods-removed"></span>

   <details>
   <summary>Details</summary>
   <p></p>

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

   <p></p>

   Removed methods:

   - `normalizeParams()`: refer to the internal `_parse()` method.
   - `hydrateUrl()`: use the returned URL string.
   - `matchUrl()`: use `current()` or refer to the `current()` method on the new `Route` class.
   - `constructQuery()`: use the returned URL string.
   - `extractParams()`: refer to the `_dehydrate()` method on the `Router` class.
   - `parse()`: use the returned URL string.
   - `trimParam()`: use `.replace(/{|\??}/g, '')`.

   <p></p>

   See [#330](https://github.com/tighten/ziggy/pull/330)
   </details>

1. **Ziggy's main build asset/entrypoint is now called `index.js` instead of `route.js`.** <span id="export-index"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   Ziggy's main Javascript source and dist files are now called `index.js` instead of `route.js`.

   See [#344](https://github.com/tighten/ziggy/pull/344)
   </details>

1. **The `check()` method is deprecated.** <span id="check-deprecated"></span>

   <details>
   <summary>Details</summary>
   <p></p>

   The `route().check()` method is deprecated and will be removed in a future major version of Ziggy. Use `route().has()` instead.

   See [#330](https://github.com/tighten/ziggy/pull/330)
   </details>

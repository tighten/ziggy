![Ziggy - Use your Laravel routes in JavaScript](https://raw.githubusercontent.com/tighten/ziggy/main/ziggy-banner.png)

# Ziggy – Use your Laravel routes in JavaScript

[![GitHub Actions Status](https://img.shields.io/github/actions/workflow/status/tighten/ziggy/test.yml?branch=main&style=flat)](https://github.com/tighten/ziggy/actions?query=workflow:Tests+branch:main)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/tightenco/ziggy.svg?style=flat)](https://packagist.org/packages/tightenco/ziggy)
[![Downloads on Packagist](https://img.shields.io/packagist/dt/tightenco/ziggy.svg?style=flat)](https://packagist.org/packages/tightenco/ziggy)
[![Latest Version on NPM](https://img.shields.io/npm/v/ziggy-js.svg?style=flat)](https://npmjs.com/package/ziggy-js)
[![Downloads on NPM](https://img.shields.io/npm/dt/ziggy-js.svg?style=flat)](https://npmjs.com/package/ziggy-js)

Ziggy provides a JavaScript `route()` function that works like Laravel's, making it a breeze to use your named Laravel routes in JavaScript.

- [**Installation**](#installation)
- [**Usage**](#usage)
    - [`route()` function](#route-function)
    - [`Router` class](#router-class)
    - [Route-model binding](#route-model-binding)
    - [TypeScript](#typescript)
- [**JavaScript frameworks**](#javascript-frameworks)
    - [Generating and importing Ziggy's configuration](#generating-and-importing-ziggys-configuration)
    - [Importing the `route()` function](#importing-the-route-function)
    - [Vue](#vue)
    - [React](#react)
    - [SPAs or separate repos](#spas-or-separate-repos)
- [**Filtering Routes**](#filtering-routes)
    - [Including/excluding routes](#includingexcluding-routes)
    - [Filtering with groups](#filtering-with-groups)
- [**Other**](#other)
- [**Contributing**](#contributing)

## Installation

Install Ziggy in your Laravel app with Composer:

```bash
composer require tightenco/ziggy
```

Add the `@routes` Blade directive to your main layout (_before_ your application's JavaScript), and the `route()` helper function will be available globally!

> By default, the output of the `@routes` Blade directive includes a list of all your application's routes and their parameters. This route list is included in the HTML of the page and can be viewed by end users. To configure which routes are included in this list, or to show and hide different routes on different pages, see [Filtering Routes](#filtering-routes).

## Usage

### `route()` function

Ziggy's `route()` function works like [Laravel's `route()` helper](https://laravel.com/docs/10.x/helpers#method-route)—you can pass it the name of a route, and the parameters you want to pass to the route, and it will generate a URL.

#### Basic usage

```php
Route::get('posts', fn (Request $request) => /* ... */)->name('posts.index');
```

```js
route('posts.index'); // 'https://ziggy.test/posts'
```

#### Parameters

```php
Route::get('posts/{post}', fn (Post $post) => /* ... */)->name('posts.show');
```

```js
route('posts.show', 1);           // 'https://ziggy.test/posts/1'
route('posts.show', [1]);         // 'https://ziggy.test/posts/1'
route('posts.show', { post: 1 }); // 'https://ziggy.test/posts/1'
```

#### Multiple parameters

```php
Route::get('venues/{venue}/events/{event}', fn (Venue $venue, Event $event) => /* ... */)
    ->name('venues.events.show');
```

```js
route('venues.events.show', [1, 2]);                 // 'https://ziggy.test/venues/1/events/2'
route('venues.events.show', { venue: 1, event: 2 }); // 'https://ziggy.test/venues/1/events/2'
```

#### Query parameters

Ziggy adds arguments that don't match any named route parameters as query parameters:

```php
Route::get('venues/{venue}/events/{event}', fn (Venue $venue, Event $event) => /* ... */)
    ->name('venues.events.show');
```

```js
route('venues.events.show', {
    venue: 1,
    event: 2,
    page: 5,
    count: 10,
});
// 'https://ziggy.test/venues/1/events/2?page=5&count=10'
```

If you need to pass a query parameter with the same name as a route parameter, nest it under the special `_query` key:

```js
route('venues.events.show', {
    venue: 1,
    event: 2,
    _query: {
        event: 3,
        page: 5,
    },
});
// 'https://ziggy.test/venues/1/events/2?event=3&page=5'
```

Like Laravel, Ziggy automatically encodes boolean query parameters as integers in the query string:

```js
route('venues.events.show', {
    venue: 1,
    event: 2,
    _query: {
        draft: false,
        overdue: true,
    },
});
// 'https://ziggy.test/venues/1/events/2?draft=0&overdue=1'
```

#### Default parameter values

Ziggy supports default route parameter values ([Laravel docs](https://laravel.com/docs/urls#default-values)).

```php
Route::get('{locale}/posts/{post}', fn (Post $post) => /* ... */)->name('posts.show');
```

```php
// app/Http/Middleware/SetLocale.php

URL::defaults(['locale' => $request->user()->locale ?? 'de']);
```

```js
route('posts.show', 1); // 'https://ziggy.test/de/posts/1'
```

#### Examples

HTTP request with `axios`:

```js
const post = { id: 1, title: 'Ziggy Stardust' };

return axios.get(route('posts.show', post)).then((response) => response.data);
```

### `Router` class

Calling Ziggy's `route()` function with no arguments will return an instance of its JavaScript `Router` class, which has some other useful properties and methods.

#### Check the current route: `route().current()`

```js
// Laravel route called 'events.index' with URI '/events'
// Current window URL is https://ziggy.test/events

route().current();               // 'events.index'
route().current('events.index'); // true
route().current('events.*');     // true
route().current('events.show');  // false
```

`route().current()` optionally accepts parameters as its second argument, and will check that their values also match in the current URL:

```js
// Laravel route called 'venues.events.show' with URI '/venues/{venue}/events/{event}'
// Current window URL is https://myapp.com/venues/1/events/2?hosts=all

route().current('venues.events.show', { venue: 1 });           // true
route().current('venues.events.show', { venue: 1, event: 2 }); // true
route().current('venues.events.show', { hosts: 'all' });       // true
route().current('venues.events.show', { venue: 6 });           // false
```

#### Check if a route exists: `route().has()`

```js
// Laravel app has only one named route, 'home'

route().has('home');   // true
route().has('orders'); // false
```

#### Retrieve the current route params: `route().params`

```js
// Laravel route called 'venues.events.show' with URI '/venues/{venue}/events/{event}'
// Current window URL is https://myapp.com/venues/1/events/2?hosts=all

route().params; // { venue: '1', event: '2', hosts: 'all' }
```

> Note: parameter values retrieved with `route().params` will always be returned as strings.

### Route-model binding

Ziggy supports Laravel's [route-model binding](https://laravel.com/docs/routing#route-model-binding), and can even recognize custom route key names. If you pass `route()` a JavaScript object as a route parameter, Ziggy will use the registered route-model binding keys for that route to find the correct parameter value inside the object. If no route-model binding keys are explicitly registered for a parameter, Ziggy will use the object's `id` key.

```php
// app/Models/Post.php

class Post extends Model
{
    public function getRouteKeyName()
    {
        return 'slug';
    }
}
```

```php
Route::get('blog/{post}', function (Post $post) {
    return view('posts.show', ['post' => $post]);
})->name('posts.show');
```

```js
const post = {
    id: 3,
    title: 'Introducing Ziggy v1',
    slug: 'introducing-ziggy-v1',
    date: '2020-10-23T20:59:24.359278Z',
};

// Ziggy knows that this route uses the 'slug' route-model binding key:

route('posts.show', post); // 'https://ziggy.test/blog/introducing-ziggy-v1'
```

Ziggy also supports [custom keys](https://laravel.com/docs/routing#customizing-the-key) for scoped bindings declared directly in a route definition:

```php
Route::get('authors/{author}/photos/{photo:uuid}', fn (Author $author, Photo $photo) => /* ... */)
    ->name('authors.photos.show');
```

```js
const photo = {
    uuid: '714b19e8-ac5e-4dab-99ba-34dc6fdd24a5',
    filename: 'sunset.jpg',
}

route('authors.photos.show', [{ id: 1, name: 'Ansel' }, photo]);
// 'https://ziggy.test/authors/1/photos/714b19e8-ac5e-4dab-99ba-34dc6fdd24a5'
```

### TypeScript

Ziggy includes TypeScript type definitions, and an Artisan command that can generate additional type definitions to enable route name and parameter autocompletion.

To generate route types, run the `ziggy:generate` command with the `--types` or `--types-only` option:

```bash
php artisan ziggy:generate --types
```

To make your IDE aware that Ziggy's `route()` helper is available globally, and to type it correctly, add a declaration like this in a `.d.ts` file somewhere in your project:

```ts
import { route as routeFn } from 'ziggy-js';

declare global {
    var route: typeof routeFn;
}
```

If you don't have Ziggy's NPM package installed, add the following to your `jsconfig.json` or `tsconfig.json` to load Ziggy's types from your vendor directory:

```json
{
    "compilerOptions": {
        "paths": {
            "ziggy-js": ["./vendor/tightenco/ziggy"]
        }
    }
}
```

## JavaScript frameworks

> [!NOTE]
> Many applications don't need the additional setup described here—the `@routes` Blade directive makes Ziggy's `route()` function and config available globally, including within bundled JavaScript files.

If you are not using the `@routes` Blade directive, you can import Ziggy's `route()` function and configuration directly into JavaScript/TypeScript files.

### Generating and importing Ziggy's configuration

Ziggy provides an Artisan command to output its config and routes to a file:

```bash
php artisan ziggy:generate
```

This command places your configuration in `resources/js/ziggy.js` by default, but you can customize this path by passing an argument to the Artisan command or setting the `ziggy.output.path` config value.

The file `ziggy:generate` creates looks something like this:

```js
// resources/js/ziggy.js

const Ziggy = {
    url: 'https://ziggy.test',
    port: null,
    routes: {
        home: {
            uri: '/',
            methods: [ 'GET', 'HEAD'],
            domain: null,
        },
        login: {
            uri: 'login',
            methods: ['GET', 'HEAD'],
            domain: null,
        },
    },
};

export { Ziggy };
```

### Importing the `route()` function

You can import Ziggy like any other JavaScript library. Without the `@routes` Blade directive Ziggy's config is not available globally, so it must be passed to the `route()` function manually:

```js
import { route } from '../../vendor/tightenco/ziggy';
import { Ziggy } from './ziggy.js';

route('home', undefined, undefined, Ziggy);
```

To simplify importing the `route()` function, you can create an alias to the vendor path:

```js
// vite.config.js

export default defineConfig({
    resolve: {
        alias: {
            'ziggy-js': path.resolve('vendor/tightenco/ziggy'),
        },
    },
});
```

Now your imports can be shortened to:

```js
import { route } from 'ziggy-js';
```

### Vue

Ziggy includes a Vue plugin to make it easy to use the `route()` helper throughout your Vue app:

```js
import { createApp } from 'vue';
import { ZiggyVue } from 'ziggy-js';
import App from './App.vue';

createApp(App).use(ZiggyVue);
```

Now you can use the `route()` function anywhere in your Vue components and templates:

```vue
<a class="nav-link" :href="route('home')">Home</a>
```

If you are not using the `@routes` Blade directive, import Ziggy's configuration too and pass it to `.use()`:

```js
import { createApp } from 'vue';
import { ZiggyVue } from 'ziggy-js';
import { Ziggy } from './ziggy.js';
import App from './App.vue';

createApp(App).use(ZiggyVue, Ziggy);
```

### React

Ziggy includes a `useRoute()` hook to make it easy to use the `route()` helper in your React app:

```jsx
import React from 'react';
import { useRoute } from 'ziggy-js';

export default function PostsLink() {
    const route = useRoute();

    return <a href={route('posts.index')}>Posts</a>;
}
```

If you are not using the `@routes` Blade directive, import Ziggy's configuration too and pass it to `useRoute()`:

```jsx
import React from 'react';
import { useRoute } from 'ziggy-js';
import { Ziggy } from './ziggy.js';

export default function PostsLink() {
    const route = useRoute(Ziggy);

    return <a href={route('posts.index')}>Posts</a>;
}
```

You can also make the `Ziggy` config object available globally, so you can call `useRoute()` without passing Ziggy's configuration to it every time:

```js
// app.js
import { Ziggy } from './ziggy.js';
globalThis.Ziggy = Ziggy;
```

### SPAs or separate repos

Ziggy's `route()` function is available as an NPM package, for use in JavaScript projects managed separately from their Laravel backend (i.e. without Composer or a `vendor` directory). You can install the NPM package with `npm install ziggy-js`.

To make your routes available on the frontend for this function to use, you can either run `php artisan ziggy:generate` and add the generated config file to your frontend project, or you can return Ziggy's config as JSON from an endpoint in your Laravel API (see [Retrieving Ziggy's config from an API endpoint](#retrieving-ziggys-config-from-an-api-endpoint) below for an example of how to set this up).

## Filtering Routes

Ziggy supports filtering the list of routes it outputs, which is useful if you have certain routes that you don't want to be included and visible in your HTML source.

> [!IMPORTANT]
> Hiding routes from Ziggy's output is not a replacement for thorough authentication and authorization. Routes that should not be accessibly publicly should be protected by authentication whether they're filtered out of Ziggy's output or not.

### Including/excluding routes

To set up route filtering, create a config file in your Laravel app at `config/ziggy.php` and add **either** an `only` or `except` key containing an array of route name patterns.

> Note: You have to choose one or the other. Setting both `only` and `except` will disable filtering altogether and return all named routes.

```php
// config/ziggy.php

return [
    'only' => ['home', 'posts.index', 'posts.show'],
];
```

You can use asterisks as wildcards in route filters. In the example below, `admin.*` will exclude routes named `admin.login`, `admin.register`, etc.:

```php
// config/ziggy.php

return [
    'except' => ['_debugbar.*', 'horizon.*', 'admin.*'],
];
```

### Filtering with groups

You can also define groups of routes that you want make available in different places in your app, using a `groups` key in your config file:

```php
// config/ziggy.php

return [
    'groups' => [
        'admin' => ['admin.*', 'users.*'],
        'author' => ['posts.*'],
    ],
];
```

Then, you can expose a specific group by passing the group name into the `@routes` Blade directive:

```blade
{{-- authors.blade.php --}}

@routes('author')
```

To expose multiple groups you can pass an array of group names:

```blade
{{-- admin.blade.php --}}

@routes(['admin', 'author'])
```

> Note: Passing group names to the `@routes` directive will always take precedence over your other `only` or `except` settings.

## Other

### TLS/SSL termination and trusted proxies

<!-- Or: What to do if your app is served over `https` but Ziggy's `route()` helper generates `http` URLs -->

If your application is using [TLS/SSL termination](https://en.wikipedia.org/wiki/TLS_termination_proxy) or is behind a load balancer or proxy, or if it's hosted on a service that is, Ziggy may generate URLs with a scheme of `http` instead of `https`, even if your app URL uses `https`. To fix this, set up your Laravel app's trusted proxies according to the documentation on [Configuring Trusted Proxies](https://laravel.com/docs/requests#configuring-trusted-proxies).

### Using `@routes` with a Content Security Policy

A [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSP) may block inline scripts, including those output by Ziggy's `@routes` Blade directive. If you have a CSP and are using a nonce to flag safe inline scripts, you can pass the nonce to the `@routes` directive and it will be added to Ziggy's script tag:

```php
@routes(nonce: 'your-nonce-here')
```

### Disabling the `route()` helper

If you only want to use the `@routes` directive to make Ziggy's configuration available in JavaScript, but don't need the `route()` helper function, set the `ziggy.skip-route-function` config to `true`.

### Retrieving Ziggy's config from an API endpoint

If you need to retrieve Ziggy's config from your Laravel backend over the network, you can create a route that looks something like this:

```php
// routes/api.php

use Tighten\Ziggy\Ziggy;

Route::get('api/ziggy', fn () => response()->json(new Ziggy));
```

### Re-generating the routes file when your app routes change

If you are generating your Ziggy config as a file by running `php artisan ziggy:generate`, you may want to re-run that command when your app's route files change. The example below is a Laravel Mix plugin, but similar functionality could be achieved without Mix. Huge thanks to [Nuno Rodrigues](https://github.com/nacr) for [the idea and a sample implementation](https://github.com/tighten/ziggy/issues/321#issuecomment-689150082). See [#655 for a Vite example](https://github.com/tighten/ziggy/pull/655/files#diff-4aeb78f813e14842fcf95bdace9ced23b8a6eed60b23c165eaa52e8db2f97b61).

<details>
<summary>Laravel Mix plugin example</summary>
<p></p>

```js
const mix = require('laravel-mix');
const { exec } = require('child_process');

mix.extend('ziggy', new class {
    register(config = {}) {
        this.watch = config.watch ?? ['routes/**/*.php'];
        this.path = config.path ?? '';
        this.enabled = config.enabled ?? !Mix.inProduction();
    }

    boot() {
        if (!this.enabled) return;

        const command = () => exec(
            `php artisan ziggy:generate ${this.path}`,
            (error, stdout, stderr) => console.log(stdout)
        );

        command();

        if (Mix.isWatching() && this.watch) {
            ((require('chokidar')).watch(this.watch))
                .on('change', (path) => {
                    console.log(`${path} changed...`);
                    command();
                });
        };
    }
}());

mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css', [])
    .ziggy();
```
</details>

## Contributing

To get started contributing to Ziggy, check out [the contribution guide](CONTRIBUTING.md).

## Credits

- [Daniel Coulbourne](https://twitter.com/DCoulbourne)
- [Jake Bathman](https://twitter.com/jakebathman)
- [Matt Stauffer](https://twitter.com/stauffermatt)
- [Jacob Baker-Kretzmar](https://twitter.com/bakerkretzmar)
- [All contributors](https://github.com/tighten/ziggy/contributors)

Thanks to [Caleb Porzio](http://twitter.com/calebporzio), [Adam Wathan](http://twitter.com/adamwathan), and [Jeffrey Way](http://twitter.com/jeffrey_way) for help solidifying the idea.

## Security

Please review our [security policy](../../security/policy) on how to report security vulnerabilities.

## License

Ziggy is open-source software released under the MIT license. See [LICENSE](LICENSE) for more information.

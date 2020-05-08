![Ziggy - Use your Laravel named routes in JavaScript](https://raw.githubusercontent.com/tightenco/ziggy/master/ziggy-banner.png?version=3)

# Ziggy – Use your Laravel named routes in JavaScript

[![GitHub Actions Status](https://img.shields.io/github/workflow/status/tightenco/ziggy/Tests?label=tests&style=flat)](https://github.com/tightenco/ziggy/actions?query=workflow:Tests+branch:master)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/tightenco/ziggy.svg?style=flat)](https://packagist.org/packages/tightenco/ziggy)
[![Downloads on Packagist](https://img.shields.io/packagist/dt/tightenco/ziggy.svg?style=flat)](https://packagist.org/packages/tightenco/ziggy)
[![Latest Version on NPM](https://img.shields.io/npm/v/ziggy-js.svg?style=flat)](https://npmjs.com/package/ziggy-js)
[![Downloads on NPM](https://img.shields.io/npm/dt/ziggy-js.svg?style=flat)](https://npmjs.com/package/ziggy-js)

Ziggy creates a Blade directive that you can include in your views. It will export a JavaScript object of your application's named routes, keyed by their names (aliases), as well as a global `route()` helper function which you can use to access your routes in your JavaScript.

Ziggy supports all versions of Laravel from `5.4` to `7.x`.

## Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Examples](#examples)
    - [Default Values](#default-values)
- [Filtering Routes](#filtering-routes)
    - [Basic Whitelisting & Blacklisting](#basic-whitelisting--blacklisting)
    - [Basic Whitelisting & Blacklisting using Macros](#basic-whitelisting--blacklisting-using-macros)
    - [Advanced Whitelisting using Groups](#advanced-whitelisting-using-groups)
- [Other Useful Methods](#other-useful-methods)
    - [`current()`](#current)
    - [`url()`](#url)
- [Artisan Command](#artisan-command)
- [Using with Vue Components](#using-with-vue-components)
- [Other](#other)
- [Contributing](#contributing)
- [Credits](#credits)
- [Security](#security)
- [License](#license)

## Installation

1. Install Ziggy using Composer: `composer require tightenco/ziggy`.
1. If using Laravel 5.4, add `Tightenco\Ziggy\ZiggyServiceProvider::class` to the `providers` array in your `config/app.php`.
1. Include our Blade directive (`@routes`) somewhere in your template before your main application JavaScript is loaded—likely in the header somewhere.

## Usage

This package uses the `@routes` directive to inject a JavaScript object containing all of your application's routes, keyed by their names. This collection is available at `Ziggy.namedRoutes`.

The package also creates an optional `route()` JavaScript helper that functions like Laravel's PHP `route()` helper, which can be used to retrieve URLs by name and (optionally) parameters.

#### Examples

Without parameters:

```js
route('posts.index'); // Returns '/posts'
```

With required parameter:

```js
route('posts.show', { id: 1 }); // Returns '/posts/1'
route('posts.show', [1]); // Returns '/posts/1'
route('posts.show', 1); // Returns '/posts/1'
```

With multiple required parameters:

```js
route('events.venues.show', { event: 1, venue: 2 }); // Returns '/events/1/venues/2'
route('events.venues.show', [1, 2]); // Returns '/events/1/venues/2'
```

With query parameters:

```js
route('events.venues.show', { event: 1, venue: 2, page: 5, count: 10 }); // Returns '/events/1/venues/2?page=5&count=10'
```

If whole objects are passed, Ziggy will automatically look for an `id` primary key:

```js
let event = { id: 1, name: 'World Series' };
let venue = { id: 2, name: 'Rogers Centre' };

route('events.venues.show', [event, venue]); // Returns '/events/1/venues/2'
```

Practical AJAX example:

```js
let post = { id: 1, title: 'Ziggy Stardust' };

return axios.get(route('posts.show', post))
    .then((response) => {
        return response.data;
    });
```

_Note: If you are using Axios and making requests that require CSRF verification, use the [`url()` method](#url) on the route (documented below). This will ensure that the `X-XSRF-TOKEN` header is sent with the request._

#### Default Values

See the [Laravel documentation on default route parameter values](https://laravel.com/docs/urls#default-values).

Default values work out of the box for Laravel versions >= 5.5.29, for previous versions you will need to set the default parameters by including this code somewhere in the same page as Ziggy's `@routes` Blade directive.

```js
Ziggy.defaultParameters = {
    // example
    locale: 'en',
};
```

## Filtering Routes

Filtering routes is _completely optional_. If you want to pass all of your routes to your JavaScript by default, you can carry on using Ziggy as described above.

#### Basic Whitelisting & Blacklisting

To take advantage of basic whitelisting or blacklisting of routes, you will first need to create a config file in your Laravel app at `config/ziggy.php` and define **either** a `whitelist` or `blacklist` setting as an array of route name patterns.

**Note: You have to choose one or the other. Setting `whitelist` and `blacklist` will disable filtering altogether and simply return the default list of routes.**

Example `config/ziggy.php`:

```php
return [
    // 'whitelist' => ['home', 'api.*'],
    'blacklist' => ['debugbar.*', 'horizon.*', 'admin.*'],
];
```

As shown in the example above, Ziggy can use asterisks as wildcards in route filter patterns. `home` will only match the route named `home`, whereas `api.*` will match any route whose name begins with `api.`, such as `api.posts.index` and `api.users.show`.

#### Basic Whitelisting & Blacklisting using Macros

Whitelisting and blacklisting can also be achieved using the following macros.

Example whitelisting:

```php
Route::whitelist(function () {
    Route::get('...')->name('posts');
});

Route::whitelist()->get('...')->name('posts');
```

Example blacklisting:

```php
Route::blacklist(function () {
    Route::get('...')->name('posts');
});

Route::blacklist()->get('...')->name('posts');
```

#### Advanced Whitelisting using Groups

You may also optionally define multiple whitelists using a `groups` key in your `config/ziggy.php`:

```php
return [
    'groups' => [
        'admin' => [
            'admin.*',
            'posts.*',
        ],
        'author' => [
            'posts.*',
        ],
    ],
];
```

In the above example, you can see we have configured multiple whitelists for different user roles. You may expose a specific whitelist group by passing the group key into the `@routes` directive in your Blade view:

```php
@routes('author')
```

If you want to expose multiple groups you can pass an array of group names:

```php
@routes(['admin', 'author'])
```

**Note: Passing group names to the `@routes` directive will always take precedence over your other `whitelist` and `blacklist` settings.**

## Other Useful Methods

#### `current()`

To get the name of the current route based on the browser's `window.location`, you can use:

```js
route().current();
// returns 'events.index'
```

To check whether you are currently on a specific route, you can pass the route name to `current()`:

```js
route().current('events.index');
// returns true
```

You can even use wildcards to check if you're on any of the routes in a given 'group':

```js
route().current('events.*');
// returns true
```

#### `url()`

Ziggy returns a wrapper of the JavaScript [String primitive](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), which behaves exactly like a string in almost all cases. In rare cases, such as when third-party libraries use strict type checking, you may need an actual string literal.

To achieve this you can call `url()` on your route:

```js
route('home').url();
// returns 'https://ziggy.test/'
```

## Artisan Command

Ziggy registers an Artisan console command to generate a `ziggy.js` routes file, which can be used as part of an asset pipeline such as [Laravel Mix](https://laravel.com/docs/mix).

You can run `php artisan ziggy:generate` in your project to generate a static routes file in `resources/assets/js/ziggy.js`. You can optionally include a second parameter to override the path and file name (you must pass a complete path, including the file name):

```sh
php artisan ziggy:generate "resources/foo.js"
```

Example `ziggy.js`, where the named routes `home` and `login` exist in `routes/web.php`:

```php
// routes/web.php

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::get('/login', function () {
    return view('login');
})->name('login');
```

```js
// ziggy.js

var Ziggy = {
    namedRoutes: {"home":{"uri":"\/","methods":["GET","HEAD"],"domain":null},"login":{"uri":"login","methods":["GET","HEAD"],"domain":null}},
    baseUrl: 'http://ziggy.test/',
    baseProtocol: 'http',
    baseDomain: 'ziggy.test',
    basePort: false
};

export {
    Ziggy
};
```

Importing the `route()` helper and generated `ziggy.js`

```js
// webpack.mix.js
const path = require('path');

mix.webpackConfig({
    resolve: {
        alias: {
            ziggy: path.resolve('vendor/tightenco/ziggy/src/js/route.js'),
        },
    },
});
```

```js
// app.js

import route from 'ziggy';
import { Ziggy } from './ziggy';
```

## Using with Vue Components

If you want to use the `route()` helper in a Vue component, add this to your `app.js` file:

```js
// app.js

import route from 'ziggy';
import { Ziggy } from './ziggy';

Vue.mixin({
    methods: {
        route: (name, params, absolute) => route(name, params, absolute, Ziggy),
    },
});
```

Then you can use the method in your Vue components like so:

```html
<a class="nav-link" :href="route('home')">Home</a>
```

Thanks to [Archer70](https://github.com/tightenco/ziggy/issues/70#issuecomment-369129032) for this solution.

## Other

**Environment-based loading of minified route helper file**

When using the `@routes` Blade directive, Ziggy will detect the current environment and minify the output if `APP_ENV` is not `local`. In this case, `ziggy.min.js` will be loaded—otherwise, `ziggy.js` will be used.

**Disabling the `route()` helper**

If you only want to use the `@routes` directive to make your app's routes available in JavaScript, but don't need the `route()` helper function, you can set `skip-route-function` to `true` in your config:

```php
// config/ziggy.php

return [
    'skip-route-function' => true,
];
```

## Contributing

To get started contributing to Ziggy, check out [the contribution guide](CONTRIBUTING.md).

## Credits

- [Daniel Coulbourne](https://twitter.com/DCoulbourne)
- [Jake Bathman](https://twitter.com/jakebathman)
- [Matt Stauffer](https://twitter.com/stauffermatt)
- [Jacob Baker-Kretzmar](https://twitter.com/bakerkretzmar)
- [All contributors](https://github.com/tightenco/ziggy/contributors)

Thanks to [Caleb Porzio](http://twitter.com/calebporzio), [Adam Wathan](http://twitter.com/adamwathan), and [Jeffrey Way](http://twitter.com/jeffrey_way) for help solidifying the idea.

## Security

If you discover any security related issues, please email <hello@tighten.co> instead of using the issue tracker.

## License

Ziggy is open source software licensed under the MIT license. See [LICENSE.md](LICENSE.md) for more information.

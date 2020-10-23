![Ziggy - Use your Laravel named routes in JavaScript](https://raw.githubusercontent.com/tighten/ziggy/master/ziggy-banner.png)

# Ziggy – Use your Laravel routes in JavaScript

[![GitHub Actions Status](https://img.shields.io/github/workflow/status/tighten/ziggy/Tests?label=tests&style=flat)](https://github.com/tighten/ziggy/actions?query=workflow:Tests+branch:master)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/tightenco/ziggy.svg?style=flat)](https://packagist.org/packages/tightenco/ziggy)
[![Downloads on Packagist](https://img.shields.io/packagist/dt/tightenco/ziggy.svg?style=flat)](https://packagist.org/packages/tightenco/ziggy)
[![Latest Version on NPM](https://img.shields.io/npm/v/ziggy-js.svg?style=flat)](https://npmjs.com/package/ziggy-js)
[![Downloads on NPM](https://img.shields.io/npm/dt/ziggy-js.svg?style=flat)](https://npmjs.com/package/ziggy-js)

Ziggy creates a Blade directive that you can include in your views. It will export a JavaScript object of your application's named routes, keyed by their names (aliases), as well as a global `route()` helper function which you can use to access your routes in your JavaScript.

Ziggy supports all versions of Laravel from `5.4` to `8.x`.

> **Note**: you are viewing the `develop` branch, which is under active development. Not all of the features and changes in this documentation have been released. [Docs for the latest Ziggy release, `v0.9.4`, are in the Readme on the `0.9.x` branch](https://github.com/tighten/ziggy/tree/0.9.x).

## Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Examples](#examples)
    - [Default Values](#default-values)
- [Filtering Routes](#filtering-routes)
    - [Basic Filtering](#basic-filtering)
    - [Filtering using Groups](#filtering-using-groups)
- [Content Security Policy](#content-security-policy)
- [Other Useful Methods](#other-useful-methods)
    - [`current()`](#current)
    - [`check()`](#check)
    - [`url()`](#url)
- [Artisan Command](#artisan-command)
- [Using with Vue Components](#using-with-vue-components)
- [Other](#other)
- [Contributing](#contributing)
- [Credits](#credits)
- [Security](#security)
- [License](#license)

## Installation

1. Install Ziggy using Composer: `composer require tighten/ziggy`.
1. If using Laravel 5.4, add `Tightenco\Ziggy\ZiggyServiceProvider::class` to the `providers` array in your `config/app.php`.
1. Include our Blade directive (`@routes`) somewhere in your template before your main application JavaScript is loaded—likely in the header somewhere.

Ziggy is also available as an NPM package, `ziggy-js`, that exposes the `route()` function for use in frontend apps that are not using Blade or Composer. You can install the NPM package with `npm install ziggy-js` or load it from a CDN:

```html
<!-- Load the Ziggy routes object first -->
<script defer src="https://unpkg.com/ziggy-js@0.9.x/dist/js/route.min.js"></script>
```

Note that you still have to generate your routes file with `php artisan ziggy:generate` and make it available to your frontend app.

## Usage

Ziggy's `route()` helper function works similarly to Laravel's—you can pass it the name of any of your routes, and the parameters you want to pass to the route, and it will return a URL.

<!-- This package uses the `@routes` directive to inject a JavaScript object containing all of your application's routes, keyed by their names. This collection is available at `Ziggy.namedRoutes`.
The package also creates an optional `route()` JavaScript helper that functions like Laravel's PHP `route()` helper, which can be used to retrieve URLs by name and (optionally) parameters. -->

**Basic usage**

```php
// routes/web.php

Route::get('posts', fn (Request $request) => /* ... */)->name('posts.index');
```

```js
// app.js

route('posts.index'); // 'https://ziggy.test/posts'
```

**With parameters**

```php
// routes/web.php

Route::get('posts/{post}', fn (Request $request, Post $post) => /* ... */)->name('posts.show');
```

```js
// app.js

route('posts.show', 1);           // 'https://ziggy.test/posts/1'
route('posts.show', [1]);         // 'https://ziggy.test/posts/1'
route('posts.show', { post: 1 }); // 'https://ziggy.test/posts/1'
```

**With multiple parameters**

```php
// routes/web.php

Route::get('events/{event}/venues/{venue}', fn (Request $request, Event $event, Venue $venue) => /* ... */)->name('events.venues.show');
```

```js
// app.js

route('events.venues.show', [1, 2]);                 // 'https://ziggy.test/events/1/venues/2'
route('events.venues.show', { event: 1, venue: 2 }); // 'https://ziggy.test/events/1/venues/2'
```

**With query parameters**

```php
// routes/web.php

Route::get('events/{event}/venues/{venue}', fn (Request $request, Event $event, Venue $venue) => /* ... */)->name('events.venues.show');
```

```js
// app.js

route('events.venues.show', {
    event: 1,
    venue: 2,
    page: 5,
    count: 10,
});
// 'https://ziggy.test/events/1/venues/2?page=5&count=10'
```

If you have a query parameter with the same name as a route parameter, nest it under a `_query` key:

```js
route('events.venues.show', {
    event: 1,
    venue: 2,
    _query: {
        event: 3,
        page: 5,
    },
});
// 'https://ziggy.test/events/1/venues/2?event=3&page=5'
```

**With default parameter values**

@todo

**Practical AJAX example**

```js
const post = { id: 1, title: 'Ziggy Stardust' };

return axios.get(route('posts.show', post)).then((response) => response.data);
```

#### Route-model binding

Ziggy recognizes [Laravel route-model bindings](https://laravel.com/docs/routing#route-model-binding) and can use custom route key names. If you pass a Javascript object as a parameter value, Ziggy will use the registered route key if it's present, and fall back to `id` if it isn't.

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
// app/Http/Controllers/PostController.php

class PostController
{
    public function show(Request $request, Post $post)
    {
        //
    }
}
```

```php
// routes/web.php

Route::get('blog/{post}', [PostController::class, 'show'])->name('posts.show');
```

```js
// app.js

const post = {
    title: 'Introducing Ziggy v1',
    slug: 'introducing-ziggy-v1',
    date: '2020-10-23T20:59:24.359278Z',
};

route('posts.show', post); // 'https://ziggy.test/blog/introducing-ziggy-v1'
```

Ziggy also supports [custom keys](https://laravel.com/docs/routing#customizing-the-key) for scoped bindings in the route definition:

```php
// routes/web.php

Route::get('authors/{author}/photos/{photo:uuid}', fn (Request $request, Author $author, Photo $photo) => /* ... */)->name('authors.photos.show');
```

```js
// app.js

const photo = {
    uuid: '714b19e8-ac5e-4dab-99ba-34dc6fdd24a5',
    filename: 'sunset.jpg',
}

route('authors.photos.show', [{ id: 1, name: 'Jacob' }, photo]);
// 'https://ziggy.test/authors/1/photos/introducing-ziggy-v1'
```

@todo move this up
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

#### Basic Filtering

To take advantage of basic route filtering, you can create a config file in your Laravel app at `config/ziggy.php` and define **either** an `only` or `except` setting as an array of route name patterns.

**Note: You have to choose one or the other. Setting both `only` and `except` will disable filtering altogether and simply return the default list of routes.**

Example `config/ziggy.php`:

```php
return [
    // 'only' => ['home', 'api.*'],
    'except' => ['debugbar.*', 'horizon.*', 'admin.*'],
];
```

As shown in the example above, Ziggy can use asterisks as wildcards in route filter patterns. `home` will only match the route named `home`, whereas `api.*` will match any route whose name begins with `api.`, such as `api.posts.index` and `api.users.show`.

#### Filtering using Groups

You can also optionally define multiple groups of included routes using a `groups` key in your `config/ziggy.php`:

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

In the above example, we have configured multiple route groups for different user roles. You can expose a specific group by passing the group key into the `@routes` directive in your Blade view:

```php
@routes('author')
```

If you want to expose multiple groups you can pass an array of group names:

```php
@routes(['admin', 'author'])
```

**Note: Passing group names to the `@routes` directive will always take precedence over your other `only` or `except` settings.**

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

#### `check()`

Ziggy can check if a given named route is defined:

```js
route().check('home');
// returns true if a route name 'home' exists, false otherwise
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

You can run `php artisan ziggy:generate` in your project to generate a static routes file in `resources/js/ziggy.js`. You can optionally include a second parameter to override the path and file name (you must pass a complete path, including the file name):

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
            ziggy: path.resolve('vendor/tighten/ziggy/src/js/route.js'),
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

Thanks to [Archer70](https://github.com/tighten/ziggy/issues/70#issuecomment-369129032) for this solution.

## Other

#### Using `@routes` with a Content Security Policy

A [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSP) may block inline scripts, including those output by Ziggy's `@routes` Blade directive. If you have a CSP and are using a nonce to flag safe inline scripts, you can pass the nonce as as the second argument to the `@routes` directive and it will be added to Ziggy's script tag:

```php
@routes(false, 'your-nonce-here')
```

#### Disabling the `route()` helper

If you only want to use the `@routes` directive to make your app's routes available in JavaScript, but don't need the `route()` helper function, set the `skip-route-function` config value to `true`:

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
- [All contributors](https://github.com/tighten/ziggy/contributors)

Thanks to [Caleb Porzio](http://twitter.com/calebporzio), [Adam Wathan](http://twitter.com/adamwathan), and [Jeffrey Way](http://twitter.com/jeffrey_way) for help solidifying the idea.

## Security

If you discover any security related issues, please email <hello@tighten.co> instead of using the issue tracker.

## License

Ziggy is open source software released under the MIT license. See [LICENSE](LICENSE) for more information.

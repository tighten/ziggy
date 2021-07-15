![Ziggy - Use your Laravel named routes in JavaScript](https://raw.githubusercontent.com/tighten/ziggy/main/ziggy-banner.png)

# Ziggy – Use your Laravel routes in JavaScript

[![GitHub Actions Status](https://img.shields.io/github/workflow/status/tighten/ziggy/Tests?label=tests&style=flat)](https://github.com/tighten/ziggy/actions?query=workflow:Tests+branch:main)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/tightenco/ziggy.svg?style=flat)](https://packagist.org/packages/tightenco/ziggy)
[![Downloads on Packagist](https://img.shields.io/packagist/dt/tightenco/ziggy.svg?style=flat)](https://packagist.org/packages/tightenco/ziggy)
[![Latest Version on NPM](https://img.shields.io/npm/v/ziggy-js.svg?style=flat)](https://npmjs.com/package/ziggy-js)
[![Downloads on NPM](https://img.shields.io/npm/dt/ziggy-js.svg?style=flat)](https://npmjs.com/package/ziggy-js)

Ziggy provides a JavaScript `route()` helper function that works like Laravel's, making it easy to use your Laravel named routes in JavaScript.

Ziggy supports all versions of Laravel from `5.4` onward, and all modern browsers.

- [**Installation**](#installation)
- [**Usage**](#usage)
    - [The `route()` helper](#the-route-helper)
    - [The `Router` class](#the-router-class)
    - [Route-model binding](#route-model-binding)
    - [TypeScript support](#typescript-support)
- [**Advanced Setup**](#advanced-setup)
    - [JavaScript frameworks](#javascript-frameworks)
    - [Vue](#vue)
    - [React](#react)
    - [SPAs or separate repos](#spas-or-separate-repos)
- [**Filtering Routes**](#filtering-routes)
    - [Basic Filtering](#basic-filtering)
    - [Filtering using Groups](#filtering-using-groups)
- [**Other**](#other)
- [**Contributing**](#contributing)

## Installation

Install Ziggy into your Laravel app with `composer require tightenco/ziggy`.

Add the `@routes` Blade directive to your main layout (_before_ your application's JavaScript), and the `route()` helper function will now be available globally!

## Usage

#### The `route()` helper

Ziggy's `route()` helper function works like Laravel's—you can pass it the name of one of your routes, and the parameters you want to pass to the route, and it will return a URL.

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

Like Laravel's `route()` helper, Ziggy automatically encodes boolean query parameters as integers in the query string:

```js
route('events.venues.show', {
    event: 1,
    venue: 2,
    _query: {
        draft: false,
        overdue: true,
    },
});
// 'https://ziggy.test/events/1/venues/2?draft=0&overdue=1'
```

**With default parameter values**

See the [Laravel documentation on default route parameter values](https://laravel.com/docs/urls#default-values).

```php
// routes/web.php

Route::get('{locale}/posts/{post}', fn (Request $request, Post $post) => /* ... */)->name('posts.show');
```

```php
// app/Http/Middleware/SetLocale.php

URL::defaults(['locale' => $request->user()->locale ?? 'de']);
```

```js
// app.js

route('posts.show', 1); // 'https://ziggy.test/de/posts/1'
```

**Practical AJAX example**

```js
const post = { id: 1, title: 'Ziggy Stardust' };

return axios.get(route('posts.show', post)).then((response) => response.data);
```

#### The `Router` class

Calling Ziggy's `route()` helper function with no arguments will return an instance of the JavaScript `Router` class, which has some other useful properties and methods.

**Checking the current route: `route().current()`**

```js
// Route called 'events.index', with URI '/events'
// Current window URL is https://ziggy.test/events

route().current();               // 'events.index'
route().current('events.index'); // true
route().current('events.*');     // true
route().current('events.show');  // false
```

The `current()` method optionally accepts parameters as its second argument, and will check that their values also match in the current URL:

```js
// Route called 'events.venues.show', with URI '/events/{event}/venues/{venue}'
// Current window URL is https://myapp.com/events/1/venues/2?authors=all

route().current('events.venues.show', { event: 1, venue: 2 }); // true
route().current('events.venues.show', { authors: 'all' });     // true
route().current('events.venues.show', { venue: 6 });           // false
```

**Checking if a route exists: `route().has()`**

```js
// App has only one named route, 'home'

route().has('home');   // true
route().has('orders'); // false
```

**Retrieving the current route params: `route().params`**

```js
// Route called 'events.venues.show', with URI '/events/{event}/venues/{venue}'
// Current window URL is https://myapp.com/events/1/venues/2?authors=all

route().params; // { event: '1', venue: '2', authors: 'all' }
```

> Note: parameter values retrieved with `route().params` will always be returned as strings.

#### Route-model binding

Ziggy supports Laravel [route-model binding](https://laravel.com/docs/routing#route-model-binding), and can even recognize custom route key names. If you pass `route()` a JavaScript object as one of the route parameters, Ziggy will use the registered route-model binding keys for that route to find the parameter value in the object and insert it into the URL (falling back to an `id` key if there is one and the route-model binding key isn't present).

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
        return view('posts.show', ['post' => $post]);
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

// Ziggy knows that this route uses the 'slug' route-model binding key name:

route('posts.show', post); // 'https://ziggy.test/blog/introducing-ziggy-v1'
```

Ziggy also supports [custom keys](https://laravel.com/docs/routing#customizing-the-key) for scoped bindings in the route definition (requires Laravel 7+):

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
// 'https://ziggy.test/authors/1/photos/714b19e8-ac5e-4dab-99ba-34dc6fdd24a5'
```

#### TypeScript support

Unofficial TypeScript type definitions for Ziggy are maintained by [benallfree](https://github.com/benallfree) as part of [Definitely Typed](https://github.com/DefinitelyTyped/DefinitelyTyped), and can be installed with `npm install @types/ziggy-js`.

## Advanced Setup

#### JavaScript frameworks

If you are not using Blade, or would prefer not to use the `@routes` directive, Ziggy provides an artisan command to output its config and routes to a file: `php artisan ziggy:generate`. By default this command stores your routes at `resources/js/ziggy.js`, but you can pass an argument to it to use a different path. Alternatively, you can return Ziggy's config as JSON from an endpoint in your Laravel API (see [Retrieving Ziggy's routes and config from an API endpoint](#retrieving-ziggys-routes-and-config-from-an-api-endpoint) below for an example of how to set this up).

The file generated by `php artisan ziggy:generate` will look something like this:

```js
// ziggy.js

const Ziggy = {
    routes: {"home":{"uri":"\/","methods":["GET","HEAD"],"domain":null},"login":{"uri":"login","methods":["GET","HEAD"],"domain":null}},
    url: 'http://ziggy.test',
    port: false
};

export { Ziggy };
```

You can optionally create a webpack alias to make importing Ziggy's core source files easier:

```js
// webpack.mix.js

// Mix v6
const path = require('path');

mix.alias({
    ziggy: path.resolve('vendor/tightenco/ziggy/dist'), // or 'vendor/tightenco/ziggy/dist/vue' if you're using the Vue plugin
});

// Mix v5
const path = require('path');

mix.webpackConfig({
    resolve: {
        alias: {
            ziggy: path.resolve('vendor/tightenco/ziggy/dist'),
        },
    },
});
```

Finally, import and use Ziggy like any other JavaScript library. Because the Ziggy config object is not available globally in this setup, you'll usually have to pass it to the `route()` function manually:

```js
// app.js

import route from 'ziggy';
import { Ziggy } from './ziggy';

// ...

route('home', undefined, undefined, Ziggy);
```

#### Vue

Ziggy includes a Vue plugin to make it easy to use the `route()` helper throughout your Vue app:

```js
import { createApp } from 'vue';
import { ZiggyVue } from 'ziggy';
import { Ziggy } from './ziggy';
import App from './App';

createApp(App).use(ZiggyVue, Ziggy);

// Vue 2
import Vue from 'vue'
import { ZiggyVue } from 'ziggy';
import { Ziggy } from './ziggy';

Vue.use(ZiggyVue, Ziggy);
```

If you use this plugin with the Laravel Mix alias shown above, make sure to update the alias to `vendor/tightenco/ziggy/dist/vue`.

> Note: If you use the `@routes` Blade directive in your views, Ziggy's configuration will already be available globally, so you don't need to import the `Ziggy` config object and pass it into `use()`.

Now you can use `route()` anywhere in your Vue components and templates, like so:

```html
<a class="nav-link" :href="route('home')">Home</a>
```

#### React

To use Ziggy with React, start by importing the `route()` function and your Ziggy config. Because the Ziggy config object is not available globally in this setup, you'll have to pass it to the `route()` function manually:

```js
// app.js

import route from 'ziggy';
import { Ziggy } from './ziggy';

// ...

route('home', undefined, undefined, Ziggy);
```

We're working on adding a Hook to Ziggy to make this cleaner, but for now make sure you pass the configuration object as the fourth argument to the `route()` function as shown above.

> Note: If you include the `@routes` Blade directive in your views, the `route()` helper will already be available globally, including in your React app, so you don't need to import `route` or `Ziggy` anywhere.

#### SPAs or separate repos

Ziggy's `route()` helper function is also available as an NPM package, for use in JavaScript projects managed separately from their Laravel backend (i.e. without Composer or a `vendor` directory). You can install the NPM package with `npm install ziggy-js`.

To make your routes available on the frontend for this function to use, you can either run `php artisan ziggy:generate` and add the generated routes file to your project, or you can return Ziggy's config as JSON from an endpoint in your Laravel API (see [Retrieving Ziggy's routes and config from an API endpoint](#retrieving-ziggys-routes-and-config-from-an-api-endpoint) below for an example of how to set this up).

Then, import and use Ziggy as above:

```js
// app.js

import route from 'ziggy-js';

import { Ziggy } from './ziggy';
// or...
const response = await fetch('/api/ziggy');
const Ziggy = await response.toJson();

// ...

route('home', undefined, undefined, Ziggy);
```

## Filtering Routes

Ziggy supports filtering the routes it makes available to your JavaScript, which is great if you have certain routes that you don't want to be included and visible in the source of the response sent back to clients. Filtering routes is optional—by default, Ziggy includes all your application's named routes.

#### Basic filtering

To set up basic route filtering, create a config file in your Laravel app at `config/ziggy.php` and define **either** an `only` or `except` setting as an array of route name patterns.

> Note: You have to choose one or the other. Setting both `only` and `except` will disable filtering altogether and return all named routes.

```php
// config/ziggy.php

return [
    'only' => ['home', 'posts.index', 'posts.show'],
];
```

You can also use asterisks as wildcards in route filters. In the example below, `admin.*` will exclude routes named `admin.login` and `admin.register`:

```php
// config/ziggy.php

return [
    'except' => ['_debugbar.*', 'horizon.*', 'admin.*'],
];
```

#### Filtering using groups

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

#### TLS/SSL termination and trusted proxies

<!-- Or: What to do if your app is served over `https` but Ziggy's `route()` helper generates `http` URLs -->

If your application is using [TLS/SSL termination](https://en.wikipedia.org/wiki/TLS_termination_proxy) or is behind a load balancer or proxy, or if it's hosted on a service that is, Ziggy may generate URLs with a scheme of `http` instead of `https`, even if your app URL uses `https`. To avoid this happening, set up your Laravel app's `TrustProxies` middleware according to the documentation on [Configuring Trusted Proxies](https://laravel.com/docs/requests#configuring-trusted-proxies).

#### Using `@routes` with a Content Security Policy

A [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSP) may block inline scripts, including those output by Ziggy's `@routes` Blade directive. If you have a CSP and are using a nonce to flag safe inline scripts, you can pass the nonce as as the second argument to the `@routes` directive and it will be added to Ziggy's script tag:

```php
// PHP ^8.0
@routes(nonce: 'your-nonce-here')

// PHP <=7.4
@routes(null, 'your-nonce-here')
```

#### Disabling the `route()` helper

If you only want to use the `@routes` directive to make your app's routes available in JavaScript, but don't need the `route()` helper function, set the `skip-route-function` config value to `true`:

```php
// config/ziggy.php

return [
    'skip-route-function' => true,
];
```

#### Retrieving Ziggy's routes and config from an API endpoint

Ziggy can easily return its config object as JSON from an endpoint in your Laravel app. For example, you could set up an `/api/ziggy` route that looks something like this:

```php
// routes/api.php

use Tightenco\Ziggy\Ziggy;

Route::get('api/ziggy', fn () => response()->json(new Ziggy));
```

Then, client-side, you could retrieve the config with an HTTP request:

```js
// app.js

import route from 'ziggy-js';

const response = await fetch('/api/ziggy');
const Ziggy = await response.toJson();

// ...

route('home', undefined, undefined, Ziggy);
```

#### Re-generating the routes file when your app routes change

If you're exporting your Ziggy routes as a file by running `php artisan ziggy:generate`, you may want to watch your app's route files and re-run the command automatically whenever they're updated. The example below is a Laravel Mix plugin, but similar functionality could be achieved without Mix. Huge thanks to [Nuno Rodrigues](https://github.com/nacr) for [the idea and a sample implementation](https://github.com/tighten/ziggy/issues/321#issuecomment-689150082)!

<details>
<summary>Code example</summary>
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

If you discover any security related issues, please email <hello@tighten.co> instead of using the issue tracker.

## License

Ziggy is open source software released under the MIT license. See [LICENSE](LICENSE) for more information.

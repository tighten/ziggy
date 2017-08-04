# Ziggy
## Use your Laravel Named Routes inside Javascript

![Ziggy Javascript Laravel Routes Example](http://i.imgur.com/m6C9Cfy.gif)

Ziggy creates a Blade directive which you can include in your views. This will include a JS object of named routes, keyed by name, as well as a global `route()` helper function which you can use to access your routes in your JS. It's called ziggy because I didn't want to call it `laravel-named-routes-in-js`. So sue me.

### Installation 

`composer require tightenco/ziggy`

Add `Ziggy\ZiggyServiceProvider::class` to the `providers` array in your `config/app.php`.

Include our Blade Directive (`@jsroutes`) somewhere in your template before your main App JS is loaded.

### Usage

Your Routes will be stored as a nested JS object at `window.namedRoutes`.
Included is an optional `route()` helper method which can be used to retrieve URLs by name.

`route('posts.index')` should return `/posts`

If you wish to retrieve the URL for a route with required parameters, pass a JS object with the params as the second argument to `route()`

`route('posts.show', {id: 1})` should return `/posts/1`

### Thanks

Thanks to [Caleb Porzio](http://twitter.com/calebporzio), [Adam Wathan](http://twitter.com/adamwathan), [Matt Stauffer](http://twitter.com/stauffermatt), and [Jeffrey Way](http://twitter.com/jeffrey_way) for helping me think through all the ways to skin this cat.

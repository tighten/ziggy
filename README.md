[ ![Codeship Status for tightenco/ziggy](https://app.codeship.com/projects/fd5f2a10-5f32-0135-294e-56d74613da6d/status?branch=master)](https://app.codeship.com/projects/238934)

![Ziggy Javascript Laravel Routes Example](http://i.imgur.com/tWu1ZqT.gif)

# Ziggy - Use your Laravel Named Routes inside Javascript

Ziggy creates a Blade directive which you can include in your views. This will export a JavaScript object of your application's named routes, keyed by their names (aliases), as well as a global `route()` helper function which you can use to access your routes in your JavaScript.

## Installation 

1. Add Ziggy to your Composer file: `composer require tightenco/ziggy`

2. (if Laravel 5.4) Add `Tightenco\Ziggy\ZiggyServiceProvider::class` to the `providers` array in your `config/app.php`.

3. Include our Blade Directive (`@routes`) somewhere in your template before your main application JavaScript is loaded&mdash;likely in the header somewhere.

## Usage

This package replaces the `@routes` directive with a collection of all of your application's routes, keyed by their names. This collection is available at `window.namedRoutes`.

The package also creates an optional `route()` JavaScript helper which functions like Laravel's `route()` PHP helper, which can be used to retrieve URLs by name and (optionally) parameters. 

For example:

`route('posts.index')` should return `posts`

If you wish to retrieve the URL for a route with required parameters, pass a JavaScript object with the parameterss as the second argument to `route()`:

`route('posts.show', {id: 1})` should return `posts/1`

Here's a full example:

```javascript
let postId = 1337;

return axios.get(route('posts.show', {id: postId}))
    .then((response) => {
        return response.data;
    });
```


## Credits

- [Daniel Coulbourne](https://twitter.com/DCoulbourne)
- [Matt Stauffer](https://twitter.com/stauffermatt)

Thanks to [Caleb Porzio](http://twitter.com/calebporzio), [Adam Wathan](http://twitter.com/adamwathan), and [Jeffrey Way](http://twitter.com/jeffrey_way).

### Expected behavior

<!-- If this is a feature request/suggestion, please provide a usage example. -->

### Current behavior

<!-- If this is a feature request/suggestion, is it a modification of an existing feature? If not, leave this blank. -->


<!-- For bug reports, please also fill out the section below: -->

### Versions

- **Laravel**: #.#.#
- **Ziggy**: #.#.#

### Route

<!-- The route with the issue, from your Laravel routes file, or a similar example. -->

```php
Route::get('/venues/{venue}', 'VenuesController@show')->name('venues.show');
```

### Contents of `Ziggy.namedRoutes`

<!-- In your browser console/dev tools, type `Ziggy.namedRoutes` and paste the result here. -->

### Ziggy call in context

<!-- For example: -->

```javascript
// Api client is a wrapper around Axios
ApiClient.get(route('venues.show', { venue: 1 }));
```

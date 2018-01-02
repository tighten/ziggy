### Expected Behavior
_If this is a new feature, give a usage example._

### Current Behavior
_If this is a new feature, is it a modification of an existing feature? Otherwise – `none`_

## For bug reports only please provide
### Currently installed Laravel version:
`5.5.28`

### Currently installed Ziggy version
`0.6.0`

### Example route from your Laravel Routes file.
_i.e. -_
```php
Route::get('/venues/{venue}', 'VenuesController@show')->name('venues.show');
```
### Contents of Ziggy.namedRoutes
_In dev tools type `Ziggy.namedRoutes` and copy the result here._

### Ziggy call in context
_i.e. –_
```javascript
// Api client is a wrapper around Axios
ApiClient.get(route('venues.show', {venue: 1}));
```

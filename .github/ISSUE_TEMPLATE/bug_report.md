---
name: Bug report
about: Report an issue to help us improve Ziggy
title: ''
assignees: ''
---

#### Description

<!-- Provide a clear and concise description of the current behaviour and what the bug is. -->

#### Expected behavior

<!-- Provide a clear and concise description of what you expected to happen. -->

#### Environment

<!-- Include ALL of the information below: -->

- **Laravel version**: 
- **Ziggy version**: 

**Related routes**:

<!-- The route with the issue, from your Laravel routes file. E.g.: -->

```php
Route::get('/', 'HomeController')->name('home');
```

**`Ziggy.routes`**:

<!-- In your browser console/devtools, run `Ziggy.routes` and paste the result here. E.g.: -->

```js
{
    home: {
        uri: '/',
        methods: ['GET', 'HEAD'],
    },
    // ...
}
```

**Ziggy call and context**:

<!-- Show where and how you're using Ziggy when this bug occurs. E.g.: -->

```js
// ApiClient is a wrapper around axios
ApiClient.get(route('home', { lang: 'en' }));
```

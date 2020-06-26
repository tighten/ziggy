# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html), and the format of this changelog is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

Breaking changes are marked with ⚠️.

**Added**

- Document the `check()` method ([#294](https://github.com/tightenco/ziggy/pull/294)) and how to install and use Ziggy via `npm` and over a CDN ([#299](https://github.com/tightenco/ziggy/pull/299))

**Changed**

- ⚠️ Update `ziggy:generate` output path for Laravel 5.7+ `resources` directory structure, thanks [@Somethingideally](https://github.com/Somethingideally)! ([#269](https://github.com/tightenco/ziggy/pull/269))
- ⚠️ Update automatic `id` parameter detection to check for higher priority named route parameters and allow passing `id` as a query parameter ([#301](https://github.com/tightenco/ziggy/pull/301))
- ⚠️ Rename the `RoutePayload` class to `Ziggy` and remove its `compile` method in favour of constructing a new instance and calling `->toArray()` or `->toJson()` ([#tbd](#))
    - Resolve the application router instance internally instead of passing it into the constructor – `new Ziggy(...)` now takes only 2 arguments, `$group` and `$url`
    - Change the default value of `basePort` from `false` to `null`
    - Remove the `getRoutePayload()` methods on the `BladeRouteGenerator` and `CommandRouteGenerator` classes

**Fixed**

- Fix automatic `id` parameter detection by also excluding routes with an _optional_ `id` parameter (`{id?}`), thanks [@Livijn](https://github.com/Livijn)! ([#263](https://github.com/tightenco/ziggy/pull/263))
- Fix port not being added to URL for routes with subdomains ([#293](https://github.com/tightenco/ziggy/pull/293))
- Fix getting parameters of routes in apps installed in subfolders ([#302](https://github.com/tightenco/ziggy/pull/302))

## [0.9.4] - 2020-06-05

**Fixed**

- Fix escaping of `.` characters in the `current()` method, thanks [@davejamesmiller](https://github.com/davejamesmiller)! ([#296](https://github.com/tightenco/ziggy/pull/296))

## [0.9.3] - 2020-05-08

**Added**

- Add support for passing a CSP `nonce` attribute to the `@routes` Blade directive to be set on the script tag, thanks [@tminich](https://github.com/tminich)! (#287)

**Changed**

- Improve support for using Ziggy with server-side rendering, thanks [@emielmolenaar](https://github.com/emielmolenaar)! ([#260](https://github.com/tightenco/ziggy/pull/260))
- Avoid resolving the Blade compiler unless necessary, thanks [@axlon](https://github.com/axlon)! ([#267](https://github.com/tightenco/ziggy/pull/267))
- Use `dist/js/route.js` as the npm package's main target, thanks [@ankurk91](https://github.com/ankurk91) and [@benallfree](https://github.com/benallfree)! ([#276](https://github.com/tightenco/ziggy/pull/276))
- Readme and quality-of-life improvements ([#289](https://github.com/tightenco/ziggy/pull/289))

**Fixed**

- Ensure Ziggy's assets are always generated in the correct location ([#290](https://github.com/tightenco/ziggy/pull/290))

---

For previous changes see the [Releases](https://github.com/tightenco/ziggy/releases) page.

[Unreleased]: https://github.com/tightenco/ziggy/compare/0.9.4...HEAD
[0.9.4]: https://github.com/tightenco/ziggy/compare/0.9.3...0.9.4
[0.9.3]: https://github.com/tightenco/ziggy/compare/v0.9.2...0.9.3

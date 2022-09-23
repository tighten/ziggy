/**
 * @jest-environment jsdom
 */

import assert, { deepEqual, strictEqual as same, throws } from 'assert';
import route from '../../src/js';

const defaultWindow = {
    location: {
        host: 'ziggy.dev',
    },
};

const defaultZiggy = {
    url: 'https://ziggy.dev',
    port: null,
    defaults: { locale: 'en' },
    routes: {
        home: {
            uri: '/',
            methods: ['GET', 'HEAD'],
        },
        'posts.index': {
            uri: 'posts',
            methods: ['GET', 'HEAD'],
        },
        'posts.show': {
            uri: 'posts/{post}',
            methods: ['GET', 'HEAD'],
            bindings: {
                post: 'id',
            },
        },
        'posts.update': {
            uri: 'posts/{post}',
            methods: ['PUT'],
            bindings: {
                post: 'id',
            },
        },
        'postComments.show': {
            uri: 'posts/{post}/comments/{comment}',
            methods: ['GET', 'HEAD'],
            bindings: {
                post: 'id',
                comment: 'uuid',
            },
        },
        'translatePosts.index': {
            uri: '{locale}/posts',
            methods: ['GET', 'HEAD'],
        },
        'translatePosts.show': {
            uri: '{locale}/posts/{id}',
            methods: ['GET', 'HEAD'],
        },
        'translatePosts.update': {
            uri: '{locale}/posts/{post}',
            methods: ['PUT', 'PATCH'],
        },
        'events.venues-index': {
            uri: 'events/{event}/venues-index',
            methods: ['GET', 'HEAD'],
            bindings: {
                event: 'id',
            },
        },
        'events.venues.index': {
            uri: 'events/{event}/venues',
            methods: ['GET', 'HEAD'],
            bindings: {
                event: 'id',
            },
        },
        'events.venues.show': {
            uri: 'events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
            bindings: {
                event: 'id',
                venue: 'id',
            },
        },
        'events.venues.update': {
            uri: 'events/{event}/venues/{venue}',
            methods: ['PUT', 'PATCH'],
        },
        'translateEvents.venues.show': {
            uri: '{locale}/events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
            bindings: {
                event: 'id',
                venue: 'id',
            },
        },
        'conversations.show': {
            uri: 'subscribers/{subscriber}/conversations/{type}/{conversation_id?}',
            methods: ['GET', 'HEAD'],
        },
        optional: {
            uri: 'optional/{id}/{slug?}',
            methods: ['GET', 'HEAD'],
        },
        optionalId: {
            uri: 'optionalId/{type}/{id?}',
            methods: ['GET', 'HEAD'],
        },
        'team.user.show': {
            uri: 'users/{id}',
            methods: ['GET', 'HEAD'],
            domain: '{team}.ziggy.dev',
        },
        'translateTeam.user.show': {
            uri: '{locale}/users/{id}',
            methods: ['GET', 'HEAD'],
            domain: '{team}.ziggy.dev',
        },
        'products.show': {
            uri: '{country?}/{language?}/products/{id}',
            methods: ['GET', 'HEAD'],
        },
        'hosting-contacts.index': {
            uri: 'hosting-contacts',
            methods: ['GET', 'HEAD'],
        },
        'pages.optional': {
            uri: 'optionalpage/{page?}',
            methods: ['GET', 'HEAD'],
        },
        'pages.optionalExtension': {
            uri: 'download/file{extension?}',
            methods: ['GET', 'HEAD'],
        },
        'pages.requiredExtension': {
            uri: 'strict-download/file{extension}',
            methods: ['GET', 'HEAD'],
        },
        'pages.optionalWhere': {
            uri: 'where/optionalpage/{page?}',
            methods: ['GET', 'HEAD'],
            wheres: {
                page: '[0-9]+',
            },
        },
        'pages.optionalExtensionWhere': {
            uri: 'where/download/file{extension?}',
            methods: ['GET', 'HEAD'],
            wheres: {
                extension: '\\.(php|html)',
            },
        },
        'pages.requiredExtensionWhere': {
            uri: 'where/strict-download/file{extension}',
            methods: ['GET', 'HEAD'],
            wheres: {
                extension: '\\.(php|html)',
            },
        },
        'pages.complexWhere': {
            uri: 'where/{word}-{digit}/{required}/{optional?}/file{extension?}',
            methods: ['GET', 'HEAD'],
            wheres: {
                word: '[a-z_-]+',
                digit: '[0-9]+',
                required: 'required',
                optional: 'optional',
                extension: '\\.(php|html)',
            },
        },
        'pages.complexWhereConflict1': {
            uri: 'where/{digit}-{word}/{required}/{optional?}/file{extension?}',
            methods: ['GET', 'HEAD'],
            wheres: {
                word: '[a-z_-]+',
                digit: '[0-9]+',
                required: 'required',
                optional: 'optional',
                extension: '\\.(php|html)',
            },
        },
        'pages.complexWhereConflict2': {
            uri: 'where/complex-{digit}/{required}/{optional?}/file{extension?}',
            methods: ['GET', 'HEAD'],
            wheres: {
                digit: '[0-9]+',
                required: 'different_but_required',
                optional: 'optional',
                extension: '\\.(php|html)',
            },
        },
        pages: {
            uri: '{page}',
            methods: ['GET', 'HEAD'],
        },
        slashes: {
            uri: 'slashes/{encoded}/{slug}',
            methods: ['GET', 'HEAD'],
            wheres: {
                slug: '.*',
            },
        },
    },
};

beforeAll(() => {
    delete window.location;
    window.location = {};
});

beforeEach(() => {
    window.location = { ...defaultWindow.location };
    global.window.location = window.location;
    global.Ziggy = { ...defaultZiggy };
});

describe('route()', () => {
    test('can generate a URL with no parameters', () => {
        same(route('posts.index'), 'https://ziggy.dev/posts');
    });

    test('can generate a URL with default parameters', () => {
        same(route('translatePosts.index'), 'https://ziggy.dev/en/posts');
    });

    test('can generate a relative URL by passing absolute = false', () => {
        same(route('posts.index', [], false), '/posts');
    });

    test('can generate a URL with filled optional parameters', () => {
        same(
            route('conversations.show', {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234,
            }),
            'https://ziggy.dev/subscribers/123/conversations/email/1234'
        );
    });

    test('can generate a relative URL with filled optional parameters', () => {
        same(
            route('conversations.show', {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234,
            }, false),
            '/subscribers/123/conversations/email/1234'
        );
    });

    test('can generate a relative URL with default parameters', () => {
        same(route('translatePosts.index', [], false), '/en/posts');
    });

    test('can error if a required parameter is not provided', () => {
        throws(() => route('posts.show'), /'post' parameter is required/);
    });

    test('can error if a required parameter is not provided to a route with default parameters', () => {
        throws(() => route('translatePosts.show'), /'id' parameter is required/);
    });

    test('can error if a required parameter with a default has no default value', () => {
        global.Ziggy.defaults = {};

        throws(
            () => route('translatePosts.index'),
            /'locale' parameter is required/
        );
    });

    test('can generate a URL using an integer', () => {
        // route with required parameters
        same(route('posts.show', 1), 'https://ziggy.dev/posts/1');
        // route with default parameters
        same(route('translatePosts.show', 1), 'https://ziggy.dev/en/posts/1');
    });

    test('can generate a URL using a string', () => {
        // route with required parameters
        same(route('posts.show', 'my-first-post'), 'https://ziggy.dev/posts/my-first-post');
        // route with default parameters
        same(route('translatePosts.show', 'my-first-post'), 'https://ziggy.dev/en/posts/my-first-post');
    });

    test('can generate a URL using an object', () => {
        // routes with required parameters
        same(route('posts.show', { id: 1 }), 'https://ziggy.dev/posts/1');
        same(route('events.venues.show', { event: 1, venue: 2 }), 'https://ziggy.dev/events/1/venues/2');
        // route with optional parameters
        same(route('optionalId', { type: 'model', id: 1 }), 'https://ziggy.dev/optionalId/model/1');
        // route with both required and default parameters
        same(route('translateEvents.venues.show', { event: 1, venue: 2 }), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('can generate a URL using an array', () => {
        // routes with required parameters
        same(route('posts.show', [1]), 'https://ziggy.dev/posts/1');
        same(route('events.venues.show', [1, 2]), 'https://ziggy.dev/events/1/venues/2');
        same(route('events.venues.show', [1, 'coliseum']), 'https://ziggy.dev/events/1/venues/coliseum');
        // route with default parameters
        same(route('translatePosts.show', [1]), 'https://ziggy.dev/en/posts/1');
        // route with both required and default parameters
        same(route('translateEvents.venues.show', [1, 2]), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('can generate a URL using an array of objects', () => {
        const event = { id: 1, name: 'World Series' };
        const venue = { id: 2, name: 'Rogers Centre' };

        // route with required parameters
        same(route('events.venues.show', [event, venue]), 'https://ziggy.dev/events/1/venues/2');
        // route with required and default parameters
        same(route('translateEvents.venues.show', [event, venue]), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('can generate a URL using an array of integers and objects', () => {
        const venue = { id: 2, name: 'Rogers Centre' };

        // route with required parameters
        same(route('events.venues.show', [1, venue]), 'https://ziggy.dev/events/1/venues/2');
        // route with required and default parameters
        same(route('translateEvents.venues.show', [1, venue]), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('can generate a URL for a route with domain parameters', () => {
        // route with required domain parameters
        same(route('team.user.show', { team: 'tighten', id: 1 }), 'https://tighten.ziggy.dev/users/1');
        // route with required domain parameters and default parameters
        same(route('translateTeam.user.show', { team: 'tighten', id: 1 }), 'https://tighten.ziggy.dev/en/users/1');
    });

    test('can generate a URL for a route with a custom route model binding scope', () => {
        same(
            route('postComments.show', [
                { id: 1, title: 'Post' },
                { uuid: 12345, title: 'Comment' },
            ]),
            'https://ziggy.dev/posts/1/comments/12345'
        );
        same(
            route('postComments.show', [1, { uuid: 'correct-horse-etc-etc' }]),
            'https://ziggy.dev/posts/1/comments/correct-horse-etc-etc'
        );
    });

    test("can fall back to an 'id' key if an object is passed for a parameter with no registered bindings", () => {
        same(route('translatePosts.update', { id: 14 }), 'https://ziggy.dev/en/posts/14');
        same(route('translatePosts.update', [{ id: 14 }]), 'https://ziggy.dev/en/posts/14');
        same(route('events.venues.update', [{ id: 10 }, { id: 1 }]), 'https://ziggy.dev/events/10/venues/1');
    });

    test('can generate a URL for an app installed in a subfolder', () => {
        global.Ziggy.url = 'https://ziggy.dev/subfolder';

        same(
            route('postComments.show', [1, { uuid: 'correct-horse-etc-etc' }]),
            'https://ziggy.dev/subfolder/posts/1/comments/correct-horse-etc-etc'
        );
    });

    test('can error if a route model binding key is missing', () => {
        throws(
            () => route('postComments.show', [1, { count: 20 }]),
            /Ziggy error: object passed as 'comment' parameter is missing route model binding key 'uuid'\./
        );
    });

    test('can return base URL if path is "/"', () => {
        same(route('home'), 'https://ziggy.dev');
    });

    // @todo duplicate
    test('can ignore an optional parameter', () => {
        same(route('optional', { id: 123 }), 'https://ziggy.dev/optional/123');
        same(route('optional', { id: 123, slug: 'news' }), 'https://ziggy.dev/optional/123/news');
        same(route('optional', { id: 123, slug: null }), 'https://ziggy.dev/optional/123');
    });

    test('can ignore a single optional parameter', () => {
        same(route('pages.optional'), 'https://ziggy.dev/optionalpage');
        same(route('pages.optional', {}), 'https://ziggy.dev/optionalpage');
        same(route('pages.optional', undefined), 'https://ziggy.dev/optionalpage');
        same(route('pages.optional', null), 'https://ziggy.dev/optionalpage');
    });

    test('can error if a route name doesn’t exist', () => {
        throws(() => route('unknown-route'), /Ziggy error: route 'unknown-route' is not in the route list\./);
    });

    test('can automatically append extra parameter values as a query string', () => {
        same(
            route('events.venues.show', {
                event: 1,
                venue: 2,
                search: 'rogers',
                page: 2,
            }),
            'https://ziggy.dev/events/1/venues/2?search=rogers&page=2'
        );
        same(
            route('events.venues.show', {
                id: 2,
                event: 1,
                venue: 2,
                search: 'rogers',
            }),
            'https://ziggy.dev/events/1/venues/2?id=2&search=rogers'
        );
        // ignore values explicitly set to `null`
        same(route('posts.index', { filled: 'filling', empty: null }), 'https://ziggy.dev/posts?filled=filling');
    });

    test('can cast boolean query parameters to integers', () => {
        same(route('posts.show', { post: 1, preview: true }), 'https://ziggy.dev/posts/1?preview=1');
    });

    test('can explicitly append query parameters using _query parameter', () => {
        same(
            route('events.venues.show', {
                event: 1,
                venue: 2,
                _query: {
                    event: 4,
                    venue: 2,
                },
            }),
            'https://ziggy.dev/events/1/venues/2?event=4&venue=2'
        );
        same(
            route('events.venues.show', {
                event: { id: 4, name: 'Fun Event' },
                _query: {
                    event: 9,
                    id: 12,
                },
                venue: 2,
            }),
            'https://ziggy.dev/events/4/venues/2?event=9&id=12'
        );
    });

    test('can generate a URL with a port', () => {
        global.Ziggy.url = 'https://ziggy.dev:81';
        global.Ziggy.port = 81;

        // route with no parameters
        same(route('posts.index'), 'https://ziggy.dev:81/posts');
        // route with required domain parameters
        same(route('team.user.show', { team: 'tighten', id: 1 }), 'https://tighten.ziggy.dev:81/users/1');
    });

    test('can handle trailing path segments in the base URL', () => {
        global.Ziggy.url = 'https://test.thing/ab/cd';

        same(route('events.venues.index', 1), 'https://test.thing/ab/cd/events/1/venues');
    });

    test('can URL-encode named parameters', () => {
        global.Ziggy.url = 'https://test.thing/ab/cd';

        same(
            route('events.venues.index', { event: 'Fun&Games' }),
            'https://test.thing/ab/cd/events/Fun%26Games/venues'
        );
        same(
            route('events.venues.index', {
                event: 'Fun&Games',
                location: 'Blues&Clues',
            }),
            'https://test.thing/ab/cd/events/Fun%26Games/venues?location=Blues%26Clues'
        );
    });

    test('can format an array of query parameters', () => {
        same(
            route('events.venues.index', {
                event: 'test',
                guests: ['a', 'b', 'c'],
            }),
            'https://ziggy.dev/events/test/venues?guests[0]=a&guests[1]=b&guests[2]=c'
        );
    });

    test('can handle a parameter explicity set to `0`', () => {
        same(route('posts.update', 0), 'https://ziggy.dev/posts/0');
    });

    test('can accept a custom Ziggy configuration object', () => {
        const config = {
            url: 'http://notYourAverage.dev',
            port: null,
            defaults: { locale: 'en' },
            routes: {
                'tightenDev.packages.index': {
                    uri: 'tightenDev/{dev}/packages',
                    methods: ['GET', 'HEAD'],
                },
            },
        };

        same(
            route('tightenDev.packages.index', { dev: 1 }, true, config),
            'http://notYourAverage.dev/tightenDev/1/packages'
        );
    });

    test('can extract parameters for an app installed in a subfolder', () => {
        global.Ziggy.url = 'https://ziggy.dev/subfolder';

        global.window.location.href = 'https://ziggy.dev/subfolder/ph/en/products/4';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/subfolder/ph/en/products/4';

        deepEqual(route().params, { country: 'ph', language: 'en', id: '4' });
    });

    test('can extract parameters for an app installed in nested subfolders', () => {
        global.Ziggy.url = 'https://ziggy.dev/nested/subfolder';

        global.window.location.href = 'https://ziggy.dev/nested/subfolder/ph/en/products/4';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/nested/subfolder/ph/en/products/4';

        deepEqual(route().params, { country: 'ph', language: 'en', id: '4' });
    });

    test('can extract domain parameters from the current URL', () => {
        global.window.location.href = 'https://tighten.ziggy.dev/users/1';
        global.window.location.host = 'tighten.ziggy.dev';
        global.window.location.pathname = '/users/1';

        deepEqual(route().params, { team: 'tighten', id: '1' });
    });

    test('can extract named parameters from the current URL', () => {
        global.window.location.href = 'https://ziggy.dev/posts/1';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/posts/1';

        deepEqual(route().params, { post: '1' });

        global.window.location.href = 'https://ziggy.dev/events/1/venues/2';
        global.window.location.pathname = '/events/1/venues/2';

        deepEqual(route().params, { event: '1', venue: '2' });
    });

    test('can extract query parameters from the current URL', () => {
        global.window.location.href = 'https://ziggy.dev/posts/1?guest[name]=Taylor';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/posts/1';
        global.window.location.search = '?guest[name]=Taylor';

        deepEqual(route().params, { post: '1', guest: { name: 'Taylor' } });

        global.window.location.href = 'https://ziggy.dev/events/1/venues/2?id=5&vip=0';
        global.window.location.pathname = '/events/1/venues/2';
        global.window.location.search = '?id=5&vip=0';

        deepEqual(route().params, { event: '1', venue: '2', id: '5', vip: '0' });
    });

    test("can append 'extra' string/number parameter to query", () => {
        // 'posts.index' has no parameters
        same(route('posts.index', 'extra'), 'https://ziggy.dev/posts?extra=');
        same(route('posts.index', [{extra: 2}]), 'https://ziggy.dev/posts?extra=2');
        same(route('posts.index', 1), 'https://ziggy.dev/posts?1=');
    });

    test("can append 'extra' string/number elements in array of parameters to query", () => {
        // 'posts.show' has exactly one parameter
         same(route('posts.show', [1, 2]), 'https://ziggy.dev/posts/1?2=');
         same(route('posts.show', ['my-first-post', 'foo', 'bar']), 'https://ziggy.dev/posts/my-first-post?foo=&bar=');
    });

    test("can automatically append object with only 'extra' parameters to query", () => {
        // Route has no parameters, the entire parameters object is 'extra' and should be used as the query string
        same(route('hosting-contacts.index', { filter: { name: 'Dwyer' } }), 'https://ziggy.dev/hosting-contacts?filter[name]=Dwyer');
    });

    test("can append 'extra' object parameter to query", () => {
        same(route('posts.show', { post: 2, filter: { name: 'Dwyer' } }), 'https://ziggy.dev/posts/2?filter[name]=Dwyer');
    });

    test('can generate a URL for a route with parameters inside individual segments', () => {
        same(route('pages.requiredExtension', 'x'), 'https://ziggy.dev/strict-download/filex');
        same(route('pages.requiredExtension', '.html'), 'https://ziggy.dev/strict-download/file.html');
        same(route('pages.requiredExtension', { extension: '.pdf' }), 'https://ziggy.dev/strict-download/file.pdf');
    });

    test('can generate a URL for a route with optional parameters inside individual segments', () => {
        same(route('pages.optionalExtension'), 'https://ziggy.dev/download/file');
        same(route('pages.optionalExtension', '.html'), 'https://ziggy.dev/download/file.html');
        same(route('pages.optionalExtension', { extension: '.pdf' }), 'https://ziggy.dev/download/file.pdf');
    });

    test('can generate a URL for a route with optional parameters inside individual segments respecting where requirements', () => {
        same(route('pages.optionalExtensionWhere'), 'https://ziggy.dev/where/download/file');
        same(route('pages.optionalExtensionWhere', '.html'), 'https://ziggy.dev/where/download/file.html');
        throws(() => route('pages.optionalExtensionWhere', { extension: '.pdf' }), /'extension' parameter does not match required format/);
    });

    test('can generate a URL for a route with parameters inside individual segments', () => {
        same(route('pages.requiredExtensionWhere', '.html'), 'https://ziggy.dev/where/strict-download/file.html');
        throws(() => route('pages.requiredExtensionWhere', 'x'), /'extension' parameter does not match required format/);
        throws(() => route('pages.requiredExtensionWhere', { extension: '.pdf' }), /'extension' parameter does not match required format/);
    });


    test('can skip encoding slashes inside last parameter when explicitly allowed', () => {
        same(route('slashes', ['one/two', 'three/four']), 'https://ziggy.dev/slashes/one%2Ftwo/three/four');
        same(route('slashes', ['one/two', 'Fun&Games/venues']), 'https://ziggy.dev/slashes/one%2Ftwo/Fun%26Games/venues');
        same(route('slashes', ['one/two/three', 'Fun&Games/venues/outdoors']), 'https://ziggy.dev/slashes/one%2Ftwo%2Fthree/Fun%26Games/venues/outdoors');
    });
});

describe('has()', () => {
    test('can check if given named route exists', () => {
        assert(route().has('posts.show'));
        assert(!route().has('non.existing.route'));
    });

    test('can check if given named route exists with .check()', () => {
        assert(route().check('posts.show'));
        assert(!route().check('non.existing.route'));
    });
});

describe('current()', () => {
    test('can get the current route name', () => {
        global.window.location.pathname = '/events/1/venues/2';

        same(route().current(), 'events.venues.show');
    });

    test('can get the current route name on a route with multiple allowed HTTP methods', () => {
        global.window.location.pathname = '/posts/1';

        same(route().current(), 'posts.show');
    });

    test('can get the current route name with a missing protocol', () => {
        global.window.location.pathname = '/events/1/venues/';
        global.window.location.protocol = '';

        same(route().current(), 'events.venues.index');
    });

    test('can get the current route name at the domain root', () => {
        global.window.location.href = 'https://ziggy.dev';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/';

        same(route().current(), 'home');
        same(route().current('home'), true);
    });

    test('can ignore query string when getting current route name', () => {
        global.window.location.pathname = '/events/1/venues?foo=2';

        same(route().current(), 'events.venues.index');
    });

    test('can ignore domain when getting current route name and absolute is false', () => {
        global.window.location.href = 'https://tighten.ziggy.dev/events/1/venues?foo=2';
        global.window.location.host = 'tighten.ziggy.dev';
        global.window.location.pathname = '/events/1/venues?foo=2';

        same(route(undefined, undefined, false).current(), 'events.venues.index');

        global.window.location.href = 'https://example.com/events/1/venues?foo=2';
        global.window.location.host = 'example.com';
        global.window.location.pathname = '/events/1/venues?foo=2';

        same(route(undefined, undefined, false).current(), 'events.venues.index');
    });

    test('can ignore domain when getting current route name, absolute is false, and app is in a subfolder', () => {
        global.Ziggy.url = 'https://tighten.ziggy.dev/subfolder';
        global.window.location.href = 'https://tighten.ziggy.dev/subfolder/events/1/venues?foo=2';
        global.window.location.pathname = '/subfolder/events/1/venues?foo=2';

        same(route(undefined, undefined, false).current(), 'events.venues.index');

        global.Ziggy.url = 'https://example.com/nested/subfolder';
        global.window.location.href = 'https://example.com/nested/subfolder/events/1/venues?foo=2';
        global.window.location.pathname = '/nested/subfolder/events/1/venues?foo=2';

        same(route(undefined, undefined, false).current(), 'events.venues.index');
    });

    test('can get the current route name with a custom Ziggy object', () => {
        global.Ziggy = undefined;
        global.window.location.pathname = '/events/';

        const config = {
            url: 'https://ziggy.dev',
            port: null,
            routes: {
                'events.index': {
                    uri: 'events',
                    methods: ['GET', 'HEAD'],
                },
            },
        };

        same(route(undefined, undefined, undefined, config).current(), 'events.index');
    });

    test('can return undefined when getting the current route name on an unknown URL', () => {
        global.window.location.pathname = '/unknown/path';

        same(route().current(), undefined);
    });

    test('can check the current route name on a route/URL made up entirely of a single parameter', () => {
        global.window.location.pathname = '/some-page';

        same(route().current(), 'pages');
        same(route().current('pages', { page: 'some-page' }), true);
    });

    test('can check the current route name on a route/URL made up entirely of a single optional parameter', () => {
        global.window.location.pathname = '/optionalpage/foo';

        same(route().current(), 'pages.optional');
        same(route().current('pages.optional', ''), false);
        same(route().current('pages.optional', ['']), false);
        // same(route().current('pages.optional', []), false); // Not supported
        same(route().current('pages.optional', { page: '' }), false);
        same(route().current('pages.optional', { page: undefined }), false);
        same(route().current('pages.optional', { page: 'foo' }), true);
    });

    test('can check the current route name on a route/URL made up entirely of a single optional parameter and with that parameter missing', () => {
        global.window.location.pathname = '/optionalpage';

        same(route().current(), 'pages.optional');
        same(route().current('pages.optional', ''), true);
        // same(route().current('pages.optional', []), true); // Not supported
        same(route().current('pages.optional', ['']), true);
        same(route().current('pages.optional', { page: '' }), true);
        same(route().current('pages.optional', { page: undefined }), true);
        same(route().current('pages.optional', { page: 'foo' }), false);

        global.window.location.pathname = '/where/optionalpage';
        same(route().current('pages.optionalWhere', { page: undefined }), true);
        same(route().current('pages.optionalWhere', { page: 'foo' }), false);
        global.window.location.pathname = '/where/optionalpage/23';
        same(route().current('pages.optionalWhere', { page: 23 }), true);
        same(route().current('pages.optionalWhere', { page: 22 }), false);
    });

    test('can check current route with complex requirements without conflicts', () => {
        global.window.location.pathname = '/where/word-12/required/file';
        same(route().current('pages.complexWhere'), true);
        same(route().current('pages.complexWhereConflict1'), false);

        global.window.location.pathname = '/where/complex-12/required/file';
        same(route().current('pages.complexWhere', {word: 'complex', digit: '12', required: 'required'}), true);
        same(route().current('pages.complexWhereConflict1'), false);

        global.window.location.pathname = '/where/123-abc/required/file.html';
        same(route().current('pages.complexWhereConflict1'), true);
        same(route().current('pages.complexWhere'), false);

        global.window.location.pathname = '/where/complex-12/different_but_required/optional/file';
        same(route().current('pages.complexWhereConflict2'), true);
        same(route().current('pages.complexWhere'), false);
    });

    test('can current route with complex requirements is dehydrated correctly', () => {
        global.window.location.pathname = '/where/word-12/required/file';
        deepEqual(route().params, {digit: '12', word: 'word', required: 'required', optional: undefined, extension: undefined})

        global.window.location.pathname = '/where/complex-12/required/optional/file';
        deepEqual(route().params, {digit: '12', word: 'complex', required: 'required', optional: 'optional', extension: undefined})

        global.window.location.pathname = '/where/123-abc/required/file.html';
        deepEqual(route().params, {digit: '123', word: 'abc', required: 'required', optional: undefined, extension: '.html'})

        global.window.location.pathname = '/where/complex-12/different_but_required/optional/file';
        deepEqual(route().params, {digit: '12', required: 'different_but_required', optional: 'optional', extension: undefined})

        global.window.location.search = '?ab=cd&ef=1&dd';
        deepEqual(route().params, {digit: '12', required: 'different_but_required', optional: 'optional', extension: undefined, ab: 'cd', ef: '1', 'dd': ''})
    });

    test('can strip regex start and end of string tokens from wheres', () => {
        global.Ziggy = undefined;
        global.window.location.pathname = '/workspace/processes';

        const config = {
            url: 'https://ziggy.dev',
            port: null,
            routes: {
                'workspaces.processes.index': {
                    uri: '{workspace}/processes',
                    methods: ['GET', 'HEAD'],
                    wheres: {
                        workspace: '^(?!api|nova-api|horizon).*$',
                    },
                },
            },
        };

        same(route(undefined, undefined, undefined, config).current(), 'workspaces.processes.index');
    });

    test('can check the current route name at a URL with a non-delimited parameter', () => {
        global.window.location.pathname = '/strict-download/file.html';

        same(route().current(), 'pages.requiredExtension');
        same(route().current('pages.requiredExtension', ''), false);
        same(route().current('pages.requiredExtension*', ''), false);
        same(route().current('pages.requiredExtension', '.html'), true);
        same(route().current('pages.requiredExtension*', '.html'), true);
        same(route().current('pages.requiredExtension', ['']), false);
        same(route().current('pages.requiredExtension*', ['']), false);
        same(route().current('pages.requiredExtension', ['.html']), true);
        same(route().current('pages.requiredExtension*', ['.html']), true);
        same(route().current('pages.requiredExtension', { extension: '' }), false);
        same(route().current('pages.requiredExtension*', { extension: '' }), false);
        same(route().current('pages.requiredExtension', { extension: '.pdf' }), false);
        same(route().current('pages.requiredExtension*', { extension: '.pdf' }), false);
        same(route().current('pages.requiredExtension', { extension: '.html' }), true);
        same(route().current('pages.requiredExtension*', { extension: '.html' }), true);
    });

    test('can check the current route name at a URL with a missing non-delimited optional parameter', () => {
        global.window.location.pathname = '/download/file';

        same(route().current(), 'pages.optionalExtension');
        same(route().current('pages.optionalExtension', ''), true);
        same(route().current('pages.optionalExtension*', ''), true);
        same(route().current('pages.optionalExtension', ['']), true);
        same(route().current('pages.optionalExtension*', ['']), true);
        same(route().current('pages.optionalExtension', { extension: '' }), true);
        same(route().current('pages.optionalExtension*', { extension: '' }), true);
        same(route().current('pages.optionalExtension', { extension: '.html' }), false);
        same(route().current('pages.optionalExtension*', { extension: '.pdf' }), false);
    });

    test('can check the current route name at a URL with a non-delimited optional parameter', () => {
        global.window.location.pathname = '/download/file.html';

        same(route().current(), 'pages.optionalExtension');
        same(route().current('pages.optionalExtension', ''), false);
        same(route().current('pages.optionalExtension*', ''), false);
        same(route().current('pages.optionalExtension', '.html'), true);
        same(route().current('pages.optionalExtension*', '.html'), true);
        same(route().current('pages.optionalExtension', ['']), false);
        same(route().current('pages.optionalExtension*', ['']), false);
        same(route().current('pages.optionalExtension', ['.html']), true);
        same(route().current('pages.optionalExtension*', ['.html']), true);
        same(route().current('pages.optionalExtension', { extension: '' }), false);
        same(route().current('pages.optionalExtension*', { extension: '' }), false);
        same(route().current('pages.optionalExtension', { extension: '.pdf' }), false);
        same(route().current('pages.optionalExtension*', { extension: '.pdf' }), false);
        same(route().current('pages.optionalExtension', { extension: '.html' }), true);
        same(route().current('pages.optionalExtension*', { extension: '.html' }), true);

        global.window.location.pathname = '/where/download/file.html';
        same(route().current('pages.optionalExtensionWhere', { extension: '.html' }), true);

        global.window.location.pathname = '/where/download/file.pdf';
        same(route().current('pages.optionalExtensionWhere', { extension: '.pdf' }), false);
    });

    test('can check the current route name with parameters on a URL with no parameters', () => {
        global.window.location.href = 'https://ziggy.dev';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/';

        same(route().current('home', { page: 'test' }), false);
        same(route().current('pages', { page: 'test' }), false);

        global.window.location.pathname = '/posts/';

        same(route().current('posts.index', { post: 1 }), false);
        same(route().current('posts.show', { post: 1 }), false);
    });

    test('can check the current route name with positional parameters on a URL with no parameters', () => {
        global.window.location.pathname = '/posts';
        global.window.location.search = '?0=test';

        same(route().current('posts.index', undefined), true);
        same(route().current('posts.index', null), true);
        same(route().current('posts.index', {}), true);
        same(route().current('posts.index', { '0': 'test' }), true);

        same(route().current('posts.index', ''), false);
        same(route().current('posts.index', 'test'), false);
        // same(route().current('posts.index', []), false); // Not supported
        same(route().current('posts.index', ['']), false);
        same(route().current('posts.index', [1]), false);
    });

    test('can return false when checking the current route name on an unknown route', () => {
        global.window.location.pathname = '/unknown/';

        same(route().current('posts.delete'), false);
    });

    test('can return false when checking the current route name and params on an unknown URL', () => {
        global.window.location.pathname = '/unknown/path';

        same(route().current('posts.show', { post: 2 }), false);
        same(route().current('posts.show', 2), false);
        same(route().current('posts.show', [2]), false);
        same(route().current('posts.show', 'post'), false);
    });

    test('can return false when checking a non-existent route name on a known URL', () => {
        global.window.location.pathname = '/events/1/venues/2';

        same(route().current('random-route'), false);
    });

    test('can return false when checking a non-existent route name on an unknown URL', () => {
        global.window.location.pathname = '/unknown/test';

        same(route().current('random-route'), false);
    });

    test('can return false when checking a non-existent route name and params on a known URL', () => {
        global.window.location.pathname = '/events/1/venues/2';

        same(route().current('random-route', { post: 2 }), false);
        same(route().current('random-route', 2), false);
        same(route().current('random-route', [2]), false);
        same(route().current('random-route', 'post'), false);
    });

    test('can return false when checking a non-existent route name and params on an unknown URL', () => {
        global.window.location.pathname = '/unknown/params';

        same(route().current('random-route', { post: 2 }), false);
        same(route().current('random-route', 2), false);
        same(route().current('random-route', [2]), false);
        same(route().current('random-route', 'post'), false);
    });

    test('can check the current route name against a pattern', () => {
        global.window.location.pathname = '/events/1/venues/2';

        assert(route().current('events.venues.show'));
        assert(route().current('events.venues.*'));
        assert(route().current('events.*.show'));
        assert(route().current('*.venues.show'));
        assert(route().current('events.*'));

        assert(!route().current('events.venues.index'));
        assert(!route().current('events.users.*'));
        assert(!route().current('*.users.show'));
        assert(!route().current('events'));
        assert(!route().current('show'));

        global.window.location.pathname = '/hosting-contacts';

        assert(route().current('hosting-contacts.index'));
        assert(route().current('*.index'));
        // https://github.com/tighten/ziggy/pull/296
        assert(!route().current('hosting.*'));
    });

    test('can check the current route name on a route with filled optional parameters', () => {
        global.window.location.pathname = '/optional/1/foo';

        assert(route().current('optional'));
    });

    test('can check the current route name on a route with trailing empty optional parameters', () => {
        global.window.location.pathname = '/optional/1';

        assert(route().current('optional'));
    });

    test('can check the current route name on a route with optional parameters in the middle of the URI', () => {
        global.Ziggy.url = 'https://ziggy.dev/subfolder';

        // Missing the optional 'language' parameter (e.g. subfolder/ph/en/products...)
        global.window.location.href = 'https://ziggy.dev/subfolder/ph/products/4';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/subfolder/ph/products/4';

        assert(route().current('products.show'));
    });

    test('can check the current route with parameters', () => {
        global.window.location.pathname = '/events/1/venues/2';

        same(route().current('events.venues.show', { event: 1, venue: 2 }), true);
        same(route().current('events.venues.show', [1, 2]), true);
        same(route().current('events.venues.show', [1, { id: 2, name: 'Grand Canyon' }]), true);
        same(route().current('events.venues.show', { event: 1 }), true);
        same(route().current('events.venues.show', { venue: 2 }), true);
        same(route().current('events.venues.show', [1]), true);
        same(route().current('events.venues.show', {}), true);
        same(route().current('events.venues.show', null), true);

        same(route().current('events.venues.show', { event: 4, venue: 2 }), false);
        same(route().current('events.venues.show', { event: null }), false);
        same(route().current('events.venues.show', [1, 6]), false);
        same(route().current('events.venues.show', [{ id: 1 }, { id: 4, name: 'Great Pyramids' }]), false);
        same(route().current('events.venues.show', { event: 4 }), false);
        same(route().current('events.venues.show', { venue: 4 }), false);
        same(route().current('events.venues.show', [5]), false);
    });

    test('can check the current route with parameters with incorrect parameter names', () => {
        global.window.location.pathname = '/events/1/venues/2';

        same(route().current('events.venues.show', { eventz: 2 }), false);
    });

    test('can check the current route with query parameters', () => {
        global.window.location.pathname = '/events/1/venues/2';
        global.window.location.search = '?user=Jacob&id=9';

        assert(route().current('events.venues.show', { event: 1, venue: 2, user: 'Jacob' }));
        assert(route().current('events.venues.show', {
            event: { id: 1, name: 'Party' },
            venue: 2,
            id: 9,
        }));
        assert(route().current('events.venues.show', { user: 'Jacob', venue: { id: 2 } }));

        assert(!route().current('events.venues.show', { user: 'Matt', venue: { id: 9 } }));
        assert(!route().current('events.venues.show', { event: 5, id: 9, user: 'Jacob' }));
        assert(!route().current('events.venues.show', { id: 12, user: 'Matt' }));
    });

    test('can ignore routes that don’t allow GET requests', () => {
        global.window.location.pathname = '/posts/1';

        assert(!route().current('posts.update'));
    });

    test('can ignore trailing slashes', () => {
        global.window.location.pathname = '/events/1/venues/';

        same(route().current(), 'events.venues.index');
    });

    test('matches route name with multiple periods', () => {
        global.window.location.pathname = '/events/1/venues';

        same(route().current('events.venues-index'), false);
        same(route().current('events.venues.index'), true);

        global.window.location.pathname = '/events/1/venues-index';

        same(route().current('events.venues-index'), true);
        same(route().current('events.venues.index'), false);
    });

    test('matches route name with multiple periods and wildcards', () => {
        global.window.location.pathname = '/events/1/venues-index';

        same(route().current('events.venues-index'), true);
        same(route().current('events.venues.*'), false);
    });

    test.skip('can unresolve arbitrary urls to names and params', () => {
        const resolved = route().unresolve('https://ziggy.dev/events/1/venues?test=yes');
        deepEqual(resolved, { name: 'events.venues.index', params: {event: '1'}, query: {test: 'yes'}, route: resolved.route });
        same(resolved.route.uri, 'events/{event}/venues');

        same(route().unresolve('ziggy.dev/events/1/venues-index').name, 'events.venues-index');
        same(route().unresolve('/events/1/venues-index').name, 'events.venues-index');
    });

    test('can get the current route name without window', () => {
        global.Ziggy = undefined;
        global.window = undefined;

        const config = {
            url: 'https://ziggy.dev',
            port: null,
            routes: {
                'events.venues.show': {
                    uri: 'events/{event}/venues/{venue}',
                    methods: ['GET', 'HEAD'],
                    bindings: {
                        event: 'id',
                        venue: 'id',
                    },
                },
            },
            location: {
                host: 'ziggy.dev',
                pathname: '/events/1/venues/2',
                search: '?user=Jacob&id=9',
            },
        };

        same(route(undefined, undefined, undefined, config).current(), 'events.venues.show');
    });
});

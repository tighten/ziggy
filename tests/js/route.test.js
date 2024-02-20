// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, test } from 'vitest';
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
        statistics: {
            uri: 'статистика',
            methods: ['GET', 'HEAD'],
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
        slashesOtherRegex: {
            uri: 'slashes/{encoded}/{slug}',
            methods: ['GET', 'HEAD'],
            wheres: {
                slug: '.+',
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
        expect(route('posts.index')).toBe('https://ziggy.dev/posts');
    });

    test('can generate a URL with default parameters', () => {
        expect(route('translatePosts.index')).toBe('https://ziggy.dev/en/posts');
    });

    test('can generate a relative URL by passing absolute = false', () => {
        expect(route('posts.index', [], false)).toBe('/posts');
    });

    test('can generate a URL with filled optional parameters', () => {
        expect(
            route('conversations.show', {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234,
            }),
        ).toBe('https://ziggy.dev/subscribers/123/conversations/email/1234');
    });

    test('can generate a relative URL with filled optional parameters', () => {
        expect(
            route(
                'conversations.show',
                {
                    type: 'email',
                    subscriber: 123,
                    conversation_id: 1234,
                },
                false,
            ),
        ).toBe('/subscribers/123/conversations/email/1234');
    });

    test('can generate a relative URL with default parameters', () => {
        expect(route('translatePosts.index', [], false)).toBe('/en/posts');
    });

    test('can error if a required parameter is not provided', () => {
        expect(() => route('posts.show')).toThrow(/'post' parameter is required/);
    });

    test('can error if a required parameter is not provided to a route with default parameters', () => {
        expect(() => route('translatePosts.show')).toThrow(/'id' parameter is required/);
    });

    test('can error if a required parameter with a default has no default value', () => {
        global.Ziggy.defaults = {};

        expect(() => route('translatePosts.index')).toThrow(/'locale' parameter is required/);
    });

    test('can generate a URL using an integer', () => {
        // route with required parameters
        expect(route('posts.show', 1)).toBe('https://ziggy.dev/posts/1');
        // route with default parameters
        expect(route('translatePosts.show', 1)).toBe('https://ziggy.dev/en/posts/1');
    });

    test('can generate a URL using a string', () => {
        // route with required parameters
        expect(route('posts.show', 'my-first-post')).toBe('https://ziggy.dev/posts/my-first-post');
        // route with default parameters
        expect(route('translatePosts.show', 'my-first-post')).toBe(
            'https://ziggy.dev/en/posts/my-first-post',
        );
    });

    test('can generate a URL using an object', () => {
        // routes with required parameters
        expect(route('posts.show', { id: 1 })).toBe('https://ziggy.dev/posts/1');
        expect(route('events.venues.show', { event: 1, venue: 2 })).toBe(
            'https://ziggy.dev/events/1/venues/2',
        );
        // route with optional parameters
        expect(route('optionalId', { type: 'model', id: 1 })).toBe(
            'https://ziggy.dev/optionalId/model/1',
        );
        // route with both required and default parameters
        expect(route('translateEvents.venues.show', { event: 1, venue: 2 })).toBe(
            'https://ziggy.dev/en/events/1/venues/2',
        );
    });

    test('can generate a URL using an array', () => {
        // routes with required parameters
        expect(route('posts.show', [1])).toBe('https://ziggy.dev/posts/1');
        expect(route('events.venues.show', [1, 2])).toBe('https://ziggy.dev/events/1/venues/2');
        expect(route('events.venues.show', [1, 'coliseum'])).toBe(
            'https://ziggy.dev/events/1/venues/coliseum',
        );
        // route with default parameters
        expect(route('translatePosts.show', [1])).toBe('https://ziggy.dev/en/posts/1');
        // route with both required and default parameters
        expect(route('translateEvents.venues.show', [1, 2])).toBe(
            'https://ziggy.dev/en/events/1/venues/2',
        );
    });

    test('can generate a URL using an array of objects', () => {
        const event = { id: 1, name: 'World Series' };
        const venue = { id: 2, name: 'Rogers Centre' };

        // route with required parameters
        expect(route('events.venues.show', [event, venue])).toBe(
            'https://ziggy.dev/events/1/venues/2',
        );
        // route with required and default parameters
        expect(route('translateEvents.venues.show', [event, venue])).toBe(
            'https://ziggy.dev/en/events/1/venues/2',
        );
    });

    test('can generate a URL using an array of integers and objects', () => {
        const venue = { id: 2, name: 'Rogers Centre' };

        // route with required parameters
        expect(route('events.venues.show', [1, venue])).toBe('https://ziggy.dev/events/1/venues/2');
        // route with required and default parameters
        expect(route('translateEvents.venues.show', [1, venue])).toBe(
            'https://ziggy.dev/en/events/1/venues/2',
        );
    });

    test('can generate a URL for a route with domain parameters', () => {
        // route with required domain parameters
        expect(route('team.user.show', { team: 'tighten', id: 1 })).toBe(
            'https://tighten.ziggy.dev/users/1',
        );
        // route with required domain parameters and default parameters
        expect(route('translateTeam.user.show', { team: 'tighten', id: 1 })).toBe(
            'https://tighten.ziggy.dev/en/users/1',
        );
    });

    test('can generate a URL for a route with a custom route model binding scope', () => {
        expect(
            route('postComments.show', [
                { id: 1, title: 'Post' },
                { uuid: 12345, title: 'Comment' },
            ]),
        ).toBe('https://ziggy.dev/posts/1/comments/12345');
        expect(route('postComments.show', [1, { uuid: 'correct-horse-etc-etc' }])).toBe(
            'https://ziggy.dev/posts/1/comments/correct-horse-etc-etc',
        );
    });

    test("can fall back to an 'id' key if an object is passed for a parameter with no registered bindings", () => {
        expect(route('translatePosts.update', { id: 14 })).toBe('https://ziggy.dev/en/posts/14');
        expect(route('translatePosts.update', [{ id: 14 }])).toBe('https://ziggy.dev/en/posts/14');
        expect(route('events.venues.update', [{ id: 10 }, { id: 1 }])).toBe(
            'https://ziggy.dev/events/10/venues/1',
        );
    });

    test('can generate a URL for an app installed in a subfolder', () => {
        global.Ziggy.url = 'https://ziggy.dev/subfolder';

        expect(route('postComments.show', [1, { uuid: 'correct-horse-etc-etc' }])).toBe(
            'https://ziggy.dev/subfolder/posts/1/comments/correct-horse-etc-etc',
        );
    });

    test('can error if a route model binding key is missing', () => {
        expect(() => route('postComments.show', [1, { count: 20 }])).toThrow(
            /Ziggy error: object passed as 'comment' parameter is missing route model binding key 'uuid'\./,
        );
    });

    test('can return base URL if path is "/"', () => {
        expect(route('home')).toBe('https://ziggy.dev');
    });

    test('can generate a relative URL to a root path', () => {
        expect(route('home', undefined, false)).toBe('/');
    });

    // @todo duplicate
    test('can ignore an optional parameter', () => {
        expect(route('optional', { id: 123 })).toBe('https://ziggy.dev/optional/123');
        expect(route('optional', { id: 123, slug: 'news' })).toBe(
            'https://ziggy.dev/optional/123/news',
        );
        expect(route('optional', { id: 123, slug: null })).toBe('https://ziggy.dev/optional/123');
    });

    test('can ignore a single optional parameter', () => {
        expect(route('pages.optional')).toBe('https://ziggy.dev/optionalpage');
        expect(route('pages.optional', {})).toBe('https://ziggy.dev/optionalpage');
        expect(route('pages.optional', undefined)).toBe('https://ziggy.dev/optionalpage');
        expect(route('pages.optional', null)).toBe('https://ziggy.dev/optionalpage');
    });

    test('missing optional parameter in first path segment', () => {
        expect(route('products.show', { country: 'ca', language: 'fr', id: 1 })).toBe(
            'https://ziggy.dev/ca/fr/products/1',
        );
        // These URLs aren't valid but this matches the behavior of Laravel's PHP `route()` helper
        expect(route('products.show', { country: 'ca', id: 1 })).toBe(
            'https://ziggy.dev/ca//products/1',
        );
        expect(route('products.show', { id: 1 })).toBe('https://ziggy.dev//products/1');
        // First param is handled correctly
        expect(route('products.show', { language: 'fr', id: 1 })).toBe(
            'https://ziggy.dev/fr/products/1',
        );
    });

    test('can error if a route name doesn’t exist', () => {
        expect(() => route('unknown-route')).toThrow(
            /Ziggy error: route 'unknown-route' is not in the route list\./,
        );
    });

    test('can automatically append extra parameter values as a query string', () => {
        expect(
            route('events.venues.show', {
                event: 1,
                venue: 2,
                search: 'rogers',
                page: 2,
            }),
        ).toBe('https://ziggy.dev/events/1/venues/2?search=rogers&page=2');
        expect(
            route('events.venues.show', {
                id: 2,
                event: 1,
                venue: 2,
                search: 'rogers',
            }),
        ).toBe('https://ziggy.dev/events/1/venues/2?id=2&search=rogers');
        // ignore values explicitly set to `null`
        expect(route('posts.index', { filled: 'filling', empty: null })).toBe(
            'https://ziggy.dev/posts?filled=filling',
        );
    });

    test('can cast boolean query parameters to integers', () => {
        expect(route('posts.show', { post: 1, preview: true })).toBe(
            'https://ziggy.dev/posts/1?preview=1',
        );
    });

    test('can explicitly append query parameters using _query parameter', () => {
        expect(
            route('events.venues.show', {
                event: 1,
                venue: 2,
                _query: {
                    event: 4,
                    venue: 2,
                },
            }),
        ).toBe('https://ziggy.dev/events/1/venues/2?event=4&venue=2');
        expect(
            route('events.venues.show', {
                event: { id: 4, name: 'Fun Event' },
                _query: {
                    event: 9,
                    id: 12,
                },
                venue: 2,
            }),
        ).toBe('https://ziggy.dev/events/4/venues/2?event=9&id=12');
    });

    test('can generate a URL with a port', () => {
        global.Ziggy.url = 'https://ziggy.dev:81';
        global.Ziggy.port = 81;

        // route with no parameters
        expect(route('posts.index')).toBe('https://ziggy.dev:81/posts');
        // route with required domain parameters
        expect(route('team.user.show', { team: 'tighten', id: 1 })).toBe(
            'https://tighten.ziggy.dev:81/users/1',
        );
    });

    test('can handle trailing path segments in the base URL', () => {
        global.Ziggy.url = 'https://test.thing/ab/cd';

        expect(route('events.venues.index', 1)).toBe('https://test.thing/ab/cd/events/1/venues');
    });

    test('URL-encode query parameters', () => {
        global.Ziggy.url = 'https://test.thing/ab/cd';

        expect(route('events.venues.index', { event: 'Fun&Games' })).toBe(
            'https://test.thing/ab/cd/events/Fun&Games/venues',
        );
        expect(
            route('events.venues.index', {
                event: 'Fun&Games',
                location: 'Blues&Clues',
            }),
        ).toBe('https://test.thing/ab/cd/events/Fun&Games/venues?location=Blues%26Clues');
    });

    test('can format an array of query parameters', () => {
        expect(
            route('events.venues.index', {
                event: 'test',
                guests: ['a', 'b', 'c'],
            }),
        ).toBe('https://ziggy.dev/events/test/venues?guests[0]=a&guests[1]=b&guests[2]=c');
    });

    test('can handle a parameter explicity set to `0`', () => {
        expect(route('posts.update', 0)).toBe('https://ziggy.dev/posts/0');
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

        expect(route('tightenDev.packages.index', { dev: 1 }, true, config)).toBe(
            'http://notYourAverage.dev/tightenDev/1/packages',
        );
    });

    test('can extract parameters for an app installed in a subfolder', () => {
        global.Ziggy.url = 'https://ziggy.dev/subfolder';

        global.window.location.href = 'https://ziggy.dev/subfolder/ph/en/products/4';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/subfolder/ph/en/products/4';

        expect(route().params).toStrictEqual({ country: 'ph', language: 'en', id: '4' });
    });

    test('can extract parameters for an app installed in nested subfolders', () => {
        global.Ziggy.url = 'https://ziggy.dev/nested/subfolder';

        global.window.location.href = 'https://ziggy.dev/nested/subfolder/ph/en/products/4';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/nested/subfolder/ph/en/products/4';

        expect(route().params).toStrictEqual({ country: 'ph', language: 'en', id: '4' });
    });

    test('can extract domain parameters from the current URL', () => {
        global.window.location.href = 'https://tighten.ziggy.dev/users/1';
        global.window.location.host = 'tighten.ziggy.dev';
        global.window.location.pathname = '/users/1';

        expect(route().params).toStrictEqual({ team: 'tighten', id: '1' });
    });

    test('can extract named parameters from the current URL', () => {
        global.window.location.href = 'https://ziggy.dev/posts/1';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/posts/1';

        expect(route().params).toStrictEqual({ post: '1' });

        global.window.location.href = 'https://ziggy.dev/events/1/venues/2';
        global.window.location.pathname = '/events/1/venues/2';

        expect(route().params).toStrictEqual({ event: '1', venue: '2' });
    });

    test('can decode parameters in the current URL', () => {
        global.window.location.href = 'https://ziggy.dev/events/1/venues/1%2B2%263';
        global.window.location.pathname = '/events/1/venues/1%2B2%263';

        expect(route().params).toStrictEqual({ event: '1', venue: '1+2&3' });
    });

    test('can extract query parameters from the current URL', () => {
        global.window.location.href = 'https://ziggy.dev/posts/1?guest[name]=Taylor';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/posts/1';
        global.window.location.search = '?guest[name]=Taylor';

        expect(route().params).toStrictEqual({ post: '1', guest: { name: 'Taylor' } });

        global.window.location.href = 'https://ziggy.dev/events/1/venues/2?id=5&vip=1%2B2%263';
        global.window.location.pathname = '/events/1/venues/2';
        global.window.location.search = '?id=5&vip=1%2B2%263';

        expect(route().params).toStrictEqual({
            event: '1',
            venue: '2',
            id: '5',
            vip: '1+2&3',
        });
    });

    test("can append 'extra' string/number parameter to query", () => {
        // 'posts.index' has no parameters
        expect(route('posts.index', 'extra')).toBe('https://ziggy.dev/posts?extra=');
        expect(route('posts.index', [{ extra: 2 }])).toBe('https://ziggy.dev/posts?extra=2');
        expect(route('posts.index', 1)).toBe('https://ziggy.dev/posts?1=');
    });

    test("can append 'extra' elements in array of parameters to query", () => {
        // 'posts.show' has exactly one parameter
        expect(route('posts.show', [1, 2])).toBe('https://ziggy.dev/posts/1?2=');
        expect(route('posts.show', ['my-first-post', 'foo', 'bar'])).toBe(
            'https://ziggy.dev/posts/my-first-post?foo=&bar=',
        );

        expect(route('posts.show', ['my-first-post', 'foo', { bar: 'baz' }])).toBe(
            'https://ziggy.dev/posts/my-first-post?foo=&bar=baz',
        );
    });

    test("can automatically append object with only 'extra' parameters to query", () => {
        // Route has no parameters, the entire parameters object is 'extra' and should be used as the query string
        expect(route('hosting-contacts.index', { filter: { name: 'Dwyer' } })).toBe(
            'https://ziggy.dev/hosting-contacts?filter[name]=Dwyer',
        );
    });

    test("can append 'extra' object parameter to query", () => {
        expect(route('posts.show', { post: 2, filter: { name: 'Dwyer' } })).toBe(
            'https://ziggy.dev/posts/2?filter[name]=Dwyer',
        );
    });

    test('can generate a URL for a route with parameters inside individual segments', () => {
        expect(route('pages.requiredExtension', 'x')).toBe(
            'https://ziggy.dev/strict-download/filex',
        );
        expect(route('pages.requiredExtension', '.html')).toBe(
            'https://ziggy.dev/strict-download/file.html',
        );
        expect(route('pages.requiredExtension', { extension: '.pdf' })).toBe(
            'https://ziggy.dev/strict-download/file.pdf',
        );
    });

    test('can generate a URL for a route with optional parameters inside individual segments', () => {
        expect(route('pages.optionalExtension')).toBe('https://ziggy.dev/download/file');
        expect(route('pages.optionalExtension', '.html')).toBe(
            'https://ziggy.dev/download/file.html',
        );
        expect(route('pages.optionalExtension', { extension: '.pdf' })).toBe(
            'https://ziggy.dev/download/file.pdf',
        );
    });

    test('can generate a URL for a route with optional parameters inside individual segments respecting where requirements', () => {
        expect(route('pages.optionalExtensionWhere')).toBe('https://ziggy.dev/where/download/file');
        expect(route('pages.optionalExtensionWhere', '.html')).toBe(
            'https://ziggy.dev/where/download/file.html',
        );
        expect(() => route('pages.optionalExtensionWhere', { extension: '.pdf' })).toThrow(
            /'extension' parameter does not match required format/,
        );
    });

    test('can generate a URL for a route with parameters inside individual segments', () => {
        expect(route('pages.requiredExtensionWhere', '.html')).toBe(
            'https://ziggy.dev/where/strict-download/file.html',
        );
        expect(() => route('pages.requiredExtensionWhere', 'x')).toThrow(
            /'extension' parameter does not match required format/,
        );
        expect(() => route('pages.requiredExtensionWhere', { extension: '.pdf' })).toThrow(
            /'extension' parameter does not match required format/,
        );
    });

    test('skip encoding slashes inside last parameter when explicitly allowed', () => {
        expect(route('slashes', ['one/two', 'three/four'])).toBe(
            'https://ziggy.dev/slashes/one/two/three/four',
        );
        expect(route('slashes', ['one/two', 'Fun&Games/venues'])).toBe(
            'https://ziggy.dev/slashes/one/two/Fun&Games/venues',
        );
        expect(route('slashes', ['one/two/three', 'Fun&Games/venues/outdoors'])).toBe(
            'https://ziggy.dev/slashes/one/two/three/Fun&Games/venues/outdoors',
        );

        expect(route('slashesOtherRegex', ['one/two', 'three/four'])).toBe(
            'https://ziggy.dev/slashes/one/two/three/four',
        );
        expect(route('slashesOtherRegex', ['one/two', 'Fun&Games/venues'])).toBe(
            'https://ziggy.dev/slashes/one/two/Fun&Games/venues',
        );
        expect(route('slashesOtherRegex', ['one/two/three', 'Fun&Games/venues/outdoors'])).toBe(
            'https://ziggy.dev/slashes/one/two/three/Fun&Games/venues/outdoors',
        );
    });

    test('skip encoding some characters in route parameters', () => {
        // Laravel doesn't encode these characters in route parameters: / @ : ; , = + ! * | ? & # %
        expect(route('pages', 'a/b')).toBe('https://ziggy.dev/a/b');
        expect(route('pages', 'a@b')).toBe('https://ziggy.dev/a@b');
        expect(route('pages', 'a:b')).toBe('https://ziggy.dev/a:b');
        expect(route('pages', 'a;b')).toBe('https://ziggy.dev/a;b');
        expect(route('pages', 'a,b')).toBe('https://ziggy.dev/a,b');
        expect(route('pages', 'a=b')).toBe('https://ziggy.dev/a=b');
        expect(route('pages', 'a+b')).toBe('https://ziggy.dev/a+b');
        expect(route('pages', 'a!b')).toBe('https://ziggy.dev/a!b');
        expect(route('pages', 'a*b')).toBe('https://ziggy.dev/a*b');
        expect(route('pages', 'a|b')).toBe('https://ziggy.dev/a|b');
        expect(route('pages', 'a?b')).toBe('https://ziggy.dev/a?b');
        expect(route('pages', 'a&b')).toBe('https://ziggy.dev/a&b');
        expect(route('pages', 'a#b')).toBe('https://ziggy.dev/a#b');
        expect(route('pages', 'a%b')).toBe('https://ziggy.dev/a%b');

        // Laravel does encode '$', but encodeURI() doesn't
        expect(route('pages', 'a$b')).toBe('https://ziggy.dev/a%24b');
    });
});

describe('has()', () => {
    test('can check if given named route exists', () => {
        expect(route().has('posts.show')).toBe(true);
        expect(route().has('non.existing.route')).toBe(false);
    });

    test('can check if given named route exists with .check()', () => {
        expect(route().check('posts.show')).toBe(true);
        expect(route().check('non.existing.route')).toBe(false);
    });
});

describe('current()', () => {
    test('can get the current route name', () => {
        global.window.location.pathname = '/events/1/venues/2';

        expect(route().current()).toBe('events.venues.show');
    });

    test('can get the current route name on a route with multiple allowed HTTP methods', () => {
        global.window.location.pathname = '/posts/1';

        expect(route().current()).toBe('posts.show');
    });

    test('can get the current route name with a missing protocol', () => {
        global.window.location.pathname = '/events/1/venues/';
        global.window.location.protocol = '';

        expect(route().current()).toBe('events.venues.index');
    });

    test('can get the current route name at the domain root', () => {
        global.window.location.href = 'https://ziggy.dev';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/';

        expect(route().current()).toBe('home');
        expect(route().current('home')).toBe(true);
    });

    test('can ignore query string when getting current route name', () => {
        global.window.location.pathname = '/events/1/venues?foo=2';

        expect(route().current()).toBe('events.venues.index');
    });

    test('can ignore domain when getting current route name and absolute is false', () => {
        global.window.location.href = 'https://tighten.ziggy.dev/events/1/venues?foo=2';
        global.window.location.host = 'tighten.ziggy.dev';
        global.window.location.pathname = '/events/1/venues?foo=2';

        expect(route(undefined, undefined, false).current()).toBe('events.venues.index');

        global.window.location.href = 'https://example.com/events/1/venues?foo=2';
        global.window.location.host = 'example.com';
        global.window.location.pathname = '/events/1/venues?foo=2';

        expect(route(undefined, undefined, false).current()).toBe('events.venues.index');
    });

    test('can ignore domain when getting current route name, absolute is false, and app is in a subfolder', () => {
        global.Ziggy.url = 'https://tighten.ziggy.dev/subfolder';
        global.window.location.href = 'https://tighten.ziggy.dev/subfolder/events/1/venues?foo=2';
        global.window.location.pathname = '/subfolder/events/1/venues?foo=2';

        expect(route(undefined, undefined, false).current()).toBe('events.venues.index');

        global.Ziggy.url = 'https://example.com/nested/subfolder';
        global.window.location.href = 'https://example.com/nested/subfolder/events/1/venues?foo=2';
        global.window.location.pathname = '/nested/subfolder/events/1/venues?foo=2';

        expect(route(undefined, undefined, false).current()).toBe('events.venues.index');
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

        expect(route(undefined, undefined, undefined, config).current()).toBe('events.index');
    });

    test('can return undefined when getting the current route name on an unknown URL', () => {
        global.window.location.pathname = '/unknown/path';

        expect(route().current()).toBe(undefined);
    });

    test('can check the current route name on a route/URL made up entirely of a single parameter', () => {
        global.window.location.pathname = '/some-page';

        expect(route().current()).toBe('pages');
        expect(route().current('pages', { page: 'some-page' })).toBe(true);
    });

    test('can check the current route name on a route/URL made up entirely of a single optional parameter', () => {
        global.window.location.pathname = '/optionalpage/foo';

        expect(route().current()).toBe('pages.optional');
        expect(route().current('pages.optional', '')).toBe(false);
        expect(route().current('pages.optional', [''])).toBe(false);
        // expect(route().current('pages.optional', [])).toBe(false); // Not supported
        expect(route().current('pages.optional', { page: '' })).toBe(false);
        expect(route().current('pages.optional', { page: undefined })).toBe(false);
        expect(route().current('pages.optional', { page: 'foo' })).toBe(true);
    });

    test('can check the current route name on a route/URL made up entirely of a single optional parameter and with that parameter missing', () => {
        global.window.location.pathname = '/optionalpage';

        expect(route().current()).toBe('pages.optional');
        expect(route().current('pages.optional', '')).toBe(true);
        // expect(route().current('pages.optional', [])).toBe(true); // Not supported
        expect(route().current('pages.optional', [''])).toBe(true);
        expect(route().current('pages.optional', { page: '' })).toBe(true);
        expect(route().current('pages.optional', { page: undefined })).toBe(true);
        expect(route().current('pages.optional', { page: 'foo' })).toBe(false);

        global.window.location.pathname = '/where/optionalpage';
        expect(route().current('pages.optionalWhere', { page: undefined })).toBe(true);
        expect(route().current('pages.optionalWhere', { page: 'foo' })).toBe(false);
        global.window.location.pathname = '/where/optionalpage/23';
        expect(route().current('pages.optionalWhere', { page: 23 })).toBe(true);
        expect(route().current('pages.optionalWhere', { page: 22 })).toBe(false);
    });

    test('can check current route with complex requirements without conflicts', () => {
        global.window.location.pathname = '/where/word-12/required/file';
        expect(route().current('pages.complexWhere')).toBe(true);
        expect(route().current('pages.complexWhereConflict1')).toBe(false);

        global.window.location.pathname = '/where/complex-12/required/file';
        expect(
            route().current('pages.complexWhere', {
                word: 'complex',
                digit: '12',
                required: 'required',
            }),
        ).toBe(true);
        expect(route().current('pages.complexWhereConflict1')).toBe(false);

        global.window.location.pathname = '/where/123-abc/required/file.html';
        expect(route().current('pages.complexWhereConflict1')).toBe(true);
        expect(route().current('pages.complexWhere')).toBe(false);

        global.window.location.pathname = '/where/complex-12/different_but_required/optional/file';
        expect(route().current('pages.complexWhereConflict2')).toBe(true);
        expect(route().current('pages.complexWhere')).toBe(false);
    });

    test('can current route with complex requirements is dehydrated correctly', () => {
        global.window.location.pathname = '/where/word-12/required/file';
        expect(route().params).toStrictEqual({
            digit: '12',
            word: 'word',
            required: 'required',
            optional: undefined,
            extension: undefined,
        });

        global.window.location.pathname = '/where/complex-12/required/optional/file';
        expect(route().params).toStrictEqual({
            digit: '12',
            word: 'complex',
            required: 'required',
            optional: 'optional',
            extension: undefined,
        });

        global.window.location.pathname = '/where/123-abc/required/file.html';
        expect(route().params).toStrictEqual({
            digit: '123',
            word: 'abc',
            required: 'required',
            optional: undefined,
            extension: '.html',
        });

        global.window.location.pathname = '/where/complex-12/different_but_required/optional/file';
        expect(route().params).toStrictEqual({
            digit: '12',
            required: 'different_but_required',
            optional: 'optional',
            extension: undefined,
        });

        global.window.location.search = '?ab=cd&ef=1&dd';
        expect(route().params).toStrictEqual({
            digit: '12',
            required: 'different_but_required',
            optional: 'optional',
            extension: undefined,
            ab: 'cd',
            ef: '1',
            dd: '',
        });
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

        expect(route(undefined, undefined, undefined, config).current()).toBe(
            'workspaces.processes.index',
        );
    });

    test('can check the current route name at a URL with a non-delimited parameter', () => {
        global.window.location.pathname = '/strict-download/file.html';

        expect(route().current()).toBe('pages.requiredExtension');
        expect(route().current('pages.requiredExtension', '')).toBe(false);
        expect(route().current('pages.requiredExtension*', '')).toBe(false);
        expect(route().current('pages.requiredExtension', '.html')).toBe(true);
        expect(route().current('pages.requiredExtension*', '.html')).toBe(true);
        expect(route().current('pages.requiredExtension', [''])).toBe(false);
        expect(route().current('pages.requiredExtension*', [''])).toBe(false);
        expect(route().current('pages.requiredExtension', ['.html'])).toBe(true);
        expect(route().current('pages.requiredExtension*', ['.html'])).toBe(true);
        expect(route().current('pages.requiredExtension', { extension: '' })).toBe(false);
        expect(route().current('pages.requiredExtension*', { extension: '' })).toBe(false);
        expect(route().current('pages.requiredExtension', { extension: '.pdf' })).toBe(false);
        expect(route().current('pages.requiredExtension*', { extension: '.pdf' })).toBe(false);
        expect(route().current('pages.requiredExtension', { extension: '.html' })).toBe(true);
        expect(route().current('pages.requiredExtension*', { extension: '.html' })).toBe(true);
    });

    test('can check the current route name at a URL with a missing non-delimited optional parameter', () => {
        global.window.location.pathname = '/download/file';

        expect(route().current()).toBe('pages.optionalExtension');
        expect(route().current('pages.optionalExtension', '')).toBe(true);
        expect(route().current('pages.optionalExtension*', '')).toBe(true);
        expect(route().current('pages.optionalExtension', [''])).toBe(true);
        expect(route().current('pages.optionalExtension*', [''])).toBe(true);
        expect(route().current('pages.optionalExtension', { extension: '' })).toBe(true);
        expect(route().current('pages.optionalExtension*', { extension: '' })).toBe(true);
        expect(route().current('pages.optionalExtension', { extension: '.html' })).toBe(false);
        expect(route().current('pages.optionalExtension*', { extension: '.pdf' })).toBe(false);
    });

    test('can check the current route name at a URL with a non-delimited optional parameter', () => {
        global.window.location.pathname = '/download/file.html';

        expect(route().current()).toBe('pages.optionalExtension');
        expect(route().current('pages.optionalExtension', '')).toBe(false);
        expect(route().current('pages.optionalExtension*', '')).toBe(false);
        expect(route().current('pages.optionalExtension', '.html')).toBe(true);
        expect(route().current('pages.optionalExtension*', '.html')).toBe(true);
        expect(route().current('pages.optionalExtension', [''])).toBe(false);
        expect(route().current('pages.optionalExtension*', [''])).toBe(false);
        expect(route().current('pages.optionalExtension', ['.html'])).toBe(true);
        expect(route().current('pages.optionalExtension*', ['.html'])).toBe(true);
        expect(route().current('pages.optionalExtension', { extension: '' })).toBe(false);
        expect(route().current('pages.optionalExtension*', { extension: '' })).toBe(false);
        expect(route().current('pages.optionalExtension', { extension: '.pdf' })).toBe(false);
        expect(route().current('pages.optionalExtension*', { extension: '.pdf' })).toBe(false);
        expect(route().current('pages.optionalExtension', { extension: '.html' })).toBe(true);
        expect(route().current('pages.optionalExtension*', { extension: '.html' })).toBe(true);

        global.window.location.pathname = '/where/download/file.html';
        expect(
            route().current('pages.optionalExtensionWhere', {
                extension: '.html',
            }),
        ).toBe(true);

        global.window.location.pathname = '/where/download/file.pdf';
        expect(
            route().current('pages.optionalExtensionWhere', {
                extension: '.pdf',
            }),
        ).toBe(false);
    });

    test('can check the current route name with parameters on a URL with no parameters', () => {
        global.window.location.href = 'https://ziggy.dev';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/';

        expect(route().current('home', { page: 'test' })).toBe(false);
        expect(route().current('pages', { page: 'test' })).toBe(false);

        global.window.location.pathname = '/posts/';

        expect(route().current('posts.index', { post: 1 })).toBe(false);
        expect(route().current('posts.show', { post: 1 })).toBe(false);
    });

    test('can check the current route name with positional parameters on a URL with no parameters', () => {
        global.window.location.pathname = '/posts';
        global.window.location.search = '?0=test';

        expect(route().current('posts.index', undefined)).toBe(true);
        expect(route().current('posts.index', null)).toBe(true);
        expect(route().current('posts.index', {})).toBe(true);
        expect(route().current('posts.index', { 0: 'test' })).toBe(true);

        expect(route().current('posts.index', '')).toBe(false);
        expect(route().current('posts.index', 'test')).toBe(false);
        // expect(route().current('posts.index', [])).toBe(false); // Not supported
        expect(route().current('posts.index', [''])).toBe(false);
        expect(route().current('posts.index', [1])).toBe(false);
    });

    test('can return false when checking the current route name on an unknown route', () => {
        global.window.location.pathname = '/unknown/';

        expect(route().current('posts.delete')).toBe(false);
    });

    test('can return false when checking the current route name and params on an unknown URL', () => {
        global.window.location.pathname = '/unknown/path';

        expect(route().current('posts.show', { post: 2 })).toBe(false);
        expect(route().current('posts.show', 2)).toBe(false);
        expect(route().current('posts.show', [2])).toBe(false);
        expect(route().current('posts.show', 'post')).toBe(false);
    });

    test('can return false when checking a non-existent route name on a known URL', () => {
        global.window.location.pathname = '/events/1/venues/2';

        expect(route().current('random-route')).toBe(false);
    });

    test('can return false when checking a non-existent route name on an unknown URL', () => {
        global.window.location.pathname = '/unknown/test';

        expect(route().current('random-route')).toBe(false);
    });

    test('can return false when checking a non-existent route name and params on a known URL', () => {
        global.window.location.pathname = '/events/1/venues/2';

        expect(route().current('random-route', { post: 2 })).toBe(false);
        expect(route().current('random-route', 2)).toBe(false);
        expect(route().current('random-route', [2])).toBe(false);
        expect(route().current('random-route', 'post')).toBe(false);
    });

    test('can return false when checking a non-existent route name and params on an unknown URL', () => {
        global.window.location.pathname = '/unknown/params';

        expect(route().current('random-route', { post: 2 })).toBe(false);
        expect(route().current('random-route', 2)).toBe(false);
        expect(route().current('random-route', [2])).toBe(false);
        expect(route().current('random-route', 'post')).toBe(false);
    });

    test('can check the current route name against a pattern', () => {
        global.window.location.pathname = '/events/1/venues/2';

        expect(route().current('events.venues.show')).toBe(true);
        expect(route().current('events.venues.*')).toBe(true);
        expect(route().current('events.*.show')).toBe(true);
        expect(route().current('*.venues.show')).toBe(true);
        expect(route().current('events.*')).toBe(true);

        expect(route().current('events.venues.index')).toBe(false);
        expect(route().current('events.users.*')).toBe(false);
        expect(route().current('*.users.show')).toBe(false);
        expect(route().current('events')).toBe(false);
        expect(route().current('show')).toBe(false);

        global.window.location.pathname = '/hosting-contacts';

        expect(route().current('hosting-contacts.index')).toBe(true);
        expect(route().current('*.index')).toBe(true);
        // https://github.com/tighten/ziggy/pull/296
        expect(route().current('hosting.*')).toBe(false);
    });

    test('can check the current route name on a route with filled optional parameters', () => {
        global.window.location.pathname = '/optional/1/foo';

        expect(route().current('optional')).toBe(true);
    });

    test('can check the current route name on a route with trailing empty optional parameters', () => {
        global.window.location.pathname = '/optional/1';

        expect(route().current('optional')).toBe(true);
    });

    test('can check the current route name on a route with optional parameters in the middle of the URI', () => {
        global.Ziggy.url = 'https://ziggy.dev/subfolder';

        // Missing the optional 'language' parameter (e.g. subfolder/ph/en/products...)
        global.window.location.href = 'https://ziggy.dev/subfolder/ph/products/4';
        global.window.location.host = 'ziggy.dev';
        global.window.location.pathname = '/subfolder/ph/products/4';

        expect(route().current('products.show')).toBe(true);
    });

    test('can check the current route with parameters', () => {
        global.window.location.pathname = '/events/1/venues/2';

        expect(route().current('events.venues.show', { event: 1, venue: 2 })).toBe(true);
        expect(route().current('events.venues.show', [1, 2])).toBe(true);
        expect(route().current('events.venues.show', [1, { id: 2, name: 'Grand Canyon' }])).toBe(
            true,
        );
        expect(route().current('events.venues.show', { event: 1 })).toBe(true);
        expect(route().current('events.venues.show', { venue: 2 })).toBe(true);
        expect(route().current('events.venues.show', [1])).toBe(true);
        expect(route().current('events.venues.show', {})).toBe(true);
        expect(route().current('events.venues.show', null)).toBe(true);

        expect(route().current('events.venues.show', { event: 4, venue: 2 })).toBe(false);
        expect(route().current('events.venues.show', { event: null })).toBe(false);
        expect(route().current('events.venues.show', [1, 6])).toBe(false);
        expect(
            route().current('events.venues.show', [{ id: 1 }, { id: 4, name: 'Great Pyramids' }]),
        ).toBe(false);
        expect(route().current('events.venues.show', { event: 4 })).toBe(false);
        expect(route().current('events.venues.show', { venue: 4 })).toBe(false);
        expect(route().current('events.venues.show', [5])).toBe(false);
    });

    test('can check the current route with parameters with incorrect parameter names', () => {
        global.window.location.pathname = '/events/1/venues/2';

        expect(route().current('events.venues.show', { eventz: 2 })).toBe(false);
    });

    test('can check the current route with query parameters', () => {
        global.window.location.pathname = '/events/1/venues/2';
        global.window.location.search = '?user=Jacob&id=9';

        expect(
            route().current('events.venues.show', {
                event: 1,
                venue: 2,
                user: 'Jacob',
            }),
        ).toBe(true);
        expect(
            route().current('events.venues.show', {
                event: { id: 1, name: 'Party' },
                venue: 2,
                id: 9,
            }),
        ).toBe(true);
        expect(
            route().current('events.venues.show', {
                user: 'Jacob',
                venue: { id: 2 },
            }),
        ).toBe(true);

        expect(
            route().current('events.venues.show', {
                user: 'Matt',
                venue: { id: 9 },
            }),
        ).toBe(false);
        expect(
            route().current('events.venues.show', {
                event: 5,
                id: 9,
                user: 'Jacob',
            }),
        ).toBe(false);
        expect(route().current('events.venues.show', { id: 12, user: 'Matt' })).toBe(false);
    });

    test('can check the current route with array and object query parameters', () => {
        global.window.location.pathname = '/events/1/venues/2';
        global.window.location.search =
            '?filter[year]=2024&filter[month]=Jan&filter[month]=Feb&tags[0]=music&tags[1]=dance&genres[]=jazz&genres[]=folk';

        expect(
            route().current('events.venues.show', {
                filter: {
                    year: '2024',
                },
            }),
        ).toBe(true);
        // Weird, but technically correct since this isn't checking for an exact match, just 'overlap'
        expect(
            route().current('events.venues.show', {
                filter: {},
            }),
        ).toBe(true);
        // Even weirder, but probably better than getting really picky about empty arrays vs. empty objects
        expect(
            route().current('events.venues.show', {
                genres: {},
            }),
        ).toBe(true);
        expect(
            route().current('events.venues.show', {
                filter: {
                    year: '2024',
                    month: ['Jan'],
                },
                tags: ['dance', 'music'],
                genres: ['folk'],
            }),
        ).toBe(true);

        expect(
            route().current('events.venues.show', {
                filter: {
                    year: '2025',
                },
            }),
        ).toBe(false);
        expect(
            route().current('events.venues.show', {
                filter: {
                    year: null,
                },
            }),
        ).toBe(false);
        expect(
            route().current('events.venues.show', {
                filter: {
                    year: '2024',
                    month: ['Mar'],
                },
            }),
        ).toBe(false);
        expect(
            route().current('events.venues.show', {
                tags: [''],
            }),
        ).toBe(false);
        expect(
            route().current('events.venues.show', {
                genres: [null],
            }),
        ).toBe(false);
    });

    test('can check the current route with Cyrillic characters', () => {
        global.window.location.pathname = '/статистика';

        expect(route().current()).toBe('statistics');
        expect(route().current('statistics')).toBe(true);
    });

    test('can check the current route with encoded Cyrillic characters', () => {
        global.window.location.pathname =
            '/%D1%81%D1%82%D0%B0%D1%82%D0%B8%D1%81%D1%82%D0%B8%D0%BA%D0%B0';

        expect(route().current()).toBe('statistics');
        expect(route().current('statistics')).toBe(true);
    });

    test('can ignore routes that don’t allow GET requests', () => {
        global.window.location.pathname = '/posts/1';

        expect(route().current('posts.update')).toBe(false);
    });

    test('can ignore trailing slashes', () => {
        global.window.location.pathname = '/events/1/venues/';

        expect(route().current()).toBe('events.venues.index');
    });

    test('matches route name with multiple periods', () => {
        global.window.location.pathname = '/events/1/venues';

        expect(route().current('events.venues-index')).toBe(false);
        expect(route().current('events.venues.index')).toBe(true);

        global.window.location.pathname = '/events/1/venues-index';

        expect(route().current('events.venues-index')).toBe(true);
        expect(route().current('events.venues.index')).toBe(false);
    });

    test('matches route name with multiple periods and wildcards', () => {
        global.window.location.pathname = '/events/1/venues-index';

        expect(route().current('events.venues-index')).toBe(true);
        expect(route().current('events.venues.*')).toBe(false);
    });

    test.skip('can unresolve arbitrary urls to names and params', () => {
        const resolved = route().unresolve('https://ziggy.dev/events/1/venues?test=yes');
        expect(resolved).toStrictEqual({
            name: 'events.venues.index',
            params: { event: '1' },
            query: { test: 'yes' },
            route: resolved.route,
        });
        expect(resolved.route.uri).toBe('events/{event}/venues');

        expect(route().unresolve('ziggy.dev/events/1/venues-index').name).toBe(
            'events.venues-index',
        );
        expect(route().unresolve('/events/1/venues-index').name).toBe('events.venues-index');
    });

    test('can get the current route name without window', () => {
        global.Ziggy = undefined;
        const oldWindow = global.window;
        delete global.window;

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

        expect(route(undefined, undefined, undefined, config).current()).toBe('events.venues.show');

        global.window = oldWindow;
    });
});

import assert, { equal, strictEqual } from 'assert';
import route from '../../src/js/route.js';

const defaultWindow = {
    location: {
        hostname: 'ziggy.dev',
    },
};

const defaultZiggy = {
    baseUrl: 'https://ziggy.dev',
    baseProtocol: 'https',
    baseDomain: 'ziggy.dev',
    basePort: null,
    defaultParameters: { locale: 'en' },
    namedRoutes: {
        'home': {
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
        },
        'posts.update': {
            uri: 'posts/{post}',
            methods: ['PUT'],
        },
        'postComments.show': {
            uri: 'posts/{post}/comments/{comment}',
            methods: ['GET', 'HEAD'],
            bindings: {
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
        'events.venues.index': {
            uri: 'events/{event}/venues',
            methods: ['GET', 'HEAD'],
        },
        'events.venues.show': {
            uri: 'events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
        },
        'translateEvents.venues.show': {
            uri: '{locale}/events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
        },
        'conversations.show': {
            uri: 'subscribers/{subscriber}/conversations/{type}/{conversation_id?}',
            methods: ['GET', 'HEAD'],
        },
        'optional': {
            uri: 'optional/{id}/{slug?}',
            methods: ['GET', 'HEAD'],
        },
        'optionalId': {
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
    },
};

global.window = { ...defaultWindow };
global.Ziggy = { ...defaultZiggy };

beforeAll(() => {
    delete window.location;
    window.location = {};
});

describe('string', () => {
    test('Router class is a string', () => {
        strictEqual(route('posts.index') + '', 'https://ziggy.dev/posts');
        strictEqual(String(route('posts.index')), 'https://ziggy.dev/posts');
        strictEqual(route('posts.index').toString(), 'https://ziggy.dev/posts');
    })
});

describe('route()', () => {
    test('generate a URL with no parameters', () => {
        equal(route('posts.index').url(), 'https://ziggy.dev/posts');
    });

    test('generate a URL with default parameters', () => {
        equal(route('translatePosts.index').url(), 'https://ziggy.dev/en/posts');
    });

    test('generate a string URL using .url()', () => {
        equal(route('posts.index').url(), 'https://ziggy.dev/posts');
    });

    test('pass parameters using .with()', () => {
        assert.deepEqual(route('posts.show', [1]), route('posts.show').with([1]));
        equal(route('posts.show', [1]).url(), route('posts.show').with([1]).url());

        assert.deepEqual(route('events.venues.show', { event: 1, venue: 2 }), route('events.venues.show').with({ event: 1, venue: 2 }));
        equal(route('events.venues.show', { event: 1, venue: 2 }).url(), route('events.venues.show').with({ event: 1, venue: 2 }).url());
    });

    test('generate a relative URL by passing absolute = false', () => {
        equal(route('posts.index', [], false).url(), '/posts');
    });

    test('generate a URL with provided optional parameters', () => {
        equal(
            route('conversations.show', {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234,
            }).url(),
            'https://ziggy.dev/subscribers/123/conversations/email/1234'
        );
    });

    test('generate a relative URL with provided optional parameters', () => {
        equal(
            route('conversations.show', {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234,
            }, false).url(),
            '/subscribers/123/conversations/email/1234'
        );
    });

    test('generate a relative URL with default parameters', () => {
        equal(route('translatePosts.index', [], false).url(), '/en/posts');
    });

    test('error if a required parameter is not provided', () => {
        assert.throws(() => route('posts.show').url(), { message: /'post' key is required/ });
    });

    test('error if a required parameter is not provided to a route with default parameters', () => {
        assert.throws(() => route('translatePosts.show').url(), { message: /'id' key is required/ });
    });

    test('error if a required parameter with a default has no default value', () => {
        global.Ziggy.defaultParameters = {};

        assert.throws(
            () => route('translatePosts.index').url(),
            { message: /'locale' key is required/ }
        );

        global.Ziggy = { ...defaultZiggy };
    });

    test('generate a URL using an integer for a route with required parameters', () => {
        equal(route('posts.show', 1).url(), 'https://ziggy.dev/posts/1');
    });

    test('generate a URL using an integer for a route with required and default parameters', () => {
        equal(route('translatePosts.show', 1).url(), 'https://ziggy.dev/en/posts/1');
    });

    test('generate a URL using an object for a route with required parameters', () => {
        equal(route('posts.show', { id: 1 }).url(), 'https://ziggy.dev/posts/1');
        equal(route('events.venues.show', { event: 1, venue: 2 }).url(), 'https://ziggy.dev/events/1/venues/2');
    });

    test('generate a URL using an object for a route with optional parameters', () => {
        equal(route('optionalId', { type: 'model', id: 1 }).url(), 'https://ziggy.dev/optionalId/model/1');
    });

    test('generate a URL using a single parameter array for a route with required parameters', () => {
        equal(route('posts.show', [1]).url(), 'https://ziggy.dev/posts/1');
    });

    test('generate a URL using a single parameter array for a route with required and default parameters', () => {
        equal(route('translatePosts.show', [1]).url(), 'https://ziggy.dev/en/posts/1');
    });

    test('generate a URL using an object for a route with required and default parameters', () => {
        equal(route('translateEvents.venues.show', { event: 1, venue: 2 }).url(), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('generate a URL using an array for a route with required parameters', () => {
        equal(route('events.venues.show', [1, 2]).url(),'https://ziggy.dev/events/1/venues/2');
    });

    test('generate a URL using an array for a route with required and default parameters', () => {
        equal(route('translateEvents.venues.show', [1, 2]).url(), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('generate a URL using an array of objects for a route with required parameters', () => {
        let event = { id: 1, name: 'World Series' };
        let venue = { id: 2, name: 'Rogers Centre' };

        equal(route('events.venues.show', [event, venue]).url(), 'https://ziggy.dev/events/1/venues/2');
    });

    test('generate a URL using an array of objects for a route with required and default parameters', () => {
        let event = { id: 1, name: 'World Series' };
        let venue = { id: 2, name: 'Rogers Centre' };

        equal(route('translateEvents.venues.show', [event, venue]).url(), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('generate a URL using a mixed array of objects and scalar parameters for a route with required parameters', () => {
        let venue = { id: 2, name: 'Rogers Centre' };

        equal(route('events.venues.show', [1, venue]).url(), 'https://ziggy.dev/events/1/venues/2');
    });

    test('generate a URL using a mixed array of objects and scalar parameters for a route with required and default parameters', () => {
        let venue = { id: 2, name: 'Rogers Centre' };

        equal(route('translateEvents.venues.show', [1, venue]).url(), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('generate a URL for a route with required domain parameters', () => {
        equal(route('team.user.show', { team: 'tighten', id: 1 }).url(), 'https://tighten.ziggy.dev/users/1');
    });

    test('generate a URL for a route with required domain parameters and default parameters', () => {
        equal(route('translateTeam.user.show', { team: 'tighten', id: 1 }).url(), 'https://tighten.ziggy.dev/en/users/1');
    });

    test('generate a URL for a route with a custom route model binding scope', () => {
        equal(
            route('postComments.show', [
                { id: 1, title: 'Post' },
                { uuid: 12345, title: 'Comment' }
            ]).url(),
            'https://ziggy.dev/posts/1/comments/12345'
        );

        equal(
            route('postComments.show', [
                { id: 1, post: 'Post' },
                { uuid: 12345, comment: 'Comment' }
            ]).url(),
            'https://ziggy.dev/posts/1/comments/12345'
        );
    });

    test('return base URL if path is "/"', () => {
        equal(route('home').url(), 'https://ziggy.dev/');
    });

    // @todo duplicate
    test('skip an optional parameter', () => {
        equal(route('optional', { id: 123 }).url(), 'https://ziggy.dev/optional/123');
    });

    test('skip an optional parameter explicitly set to `null`', () => {
        equal(route('optional', { id: 123, slug: null }).url(), 'https://ziggy.dev/optional/123');
    });

    // @todo why?
    test('accept an optional parameter', () => {
        equal(route('optional', { id: 123, slug: 'news' }).url(), 'https://ziggy.dev/optional/123/news');
    });

    test('error if a route name doesn’t exist', () => {
        assert.throws(() => route('unknown-route').url(), { message: /route 'unknown-route' is not found in the route list/ });
    });

    // @todo duplicate
    test('accept query string parameters as keyed values in a parameters object', () => {
        equal(
             route('events.venues.show', {
                event: 1,
                venue: 2,
                search: 'rogers',
                page: 2
            }).url(),
            'https://ziggy.dev/events/1/venues/2?search=rogers&page=2'
        );

        equal(
            route('events.venues.show', {
                id: 2,
                event: 1,
                venue: 2,
                search: 'rogers',
            }).url(),
            'https://ziggy.dev/events/1/venues/2?id=2&search=rogers'
        );
    });

    test('accept query string parameters as keyed values using .withQuery()', () => {
        equal(
            route('events.venues.show', [1, 2]).withQuery({
                search: 'rogers',
                page: 2,
                id: 20,
            }).url(),
            'https://ziggy.dev/events/1/venues/2?search=rogers&page=2&id=20'
        );
    });

    test('generate a URL with a port for a route without parameters', () => {
        global.Ziggy.baseUrl = 'https://ziggy.dev:81/';
        global.Ziggy.baseDomain = 'ziggy.dev';
        global.Ziggy.basePort = 81;

        equal(route('posts.index').url(), 'https://ziggy.dev:81/posts');

        global.Ziggy = { ...defaultZiggy };
    });

    test('generate a URL with a port for a route with required domain parameters', () => {
        global.Ziggy.baseUrl = 'https://ziggy.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort = 81;

        equal(route('team.user.show', { team: 'tighten', id: 1 }).url(), 'https://tighten.ziggy.dev:81/users/1');

        global.Ziggy = { ...defaultZiggy };
    });

    test('handle trailing path segments in the base URL', () => {
        global.Ziggy.baseUrl = 'https://test.thing/ab/cd/';

        equal(route('events.venues.index', 1).url(), 'https://test.thing/ab/cd/events/1/venues');

        global.Ziggy = { ...defaultZiggy };
    });

    test('URL-encode named parameters', () => {
        global.Ziggy.baseUrl = 'https://test.thing/ab/cd/';

        equal(route('events.venues.index', { event: 'Fun&Games' }).url(), 'https://test.thing/ab/cd/events/Fun%26Games/venues');
        equal(
            route('events.venues.index', {
                event: 'Fun&Games',
                location: 'Brews&Clues',
            }).url(),
            'https://test.thing/ab/cd/events/Fun%26Games/venues?location=Brews%26Clues'
        );

        global.Ziggy = { ...defaultZiggy };
    });

    test('accept and format an array as a query parameter', () => {
        equal(
            route('events.venues.index', {
                event: 'test',
                guests: ['a', 'b', 'c'],
            }).url(),
            'https://ziggy.dev/events/test/venues?guests[0]=a&guests[1]=b&guests[2]=c'
        );
    });

    test('ignore query parameters explicitly set to `null`', () => {
        equal(route('posts.index', { filled: 'filling', empty: null }).url(), 'https://ziggy.dev/posts?filled=filling');
    });

    test('don’t ignore a parameter explicity set to `0`', () => {
        equal(route('posts.update', 0).url(), 'https://ziggy.dev/posts/0');
    });

    test('accept a custom Ziggy configuration object', () => {
        const customZiggy = {
            baseUrl: 'http://notYourAverage.dev/',
            baseProtocol: 'http',
            baseDomain: 'notYourAverage.dev',
            basePort: false,
            defaultParameters: { locale: 'en' },
            namedRoutes: {
                'tightenDev.packages.index': {
                    uri: 'tightenDev/{dev}/packages',
                    methods: ['GET', 'HEAD'],
                },
            },
        };

        equal(
            route('tightenDev.packages.index', { dev: 1 }, true, customZiggy).url(),
            'http://notYourAverage.dev/tightenDev/1/packages'
        );
    });

    test('remove braces and question marks from route parameter definitions', () => {
        equal(route().trimParam('optional'), 'optional');
        equal(route().trimParam('{id}'), 'id');
        equal(route().trimParam('{id?}'), 'id');
        equal(route().trimParam('{slug?}'), 'slug');
    });

    test('extract named parameters from a URL using a template and delimiter', () => {
        assert.deepEqual(route().extractParams('', '', '/'), {});
        assert.deepEqual(route().extractParams('posts', 'posts', '/'), {});

        assert.deepEqual(route().extractParams('users/1', 'users/{id}', '/'), { id: '1' });
        assert.deepEqual(
            route().extractParams('events/1/venues/2', 'events/{event}/venues/{venue}', '/'),
            { event: '1', venue: '2' }
        );
        assert.deepEqual(
            route().extractParams('optional/123', 'optional/{id}/{slug?}', '/'),
            { id: '123' }
        );
        assert.deepEqual(
            route().extractParams('optional/123/news', 'optional/{id}/{slug?}', '/'),
            { id: '123', slug: 'news' }
        );

        assert.deepEqual(
            route().extractParams('tighten.myapp.dev', '{team}.myapp.dev', '.'),
            { team: 'tighten' }
        );
    });

    test('generate URL for an app installed in a subfolder', () => {
        global.Ziggy.baseUrl = 'https://ziggy.dev/subfolder/';

        global.window.location.href = 'https://ziggy.dev/subfolder/ph/en/products/4';
        global.window.location.hostname = 'ziggy.dev';
        global.window.location.pathname = '/subfolder/ph/en/products/4';

        assert.deepEqual(route().params, { country: 'ph', language: 'en', id: '4' });

        global.window = { ...defaultWindow };
        global.Ziggy = { ...defaultZiggy };
    });

    // @todo why?
    test('merge named parameters extracted from the domain and the URL', () => {
        global.window.location.href = 'https://tighten.ziggy.dev/users/1';
        global.window.location.hostname = 'tighten.ziggy.dev';
        global.window.location.pathname = '/users/1';

        assert.deepEqual(route().params, { team: 'tighten', id: '1' });

        global.window.location.href = `https://${global.Ziggy.baseDomain}/posts/1`;
        global.window.location.hostname = global.Ziggy.baseDomain;
        global.window.location.pathname = '/posts/1';

        assert.deepEqual(route().params, { post: '1' });

        global.window.location.href = 'https://ziggy.dev/events/1/venues/2';
        global.window.location.pathname = '/events/1/venues/2';

        assert.deepEqual(route().params, { event: '1', venue: '2' });

        global.window = { ...defaultWindow };
    });

    test('can append extra parameter object entries as query parameters', () => {
        equal(
            route('translatePosts.index', { someOtherKey: 123 }),
            'https://ziggy.dev/en/posts?someOtherKey=123'
        );
    });
});

describe('check', () => {
    test('can check if given named route exists', () => {
        assert(route().check('posts.show'));
        assert(!route().check('non.existing.route'));
    });
});

describe('current', () => {
    afterEach(() => {
        global.Ziggy = { ...defaultZiggy };
        global.window = { ...defaultWindow };
        window = { ...defaultWindow };
    });

    test('can get the current route name', () => {
        global.window.location.pathname = '/events/1/venues/2';

        equal(route().current(), 'events.venues.show');
    });

    test('can get the current route name on a route with multiple allowed HTTP methods', () => {
        global.window.location.pathname = '/posts/1';

        equal(route().current(), 'posts.show');
    });

    test('can get the current route name with a missing protocol', () => {
        global.window.location.pathname = '/events/1/venues/';
        global.window.location.protocol = '';

        equal(route().current(), 'events.venues.index');
    });

    test('can get the current route name with a custom Ziggy object', () => {
        global.Ziggy = undefined;
        global.window.location.pathname = '/events/';

        const customZiggy = {
            baseUrl: 'https://ziggy.dev/',
            baseProtocol: 'https',
            baseDomain: 'ziggy.dev',
            basePort: false,
            namedRoutes: {
                'events.index': {
                    uri: 'events',
                    methods: ['GET', 'HEAD'],
                }
            },
        };

        equal(route(undefined, undefined, undefined, customZiggy).current(), 'events.index');
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
        // https://github.com/tightenco/ziggy/pull/296
        assert(!route().current('hosting.*'));
    });

    test('can check the current route name on a route with filled optional parameters', () => {
        global.window.location.pathname = '/optional/1/foo';

        assert(route().current('optional'));
    });

    test('can check the current route name on a route with empty optional parameters', () => {
        global.window.location.pathname = '/optional/1';

        assert(route().current('optional'));
    });

    test.todo('can check the current route name and parameters');
    // test.todo('can check the current route name and parameters', () => {
    //     global.window.location.pathname = '/events/1/venues/2';

    //     assert(route().current('events.venues.show', { event: 1, venue: 2 }));
    //     assert(!route().current('events.venues.show', { event: 4, venue: 2 }));
    //     assert(!route().current('events.venues.show', { event: 1, venue: 6 }));
    // });

    test('can ignore routes that dont allow GET requests', () => {
        global.window.location.pathname = '/posts/1';

        assert(!route().current('posts.update'));
    });

    test('can ignore trailing slashes', () => {
        global.window.location.pathname = '/events/1/venues/';

        equal(route().current(), 'events.venues.index');
    });

    test.todo('can ignore query parameters');
    // test('can ignore query parameters', () => {
    //     global.window.location.pathname = '/events/1/venues?foo=2';

    //     equal(route().current(), 'events.venues.index');
    // });
});

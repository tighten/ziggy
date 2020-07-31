import assert, { deepEqual, equal, strictEqual } from 'assert';
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

beforeAll(() => {
    delete window.location;
    window.location = {};
});

beforeEach(() => {
    window.location = { ...defaultWindow.location };
    global.window.location = { ...defaultWindow.location };
    global.Ziggy = { ...defaultZiggy };
});

describe('string', () => {
    test('Router class is a string', () => {
        strictEqual(route('posts.index') + '', 'https://ziggy.dev/posts');
        strictEqual(String(route('posts.index')), 'https://ziggy.dev/posts');
        strictEqual(route('posts.index').toString(), 'https://ziggy.dev/posts');
    });
});

describe('route()', () => {
    test('can generate a URL with no parameters', () => {
        equal(route('posts.index'), 'https://ziggy.dev/posts');
    });

    test('can generate a URL with default parameters', () => {
        equal(route('translatePosts.index'), 'https://ziggy.dev/en/posts');
    });

    test('can pass parameters with .with()', () => {
        deepEqual(route('posts.show', [1]), route('posts.show').with([1]));
        equal(route('posts.show', [1]), route('posts.show').with([1]).url());

        deepEqual(
            route('events.venues.show', { event: 1, venue: 2 }),
            route('events.venues.show').with({ event: 1, venue: 2 })
        );
        equal(
            route('events.venues.show', { event: 1, venue: 2 }).url(),
            route('events.venues.show').with({ event: 1, venue: 2 }).url()
        );
    });

    test('can generate a relative URL by passing absolute = false', () => {
        equal(route('posts.index', [], false), '/posts');
    });

    test('can generate a URL with filled optional parameters', () => {
        equal(
            route('conversations.show', {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234,
            }),
            'https://ziggy.dev/subscribers/123/conversations/email/1234'
        );
    });

    test('can generate a relative URL with filled optional parameters', () => {
        equal(
            route('conversations.show', {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234,
            }, false),
            '/subscribers/123/conversations/email/1234'
        );
    });

    test('can generate a relative URL with default parameters', () => {
        equal(route('translatePosts.index', [], false), '/en/posts');
    });

    test('can error if a required parameter is not provided', () => {
        assert.throws(() => route('posts.show').url(), /'post' key is required/);
    });

    test('can error if a required parameter is not provided to a route with default parameters', () => {
        assert.throws(() => route('translatePosts.show').url(), /'id' key is required/);
    });

    test('can error if a required parameter with a default has no default value', () => {
        global.Ziggy.defaultParameters = {};

        assert.throws(
            () => route('translatePosts.index').url(),
            /'locale' key is required/
        );
    });

    test('can generate a URL using an integer', () => {
        // route with required parameters
        equal(route('posts.show', 1), 'https://ziggy.dev/posts/1');
        // route with optional parameters
        equal(route('translatePosts.show', 1), 'https://ziggy.dev/en/posts/1');
    });

    test('can generate a URL using an object', () => {
        // routes with required parameters
        equal(route('posts.show', { id: 1 }), 'https://ziggy.dev/posts/1');
        equal(route('events.venues.show', { event: 1, venue: 2 }), 'https://ziggy.dev/events/1/venues/2');
        // route with optional parameters
        equal(route('optionalId', { type: 'model', id: 1 }), 'https://ziggy.dev/optionalId/model/1');
        // route with both required and optional parameters
        equal(route('translateEvents.venues.show', { event: 1, venue: 2 }), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('can generate a URL using an array', () => {
        // routes with required parameters
        equal(route('posts.show', [1]), 'https://ziggy.dev/posts/1');
        equal(route('events.venues.show', [1, 2]), 'https://ziggy.dev/events/1/venues/2');
        // route with optional parameters
        equal(route('translatePosts.show', [1]), 'https://ziggy.dev/en/posts/1');
        // route with both required and optional parameters
        equal(route('translateEvents.venues.show', [1, 2]), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('can generate a URL using an array of objects', () => {
        let event = { id: 1, name: 'World Series' };
        let venue = { id: 2, name: 'Rogers Centre' };

        // route with required parameters
        equal(route('events.venues.show', [event, venue]), 'https://ziggy.dev/events/1/venues/2');
        // route with required and default parameters
        equal(route('translateEvents.venues.show', [event, venue]), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('can generate a URL using an array of integers and objects', () => {
        let venue = { id: 2, name: 'Rogers Centre' };

        // route with required parameters
        equal(route('events.venues.show', [1, venue]), 'https://ziggy.dev/events/1/venues/2');
        // route with required and default parameters
        equal(route('translateEvents.venues.show', [1, venue]), 'https://ziggy.dev/en/events/1/venues/2');
    });

    test('can generate a URL for a route with domain parameters', () => {
        // route with required domain parameters
        equal(route('team.user.show', { team: 'tighten', id: 1 }), 'https://tighten.ziggy.dev/users/1');
        // route with required domain parameters and default parameters
        equal(route('translateTeam.user.show', { team: 'tighten', id: 1 }), 'https://tighten.ziggy.dev/en/users/1');
    });

    test('can generate a URL for a route with a custom route model binding scope', () => {
        equal(
            route('postComments.show', [
                { id: 1, title: 'Post' },
                { uuid: 12345, title: 'Comment' },
            ]),
            'https://ziggy.dev/posts/1/comments/12345'
        );
    });

    test('can return base URL if path is "/"', () => {
        equal(route('home'), 'https://ziggy.dev/');
    });

    // @todo duplicate
    test('can ignore an optional parameter', () => {
        equal(route('optional', { id: 123 }), 'https://ziggy.dev/optional/123');
        equal(route('optional', { id: 123, slug: 'news' }), 'https://ziggy.dev/optional/123/news');
        equal(route('optional', { id: 123, slug: null }), 'https://ziggy.dev/optional/123');
    });

    test('can error if a route name doesn’t exist', () => {
        assert.throws(() => route('unknown-route').url(), /route 'unknown-route' is not found in the route list/);
    });

    test('can append values as a query string with .withQuery', () => {
        equal(
            route('events.venues.show', [1, 2]).withQuery({
                search: 'rogers',
                page: 2,
                id: 20,
            }),
            'https://ziggy.dev/events/1/venues/2?search=rogers&page=2&id=20'
        );
    });

    test('can automatically append extra parameter values as a query string', () => {
        equal(
            route('events.venues.show', {
                event: 1,
                venue: 2,
                search: 'rogers',
                page: 2,
            }),
            'https://ziggy.dev/events/1/venues/2?search=rogers&page=2'
        );
        equal(
            route('events.venues.show', {
                id: 2,
                event: 1,
                venue: 2,
                search: 'rogers',
            }),
            'https://ziggy.dev/events/1/venues/2?id=2&search=rogers'
        );
        // ignore values explicitly set to `null`
        equal(route('posts.index', { filled: 'filling', empty: null }), 'https://ziggy.dev/posts?filled=filling');
    });

    test('can generate a URL with a port', () => {
        global.Ziggy.baseUrl = 'https://ziggy.dev:81/';
        global.Ziggy.baseDomain = 'ziggy.dev';
        global.Ziggy.basePort = 81;

        // route with no parameters
        equal(route('posts.index'), 'https://ziggy.dev:81/posts');
        // route with required domain parameters
        equal(route('team.user.show', { team: 'tighten', id: 1 }), 'https://tighten.ziggy.dev:81/users/1');
    });

    test('can handle trailing path segments in the base URL', () => {
        global.Ziggy.baseUrl = 'https://test.thing/ab/cd/';

        equal(route('events.venues.index', 1), 'https://test.thing/ab/cd/events/1/venues');
    });

    test('can URL-encode named parameters', () => {
        global.Ziggy.baseUrl = 'https://test.thing/ab/cd/';

        equal(
            route('events.venues.index', { event: 'Fun&Games' }),
            'https://test.thing/ab/cd/events/Fun%26Games/venues'
        );
        equal(
            route('events.venues.index', {
                event: 'Fun&Games',
                location: 'Blues&Clues',
            }),
            'https://test.thing/ab/cd/events/Fun%26Games/venues?location=Blues%26Clues'
        );
    });

    test('can format an array of query parameters', () => {
        equal(
            route('events.venues.index', {
                event: 'test',
                guests: ['a', 'b', 'c'],
            }),
            'https://ziggy.dev/events/test/venues?guests[0]=a&guests[1]=b&guests[2]=c'
        );
    });

    test('can handle a parameter explicity set to `0`', () => {
        equal(route('posts.update', 0), 'https://ziggy.dev/posts/0');
    });

    test('can accept a custom Ziggy configuration object', () => {
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
            route('tightenDev.packages.index', { dev: 1 }, true, customZiggy),
            'http://notYourAverage.dev/tightenDev/1/packages'
        );
    });

    test('can remove braces and question marks from route parameter definitions', () => {
        equal(route().trimParam('optional'), 'optional');
        equal(route().trimParam('{id}'), 'id');
        equal(route().trimParam('{id?}'), 'id');
        equal(route().trimParam('{slug?}'), 'slug');
    });

    test('can extract named parameters from a URL using a template and delimiter', () => {
        deepEqual(route().extractParams('', '', '/'), {});
        deepEqual(route().extractParams('posts', 'posts', '/'), {});

        deepEqual(route().extractParams('users/1', 'users/{id}', '/'), { id: '1' });
        deepEqual(
            route().extractParams('events/1/venues/2', 'events/{event}/venues/{venue}', '/'),
            { event: '1', venue: '2' }
        );
        deepEqual(
            route().extractParams('optional/123', 'optional/{id}/{slug?}', '/'),
            { id: '123' }
        );
        deepEqual(
            route().extractParams('optional/123/news', 'optional/{id}/{slug?}', '/'),
            { id: '123', slug: 'news' }
        );

        deepEqual(
            route().extractParams('tighten.myapp.dev', '{team}.myapp.dev', '.'),
            { team: 'tighten' }
        );
    });

    test('can generate URL for an app installed in a subfolder', () => {
        global.Ziggy.baseUrl = 'https://ziggy.dev/subfolder/';

        global.window.location.href = 'https://ziggy.dev/subfolder/ph/en/products/4';
        global.window.location.hostname = 'ziggy.dev';
        global.window.location.pathname = '/subfolder/ph/en/products/4';

        deepEqual(route().params, { country: 'ph', language: 'en', id: '4' });
    });

    test('can extract named parameters from the current URL', () => {
        global.window.location.href = 'https://ziggy.dev/posts/1';
        global.window.location.hostname = 'ziggy.dev';
        global.window.location.pathname = '/posts/1';

        deepEqual(route().params, { post: '1' });

        global.window.location.href = 'https://ziggy.dev/events/1/venues/2';
        global.window.location.pathname = '/events/1/venues/2';

        deepEqual(route().params, { event: '1', venue: '2' });
    });

    test('can extract domain parameters from the current URL', () => {
        global.window.location.href = 'https://tighten.ziggy.dev/users/1';
        global.window.location.hostname = 'tighten.ziggy.dev';
        global.window.location.pathname = '/users/1';

        deepEqual(route().params, { team: 'tighten', id: '1' });
    });
});

describe('check', () => {
    test('can check if given named route exists', () => {
        assert(route().check('posts.show'));
        assert(!route().check('non.existing.route'));
    });
});

describe('current', () => {
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
                },
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

import assert from 'assert';
import test from 'ava';
import route from '../../src/js/route.js';

// global.Ziggy = {
//     namedRoutes: {
//         'translateTeam.user.show': {
//             uri: '{locale}/users/{id}',
//             methods: ['GET', 'HEAD'],
//             domain: '{team}.myapp.dev'
//         },
//         'translateEvents.venues.show': {
//             uri: '{locale}/events/{event}/venues/{venue}',
//             methods: ['GET', 'HEAD'],
//         },
//         'translatePosts.show': {
//             uri: '{locale}/posts/{id}',
//             methods: ['GET', 'HEAD'],
//         },
//         home: {
//             uri: '/',
//             methods: ['GET', 'HEAD'],
//         },
//         'team.user.show': {
//             uri: 'users/{id}',
//             methods: ['GET', 'HEAD'],
//             domain: '{team}.myapp.dev'
//         },
//         'posts.store': {
//             uri: 'posts',
//             methods: ['POST'],
//         },
//         'posts.destroy': {
//             uri: 'posts/{id}',
//             methods: ['DELETE'],
//         },
//         withOptionalFilter: {
//             uri: 'stuff/{filter?}',
//             methods: ['GET', 'HEAD'],
//         },
//         optionalId: {
//             uri: 'optionalId/{type}/{id?}',
//             methods: ['GET', 'HEAD'],
//         },
//     },
// };

test.before(t => t.context.globalZiggy = { ...global.Ziggy });

test('generate a URL with no parameters', t => {
    t.is(route('posts.index').url(), 'https://ziggy.dev/posts');
});

test('generate a URL with default parameters', t => {
    t.is(route('translatePosts.index').url(), 'https://ziggy.dev/en/posts');
});

test('generate a string URL using .url()', t => {
    t.is(route('posts.index').url(), 'https://ziggy.dev/posts');
});

test('generate a relative URL by passing absolute = false', t => {
    t.is(route('posts.index', [], false).url(), '/posts');
});

test('generate a URL with provided optional parameters', t => {
    t.is(
        route('conversations.show', {
            type: 'email',
            subscriber: 123,
            conversation_id: 1234,
        }).url(),
        'https://ziggy.dev/subscribers/123/conversations/email/1234'
    );
});

test('generate a relative URL with provided optional parameters', t => {
    t.is(
        route('conversations.show', {
            type: 'email',
            subscriber: 123,
            conversation_id: 1234,
        }, false).url(),
        '/subscribers/123/conversations/email/1234'
    );
});

test('generate a relative URL with default parameters', t => {
    t.is(route('translatePosts.index', [], false).url(), '/en/posts');
});

test('error if a required parameter is not provided', t => {
    t.throws(() => route('posts.show').url(), { message: /'post' key is required/ });
});

test('error if a required parameter is not provided to a route with default parameters', t => {
    t.throws(() => route('translatePosts.show').url(), { message: /'id' key is required/ });
});

test('error if a required parameter with a default has no default value', t => {
    global.Ziggy.defaultParameters = {};

    t.throws(
        () => route('translatePosts.index').url(),
        { message: /'locale' key is required/ }
    );

    global.Ziggy = t.context.globalZiggy;
});

test('generate a URL using an integer for a route with required parameters', t => {
    t.is(route('posts.show', 1).url(), 'https://ziggy.dev/posts/1');
    t.is(route('posts.show').with(1).url(), 'https://ziggy.dev/posts/1');
});

test('generate a URL using an integer for a route with required and default parameters', t => {
    t.is(route('translatePosts.show', 1).url(), 'https://ziggy.dev/en/posts/1');
    t.is(route('translatePosts.show').with(1).url(), 'https://ziggy.dev/en/posts/1');
});

test('generate a URL using an object for a route with required parameters', t => {
    t.is(route('posts.show', { id: 1 }).url(), 'https://ziggy.dev/posts/1');
    t.is(route('posts.show').with({ id: 1 }).url(), 'https://ziggy.dev/posts/1');
});

test('generate a URL using an object for a route with optional parameters', t => {
    t.is(
        route('optionalId', { type: 'model', id: 1 }).url(),
        'https://ziggy.dev/optionalId/model/1'
    );
});

test('generate a URL using an array of objects for a route with required parameters', t => {
    t.is(
        route('events.venues.show', [
            { id: 1, title: 'Event' },
            { id: 2, title: 'Venue' },
        ]).url(),
        'https://ziggy.dev/events/1/venues/2'
    );
});

test('generate a URL using an object for a route with required and default parameters', t => {
    t.is(route('translatePosts.show', { id: 1 }).url(), 'https://ziggy.dev/en/posts/1');
    t.is(route('translatePosts.show').with({ id: 1 }).url(), 'https://ziggy.dev/en/posts/1');
});

test('generate a URL using a single parameter array for a route with required parameters', t => {
    t.is(route('posts.show', [1]).url(), 'https://ziggy.dev/posts/1');
    t.is(route('posts.show').with([1]).url(), 'https://ziggy.dev/posts/1');
});

test('generate a URL using a single parameter array for a route with required and default parameters', t => {
    t.is(route('translatePosts.show', [1]).url(), 'https://ziggy.dev/en/posts/1');
    t.is(route('translatePosts.show').with([1]).url(), 'https://ziggy.dev/en/posts/1');
});
});

test('generate URL using single parameter array for route with required and default parameters', t => {
    assert.equal(
        route('translatePosts.show', [1]),
        'http://myapp.dev/en/posts/1'
    );
    assert.equal(
        route('translatePosts.show').with([1]),
        'http://myapp.dev/en/posts/1'
    );
});

test('generate URL using parameters object for route with required parameters', t => {
    assert.equal(
        route('events.venues.show', { event: 1, venue: 2 }),
        'http://myapp.dev/events/1/venues/2'
    );
    assert.equal(
        route('events.venues.show').with({ event: 1, venue: 2 }),
        'http://myapp.dev/events/1/venues/2'
    );
});

test('generate URL using parameters object for route with required and default parameters', t => {
    assert.equal(
        route('translateEvents.venues.show', { event: 1, venue: 2 }),
        'http://myapp.dev/en/events/1/venues/2'
    );
    assert.equal(
        route('translateEvents.venues.show').with({ event: 1, venue: 2 }),
        'http://myapp.dev/en/events/1/venues/2'
    );
});

test('generate URL using parameters array for route with required parameters', t => {
    assert.equal(
        route('events.venues.show', [1, 2]),
        'http://myapp.dev/events/1/venues/2'
    );
    assert.equal(
        route('events.venues.show').with([1, 2]),
        'http://myapp.dev/events/1/venues/2'
    );
});

test('generate URL using parameters array for route with required and default parameters', t => {
    assert.equal(
        route('translateEvents.venues.show', [1, 2]),
        'http://myapp.dev/en/events/1/venues/2'
    );
    assert.equal(
        route('translateEvents.venues.show').with([1, 2]),
        'http://myapp.dev/en/events/1/venues/2'
    );
});

test('generate URL using array of objects for route with required parameters', t => {
    let event = { id: 1, name: 'World Series' };
    let venue = { id: 2, name: 'Rogers Centre' };

    assert.equal(
        route('events.venues.show', [event, venue]),
        'http://myapp.dev/events/1/venues/2'
    );
    assert.equal(
        route('events.venues.show').with([event, venue]),
        'http://myapp.dev/events/1/venues/2'
    );
});

test('generate URL using array of objects for route with required and default parameters', t => {
    let event = { id: 1, name: 'World Series' };
    let venue = { id: 2, name: 'Rogers Centre' };

    assert.equal(
        route('translateEvents.venues.show', [event, venue]),
        'http://myapp.dev/en/events/1/venues/2'
    );
    assert.equal(
        route('translateEvents.venues.show').with([event, venue]),
        'http://myapp.dev/en/events/1/venues/2'
    );
});

test('generate URL using mixed array of objects and scalar parameters for route with required parameters', t => {
    let venue = { id: 2, name: 'Rogers Centre' };

    assert.equal(
        route('events.venues.show', [1, venue]),
        'http://myapp.dev/events/1/venues/2'
    );
    assert.equal(
        route('events.venues.show').with([1, venue]),
        'http://myapp.dev/events/1/venues/2'
    );
});

test('generate URL using mixed array of objects and scalar parameters for route with required and default parameters', t => {
    let venue = { id: 2, name: 'Rogers Centre' };

    assert.equal(
        route('translateEvents.venues.show', [1, venue]),
        'http://myapp.dev/en/events/1/venues/2'
    );
    assert.equal(
        route('translateEvents.venues.show').with([1, venue]),
        'http://myapp.dev/en/events/1/venues/2'
    );
});

test('generate URL for route with required domain parameters', t => {
    assert.equal(
        route('team.user.show', { team: 'tighten', id: 1 }),
        'http://tighten.myapp.dev/users/1'
    );
    assert.equal(
        route('team.user.show').with({ team: 'tighten', id: 1 }),
        'http://tighten.myapp.dev/users/1'
    );
});

test('generate URL including default parameters for route with required domain parameters', t => {
    assert.equal(
        route('translateTeam.user.show', { team: 'tighten', id: 1 }),
        'http://tighten.myapp.dev/en/users/1'
    );
    assert.equal(
        route('translateTeam.user.show').with({ team: 'tighten', id: 1 }),
        'http://tighten.myapp.dev/en/users/1'
    );
});

test('return base URL if path is "/"', t => {
    assert.equal(route('home'), 'http://myapp.dev/');
});

// @todo duplicate
test('skip optional parameter `slug`', t => {
    assert.equal(
        route('optional', { id: 123 }),
        'http://myapp.dev/optional/123'
    );
});

test('skip optional parameter `slug` explicitly set to `null`', t => {
    assert.equal(
        route('optional', { id: 123, slug: null }),
        'http://myapp.dev/optional/123'
    );
});

// @todo why?
test('accept optional parameter `slug`', t => {
    assert.equal(
        route('optional', { id: 123, slug: 'news' }),
        'http://myapp.dev/optional/123/news'
    );
});

test('error if route name doesn’t exist', t => {
    assert.throws(function() {
        route('unknown-route').toString();
    }, /route 'unknown-route' is not found in the route list/);
});

// @todo duplicate
test('accept query string parameters as keyed values in parameters object', t => {
    assert.equal(
        route('events.venues.show', {
            event: 1,
            venue: 2,
            search: 'rogers',
            page: 2
        }),
        'http://myapp.dev/events/1/venues/2?search=rogers&page=2'
    );
});

test('accept query string parameters as keyed values using .withQuery() method', t => {
    let router = route('events.venues.show', [1, 2]).withQuery({
        search: 'rogers',
        page: 2
    });
    assert.equal(
        router,
        'http://myapp.dev/events/1/venues/2?search=rogers&page=2'
    );
});

test('generate URL with port for route without parameters', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    assert.equal(route('posts.index'), 'http://myapp.dev:81/posts');

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

test('generate URL without port for route with required domain parameters', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    assert.equal(
        route('team.user.show', { team: 'tighten', id: 1 }),
        'http://tighten.myapp.dev:81/users/1'
    );
    assert.equal(
        route('team.user.show').with({ team: 'tighten', id: 1 }),
        'http://tighten.myapp.dev:81/users/1'
    );

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

test('handle trailing paths in base URL', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

    assert.equal(
        route('events.venues.index', 1),
        'http://test.thing/ab/cd/events/1/venues'
    );

    global.Ziggy.baseUrl = orgBaseUrl;
});

test('URL-encode named parameters', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

    assert.equal(
        route('events.venues.index', { event: 'Fun&Games' }).url(),
        'http://test.thing/ab/cd/events/Fun%26Games/venues'
    );

    global.Ziggy.baseUrl = orgBaseUrl;
});

test('accept and format array as query parameter', t => {
    assert.equal(
        route('events.venues.index', {
            event: 'test',
            guests: ['a', 'b', 'c']
        }),
        'http://myapp.dev/events/test/venues?guests[0]=a&guests[1]=b&guests[2]=c'
    );
});

// @todo combine with other URL-encoding test above
test('URL-encode query parameters', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

    assert.equal(
        route('events.venues.index', {
            event: 'Fun&Games',
            location: 'Brews&Clues'
        }).url(),
        'http://test.thing/ab/cd/events/Fun%26Games/venues?location=Brews%26Clues'
    );

    global.Ziggy.baseUrl = orgBaseUrl;
});

test('ignore query parameters explicitly set to `null`', t => {
    assert.equal(
        route('posts.index', { filled: 'filling', empty: null }).url(),
        'http://myapp.dev/posts?filled=filling'
    );
});

test('don’t ignore parameter explicity set to `0`', t => {
    assert.equal(
        route('posts.update', 0).url(),
        'http://myapp.dev/posts/0'
    );
});

test('get name of current route using .current() method with missing protocol', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    global.window = {
        location: {
            hostname: 'myapp.dev',
            pathname: '/events/1/venues/',
            port: '81',
            protocol: ''
        }
    };

    assert.equal(route().current(), 'events.venues.index');

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

test('accept custom Ziggy configuration object', t => {
    const customZiggy = {
        namedRoutes: {
            'tightenDev.packages.index': {
                uri: 'tightenDev/{dev}/packages',
                methods: ['GET', 'HEAD'],
                domain: null
            }
        },
        baseUrl: 'http://notYourAverage.dev/',
        baseProtocol: 'http',
        baseDomain: 'notYourAverage.dev',
        basePort: false,
        defaultParameters: {
            locale: 'en'
        }
    };

    assert.equal(
        route(
            'tightenDev.packages.index',
            { dev: 1 },
            true,
            customZiggy
        ).url(),
        'http://notYourAverage.dev/tightenDev/1/packages'
    );
});

test('get name of current route using .current() method with missing global Ziggy object', t => {
    const orgZiggy = global.Ziggy;

    global.Ziggy = undefined;

    global.window = {
        location: {
            hostname: 'myapp.dev',
            pathname: '/events/',
            protocol: ''
        }
    };

    const customZiggy = {
        namedRoutes: {
            'events.index': {
                uri: 'events',
                methods: ['GET', 'HEAD'],
                domain: null
            }
        },
        baseUrl: 'http://myapp.dev/',
        baseProtocol: 'http',
        baseDomain: 'myapp.dev',
        basePort: false
    };

    assert.equal(
        route(undefined, undefined, undefined, customZiggy).current(),
        'events.index'
    );

    global.Ziggy = orgZiggy;
});

test('remove braces and question marks from route parameter definition', t => {
    assert(route().trimParam('optional'), 'optional');

    assert(route().trimParam('{id}'), 'id');

    assert(route().trimParam('{slug?}'), 'slug');
});

test('extract named parameters from URL using given template and delimiter', t => {
    assert.deepStrictEqual(route().extractParams('', '', '/'), {});

    assert.deepStrictEqual(
        route().extractParams('posts', 'posts', '/'),
        {}
    );

    assert.deepStrictEqual(
        route().extractParams('users/1', 'users/{id}', '/'),
        { id: '1' }
    );

    assert.deepStrictEqual(
        route().extractParams(
            'events/1/venues/2',
            'events/{event}/venues/{venue}',
            '/'
        ),
        { event: '1', venue: '2' }
    );

    assert.deepStrictEqual(
        route().extractParams('optional/123', 'optional/{id}/{slug?}', '/'),
        { id: '123' }
    );

    assert.deepStrictEqual(
        route().extractParams(
            'optional/123/news',
            'optional/{id}/{slug?}',
            '/'
        ),
        { id: '123', slug: 'news' }
    );

    assert.deepStrictEqual(
        route().extractParams('tighten.myapp.dev', '{team}.myapp.dev', '.'),
        { team: 'tighten' }
    );
});

// @todo why?
test('merge named parameters extracted from domain and URL', t => {
    global.window.location.hostname = 'tighten.myapp.dev';
    global.window.location.pathname = '/users/1';

    assert.deepStrictEqual(route().params, { team: 'tighten', id: '1' });

    global.window.location.hostname = global.Ziggy.baseDomain;
    global.window.location.pathname = '/posts/1';

    assert.deepStrictEqual(route().params, { post: '1' });

    global.window.location.pathname = '/events/1/venues/2';

    assert.deepStrictEqual(route().params, { event: '1', venue: '2' });
});

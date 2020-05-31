import assert from 'assert';
import axios from 'axios';
import moxios from 'moxios';
import test from 'ava';

import route from '../../src/js/route.js';

global.Ziggy = {
    namedRoutes: {
        'translateTeam.user.show': {
            uri: '{locale}/users/{id}',
            methods: ['GET', 'HEAD'],
            domain: '{team}.myapp.dev'
        },
        'translateEvents.venues.show': {
            uri: '{locale}/events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        'translatePosts.index': {
            uri: '{locale}/posts',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        'translatePosts.show': {
            uri: '{locale}/posts/{id}',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        home: {
            uri: '/',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        'team.user.show': {
            uri: 'users/{id}',
            methods: ['GET', 'HEAD'],
            domain: '{team}.myapp.dev'
        },
        'posts.index': {
            uri: 'posts',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        'posts.update': {
            uri: 'posts/{post}',
            methods: ['PUT'],
            domain: null
        },
        'posts.show': {
            uri: 'posts/{post}',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        'posts.store': {
            uri: 'posts',
            methods: ['POST'],
            domain: null
        },
        'posts.destroy': {
            uri: 'posts/{id}',
            methods: ['DELETE'],
            domain: null
        },
        'events.venues.show': {
            uri: 'events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        'events.venues.index': {
            uri: 'events/{event}/venues',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        optional: {
            uri: 'optional/{id}/{slug?}',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        withOptionalFilter: {
            uri: 'stuff/{filter?}',
            methods: ['GET', 'HEAD'],
            domain: null
        },
        'conversations.show': {
            uri:
                'subscribers/{subscriber}/conversations/{type}/{conversation_id?}',
            methods: ['GET', 'HEAD'],
            domain: null
        },
    },
    baseUrl: 'http://myapp.dev/',
    baseProtocol: 'http',
    baseDomain: 'myapp.dev',
    basePort: false,
    defaultParameters: {
        locale: 'en'
    }
};

test('generate URL with no parameters', t => {
    assert.equal(route('posts.index'), 'http://myapp.dev/posts');
});

test('generate URL with default parameters', t => {
    assert.equal(
        route('translatePosts.index'),
        'http://myapp.dev/en/posts'
    );
});

test('generate URL using .url() method', t => {
    assert.equal(route('posts.index').url(), 'http://myapp.dev/posts');
});

test('generate URL with default parameters using .url() method', t => {
    assert.equal(
        route('translatePosts.index').url(),
        'http://myapp.dev/en/posts'
    );
});

test('generate relative URL by passing `false` to `absolute` argument', t => {
    assert.equal(route('posts.index', [], false), '/posts');
});

test('generate URL with provided optional parameters', t => {
    assert.equal(
        route('conversations.show', {
            type: 'email',
            subscriber: 123,
            conversation_id: 1234
        }),
        'http://myapp.dev/subscribers/123/conversations/email/1234'
    );
});

test('generate relative URL with provided optional parameters', t => {
    assert.equal(
        route(
            'conversations.show',
            {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234
            },
            false
        ),
        '/subscribers/123/conversations/email/1234'
    );
});

test('generate relative URL with default parameters', t => {
    assert.equal(route('translatePosts.index', [], false), '/en/posts');
});

test('append extra provided named parameters as query parameters', t => {
    assert.equal(
        route('translatePosts.index', { someOtherKey: 123 }),
        'http://myapp.dev/en/posts?someOtherKey=123'
    );
});

test('error if required parameters not provided', t => {
    assert.throws(function() {
        route('posts.show').toString();
    }, /'post' key is required/);
});

test('error if required parameters with defaults are missing default values', t => {
    let defaultParameters = Ziggy.defaultParameters;
    global.Ziggy.defaultParameters = [];
    assert.throws(function() {
        route('translatePosts.index').toString();
    }, /'locale' key is required/);
    global.Ziggy.defaultParameters = defaultParameters;
});

test('don’t use `Array.filter` as default value for parameter named "filter"', t => {
    let defaultParameters = global.Ziggy.defaultParameters;
    global.Ziggy.defaultParameters = [];
    assert.equal(
        route('withOptionalFilter'),
        'http://myapp.dev/stuff'
    );
    global.Ziggy.defaultParameters = defaultParameters;
});

test('error if required parameters not provided to route with default parameters', t => {
    assert.throws(function() {
        route('translatePosts.show').toString();
    }, /'id' key is required/);
});

test('generate URL using single scalar argument for route with required parameters', t => {
    assert.equal(route('posts.show', 1), 'http://myapp.dev/posts/1');
    assert.equal(route('posts.show').with(1), 'http://myapp.dev/posts/1');
});

test('generate URL using single scalar paremeter for route with required and default parameters', t => {
    assert.equal(
        route('translatePosts.show', 1),
        'http://myapp.dev/en/posts/1'
    );
    assert.equal(
        route('translatePosts.show').with(1),
        'http://myapp.dev/en/posts/1'
    );
});

test('generate URL using single parameter object for route with required parameters', t => {
    assert.equal(
        route('posts.show', { id: 1 }),
        'http://myapp.dev/posts/1'
    );
    assert.equal(
        route('posts.show').with({ id: 1 }),
        'http://myapp.dev/posts/1'
    );
});

test('generate URL using array of parameters objects for route with required parameters', t => {
    assert.equal(
        route('events.venues.show', [
            { id: 1, title: 'Event' },
            { id: 2, title: 'Venue' }
        ]),
        'http://myapp.dev/events/1/venues/2'
    );
});

test('generate URL using parameter object for route with required and default parameters', t => {
    assert.equal(
        route('translatePosts.show', { id: 1 }),
        'http://myapp.dev/en/posts/1'
    );
    assert.equal(
        route('translatePosts.show').with({ id: 1 }),
        'http://myapp.dev/en/posts/1'
    );
});

test('generate URL using single parameter array for route with required parameters', t => {
    assert.equal(route('posts.show', [1]), 'http://myapp.dev/posts/1');
    assert.equal(route('posts.show').with([1]), 'http://myapp.dev/posts/1');
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

test('make axios call when route(...) passed as target', t => {
    moxios.install();

    moxios.stubRequest('http://myapp.dev/posts/1', {
        status: 200,
        responseText: 'Worked!'
    });

    axios
        .get(route('posts.show', 1))
        .then(function(response) {
            assert.equal(response.status, 200);
        })
        .catch(function(error) {
            throw error;
        });

    moxios.uninstall();
});

test('make axios call when route(...) with parameters passed as target', t => {
    moxios.install();

    moxios.stubRequest('http://myapp.dev/posts/1', {
        status: 200,
        responseText: 'Worked!'
    });

    axios
        .get(route('posts.index'), {
            page: 2,
            params: { thing: 'thing' }
        })
        .then(function(response) {
            assert.equal(response.status, 200);
        })
        .catch(function(error) {
            throw error;
        });

    moxios.uninstall();
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
        'http://tighten.myapp.dev/users/1'
    );
    assert.equal(
        route('team.user.show').with({ team: 'tighten', id: 1 }),
        'http://tighten.myapp.dev/users/1'
    );

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

// @todo should be 2 tests, one for getting and one for checking
test('get name of current route using .current() method / check if name of current route matches pattern using .current() method', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    global.window = {
        location: {
            hostname: 'myapp.dev',
            pathname: '/events/1/venues/2',
            port: '81',
            protocol: 'http:'
        }
    };

    t.is(route().current(), 'events.venues.show');

    t.true(route().current('events.venues.show'));
    t.true(route().current('events.venues.*'));
    t.true(route().current('events.*.show'));
    t.true(route().current('*.venues.show'));
    t.true(route().current('events.*'));

    t.false(route().current('events.venues.index'));
    t.false(route().current('events.users.*'));
    t.false(route().current('*.users.show'));
    t.false(route().current('events'));
    t.false(route().current('show'));

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

test('get name of current route using .current() method for route without optional parameters', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    global.window = {
        location: {
            hostname: 'myapp.dev',
            pathname: '/optional/1',
            port: '81',
            protocol: 'http:'
        }
    };

    assert.equal(route().current('optional'), true);

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

test('get name of current route using .current() method for route with optional parameters', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    global.window = {
        location: {
            hostname: 'myapp.dev',
            pathname: '/optional/1/2',
            port: '81',
            protocol: 'http:'
        }
    };

    assert.equal(route().current('optional'), true);

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

test('get name of current route using .current() method for route without multiple allowed HTTP methods', t => {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    global.window = {
        location: {
            hostname: 'myapp.dev',
            pathname: '/posts/1',
            port: '81',
            protocol: 'http:'
        }
    };

    assert.equal(route().current(), 'posts.show');

    assert.equal(route().current('posts.update'), false);

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

// @todo this doesnt' check the query parameter part...
test('ignore trailing slashes and query parameters in URL when getting name of current route', t => {
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
            protocol: 'http:'
        }
    };

    assert.equal(route().current(), 'events.venues.index');

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

test('check if given named route exists', t => {
    assert.equal(route().check('posts.show'), true);

    assert.equal(route().check('non.existing.route'), false);
})

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

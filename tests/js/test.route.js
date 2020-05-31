let assert = require('assert');
let axios = require('axios');
let moxios = require('moxios');

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

it('generate URL with no parameters', function() {
    assert.equal('http://myapp.dev/posts', route('posts.index'));
});

it('generate URL with default parameters', function() {
    assert.equal(
        'http://myapp.dev/en/posts',
        route('translatePosts.index')
    );
});

it('generate URL using .url() method', function() {
    assert.equal('http://myapp.dev/posts', route('posts.index').url());
});

it('generate URL with default parameters using .url() method', function() {
    assert.equal(
        'http://myapp.dev/en/posts',
        route('translatePosts.index').url()
    );
});

it('generate relative URL by passing `false` to `absolute` argument', function() {
    assert.equal('/posts', route('posts.index', [], false));
});

it('generate URL with provided optional parameters', function() {
    assert.equal(
        'http://myapp.dev/subscribers/123/conversations/email/1234',
        route('conversations.show', {
            type: 'email',
            subscriber: 123,
            conversation_id: 1234
        })
    );
});

it('generate relative URL with provided optional parameters', function() {
    assert.equal(
        '/subscribers/123/conversations/email/1234',
        route(
            'conversations.show',
            {
                type: 'email',
                subscriber: 123,
                conversation_id: 1234
            },
            false
        )
    );
});

it('generate relative URL with default parameters', function() {
    assert.equal('/en/posts', route('translatePosts.index', [], false));
});

it('append extra provided named parameters as query parameters', function() {
    assert.equal(
        'http://myapp.dev/en/posts?someOtherKey=123',
        route('translatePosts.index', { someOtherKey: 123 })
    );
});

it('error if required parameters not provided', function() {
    assert.throws(function() {
        route('posts.show').toString();
    }, /'post' key is required/);
});

it('error if required parameters with defaults are missing default values', function() {
    let defaultParameters = Ziggy.defaultParameters;
    global.Ziggy.defaultParameters = [];
    assert.throws(function() {
        route('translatePosts.index').toString();
    }, /'locale' key is required/);
    global.Ziggy.defaultParameters = defaultParameters;
});

it('don’t use `Array.filter` as default value for parameter named "filter"', function() {
    let defaultParameters = global.Ziggy.defaultParameters;
    global.Ziggy.defaultParameters = [];
    assert.equal(
        'http://myapp.dev/stuff',
        route('withOptionalFilter')
    );
    global.Ziggy.defaultParameters = defaultParameters;
});

it('error if required parameters not provided to route with default parameters', function() {
    assert.throws(function() {
        route('translatePosts.show').toString();
    }, /'id' key is required/);
});

it('generate URL using single scalar argument for route with required parameters', function() {
    assert.equal('http://myapp.dev/posts/1', route('posts.show', 1));
    assert.equal('http://myapp.dev/posts/1', route('posts.show').with(1));
});

it('generate URL using single scalar paremeter for route with required and default parameters', function() {
    assert.equal(
        'http://myapp.dev/en/posts/1',
        route('translatePosts.show', 1)
    );
    assert.equal(
        'http://myapp.dev/en/posts/1',
        route('translatePosts.show').with(1)
    );
});

it('generate URL using single parameter object for route with required parameters', function() {
    assert.equal(
        'http://myapp.dev/posts/1',
        route('posts.show', { id: 1 })
    );
    assert.equal(
        'http://myapp.dev/posts/1',
        route('posts.show').with({ id: 1 })
    );
});

it('generate URL using array of parameters objects for route with required parameters', () => {
    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show', [
            { id: 1, title: 'Event' },
            { id: 2, title: 'Venue' }
        ])
    );
});

it('generate URL using parameters object for route with required and default parameters', function() {
    assert.equal(
        'http://myapp.dev/en/posts/1',
        route('translatePosts.show', { id: 1 })
    );
    assert.equal(
        'http://myapp.dev/en/posts/1',
        route('translatePosts.show').with({ id: 1 })
    );
});

it('generate URL using single parameter array for route with required parameters', function() {
    assert.equal('http://myapp.dev/posts/1', route('posts.show', [1]));
    assert.equal('http://myapp.dev/posts/1', route('posts.show').with([1]));
});

it('generate URL using single parameter array for route with required and default parameters', function() {
    assert.equal(
        'http://myapp.dev/en/posts/1',
        route('translatePosts.show', [1])
    );
    assert.equal(
        'http://myapp.dev/en/posts/1',
        route('translatePosts.show').with([1])
    );
});

it('generate URL using parameters object for route with required parameters', function() {
    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show', { event: 1, venue: 2 })
    );
    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show').with({ event: 1, venue: 2 })
    );
});

it('generate URL using parameters object for route with required and default parameters', function() {
    assert.equal(
        'http://myapp.dev/en/events/1/venues/2',
        route('translateEvents.venues.show', { event: 1, venue: 2 })
    );
    assert.equal(
        'http://myapp.dev/en/events/1/venues/2',
        route('translateEvents.venues.show').with({ event: 1, venue: 2 })
    );
});

it('generate URL using parameters array for route with required parameters', function() {
    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show', [1, 2])
    );
    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show').with([1, 2])
    );
});

it('generate URL using parameters array for route with required and default parameters', function() {
    assert.equal(
        'http://myapp.dev/en/events/1/venues/2',
        route('translateEvents.venues.show', [1, 2])
    );
    assert.equal(
        'http://myapp.dev/en/events/1/venues/2',
        route('translateEvents.venues.show').with([1, 2])
    );
});

it('generate URL using array of objects for route with required parameters', function() {
    let event = { id: 1, name: 'World Series' };
    let venue = { id: 2, name: 'Rogers Centre' };

    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show', [event, venue])
    );
    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show').with([event, venue])
    );
});

it('generate URL using array of objects for route with required and default parameters', function() {
    let event = { id: 1, name: 'World Series' };
    let venue = { id: 2, name: 'Rogers Centre' };

    assert.equal(
        'http://myapp.dev/en/events/1/venues/2',
        route('translateEvents.venues.show', [event, venue])
    );
    assert.equal(
        'http://myapp.dev/en/events/1/venues/2',
        route('translateEvents.venues.show').with([event, venue])
    );
});

it('generate URL using mixed array of objects and scalar parameters for route with required parameters', function() {
    let venue = { id: 2, name: 'Rogers Centre' };

    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show', [1, venue])
    );
    assert.equal(
        'http://myapp.dev/events/1/venues/2',
        route('events.venues.show').with([1, venue])
    );
});

it('generate URL using mixed array of objects and scalar parameters for route with required and default parameters', function() {
    let venue = { id: 2, name: 'Rogers Centre' };

    assert.equal(
        'http://myapp.dev/en/events/1/venues/2',
        route('translateEvents.venues.show', [1, venue])
    );
    assert.equal(
        'http://myapp.dev/en/events/1/venues/2',
        route('translateEvents.venues.show').with([1, venue])
    );
});

it('generate URL for route with required domain parameters', function() {
    assert.equal(
        'http://tighten.myapp.dev/users/1',
        route('team.user.show', { team: 'tighten', id: 1 })
    );
    assert.equal(
        'http://tighten.myapp.dev/users/1',
        route('team.user.show').with({ team: 'tighten', id: 1 })
    );
});

it('generate URL including default parameters for route with required domain parameters', function() {
    assert.equal(
        'http://tighten.myapp.dev/en/users/1',
        route('translateTeam.user.show', { team: 'tighten', id: 1 })
    );
    assert.equal(
        'http://tighten.myapp.dev/en/users/1',
        route('translateTeam.user.show').with({ team: 'tighten', id: 1 })
    );
});

it('return base URL if path is "/"', function() {
    assert.equal('http://myapp.dev/', route('home'));
});

it('make axios call when route(...) passed as target', function() {
    moxios.install();

    moxios.stubRequest('http://myapp.dev/posts/1', {
        status: 200,
        responseText: 'Worked!'
    });

    axios
        .get(route('posts.show', 1))
        .then(function(response) {
            assert.equal(200, response.status);
        })
        .catch(function(error) {
            throw error;
        });

    moxios.uninstall();
});

it('make axios call when route(...) with parameters passed as target', function() {
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
            assert.equal(200, response.status);
        })
        .catch(function(error) {
            console.log(error);
            assert.equal(true, false);
        });

    moxios.uninstall();
});

// @todo duplicate
it('skip optional parameter `slug`', function() {
    assert.equal(
        route('optional', { id: 123 }),
        'http://myapp.dev/optional/123'
    );
});

it('skip optional parameter `slug` explicitly set to `null`', function() {
    assert.equal(
        route('optional', { id: 123, slug: null }),
        'http://myapp.dev/optional/123'
    );
});

// @todo why?
it('accept optional parameter `slug`', function() {
    assert.equal(
        route('optional', { id: 123, slug: 'news' }),
        'http://myapp.dev/optional/123/news'
    );
});

it('error if route name doesn’t exist', function() {
    assert.throws(function() {
        route('unknown-route').toString();
    }, /route 'unknown-route' is not found in the route list/);
});

// @todo duplicate
it('accept query string parameters as keyed values in parameters object', function() {
    assert.equal(
        'http://myapp.dev/events/1/venues/2?search=rogers&page=2',
        route('events.venues.show', {
            event: 1,
            venue: 2,
            search: 'rogers',
            page: 2
        })
    );
});

it('accept query string parameters as keyed values using .withQuery() method', function() {
    let router = route('events.venues.show', [1, 2]).withQuery({
        search: 'rogers',
        page: 2
    });
    assert.equal(
        router,
        'http://myapp.dev/events/1/venues/2?search=rogers&page=2'
    );
});

it('generate URL with port for route without parameters', function() {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    assert.equal('http://myapp.dev:81/posts', route('posts.index'));

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

it('generate URL without port for route with required domain parameters', function() {
    let orgBaseUrl = Ziggy.baseUrl;
    let orgBaseDomain = Ziggy.baseDomain;
    let orgBasePort = Ziggy.basePort;

    global.Ziggy.baseUrl = 'http://myapp.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    assert.equal(
        'http://tighten.myapp.dev/users/1',
        route('team.user.show', { team: 'tighten', id: 1 })
    );
    assert.equal(
        'http://tighten.myapp.dev/users/1',
        route('team.user.show').with({ team: 'tighten', id: 1 })
    );

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

// @todo should be 2 tests, one for getting and one for checking
it('get name of current route using .current() method / check if name of current route matches pattern using .current() method', function() {
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

    assert.equal('events.venues.show', route().current());

    assert.equal(true, route().current('events.venues.show'));

    assert.equal(false, route().current('events.venues.index'));

    assert.equal(true, route().current('events.venues.*'));

    assert.equal(false, route().current('events.users.*'));

    assert.equal(true, route().current('events.*.show'));

    assert.equal(true, route().current('*.venues.show'));

    assert.equal(false, route().current('*.users.show'));

    assert.equal(false, route().current('events'));

    assert.equal(true, route().current('events.*'));

    assert.equal(false, route().current('show'));

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

it('get name of current route using .current() method for route without optional parameters', function() {
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

    assert.equal(true, route().current('optional'));

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

it('get name of current route using .current() method for route with optional parameters', function() {
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

    assert.equal(true, route().current('optional'));

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

it('get name of current route using .current() method for route without multiple allowed HTTP methods', function() {
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

    assert.equal('posts.show', route().current());

    assert.equal(false, route().current('posts.update'));

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

// @todo this doesnt' check the query parameter part...
it('ignore trailing slashes and query parameters in URL when getting name of current route', function() {
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

    assert.equal('events.venues.index', route().current());

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

it('check if given named route exists', function() {
    assert.equal(true, route().check('posts.show'));

    assert.equal(false, route().check('non.existing.route'));
})

it('handle trailing paths in base URL', function() {
    let orgBaseUrl = Ziggy.baseUrl;
    global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

    assert.equal(
        'http://test.thing/ab/cd/events/1/venues',
        route('events.venues.index', 1)
    );

    global.Ziggy.baseUrl = orgBaseUrl;
});

it('URL-encode named parameters', function() {
    let orgBaseUrl = Ziggy.baseUrl;
    global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

    assert.equal(
        'http://test.thing/ab/cd/events/Fun%26Games/venues',
        route('events.venues.index', { event: 'Fun&Games' }).url()
    );

    global.Ziggy.baseUrl = orgBaseUrl;
});

it('accept and format array as query parameter', function() {
    assert.equal(
        route('events.venues.index', {
            event: 'test',
            guests: ['a', 'b', 'c']
        }),
        'http://myapp.dev/events/test/venues?guests[0]=a&guests[1]=b&guests[2]=c'
    );
});

// @todo combine with other URL-encoding test above
it('URL-encode query parameters', function() {
    let orgBaseUrl = Ziggy.baseUrl;
    global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

    assert.equal(
        'http://test.thing/ab/cd/events/Fun%26Games/venues?location=Brews%26Clues',
        route('events.venues.index', {
            event: 'Fun&Games',
            location: 'Brews&Clues'
        }).url()
    );

    global.Ziggy.baseUrl = orgBaseUrl;
});

it('ignore query parameters explicitly set to `null`', function() {
    assert.equal(
        'http://myapp.dev/posts?filled=filling',
        route('posts.index', { filled: 'filling', empty: null }).url()
    );
});

it('don’t ignore parameter explicity set to `0`', function() {
    assert.equal(
        'http://myapp.dev/posts/0',
        route('posts.update', 0).url()
    );
});

it('get name of current route using .current() method with missing protocol', function() {
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

    assert.equal('events.venues.index', route().current());

    global.Ziggy.baseUrl = orgBaseUrl;
    global.Ziggy.baseDomain = orgBaseDomain;
    global.Ziggy.basePort = orgBasePort;
});

it('accept custom Ziggy configuration object', function() {
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
        'http://notYourAverage.dev/tightenDev/1/packages',
        route(
            'tightenDev.packages.index',
            { dev: 1 },
            true,
            customZiggy
        ).url()
    );
});

it('get name of current route using .current() method with missing global Ziggy object', function() {
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
        'events.index',
        route(undefined, undefined, undefined, customZiggy).current()
    );

    global.Ziggy = orgZiggy;
});

it('remove braces and question marks from route parameter definition', function() {
    assert(route().trimParam('optional'), 'optional');

    assert(route().trimParam('{id}'), 'id');

    assert(route().trimParam('{slug?}'), 'slug');
});

it('extract named parameters from URL using given template and delimiter', function() {
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
it('merge named parameters extracted from domain and URL', function() {
    global.window.location.hostname = 'tighten.myapp.dev';
    global.window.location.pathname = '/users/1';

    assert.deepStrictEqual(route().params, { team: 'tighten', id: '1' });

    global.window.location.hostname = global.Ziggy.baseDomain;
    global.window.location.pathname = '/posts/1';

    assert.deepStrictEqual(route().params, { post: '1' });

    global.window.location.pathname = '/events/1/venues/2';

    assert.deepStrictEqual(route().params, { event: '1', venue: '2' });
});

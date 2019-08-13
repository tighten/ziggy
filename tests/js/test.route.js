let assert = require('assert');
let axios = require('axios');
let moxios = require('moxios');

import route from '../../src/js/route.js';

global.Ziggy = {
    namedRoutes: {
        "translateTeam.user.show": {
            "uri": "{locale}/users/{id}",
            "methods": ["GET", "HEAD"],
            "domain": "{team}.myapp.dev"
        },
        "translateEvents.venues.show": {
            "uri": "{locale}/events/{event}/venues/{venue}",
            "methods": ["GET", "HEAD"],
            "domain": null
        },
        "translatePosts.index": {
            "uri":"{locale}/posts",
            "methods": ["GET", "HEAD"],
            "domain": null
        },
        "translatePosts.show": {
            "uri":"{locale}/posts/{id}",
            "methods": ["GET", "HEAD"],
            "domain": null
        },
        "home": {
            "uri": "/",
            "methods": ["GET", "HEAD"],
            "domain": null
        },
        "team.user.show": {
            "uri": "users/{id}",
            "methods": ["GET", "HEAD"],
            "domain": "{team}.myapp.dev"
        },
        "posts.index": {
            "uri": "posts",
            "methods": ["GET", "HEAD"],
            "domain": null
        },
        "posts.update": {
            "uri": "posts/{post}",
            "methods": ["PUT"],
            "domain": null
        },
        "posts.show": {
            "uri": "posts/{post}",
            "methods": ["GET", "HEAD"],
            "domain": null
        },
        "posts.store": {
            "uri": "posts",
            "methods": ["POST"],
            "domain": null
        },
        "posts.destroy": {
            "uri": "posts/{id}",
            "methods": ["DELETE"],
            "domain": null
        },
        "events.venues.show": {
            "uri": "events/{event}/venues/{venue}",
            "methods": ["GET", "HEAD"],
            "domain": null
        },
        "events.venues.index": {
            "uri": "events/{event}/venues",
            "methods": ["GET", "HEAD"],
            "domain": null
        },
        "optional": {
            "uri": "optional/{id}/{slug?}",
            "methods": ["GET","HEAD"],
            "domain": null
        }
    },
    baseUrl: 'http://myapp.dev/',
    baseProtocol: 'http',
    baseDomain: 'myapp.dev',
    basePort: false,
    defaultParameters: {
        locale: "en"
    }
};

describe('route()', function() {
    it('Should return URL when run without route name', function() {
        assert.equal(
            "http://myapp.dev/posts/withou/named/routed",
            route().go('posts/withou/named/routed').url()
        );
    });

    it('Should return URL when run without route name, first slash should remove', function() {
        assert.equal(
            "http://myapp.dev/posts/withou/named/routed",
            route().go('/posts/withou/named/routed').url()
        );
    });

    it('Should return URL when run without params on a route without params', function() {
        assert.equal(
            "http://myapp.dev/posts",
            route('posts.index').url()
        );
    });

    it('Should return URL when run without params on a route without params , with default params', function() {
        assert.equal(
            "http://myapp.dev/en/posts",
            route('translatePosts.index').url()
        );
    });

    it('Should return URL when when passed the url() method', function() {
        assert.equal(
            "http://myapp.dev/posts",
            route('posts.index').url()
        );
    });

    it('Should return URL when when passed the url() method with default params', function() {
        assert.equal(
            "http://myapp.dev/en/posts",
            route('translatePosts.index').url()
        );
    });


    it('Should return URL without domain when passing false into absolute param.', function() {
        assert.equal(
            "/posts",
            route('posts.index', [], false).url()
        );
    });

    // FAIL
    it('Should return URL without domain when passing false into absolute param , with default params.', function() {
        assert.equal(
            "/en/posts",
            route('translatePosts.index', [], false).url()
        );
    });

    it('Should return missing params error when run with missing params on a route with required params', function() {
        assert.throws(
            function() {
                route('posts.show').toString().url()
            },
                /'post' key is required/
        );
    });

    it('Should return missing params error when run with missing default params on a route with required default params', function() {
        let defaultParameters = Ziggy.defaultParameters;
        global.Ziggy.defaultParameters = []
        assert.throws(
            function() {
                route('translatePosts.index').toString().url()
            },
                /'locale' key is required/
        );
        global.Ziggy.defaultParameters = defaultParameters
    });

    it('Should return missing params error when run with missing params on a route with required params and default params', function() {
        assert.throws(
            function() {
                route('translatePosts.show').toString().url()
            },
                /'id' key is required/
        );
    });

    it('Should return URL when run with single non-array/object param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show', 1).url()
        );
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show').with(1).url()
        );
    });

    it('Should return URL when run with single non-array/object param on a route with required params and default params', function() {
        assert.equal(
            "http://myapp.dev/en/posts/1",
            route('translatePosts.show', 1).url()
        );
        assert.equal(
            "http://myapp.dev/en/posts/1",
            route('translatePosts.show').with(1).url()
        );
    });

    it('Should return URL when run with single object param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show', { id: 1 }).url()
        );
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show').with({ id: 1 }).url()
        );
    });

    it('Should return URL when run with multiple object params on a route with required params', () => {
	assert.equal(
            'http://myapp.dev/events/1/venues/2',
            route('events.venues.show', [{id: 1, title: 'Event'}, {id: 2, title: 'Venue'}]).url()
	);
    });

    it('Should return URL when run with single object param on a route with required params and default params', function() {
        assert.equal(
            "http://myapp.dev/en/posts/1",
            route('translatePosts.show', { id: 1 }).url()
        );
        assert.equal(
            "http://myapp.dev/en/posts/1",
            route('translatePosts.show').with({ id: 1 }).url()
        );
    });

    it('Should return URL when run with single array param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show', [1]).url()
        );
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show').with([1]).url()
        );
    });

    it('Should return URL when run with single array param on a route with required params and default params', function() {
        assert.equal(
            "http://myapp.dev/en/posts/1",
            route('translatePosts.show', [1]).url()
        );
        assert.equal(
            "http://myapp.dev/en/posts/1",
            route('translatePosts.show').with([1]).url()
        );
    });

    it('Should return URL when run with multiple object params on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show', { event: 1, venue: 2 }).url()
        );
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show').with({ event: 1, venue: 2 }).url()
        );
    });

    it('Should return URL when run with multiple object params on a route with required params and default params', function() {
        assert.equal(
            "http://myapp.dev/en/events/1/venues/2",
            route('translateEvents.venues.show', { event: 1, venue: 2 }).url()
        );
        assert.equal(
            "http://myapp.dev/en/events/1/venues/2",
            route('translateEvents.venues.show').with({ event: 1, venue: 2 }).url()
        );
    });

    it('Should return URL when run with multiple array params on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show', [1, 2]).url()
        );
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show').with([1, 2]).url()
        );
    });

    it('Should return URL when run with multiple array params on a route with required params and default params', function() {
        assert.equal(
            "http://myapp.dev/en/events/1/venues/2",
            route('translateEvents.venues.show', [1, 2]).url()
        );
        assert.equal(
            "http://myapp.dev/en/events/1/venues/2",
            route('translateEvents.venues.show').with([1, 2]).url()
        );
    });

    it('Should return URL when run with whole object params on a route with required params', function() {
        let event = { id: 1, name: 'World Series' };
        let venue = { id: 2, name: 'Rogers Centre' };

        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show', [event, venue]).url()
        );
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show').with([event, venue]).url()
        );
    });

    it('Should return URL when run with whole object params on a route with required params and default params', function() {
        let event = { id: 1, name: 'World Series' };
        let venue = { id: 2, name: 'Rogers Centre' };

        assert.equal(
            "http://myapp.dev/en/events/1/venues/2",
            route('translateEvents.venues.show', [event, venue]).url()
        );
        assert.equal(
            "http://myapp.dev/en/events/1/venues/2",
            route('translateEvents.venues.show').with([event, venue]).url()
        );
    });

    it('Should return URL when run with some whole object params on a route with required params', function() {
        let venue = { id: 2, name: "Rogers Centre" };

        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show', [1, venue]).url()
        );
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show').with([1, venue]).url()
        );
    });

    it('Should return URL when run with some whole object params on a route with required params and default params', function() {
        let venue = { id: 2, name: "Rogers Centre" };

        assert.equal(
            "http://myapp.dev/en/events/1/venues/2",
            route('translateEvents.venues.show', [1, venue]).url()
        );
        assert.equal(
            "http://myapp.dev/en/events/1/venues/2",
            route('translateEvents.venues.show').with([1, venue]).url()
        );
    });

    it('Should return correct URL when run with params on a route with required domain params', function() {
        assert.equal(
            "http://tighten.myapp.dev/users/1",
            route('team.user.show', { team: "tighten", id: 1 }).url()
        );
        assert.equal(
            "http://tighten.myapp.dev/users/1",
            route('team.user.show').with({ team: "tighten", id: 1 }).url()
        );
    });

    it('Should return correct URL when run with params and default params on a route with required domain params', function() {
        assert.equal(
            "http://tighten.myapp.dev/en/users/1",
            route('translateTeam.user.show', { team: "tighten", id: 1 }).url()
        );
        assert.equal(
            "http://tighten.myapp.dev/en/users/1",
            route('translateTeam.user.show').with({ team: "tighten", id: 1 }).url()
        );
    });

    it('Should return base url if path is "/"', function() {
        assert.equal(
            "http://myapp.dev/",
            route('home').url()
        );
    });

    it('Should make an axios call when a route() is passed', function() {
        moxios.install();

        moxios.stubRequest('http://myapp.dev/posts/1', {
            status: 200,
            responseText: "Worked!"
        });

        axios.get(route('posts.show', 1))
            .then(function(response) {
                assert.equal(200, response.status)
            }).catch(function(error) {
                throw error;
            });

        moxios.uninstall()
    });

    it('Should make an axios call when a route() and params are passed', function() {
        moxios.install();

        moxios.stubRequest('http://myapp.dev/posts/1', {
            status: 200,
            responseText: "Worked!"
        });

        axios.get(route('posts.index'), {
              page: 2,
              params: { thing: 'thing'}
            })
            .then(function(response) {
                assert.equal(200, response.status)

            }).catch(function(error) {
                console.log(error);
                assert.equal(true, false);
            });

        moxios.uninstall()
    });

    // it('Should skip the optional parameter `slug`', function() {
    //   assert.equal(
    //     route('optional', { id: 123 }),
    //     'http://myapp.dev/optional/123/'
    //   );
    // });

    it(' optional `slug` shouldn\'t ended with slash', function() {
        assert.equal(
          route('optional', { id: 123 }).url(),
          'http://myapp.dev/optional/123'
        );
    });

    it('Should accept the optional parameter `slug`', function() {
      assert.equal(
        route('optional', { id: 123, slug: "news" }).url(),
        'http://myapp.dev/optional/123/news'
      );
    });

    it('Should return an error if route is not found in the route list', function() {
        assert.throws(
            function() {
                route('unknown-route').toString().url()
            },
            /route 'unknown-route' is not found in the route list/
        );
    });

    it('Should accept queryString params as keyed values in param object', function() {
        assert.equal(
            'http://myapp.dev/events/1/venues/2?search=rogers&page=2',
            route('events.venues.show', {event: 1, venue: 2, search: 'rogers', page: 2}).url()
        )
    });

    it('Should accept queryString params as keyed values in withQuery object', function() {
        assert.equal(
            'http://myapp.dev/events/1/venues/2?search=rogers&page=2',
            route('events.venues.show', [1, 2]).withQuery({search: 'rogers', page: 2}).url()
        )
    });

    it('Should return URL with port when run without params on a route without params', function() {
        let orgBaseUrl    = Ziggy.baseUrl;
        let orgBaseDomain = Ziggy.baseDomain;
        let orgBasePort   = Ziggy.basePort;

        global.Ziggy.baseUrl    = 'http://myapp.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort   = 81;

        assert.equal(
            "http://myapp.dev:81/posts",
            route('posts.index')
        );

        global.Ziggy.baseUrl    = orgBaseUrl;
        global.Ziggy.baseDomain = orgBaseDomain;
        global.Ziggy.basePort   = orgBasePort;
    });

    it('Should return correct URL without port when run with params on a route with required domain params', function() {
        let orgBaseUrl    = Ziggy.baseUrl;
        let orgBaseDomain = Ziggy.baseDomain;
        let orgBasePort   = Ziggy.basePort;

        global.Ziggy.baseUrl = 'http://myapp.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort = 81;

        assert.equal(
            "http://tighten.myapp.dev/users/1",
            route('team.user.show', {team: "tighten", id: 1}).url()
        );
        assert.equal(
            "http://tighten.myapp.dev/users/1",
            route('team.user.show').with({team: "tighten", id: 1}).url()
        );

        global.Ziggy.baseUrl = orgBaseUrl;
        global.Ziggy.baseDomain = orgBaseDomain;
        global.Ziggy.basePort = orgBasePort;
    });

    it('Should return correct route name for current() and respond accurately when queried.', function() {
        let orgBaseUrl = Ziggy.baseUrl;
        let orgBaseDomain = Ziggy.baseDomain;
        let orgBasePort = Ziggy.basePort;

        global.Ziggy.baseUrl = 'http://myapp.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort = 81;

        global.window = {
            location: {
                hostname: "myapp.dev",
                pathname: "/events/1/venues/2",
                port: "81",
                protocol: "http:"
            }
        };

        assert.equal(
            "events.venues.show",
            route().current()
        );

        assert.equal(
            true,
            route().current("events.venues.show")
        );

        assert.equal(
            false,
            route().current("events.venues.index")
        );

        assert.equal(
            true,
            route().current("events.venues.*")
        );

        assert.equal(
            false,
            route().current("events.users.*")
        );

        assert.equal(
            true,
            route().current("events.*.show")
        );

        assert.equal(
            true,
            route().current("*.venues.show")
        );

        assert.equal(
            false,
            route().current("*.users.show")
        );

        global.Ziggy.baseUrl = orgBaseUrl;
        global.Ziggy.baseDomain = orgBaseDomain;
        global.Ziggy.basePort = orgBasePort;
    });

    it('Should return correct route name for current() when a route has does not have optional parameters.', function() {
        let orgBaseUrl = Ziggy.baseUrl;
        let orgBaseDomain = Ziggy.baseDomain;
        let orgBasePort = Ziggy.basePort;

        global.Ziggy.baseUrl = 'http://myapp.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort = 81;

        global.window = {
            location: {
                hostname: "myapp.dev",
                pathname: "/optional/1",
                port: "81",
                protocol: "http:"
            }
        };

        assert.equal(
            true,
            route().current('optional')
        );

        global.Ziggy.baseUrl = orgBaseUrl;
        global.Ziggy.baseDomain = orgBaseDomain;
        global.Ziggy.basePort = orgBasePort;
    });

    it('Should return correct route name for current() when a route has optional parameters.', function() {
        let orgBaseUrl = Ziggy.baseUrl;
        let orgBaseDomain = Ziggy.baseDomain;
        let orgBasePort = Ziggy.basePort;

        global.Ziggy.baseUrl = 'http://myapp.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort = 81;

        global.window = {
            location: {
                hostname: "myapp.dev",
                pathname: "/optional/1/2",
                port: "81",
                protocol: "http:"
            }
        };

        assert.equal(
            true,
            route().current('optional')
        );

        global.Ziggy.baseUrl = orgBaseUrl;
        global.Ziggy.baseDomain = orgBaseDomain;
        global.Ziggy.basePort = orgBasePort;
    });

    it('Should return correct route name for current() when a route responds to multiple request methods.', function() {
        let orgBaseUrl = Ziggy.baseUrl;
        let orgBaseDomain = Ziggy.baseDomain;
        let orgBasePort = Ziggy.basePort;

        global.Ziggy.baseUrl = 'http://myapp.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort = 81;

        global.window = {
            location: {
                hostname: "myapp.dev",
                pathname: "/posts/1",
                port: "81",
                protocol: "http:"
            }
        };

        assert.equal(
            'posts.show',
            route().current()
        );

        assert.equal(
            false,
            route().current('posts.update')
        );

        global.Ziggy.baseUrl = orgBaseUrl;
        global.Ziggy.baseDomain = orgBaseDomain;
        global.Ziggy.basePort = orgBasePort;
    });

    it('Should respond "true" on route().current() regardless of trailing slashes or query variables.', function () {
        let orgBaseUrl = Ziggy.baseUrl;
        let orgBaseDomain = Ziggy.baseDomain;
        let orgBasePort = Ziggy.basePort;

        global.Ziggy.baseUrl = 'http://myapp.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort = 81;

        global.window = {
            location: {
                hostname: "myapp.dev",
                pathname: "/events/1/venues/",
                port: "81",
                protocol: "http:"
            }
        };

        assert.equal(
            'events.venues.index',
            route().current()
        );

        global.Ziggy.baseUrl = orgBaseUrl;
        global.Ziggy.baseDomain = orgBaseDomain;
        global.Ziggy.basePort = orgBasePort;
    });

    it('Should still work if paths are appended to baseUrl.', function() {
        let orgBaseUrl = Ziggy.baseUrl;
        global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

        assert.equal(
            'http://test.thing/ab/cd/events/1/venues',
            route('events.venues.index', 1).url()
        );

        global.Ziggy.baseUrl = orgBaseUrl;
    });

    it('Should URL encode path params.', function() {
        let orgBaseUrl = Ziggy.baseUrl;
        global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

        assert.equal(
            'http://test.thing/ab/cd/events/Fun%26Games/venues',
            route('events.venues.index', {event: "Fun&Games"}).url()
        );

        global.Ziggy.baseUrl = orgBaseUrl;
    });

    it('Should URL encode query params.', function() {
        let orgBaseUrl = Ziggy.baseUrl;
        global.Ziggy.baseUrl = 'http://test.thing/ab/cd/';

        assert.equal(
            'http://test.thing/ab/cd/events/Fun%26Games/venues?location=Brews%26Clues',
            route('events.venues.index', {event: "Fun&Games", location: "Brews&Clues"}).url()
        );

        global.Ziggy.baseUrl = orgBaseUrl;
    });

    it('Should not pass query param if its value is null', function() {
        assert.equal(
            "http://myapp.dev/posts?filled=filling",
            route('posts.index', {filled: 'filling', empty: null}).url()
        );
    });

    it('Should allow route().current() regardless of protocol', function() {
        let orgBaseUrl = Ziggy.baseUrl;
        let orgBaseDomain = Ziggy.baseDomain;
        let orgBasePort = Ziggy.basePort;

        global.Ziggy.baseUrl = 'http://myapp.dev:81/';
        global.Ziggy.baseDomain = 'myapp.dev';
        global.Ziggy.basePort = 81;

        global.window = {
            location: {
                hostname: "myapp.dev",
                pathname: "/events/1/venues/",
                port: "81",
                protocol: ""
            }
        };

        assert.equal(
            'events.venues.index',
            route().current()
        );

        global.Ziggy.baseUrl = orgBaseUrl;
        global.Ziggy.baseDomain = orgBaseDomain;
        global.Ziggy.basePort = orgBasePort;
    });

    it('Should still work if I pass in a custom Ziggy object', function() {
        const customZiggy = {
            namedRoutes: {
                "tightenDev.packages.index": {
                    "uri": "tightenDev/{dev}/packages",
                    "methods": ["GET", "HEAD"],
                    "domain": null
                },
            },
            baseUrl: 'http://notYourAverage.dev/',
            baseProtocol: 'http',
            baseDomain: 'notYourAverage.dev',
            basePort: false,
            defaultParameters: {
                locale: "en"
            }
        };

        assert.equal(
            'http://notYourAverage.dev/tightenDev/1/packages',
            route('tightenDev.packages.index', { dev: 1 }, true, customZiggy).url()
        );
    });

    it('Should allow route().current() when there is no global Ziggy object', function() {
        const orgZiggy = global.Ziggy;

        global.Ziggy = undefined;

        global.window = {
            location: {
                hostname: "myapp.dev",
                pathname: "/events/",
                protocol: ""
            }
        };

        const customZiggy = {
            namedRoutes: {
                "events.index": {
                    "uri": "events",
                    "methods": ["GET", "HEAD"],
                    "domain": null
                },
            },
            baseUrl: 'http://myapp.dev/',
            baseProtocol: 'http',
            baseDomain: 'myapp.dev',
            basePort: false,
        };

        assert.equal(
            'events.index',
            route(undefined, undefined, undefined, customZiggy).current()
        );

        global.Ziggy = orgZiggy;
    });

    it('Should remove all curly brackets and question marks from a dynamic parameter', function() {
        assert(
            route().trimParam('optional'),
            'optional'
        );

        assert(
            route().trimParam('{id}'),
            'id'
        );

        assert(
            route().trimParam('{slug?}'),
            'slug'
        );
    });

    it('Should extract dynamic params from a URI based on a given template and delimiter', function() {
        assert.deepStrictEqual(
            route().extractParams('', '', '/'),
            {}
        );

        assert.deepStrictEqual(
            route().extractParams('posts', 'posts', '/'),
            {}
        );

        assert.deepStrictEqual(
            route().extractParams('users/1', 'users/{id}', '/'),
            { id: '1' }
        );

        assert.deepStrictEqual(
            route().extractParams('events/1/venues/2', 'events/{event}/venues/{venue}', '/'),
            { event: '1', venue: '2' }
        );

        assert.deepStrictEqual(
            route().extractParams('optional/123', 'optional/{id}/{slug?}', '/'),
            { id: '123' }
        );

        assert.deepStrictEqual(
            route().extractParams('optional/123/news', 'optional/{id}/{slug?}', '/'),
            { id: '123', slug: 'news' }
        );

        assert.deepStrictEqual(
            route().extractParams('tighten.myapp.dev', '{team}.myapp.dev', '.'),
            { team: 'tighten' }
        );
    });

    it('Should combine dynamic params from the domain and the URI', function() {
        global.window.location.hostname = 'tighten.myapp.dev';
        global.window.location.pathname = '/users/1';

        assert.deepStrictEqual(
            route().params,
            { team: 'tighten', id: '1' }
        );

        global.window.location.hostname = global.Ziggy.baseDomain;
        global.window.location.pathname = '/posts/1';

        assert.deepStrictEqual(
            route().params,
            { post: '1' }
        );

        global.window.location.pathname = '/events/1/venues/2';

        assert.deepStrictEqual(
            route().params,
            { event: '1', venue: '2' }
        );
    });
});

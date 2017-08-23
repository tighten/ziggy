var assert = require('assert');
var axios = require('axios');
var moxios = require('moxios');
var route = require('../../src/js/route').route;

namedRoutes = JSON.parse('{"home":{"uri":"\/","methods":["GET","HEAD"],"domain":null},"team.user.show":{"uri":"users\/{id}","methods":["GET","HEAD"],"domain":"{team}.myapp.dev"},"posts.index":{"uri":"posts","methods":["GET","HEAD"],"domain":null},"posts.show":{"uri":"posts\/{id}","methods":["GET","HEAD"],"domain":null},"posts.update":{"uri":"posts\/{id}","methods":["PUT"],"domain":null},"posts.store":{"uri":"posts","methods":["POST"],"domain":null},"posts.destroy":{"uri":"posts\/{id}","methods":["DELETE"],"domain":null},"events.venues.show":{"uri":"events\/{event}\/venues\/{venue}","methods":["GET","HEAD"],"domain":null},"optional":{"uri":"optional\/{id}\/{slug?}","methods":["GET","HEAD"],"domain":null}}'),
baseUrl = 'http://myapp.dev/';

describe('route()', function() {
    it('Should return URL when run without params on a route without params', function() {
        assert.equal(
            "http://myapp.dev/posts",
            route('posts.index')
        );
    });

    it('Should return URL without domain when passing false into absolute param.', function() {
        assert.equal(
            "/posts",
            route('posts.index', [], false)
        );
    });

    it('Should return missing params error when run with missing params on a route with required params', function() {
        assert.throws(
            function() {
                route('posts.show').toString()
            },
                /"id" key is required/
        );
    });

    it('Should return URL when run with single non-array/object param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show', 1)
        );
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show').with(1)
        );
    });

    it('Should return URL when run with single object param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show', { id: 1 })
        );
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show').with({ id: 1 })
        );
    });

    it('Should return URL when run with single array param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show', [1])
        );
        assert.equal(
            "http://myapp.dev/posts/1",
            route('posts.show').with([1])
        );
    });

    it('Should return URL when run with multiple object params on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show', { event: 1, venue: 2 })
        );
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show').with({ event: 1, venue: 2 })
        );
    });

    it('Should return URL when run with multiple array params on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show', [1, 2])
        );
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show').with([1, 2])
        );
    });

    it('Should return URL when run with whole object params on a route with required params', function() {
        var event = { id: 1, name: 'World Series' };
        var venue = { id: 2, name: 'Rogers Centre' };

        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show', [event, venue])
        );
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show').with([event, venue])
        );
    });

    it('Should return URL when run with some whole object params on a route with required params', function() {
        var venue = { id: 2, name: "Rogers Centre" };

        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show', [1, venue])
        );
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route('events.venues.show').with([1, venue])
        );
    });

    it('Should return correct URL when run with params on a route with required domain params', function() {
        assert.equal(
            "tighten.myapp.dev/users/1",
            route('team.user.show', { team: "tighten", id: 1 })
        );
        assert.equal(
            "tighten.myapp.dev/users/1",
            route('team.user.show').with({ team: "tighten", id: 1 })
        );
    });

    it('Should return base url if path is "/"', function() {
        assert.equal(
            "http://myapp.dev/",
            route('home')
        );
    });

    it('Should make an axios call when a route() is passed', function() {
        moxios.install();

        moxios.stubRequest('http://myapp.dev/posts/1', {
            status: 200,
            responseText: "Worked!"
        });

        axios
            .get(route('posts.show', 1))
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

    it('Should skip the optional parameter `slug`', function() {
      assert.equal(
        route('optional', { id: 123 }),
        'http://myapp.dev/optional/123/'
      );
    });

    it('Should accept the optional parameter `slug`', function() {
      assert.equal(
        route('optional', { id: 123, slug: "news" }),
        'http://myapp.dev/optional/123/news'
      );
    });

    it('Should return an error if route is not found in the route list', function() {
        assert.throws(
            function() {
                route('unknown-route').toString()
            },
            /route "unknown-route" is not found in the route list/
        );
    });

    it('Should return an error if route name isnt provided', function() {
        assert.throws(
            function() {
                route()
            },
            /You must provide a route name/
        );
    });

    it('Should accept queryString params as keyed values in param object', function() {
        assert.equal(
            'http://myapp.dev/events/1/venues/2?search=rogers&page=2',
            route('events.venues.show', {event: 1, venue: 2, search: 'rogers', page: 2})
        )
    });

    it('Should accept queryString params as keyed values in withQuery object', function() {
        assert.equal(
            'http://myapp.dev/events/1/venues/2?search=rogers&page=2',
            route('events.venues.show', [1, 2]).withQuery({search: 'rogers', page: 2})
        )
    });
});

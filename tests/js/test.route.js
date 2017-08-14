var assert = require('assert');
var route = require('../../src/js/route');

namedRoutes = JSON.parse('{"home":{"uri":"\/","methods":["GET","HEAD"],"domain":null},"team.user.show":{"uri":"users\/{id}","methods":["GET","HEAD"],"domain":"{team}.myapp.dev"},"posts.index":{"uri":"posts","methods":["GET","HEAD"],"domain":null},"posts.show":{"uri":"posts\/{id}","methods":["GET","HEAD"],"domain":null},"posts.update":{"uri":"posts\/{id}","methods":["PUT"],"domain":null},"posts.store":{"uri":"posts","methods":["POST"],"domain":null},"posts.destroy":{"uri":"posts\/{id}","methods":["DELETE"],"domain":null},"events.venues.show":{"uri":"events\/{event}\/venues\/{venue}","methods":["GET","HEAD"],"domain":null}}'),
    baseUrl = 'http://myapp.dev/';

describe('route()', function() {
    it('Should return URL when run without params on a route without params', function() {
        assert.equal(
            "http://myapp.dev/posts",
            route.route('posts.index')
        );
    });

    it('Should return missing params error when run with missing params on a route with required params', function() {
        assert.throws(
            () => route.route('posts.show'),
            /\"id\" key is required/
        );
    });

    it('Should return URL when run with single non-array/object param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route.route('posts.show', 1)
        );
    });

    it('Should return URL when run with single object param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route.route('posts.show', {id: 1})
        );
    });

    it('Should return URL when run with single array param on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/posts/1",
            route.route('posts.show', [1])
        );
    });

    it('Should return URL when run with multiple object params on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route.route('events.venues.show', {event: 1, venue: 2})
        );
    });

    it('Should return URL when run with multiple array params on a route with required params', function() {
        assert.equal(
            "http://myapp.dev/events/1/venues/2",
            route.route('events.venues.show', [1, 2])
        );
    });

    it('Should return correct URL when run with params on a route with required domain params', function() {
        assert.equal(
            "tighten.myapp.dev/users/1",
            route.route('team.user.show', {team: 'tighten', id: 1})
        );
    });
});

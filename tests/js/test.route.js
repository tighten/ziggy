var assert = require('assert');
var route = require('../../src/js/route');

namedRoutes = JSON.parse('{"home":{"uri":"\/","methods":["GET","HEAD"],"domain":null},"test":{"uri":"user\/{id}","methods":["GET","HEAD"],"domain":"{account}.myapp.com"},"posts.index":{"uri":"posts","methods":["GET","HEAD"],"domain":null},"posts.show":{"uri":"posts\/{id}\/test\/{test}","methods":["GET","HEAD"],"domain":null},"posts.update":{"uri":"posts\/{id}","methods":["PUT"],"domain":null},"posts.store":{"uri":"posts","methods":["POST"],"domain":null},"posts.destroy":{"uri":"posts\/{id}","methods":["DELETE"],"domain":null}}'),
    baseUrl = 'http://myapp.dev/';

describe('route()', function() {
    it('Should return URL when run without params on a route without params', function() {
      assert.equal("http://myapp.dev/posts", route.route('posts.index'));
    });
});
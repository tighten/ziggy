import test from 'ava';
import route from '../../src/js/route.js';
import { win, zig } from './_setup2';

test.beforeEach(t => {
    global.Ziggy = { ...zig };
    global.window = { ...win };
});

test('generate a URL with no parameters', t => {
    t.is(route('posts.index').url(), 'https://ziggy.dev/posts');
});

test('generate a URL with default parameters', t => {
    t.is(route('translatePosts.index').url(), 'https://ziggy.dev/en/posts');
});

test('generate a string URL using .url()', t => {
    t.is(route('posts.index').url(), 'https://ziggy.dev/posts');
});

test('pass parameters using .with()', t => {
    t.deepEqual(route('posts.show', [1]), route('posts.show').with([1]));
    t.is(route('posts.show', [1]).url(), route('posts.show').with([1]).url());

    t.deepEqual(route('events.venues.show', { event: 1, venue: 2 }), route('events.venues.show').with({ event: 1, venue: 2 }));
    t.is(route('events.venues.show', { event: 1, venue: 2 }).url(), route('events.venues.show').with({ event: 1, venue: 2 }).url());
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
});

test('generate a URL using an integer for a route with required parameters', t => {
    t.is(route('posts.show', 1).url(), 'https://ziggy.dev/posts/1');
});

test('generate a URL using an integer for a route with required and default parameters', t => {
    t.is(route('translatePosts.show', 1).url(), 'https://ziggy.dev/en/posts/1');
});

test('generate a URL using an object for a route with required parameters', t => {
    t.is(route('posts.show', { id: 1 }).url(), 'https://ziggy.dev/posts/1');
    t.is(route('events.venues.show', { event: 1, venue: 2 }).url(), 'https://ziggy.dev/events/1/venues/2');
});

test('generate a URL using an object for a route with optional parameters', t => {
    t.is(route('optionalId', { type: 'model', id: 1 }).url(), 'https://ziggy.dev/optionalId/model/1');
});

test('generate a URL using a single parameter array for a route with required parameters', t => {
    t.is(route('posts.show', [1]).url(), 'https://ziggy.dev/posts/1');
});

test('generate a URL using a single parameter array for a route with required and default parameters', t => {
    t.is(route('translatePosts.show', [1]).url(), 'https://ziggy.dev/en/posts/1');
});

test('generate a URL using an object for a route with required and default parameters', t => {
    t.is(route('translateEvents.venues.show', { event: 1, venue: 2 }).url(), 'https://ziggy.dev/en/events/1/venues/2');
});

test('generate a URL using an array for a route with required parameters', t => {
    t.is(route('events.venues.show', [1, 2]).url(),'https://ziggy.dev/events/1/venues/2');
});

test('generate a URL using an array for a route with required and default parameters', t => {
    t.is(route('translateEvents.venues.show', [1, 2]).url(), 'https://ziggy.dev/en/events/1/venues/2');
});

test('generate a URL using an array of objects for a route with required parameters', t => {
    let event = { id: 1, name: 'World Series' };
    let venue = { id: 2, name: 'Rogers Centre' };

    t.is(route('events.venues.show', [event, venue]).url(), 'https://ziggy.dev/events/1/venues/2');
});

test('generate a URL using an array of objects for a route with required and default parameters', t => {
    let event = { id: 1, name: 'World Series' };
    let venue = { id: 2, name: 'Rogers Centre' };

    t.is(route('translateEvents.venues.show', [event, venue]).url(), 'https://ziggy.dev/en/events/1/venues/2');
});

test('generate a URL using a mixed array of objects and scalar parameters for a route with required parameters', t => {
    let venue = { id: 2, name: 'Rogers Centre' };

    t.is(route('events.venues.show', [1, venue]).url(), 'https://ziggy.dev/events/1/venues/2');
});

test('generate a URL using a mixed array of objects and scalar parameters for a route with required and default parameters', t => {
    let venue = { id: 2, name: 'Rogers Centre' };

    t.is(route('translateEvents.venues.show', [1, venue]).url(), 'https://ziggy.dev/en/events/1/venues/2');
});

test('generate a URL for a route with required domain parameters', t => {
    t.is(route('team.user.show', { team: 'tighten', id: 1 }).url(), 'https://tighten.ziggy.dev/users/1');
});

test('generate a URL for a route with required domain parameters and default parameters', t => {
    t.is(route('translateTeam.user.show', { team: 'tighten', id: 1 }).url(), 'https://tighten.ziggy.dev/en/users/1');
});

// @todo #307
// test('generate a URL for a route with a custom route model binding scope', t => {
//     t.is(
//         route('postComments.show', [
//             { id: 1, title: 'Post' },
//             { uuid: 12345, title: 'Comment' }
//         ]).url(),
//         'https://ziggy.dev/posts/1/comments/12345'
//     );

//     t.is(
//         route('postComments.show', [
//             { id: 1, post: 'Post' },
//             { uuid: 12345, comment: 'Comment' }
//         ]).url(),
//         'https://ziggy.dev/posts/1/comments/12345'
//     );
// });

test('return base URL if path is "/"', t => {
    t.is(route('home').url(), 'https://ziggy.dev/');
});

// @todo duplicate
test('skip an optional parameter', t => {
    t.is(route('optional', { id: 123 }).url(), 'https://ziggy.dev/optional/123');
});

test('skip an optional parameter explicitly set to `null`', t => {
    t.is(route('optional', { id: 123, slug: null }).url(), 'https://ziggy.dev/optional/123');
});

// @todo why?
test('accept an optional parameter', t => {
    t.is(route('optional', { id: 123, slug: 'news' }).url(), 'https://ziggy.dev/optional/123/news');
});

test('error if a route name doesn’t exist', t => {
    t.throws(() => route('unknown-route').url(), { message: /route 'unknown-route' is not found in the route list/ });
});

// @todo duplicate
test('accept query string parameters as keyed values in a parameters object', t => {
    t.is(
         route('events.venues.show', {
            event: 1,
            venue: 2,
            search: 'rogers',
            page: 2
        }).url(),
        'https://ziggy.dev/events/1/venues/2?search=rogers&page=2'
    );

    t.is(
        route('events.venues.show', {
            id: 2,
            event: 1,
            venue: 2,
            search: 'rogers',
        }).url(),
        'https://ziggy.dev/events/1/venues/2?id=2&search=rogers'
    );
});

test('accept query string parameters as keyed values using .withQuery()', t => {
    t.is(
        route('events.venues.show', [1, 2]).withQuery({
            search: 'rogers',
            page: 2,
            id: 20,
        }).url(),
        'https://ziggy.dev/events/1/venues/2?search=rogers&page=2&id=20'
    );
});

test('generate a URL with a port for a route without parameters', t => {
    global.Ziggy.baseUrl = 'https://ziggy.dev:81/';
    global.Ziggy.baseDomain = 'ziggy.dev';
    global.Ziggy.basePort = 81;

    t.is(route('posts.index').url(), 'https://ziggy.dev:81/posts');
});

test('generate a URL with a port for a route with required domain parameters', t => {
    global.Ziggy.baseUrl = 'https://ziggy.dev:81/';
    global.Ziggy.baseDomain = 'myapp.dev';
    global.Ziggy.basePort = 81;

    t.is(route('team.user.show', { team: 'tighten', id: 1 }).url(), 'https://tighten.ziggy.dev:81/users/1');
});

test('handle trailing path segments in the base URL', t => {
    global.Ziggy.baseUrl = 'https://test.thing/ab/cd/';

    t.is(route('events.venues.index', 1).url(), 'https://test.thing/ab/cd/events/1/venues');
});

test('URL-encode named parameters', t => {
    global.Ziggy.baseUrl = 'https://test.thing/ab/cd/';

    t.is(route('events.venues.index', { event: 'Fun&Games' }).url(), 'https://test.thing/ab/cd/events/Fun%26Games/venues');
    t.is(
        route('events.venues.index', {
            event: 'Fun&Games',
            location: 'Brews&Clues',
        }).url(),
        'https://test.thing/ab/cd/events/Fun%26Games/venues?location=Brews%26Clues'
    );
});

test('accept and format an array as a query parameter', t => {
    t.is(
        route('events.venues.index', {
            event: 'test',
            guests: ['a', 'b', 'c'],
        }).url(),
        'https://ziggy.dev/events/test/venues?guests[0]=a&guests[1]=b&guests[2]=c'
    );
});

test('ignore query parameters explicitly set to `null`', t => {
    t.is(route('posts.index', { filled: 'filling', empty: null }).url(), 'https://ziggy.dev/posts?filled=filling');
});

test('don’t ignore a parameter explicity set to `0`', t => {
    t.is(route('posts.update', 0).url(), 'https://ziggy.dev/posts/0');
});

test('accept a custom Ziggy configuration object', t => {
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

    t.is(
        route('tightenDev.packages.index', { dev: 1 }, true, customZiggy).url(),
        'http://notYourAverage.dev/tightenDev/1/packages'
    );
});

test('remove braces and question marks from route parameter definitions', t => {
    t.is(route().trimParam('optional'), 'optional');
    t.is(route().trimParam('{id}'), 'id');
    t.is(route().trimParam('{id?}'), 'id');
    t.is(route().trimParam('{slug?}'), 'slug');
});

test('extract named parameters from a URL using a template and delimiter', t => {
    t.deepEqual(route().extractParams('', '', '/'), {});
    t.deepEqual(route().extractParams('posts', 'posts', '/'), {});

    t.deepEqual(route().extractParams('users/1', 'users/{id}', '/'), { id: '1' });
    t.deepEqual(
        route().extractParams('events/1/venues/2', 'events/{event}/venues/{venue}', '/'),
        { event: '1', venue: '2' }
    );
    t.deepEqual(
        route().extractParams('optional/123', 'optional/{id}/{slug?}', '/'),
        { id: '123' }
    );
    t.deepEqual(
        route().extractParams('optional/123/news', 'optional/{id}/{slug?}', '/'),
        { id: '123', slug: 'news' }
    );

    t.deepEqual(
        route().extractParams('tighten.myapp.dev', '{team}.myapp.dev', '.'),
        { team: 'tighten' }
    );
});

test('generate URL for an app installed in a subfolder', t => {
    global.Ziggy.baseUrl = 'https://ziggy.dev/subfolder/';

    global.window.location.href = 'http://ziggy.dev/subfolder/ph/en/products/4';
    global.window.location.hostname = 'ziggy.dev';
    global.window.location.pathname = '/subfolder/ph/en/products/4';

    t.deepEqual(route().params, { country: 'ph', language: 'en', id: '4' });
});

// @todo why?
test('merge named parameters extracted from the domain and the URL', t => {
    global.window.location.href = 'http://tighten.ziggy.dev/users/1';
    global.window.location.hostname = 'tighten.ziggy.dev';
    global.window.location.pathname = '/users/1';

    t.deepEqual(route().params, { team: 'tighten', id: '1' });

    global.window.location.href = `https://${global.Ziggy.baseDomain}/posts/1`;
    global.window.location.hostname = global.Ziggy.baseDomain;
    global.window.location.pathname = '/posts/1';

    t.deepEqual(route().params, { post: '1' });

    global.window.location.href = 'https://ziggy.dev/events/1/venues/2';
    global.window.location.pathname = '/events/1/venues/2';

    t.deepEqual(route().params, { event: '1', venue: '2' });
});

import test from 'ava';
import route from '../../src/js/route.js';

global.Ziggy.namedRoutes['hosting-contacts.index'] = {
    uri: 'hosting-contacts',
    methods: ['GET'],
};

test('get the current route name', t => {
    global.window.location.pathname = '/events/1/venues/2';

    t.is(route().current(), 'events.venues.show');
});

test('check the current route name against a pattern', t => {
    global.window.location.pathname = '/events/1/venues/2';

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

    global.window.location.pathname = '/hosting-contacts';

    t.true(route().current('hosting-contacts.index'));
    t.true(route().current('*.index'));
    // https://github.com/tightenco/ziggy/pull/296
    t.false(route().current('hosting.*'));
});

test('check the current route name on a route with omitted optional parameters', t => {
    global.window.location.pathname = '/optional/1';

    t.true(route().current('optional'));
});

test('check the current route name on a route with provided optional parameters', t => {
    global.window.location.pathname = '/optional/1/foo';

    t.true(route().current('optional'));
});

test('get the current route name on a route with multiple allowed HTTP methods', t => {
    global.window.location.pathname = '/posts/1';

    t.is(route().current(), 'posts.show');
});

test('ignore routes that dont allow GET requests', t => {
    global.window.location.pathname = '/posts/1';

    t.false(route().current('posts.update'));
});

test('ignore trailing slashes', t => {
    global.window.location.pathname = '/events/1/venues/';

    t.is(route().current(), 'events.venues.index');
});

test('get the current route name with a missing protocol', t => {
    global.window.location.protocol = '';

    t.is(route().current(), 'events.venues.index');
});

test('get the current route name with a missing global Ziggy object', t => {
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

    t.is(route(undefined, undefined, undefined, customZiggy).current(), 'events.index');
});

// @todo
// test('ignore query parameters', t => {
//     global.window.location.pathname = '/events/1/venues?foo=2';

//     t.is(route().current(), 'events.venues.index');
// });

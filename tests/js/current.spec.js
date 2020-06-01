import test from 'ava';
import route from '../../src/js/route.js';

global.window = {
    location: {
        hostname: 'ziggy.dev',
    },
};

global.Ziggy = {
    baseUrl: 'https://ziggy.dev',
    namedRoutes: {
        'events.venues.show': {
            uri: 'events/{event}/venues/{venue}',
            methods: ['GET', 'HEAD'],
        },
        'events.venues.index': {
            uri: 'events/{event}/venues',
            methods: ['GET', 'HEAD'],
        },
        'posts.update': {
            uri: 'posts/{post}',
            methods: ['PUT'],
        },
        'posts.show': {
            uri: 'posts/{post}',
            methods: ['GET', 'HEAD'],
        },
        'hosting-contacts.index': {
            uri: 'hosting-contacts',
            methods: ['GET'],
        },
        optional: {
            uri: 'optional/{id}/{slug?}',
            methods: ['GET', 'HEAD'],
        },
    },
};

test.beforeEach(t => {
    global.window.location.pathname = '';
});

test('get name of current route', t => {
    global.window.location.pathname = '/events/1/venues/2';

    t.is(route().current(), 'events.venues.show');
});

test('check if current route name matches pattern', t => {
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

test('check current route name for route with omitted optional parameters', t => {
    global.window.location.pathname = '/optional/1';

    t.true(route().current('optional'));
});

test('check current route name for route with provided optional parameters', t => {
    global.window.location.pathname = '/optional/1/foo';

    t.true(route().current('optional'));
});

test('get current route name for route with multiple HTTP methods', t => {
    global.window.location.pathname = '/posts/1';

    t.is(route().current(), 'posts.show');
});

test('ignore routes without GET method when checking current route', t => {
    global.window.location.pathname = '/posts/1';

    t.false(route().current('posts.update'));
});

test('ignore trailing slashes when checking current route', t => {
    global.window.location.pathname = '/events/1/venues/';

    t.is(route().current(), 'events.venues.index');
});

test('ignore query parameters when checking current route', t => {
    global.window.location.pathname = '/events/1/venues?foo=2';

    t.is(route().current(), 'events.venues.index');
});

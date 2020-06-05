import test from 'ava';
import route from '../../src/js/route.js';

global.Ziggy = {
    baseUrl: 'https://ziggy.dev',
    namedRoutes: {
        'posts.show': {
            uri: 'posts/{post}',
            methods: ['GET', 'HEAD'],
        },
    },
};

test('check if given named route exists', t => {
    t.true(route().check('posts.show'));
    t.false(route().check('non.existing.route'));
});

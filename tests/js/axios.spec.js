import test from 'ava';
import route from '../../src/js/route.js';
import axios from 'axios';
import moxios from 'moxios';

global.Ziggy.namedRoutes = {
    'posts.index': {
        uri: 'posts',
        methods: ['GET', 'HEAD'],
        domain: null
    },
    'posts.show': {
        uri: 'posts/{post}',
        methods: ['GET', 'HEAD'],
    },
};

test.beforeEach(t => moxios.install());
test.afterEach(t => moxios.uninstall());

test('make axios call using route()', t => {
    moxios.stubRequest('https://ziggy.dev/posts/1', { status: 200 });

    axios.get(route('posts.show', 1))
        .then(response => t.is(response.status, 200))
        .catch(error => { throw error; });
});

test('make axios call using route() and passing parameters', t => {
    moxios.stubRequest('https://ziggy.dev/posts', { status: 200 });

    axios.get(route('posts.index'), {
            page: 2,
            params: { thing: 'thing' }
        })
        .then(response => t.is(response.status, 200))
        .catch(error => { throw error; });
});

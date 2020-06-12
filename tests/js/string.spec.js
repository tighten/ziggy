import test from 'ava';
import route from '../../src/js/route.js';

test('router class is a string', t => {
    t.is(route('posts.index') + '', 'https://ziggy.dev/posts');
    t.is(String(route('posts.index')), 'https://ziggy.dev/posts');
    t.is(route('posts.index').toString(), 'https://ziggy.dev/posts');
});

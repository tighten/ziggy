import test from 'ava';
import route from '../../src/js/route.js';

test('append extra parameter object entries as query parameters', t => {
    t.is(
        route('translatePosts.index', { someOtherKey: 123 }).url(),
        'https://ziggy.dev/en/posts?someOtherKey=123'
    );
});

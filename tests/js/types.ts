import route from '../../src/js';

declare module '../../src/js' {
    interface RouteList {
        'posts.index': [],
        'posts.comments.store': [{ name: 'x' }],
        'posts.comments.show': [{ name: 'post' }, { name: 'comment', binding: 'uuid' }],
        'optional': [{ name: 'maybe' }],
    }
}

// Test route name autocompletion
route();

// Test route parameter name autocompletion
route('posts.comments.store', {});

// TODO once we can detect whether params are required/optional @ts-expect-error missing required 'post' parameter
route('posts.comments.show', { comment: 2 });

// TODO once we can detect whether params are required/optional @ts-expect-error missing required 'comment' parameter
route('posts.comments.show', { post: 2 });

route('posts.comments.show', { post: 2, comment: 9 });
// Allows random extra object properties
route('posts.comments.show', { post: 2, comment: 9, foo: 'bar' });
// Allows any property order
route('posts.comments.show', { comment: 2, post: 9 });
// Allows random extra nested object properties
route('posts.comments.show', { post: { id: 2, foo: 'bar' } });

route('posts.comments.show', { post: { id: 1, foo: 'bar' } });
// @ts-expect-error missing 'id' key in post parameter object
route('posts.comments.show', { post: { foo: 'bar' } });

route('posts.comments.show', { comment: { uuid: 1, foo: 'bar' } });
// @ts-expect-error missing 'uuid' key in comment parameter object
route('posts.comments.show', { comment: { foo: 'bar' } });
// @ts-expect-error missing 'uuid' key in comment parameter object
// 'id' doesn't fix it because 'id' is the default/fallback but this
// parameter has an explicity 'uuid' binding, so it's required
route('posts.comments.show', { comment: { id: 2 } });

route('posts.comments.show', [2, { uuid: 3 }]);
route('posts.comments.show', [{ id: 2 }, 3]);
route('posts.comments.show', [{ id: 2 }, { uuid: 3 }]);

// @ts-expect-error missing 'id' in post parameter object
route('posts.comments.show', [{ x: 2 }, { uuid: 3 }]);
// @ts-expect-error missing 'uuid' key in comment parameter object
route('posts.comments.show', [{ id: 2 }, { id: 3 }]);

route('posts.comments.show', [{ id: 2 }, { uuid: 3 }, { x: 'y' }]);
route('posts.comments.show', ['foo', 'bar']);
route('posts.comments.show', [{ id: 2 }, 'bar']);
route('posts.comments.show', [1, 'foo', 3]);

// Test router method autocompletion
route().has('x');

// Test router getter autocompletion
route().params.x

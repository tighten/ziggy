import { route } from './entry';

const Ziggy = {
    url: 'foo',
    absolute: false,
    defaults: {},
    routes: {
        home: {
            uri: '/',
            methods: ['GET'],
        },
        posts: {
            uri: 'blog',
            methods: ['GET'],
        },
    },
};

route('home');
// @ts-expect-error
route('users');

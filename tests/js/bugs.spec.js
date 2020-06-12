import test from 'ava';
import route from '../../src/js/route.js';

global.Ziggy.namedRoutes = {
    ...global.Ziggy.namedRoutes,
    'filter': {
        uri: 'stuff/{filter?}',
        methods: ['GET', 'HEAD'],
    },
};

test('dont incorrectly use `Array.filter` as the default value for a parameter named "filter"', t => {
    t.is(route('filter').url(), 'https://ziggy.dev/stuff');
});

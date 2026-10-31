import { assertType, expectTypeOf } from 'vitest';
import {
    Config,
    prepareRoutes,
    route,
    Router,
    RouteScopeConfig,
    RouteUrl,
    useRoute,
    ZiggyVue,
} from '../../src/js';

const config: Config = {
    url: 'https://example.test',
    port: null,
    defaults: {},
    routes: { 'posts.show': { uri: 'posts/{post}', methods: ['GET'] } },
    location: new URL('https://example.test/posts/42'),
};
const createRoute = prepareRoutes(config.routes);
const scope: RouteScopeConfig = {
    url: config.url,
    port: config.port,
    defaults: {},
    location: new URL('https://example.test'),
};
const scoped = createRoute(scope);
expectTypeOf(scoped).toEqualTypeOf<typeof route>();
assertType<Router>(scoped());
assertType<RouteUrl>(scoped('posts.index'));
assertType<RouteUrl>(scoped('posts.comments.show', { post: 1 }));
// @ts-expect-error required generated route parameter remains required
scoped('posts.comments.show', { comment: 1 });
assertType<Router>(scoped(undefined, undefined, false));
assertType<RouteUrl>(scoped('posts.index', undefined, true, config));
expectTypeOf(useRoute(scoped)).toEqualTypeOf<typeof route>();
ZiggyVue.install({}, scoped);
// @ts-expect-error explicit location is required for every scope
createRoute({ url: 'https://example.test', port: null, defaults: {} });
// @ts-expect-error a scope cannot replace its prepared routes
createRoute({ ...scope, routes: config.routes });

// Preparation owns a copy and accepts generated definitions declared `as const`.
const immutableRoutes = {
    'posts.show': {
        uri: 'posts/{post}',
        methods: ['GET'],
        parameters: ['post'],
        middleware: ['web'],
    },
} as const;
assertType<typeof route>(prepareRoutes(immutableRoutes)(scope));

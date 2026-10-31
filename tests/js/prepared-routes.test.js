import { afterEach, describe, expect, test, vi } from 'vitest';
import { prepareRoutes, route, useRoute, ZiggyVue } from '../../src/js/index.js';
import Route from '../../src/js/Route.js';

const definition = (uri, extra = {}) => ({ uri, methods: ['GET', 'HEAD'], ...extra });
const context = (path = '/posts/42?filter[tags][]=a', extra = {}) => ({
    url: 'https://example.test',
    port: null,
    defaults: {},
    location: new URL(`https://example.test${path}`),
    ...extra,
});
const inspect = (r) => ({
    current: r.current(),
    params: r.params,
    routeParams: r.routeParams,
    queryParams: r.queryParams,
    exact: r.current('posts.show', { post: 42 }),
    wildcard: r.current('posts.*'),
});

afterEach(() => vi.restoreAllMocks());

describe('prepared routes', () => {
    test('shares one registry without reading or copying it again for each scope', () => {
        let reads = 0;
        const routes = {
            get 'posts.show'() {
                reads++;
                return definition('posts/{post}');
            },
        };
        const createRoute = prepareRoutes(routes);
        expect(reads).toBe(1);
        for (let i = 0; i < 20; i++) {
            const scoped = createRoute(context(`/posts/${i}`));
            expect(scoped().params.post).toBe(String(i));
        }
        expect(reads).toBe(1);
    });

    test('reuses reverse resolution across fresh Routers and all public getters', () => {
        const scoped = prepareRoutes({ 'posts.show': definition('posts/{post}') })(context());
        const matches = vi.spyOn(Route.prototype, 'matchesUrl');
        for (let i = 0; i < 50; i++) expect(inspect(scoped())).toEqual(inspect(scoped()));
        expect(matches).toHaveBeenCalledTimes(1);
    });

    test('named generation uses defaults and model bindings without reverse lookup', () => {
        const scoped = prepareRoutes({
            'posts.show': definition('{locale}/posts/{post}', { bindings: { post: 'slug' } }),
        })(context('/en/posts/hello', { defaults: { locale: 'en' } }));
        const matches = vi.spyOn(Route.prototype, 'matchesUrl');
        expect(scoped('posts.show', { post: { slug: 'hello' }, page: 2 })).toBe(
            'https://example.test/en/posts/hello?page=2',
        );
        expect(matches).not.toHaveBeenCalled();
    });

    test.each([
        [
            'URI edit',
            (r) => {
                r['posts.show'].uri = 'elsewhere';
            },
        ],
        [
            'methods edit',
            (r) => {
                r['posts.show'].methods = ['POST'];
            },
        ],
        [
            'constraint edit',
            (r) => {
                r['posts.show'].wheres.post = '[a-z]+';
            },
        ],
        [
            'deletion',
            (r) => {
                delete r['posts.show'];
            },
        ],
    ])('%s requires preparing a new registry; ordinary helpers remain mutable', (_, mutate) => {
        const routes = { 'posts.show': definition('posts/{post}', { wheres: { post: '[0-9]+' } }) };
        const createRoute = prepareRoutes(routes);
        const input = context();
        const scoped = createRoute(input);
        expect(scoped().current()).toBe('posts.show');
        mutate(routes);
        expect(scoped().current()).toBe('posts.show');
        expect(createRoute(input)().current()).toBe('posts.show');
        expect(prepareRoutes(routes)(input)().current()).toBeUndefined();
        expect(route(undefined, undefined, true, { ...input, routes }).current()).toBeUndefined();
    });

    test('adding a route after a cached miss requires preparing a new registry', () => {
        const routes = {};
        const createRoute = prepareRoutes(routes);
        const scoped = createRoute(context());
        expect(scoped().current()).toBeUndefined();
        routes['posts.show'] = definition('posts/{post}');
        expect(scoped().current()).toBeUndefined();
        expect(createRoute(context())().current()).toBeUndefined();
        expect(prepareRoutes(routes)(context())().current()).toBe('posts.show');
        expect(route(undefined, undefined, true, { ...context(), routes }).current()).toBe(
            'posts.show',
        );
    });

    test('returned parameters and nested query data never alias the cached result', () => {
        const scoped = prepareRoutes({ 'posts.show': definition('posts/{post}') })(context());
        scoped().routeParams.post = 'wrong';
        scoped().queryParams.filter.tags.push('wrong');
        scoped().params.filter.tags.push('also-wrong');
        expect(scoped().routeParams.post).toBe('42');
        expect(scoped().queryParams.filter.tags).toEqual(['a']);
        expect(scoped().current('posts.show', { post: 42 })).toBe(true);
    });

    test('snapshots request origin, defaults, and location independently of the registry', () => {
        const createRoute = prepareRoutes({ 'posts.show': definition('{locale}/posts/{post}') });
        const input = context('/en/posts/42', { defaults: { locale: 'en' } });
        const first = createRoute(input);
        input.url = 'https://other.test';
        input.defaults.locale = 'fr';
        input.location.pathname = '/fr/posts/7';
        expect(first('posts.show', 42)).toBe('https://example.test/en/posts/42');
        expect(first().params).toEqual({ locale: 'en', post: '42' });
        const next = createRoute(input);
        expect(next('posts.show', 7)).toBe('https://other.test/fr/posts/7');
        expect(next().current()).toBeUndefined(); // explicit host still example.test
        input.location.host = 'other.test';
        expect(createRoute(input)().params).toEqual({ locale: 'fr', post: '7' });
    });

    test('normalizes relative explicit URLs with each scope host', () => {
        const createRoute = prepareRoutes({
            a: definition('posts/{post}', { domain: 'a.test' }),
            b: definition('posts/{post}', { domain: 'b.test' }),
        });
        const a = createRoute(
            context('/posts/42', { location: new URL('https://a.test/posts/42') }),
        );
        const b = createRoute(
            context('/posts/42', { location: new URL('https://b.test/posts/42') }),
        );
        expect(a()._unresolve('/posts/42').name).toBe('a');
        expect(b()._unresolve('/posts/42').name).toBe('b');
    });

    test('does not fall back to browser location when explicit fields are absent', () => {
        vi.stubGlobal('window', { location: new URL('https://example.test/posts/42') });
        try {
            const scoped = prepareRoutes({ 'posts.show': definition('posts/{post}') })(
                context('/', { location: {} }),
            );
            expect(scoped().current()).toBeUndefined();
        } finally {
            vi.unstubAllGlobals();
        }
    });

    test('preserves own __proto__ keys without exposing prepared metadata', () => {
        const routes = JSON.parse('{"__proto__":{"uri":"posts/{post}","methods":["GET"]}}');
        const scoped = prepareRoutes(routes)(context());
        expect(scoped().current()).toBe('__proto__');
        expect(scoped().has('__proto__')).toBe(true);
        scoped()._unresolve().route.uri = 'changed';
        expect(scoped().current()).toBe('__proto__');
        expect(scoped('__proto__', 42)).toBe('https://example.test/posts/42');
        expect(Object.prototype.uri).toBeUndefined();
    });

    test('retains only the last URL result and partitions absolute/relative mode', () => {
        const scoped = prepareRoutes({ 'posts.show': definition('posts/{post}') })(context());
        const matches = vi.spyOn(Route.prototype, 'matchesUrl');
        scoped()._unresolve('/posts/1');
        scoped()._unresolve('/posts/1');
        expect(matches).toHaveBeenCalledTimes(1);
        for (let i = 2; i <= 100; i++) scoped()._unresolve(`/posts/${i}`);
        scoped()._unresolve('/posts/1');
        expect(matches).toHaveBeenCalledTimes(101);
        scoped(undefined, undefined, false)._unresolve('/posts/1');
        expect(matches).toHaveBeenCalledTimes(102);
    });

    test('explicit configuration overrides bypass the prepared scope cache', () => {
        const scoped = prepareRoutes({ 'posts.show': definition('posts/{post}') })(context());
        expect(scoped().current()).toBe('posts.show');
        const override = { ...context('/other'), routes: { other: definition('other') } };
        expect(scoped(undefined, undefined, true, override).current()).toBe('other');
        override.routes.other.uri = 'changed';
        expect(scoped(undefined, undefined, true, override).current()).toBeUndefined();
        expect(scoped().current()).toBe('posts.show');
    });

    test('isolates asynchronously interleaved requests sharing a prepared registry', async () => {
        const createRoute = prepareRoutes({ 'posts.show': definition('{locale}/posts/{post}') });
        await Promise.all(
            Array.from({ length: 32 }, async (_, i) => {
                const input = context(`/locale-${i}/posts/${i}?request=${i}`, {
                    url: `https://host-${i}.test`,
                    defaults: { locale: `locale-${i}` },
                    location: new URL(`https://host-${i}.test/locale-${i}/posts/${i}?request=${i}`),
                });
                const scoped = createRoute(input);
                expect(scoped().current()).toBe('posts.show');
                await new Promise((resolve) => setTimeout(resolve, i % 3));
                expect(scoped().params).toEqual({
                    locale: `locale-${i}`,
                    post: String(i),
                    request: String(i),
                });
                expect(scoped('posts.show', i)).toBe(
                    `https://host-${i}.test/locale-${i}/posts/${i}`,
                );
            }),
        );
    });

    test.each([
        ['optional absent', 'posts/{post?}', '/posts', {}],
        ['Unicode fallback', 'café/{post}', '/caf%C3%A9/42', {}],
        ['encoded slash', 'posts/{post}', '/posts/a%2Fb', {}],
        ['constraints', 'posts/{post}', '/posts/abc', { wheres: { post: '[0-9]+' } }],
        ['POST route', 'posts/{post}', '/posts/42', { methods: ['POST'] }],
        ['subpath', 'posts/{post}', '/app/posts/42', {}],
    ])('preserves matching semantics: %s', (_, uri, path, extra) => {
        const routes = { 'posts.show': definition(uri, extra) };
        const input = context(path, {
            url: path.startsWith('/app') ? 'https://example.test/app' : 'https://example.test',
        });
        const scoped = prepareRoutes(routes)(input);
        for (const absolute of [true, false]) {
            expect(inspect(scoped(undefined, undefined, absolute))).toEqual(
                inspect(route(undefined, undefined, absolute, { ...input, routes })),
            );
        }
    });

    test('preserves domain parameters, ports, precedence and fallback ordering', () => {
        const routes = {
            post: definition('posts/{post}', { domain: '{team}.example.test' }),
            duplicate: definition('posts/{post}', { domain: '{team}.example.test' }),
            fallback: definition('{all}', { wheres: { all: '.*' } }),
        };
        const input = context('/posts/42', {
            url: 'https://example.test:8443',
            port: 8443,
            location: new URL('https://team.example.test:8443/posts/42'),
        });
        const scoped = prepareRoutes(routes)(input);
        expect(scoped().current()).toBe('post');
        expect(scoped().routeParams).toEqual({ team: 'team', post: '42' });
        expect(scoped('post', { team: 'team', post: 42 })).toBe(
            'https://team.example.test:8443/posts/42',
        );
    });

    test('does not cache exceptions or change malformed-URI behavior', () => {
        const scoped = prepareRoutes({ 'posts.show': definition('posts/{post}') })(
            context('/posts/%c0'),
        );
        for (let i = 0; i < 2; i++) expect(() => scoped().current()).toThrow(URIError);
        expect(scoped()._unresolve('/posts/42').params.post).toBe('42');
    });

    test('requires an explicit location and rejects unsupported or cyclic manifest data', () => {
        const createRoute = prepareRoutes({});
        expect(() =>
            createRoute({ url: 'https://example.test', port: null, defaults: {} }),
        ).toThrow(/location/);
        const cyclic = {};
        cyclic.self = cyclic;
        expect(() => prepareRoutes(cyclic)).toThrow(TypeError);
        expect(() => prepareRoutes({ bad: new Date() })).toThrow(TypeError);
        expect(() => prepareRoutes({ bad: () => {} })).toThrow(TypeError);
    });

    test('can pass a scoped helper to the existing React hook and Vue plugin', () => {
        const scoped = prepareRoutes({ 'posts.show': definition('posts/{post}') })(context());
        expect(useRoute(scoped)).toBe(scoped);
        const app = { version: '3.0', config: { globalProperties: {} }, provide: vi.fn() };
        ZiggyVue.install(app, scoped);
        expect(app.config.globalProperties.route).toBe(scoped);
        expect(app.provide).toHaveBeenCalledWith('route', scoped);
        expect(app.config.globalProperties.route().current()).toBe('posts.show');
        const legacy = { version: '2.0', mixin: vi.fn() };
        ZiggyVue.install(legacy, scoped);
        expect(legacy.mixin.mock.calls[0][0].methods.route).toBe(scoped);
    });
});

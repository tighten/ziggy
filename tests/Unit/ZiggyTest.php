<?php

use Tighten\Ziggy\Ziggy;


beforeEach(function () {
    $router = app('router');

    $router->get('home', fn () => '')->name('home');
    $router->get('posts', fn () => '')->name('posts.index');
    $router->get('posts/{post}', fn () => '')->name('posts.show');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->post('posts', fn () => '')->middleware(['auth', 'role:admin'])->name('posts.store');
    $router->get('admin/users', fn () => '')->middleware(['role:admin'])->name('admin.users.index');
    $router->get('/posts/{post}/comments/{comment:uuid}', fn () => '')->name('postComments.show');

    $router->getRoutes()->refreshNameLookups();
});

test('can filter to only include routes matching a pattern', function () {
    $ziggy = new Ziggy;
    $routes = $ziggy->filter(['posts.s*', 'home'], true);

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
        ],
    ];

    expect($routes->toArray()['routes'])->toBe($expected);
});

test('can filter to exclude routes matching a pattern', function () {
    $ziggy = new Ziggy;
    $routes = $ziggy->filter(['posts.s*', 'home', 'admin.*'], false);

    $expected = [
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'postComments.show' => [
            'uri' => 'posts/{post}/comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post', 'comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
    ];

    expect($routes->toArray()['routes'])->toBe($expected);
});

test('can set included routes using only config', function () {
    config(['ziggy.only' => ['posts.s*', 'home']]);
    $routes = (new Ziggy)->toArray()['routes'];

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('can set excluded routes using except config', function () {
    config(['ziggy.except' => ['posts.s*', 'home', 'admin.*']]);
    $routes = (new Ziggy)->toArray()['routes'];

    $expected = [
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'postComments.show' => [
            'uri' => 'posts/{post}/comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post', 'comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('returns unfiltered routes when both only and except configs set', function () {
    config([
        'ziggy.except' => ['posts.s*'],
        'ziggy.only' => ['home'],
    ]);
    $routes = (new Ziggy)->toArray()['routes'];

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
        ],
        'admin.users.index' => [
            'uri' => 'admin/users',
            'methods' => ['GET', 'HEAD'],
        ],
        'postComments.show' => [
            'uri' => 'posts/{post}/comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post', 'comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('can set included routes using groups config', function () {
    config(['ziggy.groups' => ['authors' => ['home', 'posts.*']]]);
    $routes = (new Ziggy('authors'))->toArray()['routes'];

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('can include routes from multiple groups', function () {
    config(['ziggy.groups' => ['home' => ['home'], 'posts' => ['posts.*']]]);
    $routes = (new Ziggy(['home', 'posts']))->toArray()['routes'];

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('can set excluded routes in groups using negative patterns', function () {
    config(['ziggy.groups' => ['authors' => ['!home', '!posts.*', '!postComments.*']]]);
    $routes = (new Ziggy('authors'))->toArray()['routes'];

    $expected = [
        'admin.users.index' => [
            'uri' => 'admin/users',
            'methods' => ['GET', 'HEAD'],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('can combine filters in groups with positive and negative patterns', function () {
    config(['ziggy.groups' => ['authors' => ['posts.*', '!posts.index']]]);
    $routes = (new Ziggy('authors'))->toArray()['routes'];

    $expected = [
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('can filter routes from multiple groups using negative patterns', function () {
    config(['ziggy.groups' => ['home' => '!posts.*', 'posts' => '!home']]);
    $routes = (new Ziggy(['home', 'posts']))->toArray()['routes'];

    $expected = [
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'admin.users.index' => [
            'uri' => 'admin/users',
            'methods' => ['GET', 'HEAD'],
        ],
        'postComments.show' => [
            'uri' => 'posts/{post}/comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post', 'comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('can ignore passed group not set in config', function () {
    // The 'authors' group doesn't exist
    $routes = (new Ziggy('authors'))->toArray()['routes'];

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
        ],
        'admin.users.index' => [
            'uri' => 'admin/users',
            'methods' => ['GET', 'HEAD'],
        ],
        'postComments.show' => [
            'uri' => 'posts/{post}/comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post', 'comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('can include middleware', function () {
    config(['ziggy.middleware' => true]);
    $routes = (new Ziggy)->toArray()['routes'];

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
            'middleware' => ['auth', 'role:admin'],
        ],
        'admin.users.index' => [
            'uri' => 'admin/users',
            'methods' => ['GET', 'HEAD'],
            'middleware' => ['role:admin'],
        ],
        'postComments.show' => [
            'uri' => 'posts/{post}/comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post', 'comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
    ];

    expect($routes)->toEqual($expected);
});

test('can include subdomain', function () {
    app('router')->domain('{team}.ziggy.dev')->post('/', function () {
        return response()->json(new Ziggy);
    })->name('home');
    app('router')->getRoutes()->refreshNameLookups();

    $this->post(route('home', ['team' => 'tgtn']))
        ->assertJson([
            'url' => 'http://tgtn.ziggy.dev',
        ]);
});

test('can include port', function () {
    app('router')->post('/', function () {
        return response()->json(new Ziggy);
    })->name('home');
    app('router')->getRoutes()->refreshNameLookups();

    $this->post('http://ziggy.dev:3000')
        ->assertJson([
            'url' => 'http://ziggy.dev:3000',
            'port' => 3000,
        ]);
});

test('can include wheres', function () {
    app('router')->post('slashes/{slug}', function () {
        return response()->json(new Ziggy);
    })->where('slug', '.*')->name('slashes');
    app('router')->getRoutes()->refreshNameLookups();

    $this->post('http://ziggy.dev/slashes/foo/bar')
        ->assertJson([
            'routes' => [
                'slashes' => [
                    'uri' => 'slashes/{slug}',
                    'wheres' => [
                        'slug' => '.*',
                    ],
                ],
            ],
        ]);
});

test('can include only middleware set in config', function () {
    config(['ziggy.middleware' => ['auth']]);
    $routes = (new Ziggy)->toArray()['routes'];

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
            'middleware' => ['auth'],
        ],
        'admin.users.index' => [
            'uri' => 'admin/users',
            'methods' => ['GET', 'HEAD'],
        ],
        'postComments.show' => [
            'uri' => 'posts/{post}/comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post', 'comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
    ];

    expect($routes)->toEqual($expected);
});

test('can order fallback routes last', function () {
    app('router')->fallback(fn () => '')->name('fallback');
    app('router')->get('/users', fn () => '')->name('users.index');

    app('router')->getRoutes()->refreshNameLookups();
    $routes = (new Ziggy)->toArray()['routes'];

    $expected = [
        'home' => [
            'uri' => 'home',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
        'posts.show' => [
            'uri' => 'posts/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
        'posts.store' => [
            'uri' => 'posts',
            'methods' => ['POST'],
        ],
        'admin.users.index' => [
            'uri' => 'admin/users',
            'methods' => ['GET', 'HEAD'],
        ],
        'postComments.show' => [
            'uri' => 'posts/{post}/comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post', 'comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
        'users.index' => [
            'uri' => 'users',
            'methods' => ['GET', 'HEAD'],
        ],
        'fallback' => [
            'uri' => '{fallbackPlaceholder}',
            'methods' => ['GET', 'HEAD'],
            'wheres' => [
                'fallbackPlaceholder' => '.*',
            ],
            'parameters' => ['fallbackPlaceholder'],
        ],
    ];

    expect($routes)->toBe($expected);
});

test('route payload can array itself', function () {
    $ziggy = new Ziggy;

    $expected = [
        'url' => 'http://ziggy.dev',
        'port' => null,
        'defaults' => [],
        'routes' => [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'parameters' => ['post'],
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'parameters' => ['post'],
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
            ],
            'admin.users.index' => [
                'uri' => 'admin/users',
                'methods' => ['GET', 'HEAD'],
            ],
            'postComments.show' => [
                'uri' => 'posts/{post}/comments/{comment}',
                'methods' => ['GET', 'HEAD'],
                'parameters' => ['post', 'comment'],
                'bindings' => [
                    'comment' => 'uuid',
                ],
            ],
        ],
    ];

    expect($ziggy->toArray())->toBe($expected);
});

test('route payload can json itself', function () {
    config(['ziggy.only' => ['postComments.*']]);

    $expected = [
        'url' => 'http://ziggy.dev',
        'port' => null,
        'defaults' => [],
        'routes' => [
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'parameters' => ['post'],
            ],
            'postComments.show' => [
                'uri' => 'posts/{post}/comments/{comment}',
                'methods' => ['GET', 'HEAD'],
                'parameters' => ['post', 'comment'],
                'bindings' => [
                    'comment' => 'uuid',
                ],
            ],
        ],
    ];

    $json = '{"url":"http:\/\/ziggy.dev","port":null,"defaults":{},"routes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"parameters":["post"]},"postComments.show":{"uri":"posts\/{post}\/comments\/{comment}","methods":["GET","HEAD"],"parameters":["post","comment"],"bindings":{"comment":"uuid"}}}}';

    expect(json_decode(json_encode(new Ziggy), true))->toBe($expected);
    expect(json_encode(new Ziggy))->toBe($json);
    expect((new Ziggy)->toJson())->toBe($json);
});

test('route payload can automatically json itself in a response', function () {
    config(['ziggy.only' => ['postComments.*']]);

    app('router')->get('json', function () {
        return response()->json(new Ziggy);
    });

    $response = $this->get('json');

    $response->assertSuccessful();
    expect($response->getContent())->toBe((new Ziggy)->toJson());
});

test('can cache compiled route list internally on repeated instantiations', function () {
    $routes = (new Ziggy)->toArray()['routes'];

    app('router')->get('/users', fn () => '')->name('users.index');
    app('router')->getRoutes()->refreshNameLookups();

    expect((new Ziggy)->toArray()['routes'])->toBe($routes);
});

test('optional params inside path', function () {
    app('router')->get('{country?}/test/{language?}/products/{id}', fn () => '')->name('products.show');
    app('router')->getRoutes()->refreshNameLookups();

    expect(route('products.show', ['country' => 'ca', 'language' => 'fr', 'id' => 1]))->toBe('http://ziggy.dev/ca/test/fr/products/1');

    // Optional param in the middle of a path
    expect(route('products.show', ['country' => 'ca', 'id' => 1]))->toBe('http://ziggy.dev/ca/test//products/1');

    // Optional param at the beginning of a path
    expect(route('products.show', ['language' => 'fr', 'id' => 1]))->toBe('http://ziggy.dev/test/fr/products/1');

    // Both
    expect(route('products.show', ['id' => 1]))->toBe('http://ziggy.dev/test//products/1');
});

test('filter route names from nested groups', function () {
    app('router')->get('foo', fn () => '')->name('foo');
    app('router')->name('foo.')->group(function () {
        app('router')->get('foo/bar', fn () => '')->name('bar');
        app('router')->name('bar.')->group(function () {
            app('router')->get('foo/bar/baz', fn () => '')->name('baz');
        });
    });
    app('router')->getRoutes()->refreshNameLookups();

    config(['ziggy.except' => ['foo.bar.*']]);

    expect((new Ziggy)->toArray()['routes'])->toHaveKey('foo');
    expect((new Ziggy)->toArray()['routes'])->toHaveKey('foo.bar');
    $this->assertArrayNotHasKey('foo.bar.baz', (new Ziggy)->toArray()['routes']);

    config(['ziggy.except' => ['foo.*']]);

    expect((new Ziggy)->toArray()['routes'])->toHaveKey('foo');
    $this->assertArrayNotHasKey('foo.bar', (new Ziggy)->toArray()['routes']);
    $this->assertArrayNotHasKey('foo.bar.baz', (new Ziggy)->toArray()['routes']);
});

test('numeric route names', function () {
    app('router')->get('a', fn () => '')->name('a');
    app('router')->get('3', fn () => '')->name('3');
    app('router')->get('b', fn () => '')->name('b');
    app('router')->fallback(fn () => '')->name('404');
    app('router')->getRoutes()->refreshNameLookups();

    config(['ziggy.except' => ['home', 'posts.*', 'postComments.*', 'admin.*']]);

    expect((new Ziggy)->toArray()['routes'])->toBe([
        'a' => [
            'uri' => 'a',
            'methods' => ['GET', 'HEAD'],
        ],
        3 => [
            'uri' => '3',
            'methods' => ['GET', 'HEAD'],
        ],
        'b' => [
            'uri' => 'b',
            'methods' => ['GET', 'HEAD'],
        ],
        404 => [
            'uri' => '{fallbackPlaceholder}',
            'methods' => ['GET', 'HEAD'],
            'wheres' => [
                'fallbackPlaceholder' => '.*',
            ],
            'parameters' => ['fallbackPlaceholder'],
        ],
    ]);
});

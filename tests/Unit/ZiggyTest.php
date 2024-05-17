<?php

use Illuminate\Support\Facades\Route;
use Tighten\Ziggy\Ziggy;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

beforeEach(function () {
    Route::get('home', fn () => '')->name('home');
    Route::get('posts', fn () => '')->name('posts.index');
    Route::get('posts/{post}', fn () => '')->name('posts.show');
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');
    Route::post('posts', fn () => '')->middleware(['auth', 'role:admin'])->name('posts.store');
    Route::get('admin/users', fn () => '')->middleware(['role:admin'])->name('admin.users.index');
    Route::get('/posts/{post}/comments/{comment:uuid}', fn () => '')->name('postComments.show');
});

test('include routes matching a pattern', function () {
    expect((new Ziggy)->filter(['posts.s*', 'home'])->toArray()['routes'])
        ->toHaveCount(3)
        ->toHaveKeys([
            'home',
            'posts.show',
            'posts.store',
        ]);
});

test('exclude routes matching a pattern', function () {
    expect((new Ziggy)->filter(['posts.s*', 'home', 'admin.*'], false)->toArray()['routes'])
        ->toHaveCount(3)
        ->toHaveKeys([
            'posts.index',
            'postComments.index',
            'postComments.show',
        ]);
});

test('include routes using config', function () {
    config(['ziggy.only' => ['posts.s*', 'home']]);

    expect((new Ziggy)->toArray()['routes'])
        ->toHaveCount(3)
        ->toHaveKeys([
            'home',
            'posts.show',
            'posts.store',
        ]);
});

test('exclude routes using config', function () {
    config(['ziggy.except' => ['posts.s*', 'home', 'admin.*']]);

    expect((new Ziggy)->toArray()['routes'])
        ->toHaveCount(3)
        ->toHaveKeys([
            'posts.index',
            'postComments.index',
            'postComments.show',
        ]);
});

test('ignore config filters if both includes and excludes are set', function () {
    config([
        'ziggy.except' => ['posts.s*'],
        'ziggy.only' => ['home'],
    ]);

    expect((new Ziggy)->toArray()['routes'])
        ->toHaveCount(7)
        ->toHaveKeys([
            'home',
            'posts.index',
            'posts.show',
            'postComments.index',
            'posts.store',
            'admin.users.index',
            'postComments.show',
        ]);
});

test('include routes using groups', function () {
    config(['ziggy.groups' => ['authors' => ['home', 'posts.*']]]);

    expect((new Ziggy('authors'))->toArray()['routes'])
        ->toHaveCount(4)
        ->toHaveKeys([
            'home',
            'posts.index',
            'posts.show',
            'posts.store',
        ]);
});

test('include routes from multiple groups', function () {
    config(['ziggy.groups' => ['home' => ['home'], 'posts' => ['posts.*']]]);

    expect((new Ziggy(['home', 'posts']))->toArray()['routes'])
        ->toHaveCount(4)
        ->toHaveKeys([
            'home',
            'posts.index',
            'posts.show',
            'posts.store',
        ]);
});

test('filter routes using negative patterns in groups', function () {
    config(['ziggy.groups' => ['authors' => ['!home', '!posts.*', '!postComments.*']]]);

    expect((new Ziggy('authors'))->toArray()['routes'])
        ->toHaveCount(1)
        ->toHaveKeys(['admin.users.index']);
});

test('filter routes using positive and negative patterns in groups', function () {
    config(['ziggy.groups' => ['authors' => ['posts.*', '!posts.index']]]);

    expect((new Ziggy('authors'))->toArray()['routes'])
        ->toHaveCount(2)
        ->toHaveKeys([
            'posts.show',
            'posts.store',
        ]);
});

test('filter routes from multiple groups using negative patterns', function () {
    config(['ziggy.groups' => ['home' => '!posts.*', 'posts' => '!home']]);

    expect((new Ziggy(['home', 'posts']))->toArray()['routes'])
        ->toHaveCount(3)
        ->toHaveKeys([
            'postComments.index',
            'admin.users.index',
            'postComments.show',
        ]);
});

test('ignore unconfigured groups', function () {
    // The 'authors' group doesn't exist
    expect((new Ziggy('authors'))->toArray()['routes'])
        ->toHaveCount(7)
        ->toHaveKeys([
            'home',
            'posts.index',
            'posts.show',
            'postComments.index',
            'posts.store',
            'admin.users.index',
            'postComments.show',
        ]);
});

test('include middleware in route list', function () {
    config(['ziggy.middleware' => true]);

    expect((new Ziggy)->toArray()['routes'])->toBe([
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
    ]);
});

test('use subdomain from current request', function () {
    Route::domain('{team}.ziggy.dev')
        ->post('/', fn () => response()->json(new Ziggy))
        ->name('home');

    post(route('home', ['team' => 'tgtn']))
        ->assertJson([
            'url' => 'http://tgtn.ziggy.dev',
        ]);
});

test('use port from current request', function () {
    Route::post('/', fn () => response()->json(new Ziggy))->name('home');

    post('http://ziggy.dev:3000')
        ->assertJson([
            'url' => 'http://ziggy.dev:3000',
            'port' => 3000,
        ]);
});

test('include wheres in route list', function () {
    Route::post('slashes/{slug}', fn () => '')->where('slug', '.*')->name('slashes');

    expect((new Ziggy)->toArray()['routes']['slashes'])->toBe([
        'uri' => 'slashes/{slug}',
        'methods' => ['POST'],
        'wheres' => [
            'slug' => '.*',
        ],
        'parameters' => ['slug'],
    ]);
});

test('include filtered middleware in route list using config', function () {
    config(['ziggy.middleware' => ['auth']]);

    expect((new Ziggy)->toArray()['routes']['posts.store'])->toBe([
        'uri' => 'posts',
        'methods' => ['POST'],
        'middleware' => ['auth'],
    ]);
});

test('order fallback routes last', function () {
    Route::fallback(fn () => '')->name('fallback');
    Route::get('/users', fn () => '')->name('users.index');

    $routes = (new Ziggy)->toArray()['routes'];

    expect($routes)->toHaveCount(9);
    expect(last($routes))->toBe([
        'uri' => '{fallbackPlaceholder}',
        'methods' => ['GET', 'HEAD'],
        'wheres' => [
            'fallbackPlaceholder' => '.*',
        ],
        'parameters' => ['fallbackPlaceholder'],
    ]);
});

test('serialize route payload to array', function () {
    expect((new Ziggy)->toArray())->toBe([
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
    ]);
});

test('serialize route payload to JSON', function () {
    config(['ziggy.only' => ['postComments.*']]);

    $json = '{"url":"http:\/\/ziggy.dev","port":null,"defaults":{},"routes":{"postComments.index":{"uri":"posts\/{post}\/comments","methods":["GET","HEAD"],"parameters":["post"]},"postComments.show":{"uri":"posts\/{post}\/comments\/{comment}","methods":["GET","HEAD"],"parameters":["post","comment"],"bindings":{"comment":"uuid"}}}}';

    expect((new Ziggy)->toJson())->toBe($json);
    expect(json_encode(new Ziggy))->toBe($json);
    expect(json_decode(json_encode(new Ziggy), true))->toBe([
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
    ]);
});

test('automatically serialize route payload to JSON in response', function () {
    config(['ziggy.only' => ['postComments.*']]);

    Route::get('json', fn () => response()->json(new Ziggy));

    get('json')
        ->assertOk()
        ->assertContent((new Ziggy)->toJson());
});

test('cache compiled route list internally across repeated Ziggy class instantiations', function () {
    $routes = (new Ziggy)->toArray()['routes'];

    Route::get('/users', fn () => '')->name('users.index');
    app('router')->getRoutes()->refreshNameLookups();

    expect((new Ziggy)->toArray()['routes'])->toBe($routes);

    Ziggy::clearRoutes();
    app('router')->getRoutes()->refreshNameLookups();

    expect((new Ziggy)->toArray()['routes'])->not->toBe($routes);
});

test('filter routes from nested groups', function () {
    Route::get('foo', fn () => '')->name('foo');
    Route::name('foo.')->group(function () {
        Route::get('foo/bar', fn () => '')->name('bar');
        Route::name('bar.')->group(function () {
            Route::get('foo/bar/baz', fn () => '')->name('baz');
        });
    });

    config(['ziggy.except' => ['foo.bar.*']]);

    expect((new Ziggy)->toArray()['routes'])
        ->toHaveKeys(['foo', 'foo.bar'])
        ->not->toHaveKey('foo.bar.baz');

    config(['ziggy.except' => ['foo.*']]);

    expect((new Ziggy)->toArray()['routes'])
        ->toHaveKey('foo')
        ->not->toHaveKeys(['foo.bar', 'foo.bar.baz']);
});

test('handle numeric route names', function () {
    Route::get('a', fn () => '')->name('a');
    Route::get('3', fn () => '')->name('3');
    Route::get('b', fn () => '')->name('b');
    Route::fallback(fn () => '')->name('404');

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

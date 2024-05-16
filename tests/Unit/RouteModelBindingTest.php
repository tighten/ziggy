<?php

use Tighten\Ziggy\Ziggy;
use \Illuminate\Database\Eloquent\Model;

beforeEach(function () {
    $router = app('router');

    $router->get('users/{user}', function (User $user) {
        return '';
    })->name('users');
    $router->get('admins/{admin}', function (Admin $admin) {
        return '';
    })->name('admins');
    $router->get('tags/{tag}', function (Tag $tag) {
        return '';
    })->name('tags');
    $router->get('tokens/{token}', function ($token) {
        return '';
    })->name('tokens');
    $router->get('users/{user}/{number}', function (User $user, int $n) {
        return '';
    })->name('users.numbers');
    $router->post('users', function (User $user) {
        return '';
    })->name('users.store');
    $router->get('comments/{comment}', function (Comment $comment) {
        return '';
    })->name('comments');
    $router->get('replies/{reply}', function (Reply $reply) {
        return '';
    })->name('replies');
    $router->get('blog/{category}/{post:slug}', function (PostCategory $category, Post $post) {
        return '';
    })->name('posts');
    $router->get('blog/{category}/{post:slug}/{tag:slug}', function (PostCategory $category, Post $post, Tag $tag) {
        return '';
    })->name('posts.tags');

    $router->getRoutes()->refreshNameLookups();
});

test('can register implicit route model bindings', function () {
    $expected = [
        'users' => [
            'uri' => 'users/{user}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['user'],
            'bindings' => [
                'user' => 'uuid',
            ],
        ],
    ];

    expect((new Ziggy)->filter('users')->toArray()['routes'])->toBe($expected);
});

test('register inherited custom route key name', function () {
    $expected = [
        'admins' => [
            'uri' => 'admins/{admin}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['admin'],
            'bindings' => [
                'admin' => 'uuid',
            ],
        ],
    ];

    expect((new Ziggy)->filter('admins')->toArray()['routes'])->toBe($expected);
});

test('can ignore route parameters not bound to eloquent models', function () {
    expect((new Ziggy)->filter(['tokens'])->toArray()['routes'])->toBe([
        'tokens' => [
            'uri' => 'tokens/{token}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['token'],
        ],
    ]);
});

test('can ignore route action parameters without corresponding route segment', function () {
    expect((new Ziggy)->filter(['users.store'])->toArray()['routes'])->toBe([
        'users.store' => [
            'uri' => 'users',
            'methods' => ['POST'],
        ],
    ]);
});

test('can handle bound and unbound parameters in the same route', function () {
    $expected = [
        'users.numbers' => [
            'uri' => 'users/{user}/{number}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['user', 'number'],
            'bindings' => [
                'user' => 'uuid',
            ],
        ],
    ];

    expect((new Ziggy)->filter('users.numbers')->toArray()['routes'])->toBe($expected);
});

test('can handle multiple scoped bindings', function () {
    expect((new Ziggy)->filter('posts*')->toArray()['routes'])->toBe([
        'posts' => [
            'uri' => 'blog/{category}/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['category', 'post'],
            'bindings' => [
                'category' => 'id',
                'post' => 'slug',
            ],
        ],
        'posts.tags' => [
            'uri' => 'blog/{category}/{post}/{tag}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['category', 'post', 'tag'],
            'bindings' => [
                'category' => 'id',
                'post' => 'slug',
                'tag' => 'slug',
            ],
        ],
    ]);
});

test('can merge implicit and scoped bindings', function () {
    expect((new Ziggy)->toArray()['routes'])->toBe([
        'users' => [
            'uri' => 'users/{user}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['user'],
            'bindings' => [
                'user' => 'uuid',
            ],
        ],
        'admins' => [
            'uri' => 'admins/{admin}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['admin'],
            'bindings' => [
                'admin' => 'uuid',
            ],
        ],
        'tags' => [
            'uri' => 'tags/{tag}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['tag'],
            'bindings' => [
                'tag' => 'id',
            ],
        ],
        'tokens' => [
            'uri' => 'tokens/{token}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['token'],
        ],
        'users.numbers' => [
            'uri' => 'users/{user}/{number}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['user', 'number'],
            'bindings' => [
                'user' => 'uuid',
            ],
        ],
        'users.store' => [
            'uri' => 'users',
            'methods' => ['POST'],
        ],
        'comments' => [
            'uri' => 'comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
        'replies' => [
            'uri' => 'replies/{reply}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['reply'],
            'bindings' => [
                'reply' => 'uuid',
            ],
        ],
        'posts' => [
            'uri' => 'blog/{category}/{post}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['category', 'post'],
            'bindings' => [
                'category' => 'id',
                'post' => 'slug',
            ],
        ],
        'posts.tags' => [
            'uri' => 'blog/{category}/{post}/{tag}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['category', 'post', 'tag'],
            'bindings' => [
                'category' => 'id',
                'post' => 'slug',
                'tag' => 'slug',
            ],
        ],
    ]);
});

test('can include bindings in json', function () {
    $json = '{"url":"http:\/\/ziggy.dev","port":null,"defaults":{},"routes":{"users":{"uri":"users\/{user}","methods":["GET","HEAD"],"parameters":["user"],"bindings":{"user":"uuid"}},"admins":{"uri":"admins\/{admin}","methods":["GET","HEAD"],"parameters":["admin"],"bindings":{"admin":"uuid"}},"tags":{"uri":"tags\/{tag}","methods":["GET","HEAD"],"parameters":["tag"],"bindings":{"tag":"id"}},"tokens":{"uri":"tokens\/{token}","methods":["GET","HEAD"],"parameters":["token"]},"users.numbers":{"uri":"users\/{user}\/{number}","methods":["GET","HEAD"],"parameters":["user","number"],"bindings":{"user":"uuid"}},"users.store":{"uri":"users","methods":["POST"]},"comments":{"uri":"comments\/{comment}","methods":["GET","HEAD"],"parameters":["comment"],"bindings":{"comment":"uuid"}},"replies":{"uri":"replies\/{reply}","methods":["GET","HEAD"],"parameters":["reply"],"bindings":{"reply":"uuid"}},"posts":{"uri":"blog\/{category}\/{post}","methods":["GET","HEAD"],"parameters":["category","post"],"bindings":{"category":"id","post":"slug"}},"posts.tags":{"uri":"blog\/{category}\/{post}\/{tag}","methods":["GET","HEAD"],"parameters":["category","post","tag"],"bindings":{"category":"id","post":"slug","tag":"slug"}}}}';

    expect((new Ziggy)->toJson())->toBe($json);
});

test('can skip booting models that dont override their route key', function () {
    (new Ziggy)->filter(['tokens', 'users.numbers']);

    expect(User::$wasBooted)->toBeTrue();
    expect(Tag::$wasBooted)->toBeFalse();
});

test('can handle abstract classes in route model bindings', function () {
    app('router')->get('models/{model}', function (Model $model) {
        return '';
    })->name('models');
    app('router')->getRoutes()->refreshNameLookups();

    expect((new Ziggy)->toArray()['routes']['models'])->toBe([
        'uri' => 'models/{model}',
        'methods' => ['GET', 'HEAD'],
        'parameters' => ['model'],
        'bindings' => [
            'model' => 'id',
        ],
    ]);
});

test('can use custom primary key', function () {
    $expected = [
        'comments' => [
            'uri' => 'comments/{comment}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['comment'],
            'bindings' => [
                'comment' => 'uuid',
            ],
        ],
    ];

    expect((new Ziggy)->filter('comments')->toArray()['routes'])->toBe($expected);
});

test('can use get key name', function () {
    $expected = [
        'replies' => [
            'uri' => 'replies/{reply}',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['reply'],
            'bindings' => [
                'reply' => 'uuid',
            ],
        ],
    ];

    expect((new Ziggy)->filter('replies')->toArray()['routes'])->toBe($expected);
});

class User extends Model
{
    public static $wasBooted = false;

    public static function boot()
    {
        parent::boot();
        static::$wasBooted = true;
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }
}

class PostCategory extends Model
{
    //
}

class Post extends Model
{
    //
}

class Tag extends Model
{
    public static $wasBooted = false;

    public static function boot()
    {
        parent::boot();
        static::$wasBooted = true;
    }
}

class Admin extends User
{
    //
}

class Comment extends Model
{
    protected $primaryKey = 'uuid';
}

class Reply extends Model
{
    public function getKeyName()
    {
        return 'uuid';
    }
}

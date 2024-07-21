<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;
use Tighten\Ziggy\Ziggy;

beforeEach(function () {
    Route::get('users/{user}', fn (User $user) => '')->name('users');
    Route::get('admins/{admin}', fn (Admin $admin) => '')->name('admins');
    Route::get('tags/{tag}', fn (Tag $tag) => '')->name('tags');
    Route::get('tokens/{token}', fn ($token) => '')->name('tokens');
    Route::get('users/{user}/{number}', fn (User $user, int $n) => '')->name('users.numbers');
    Route::post('users', fn (User $user) => '')->name('users.store');
    Route::get('comments/{comment}', fn (Comment $comment) => '')->name('comments');
    Route::get('replies/{reply}', fn (Reply $reply) => '')->name('replies');
    Route::get('blog/{category}/{post:slug}', fn (PostCategory $category, Post $post) => '')->name('posts');
    Route::get('blog/{category}/{post:slug}/{tag:slug}', fn (PostCategory $category, Post $post, Tag $tag) => '')->name('posts.tags');
});

test('register implicit route model bindings', function () {
    expect((new Ziggy)->toArray()['routes']['users'])->toBe([
        'uri' => 'users/{user}',
        'methods' => ['GET', 'HEAD'],
        'parameters' => ['user'],
        'bindings' => [
            'user' => 'uuid',
        ],
    ]);
});

test('register inherited implicit route model bindings', function () {
    expect((new Ziggy)->toArray()['routes']['admins'])->toBe([
        'uri' => 'admins/{admin}',
        'methods' => ['GET', 'HEAD'],
        'parameters' => ['admin'],
        'bindings' => [
            'admin' => 'uuid',
        ],
    ]);
});

test('ignore route action arguments without corresponding route parameters', function () {
    expect((new Ziggy)->toArray()['routes']['users.store'])->toBe([
        'uri' => 'users',
        'methods' => ['POST'],
    ]);
});

test('handle bound and unbound parameters in the same route', function () {
    expect((new Ziggy)->toArray()['routes']['users.numbers'])->toBe([
        'uri' => 'users/{user}/{number}',
        'methods' => ['GET', 'HEAD'],
        'parameters' => ['user', 'number'],
        'bindings' => [
            'user' => 'uuid',
        ],
    ]);
});

test('handle multiple scoped bindings', function () {
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

test('merge implicit and scoped bindings', function () {
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

test('include bindings in json', function () {
    expect((new Ziggy)->toJson())
        ->toBe('{"url":"http:\/\/ziggy.dev","port":null,"defaults":{},"routes":{"users":{"uri":"users\/{user}","methods":["GET","HEAD"],"parameters":["user"],"bindings":{"user":"uuid"}},"admins":{"uri":"admins\/{admin}","methods":["GET","HEAD"],"parameters":["admin"],"bindings":{"admin":"uuid"}},"tags":{"uri":"tags\/{tag}","methods":["GET","HEAD"],"parameters":["tag"],"bindings":{"tag":"id"}},"tokens":{"uri":"tokens\/{token}","methods":["GET","HEAD"],"parameters":["token"]},"users.numbers":{"uri":"users\/{user}\/{number}","methods":["GET","HEAD"],"parameters":["user","number"],"bindings":{"user":"uuid"}},"users.store":{"uri":"users","methods":["POST"]},"comments":{"uri":"comments\/{comment}","methods":["GET","HEAD"],"parameters":["comment"],"bindings":{"comment":"uuid"}},"replies":{"uri":"replies\/{reply}","methods":["GET","HEAD"],"parameters":["reply"],"bindings":{"reply":"uuid"}},"posts":{"uri":"blog\/{category}\/{post}","methods":["GET","HEAD"],"parameters":["category","post"],"bindings":{"category":"id","post":"slug"}},"posts.tags":{"uri":"blog\/{category}\/{post}\/{tag}","methods":["GET","HEAD"],"parameters":["category","post","tag"],"bindings":{"category":"id","post":"slug","tag":"slug"}}}}');
});

test('skip booting models that dont override their route key', function () {
    (new Ziggy)->filter(['tokens', 'users.numbers']);

    expect(User::$wasBooted)->toBeTrue();
    expect(Tag::$wasBooted)->toBeFalse();
});

test('handle abstract classes in route model bindings', function () {
    Route::get('models/{model}', fn (Model $model) => '')->name('models');

    expect((new Ziggy)->toArray()['routes']['models'])->toBe([
        'uri' => 'models/{model}',
        'methods' => ['GET', 'HEAD'],
        'parameters' => ['model'],
        'bindings' => [
            'model' => 'id',
        ],
    ]);
});

test('use custom primary key set with primaryKey property', function () {
    expect((new Ziggy)->toArray()['routes']['comments'])->toBe([
        'uri' => 'comments/{comment}',
        'methods' => ['GET', 'HEAD'],
        'parameters' => ['comment'],
        'bindings' => [
            'comment' => 'uuid',
        ],
    ]);
});

test('use custom primary key set with getKeyName method', function () {
    expect((new Ziggy)->toArray()['routes']['replies'])->toBe([
        'uri' => 'replies/{reply}',
        'methods' => ['GET', 'HEAD'],
        'parameters' => ['reply'],
        'bindings' => [
            'reply' => 'uuid',
        ],
    ]);
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

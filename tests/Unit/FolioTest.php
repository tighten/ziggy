<?php

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Laravel\Folio\Folio;
use Laravel\Folio\FolioServiceProvider;
use Tighten\Ziggy\Ziggy;

beforeEach(function () {
    if ((int) head(explode('.', app()->version())) < 10) {
        return $this->markTestSkipped('Folio requires Laravel >=10');
    }

    app()->register(FolioServiceProvider::class);
});

afterEach(function () {
    File::deleteDirectories(resource_path('views'));
});

test('include named folio routes', function () {
    File::ensureDirectoryExists(resource_path('views/pages'));
    File::put(resource_path('views/pages/about.blade.php'), '<?php Laravel\Folio\name("about");');
    File::put(resource_path('views/pages/anonymous.blade.php'), '<?php');
    File::ensureDirectoryExists(resource_path('views/pages/users'));
    File::put(resource_path('views/pages/users/[id].blade.php'), '<?php Laravel\Folio\name("users.show");');

    Folio::path(resource_path('views/pages'));

    expect((new Ziggy())->toArray()['routes'])->toEqualCanonicalizing([
        'about' => [
            'uri' => 'about',
            'methods' => ['GET'],
        ],
        'users.show' => [
            'uri' => 'users/{id}',
            'methods' => ['GET'],
            'parameters' => ['id'],
        ],
        'laravel-folio' => [
            'uri' => '{fallbackPlaceholder}',
            'methods' => ['GET', 'HEAD'],
            'wheres' => ['fallbackPlaceholder' => '.*'],
            'parameters' => ['fallbackPlaceholder'],
        ],
    ]);
});

test('normal routes override folio routes', function () {
    Route::get('about', fn () => '')->name('about');

    File::ensureDirectoryExists(resource_path('views/pages'));
    File::put(resource_path('views/pages/about.blade.php'), '<?php Laravel\Folio\name("about");');

    Folio::path(resource_path('views/pages'));

    expect(Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'))->toBe([
        'about' => [
            'uri' => 'about',
            // Folio routes only respond to 'GET', so this has to be the web route
            'methods' => ['GET', 'HEAD'],
        ],
    ]);
});

test('parameters', function () {
    File::ensureDirectoryExists(resource_path('views/pages/users'));
    File::put(resource_path('views/pages/users/[id].blade.php'), '<?php Laravel\Folio\name("users.show");');
    File::put(resource_path('views/pages/users/[...ids].blade.php'), '<?php Laravel\Folio\name("users.some");');

    Folio::path(resource_path('views/pages'));

    expect((new Ziggy())->toArray()['routes']['users.show'])->toBe([
        'uri' => 'users/{id}',
        'methods' => ['GET'],
        'parameters' => ['id'],
    ]);
    expect((new Ziggy())->toArray()['routes']['users.some'])->toBe([
        'uri' => 'users/{ids}',
        'methods' => ['GET'],
        'parameters' => ['ids'],
    ]);
});

test('domains', function () {
    File::ensureDirectoryExists(resource_path('views/pages/admin'));
    File::put(resource_path('views/pages/admin/[...ids].blade.php'), '<?php Laravel\Folio\name("admins.some");');

    Folio::domain('{account}.{org}.ziggy.dev')->path(resource_path('views/pages/admin'))->uri('admin');

    expect(Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'))->toBe([
        'admins.some' => [
            'uri' => 'admin/{ids}',
            'methods' => ['GET'],
            'domain' => '{account}.{org}.ziggy.dev',
            'parameters' => ['account', 'org', 'ids'],
        ],
    ]);
});

test('paths and uris', function () {
    File::ensureDirectoryExists(resource_path('views/pages/guest'));
    File::ensureDirectoryExists(resource_path('views/pages/admin'));
    File::put(resource_path('views/pages/guest/[id].blade.php'), '<?php Laravel\Folio\name("guests.show");');
    File::put(resource_path('views/pages/admin/[...ids].blade.php'), '<?php Laravel\Folio\name("admins.some");');

    Folio::path(resource_path('views/pages/guest'))->uri('/');
    Folio::path(resource_path('views/pages/admin'))->uri('/admin');

    expect(Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'))->toBe([
        'guests.show' => [
            'uri' => '{id}',
            'methods' => ['GET'],
            'parameters' => ['id'],
        ],
        'admins.some' => [
            'uri' => 'admin/{ids}',
            'methods' => ['GET'],
            'parameters' => ['ids'],
        ],
    ]);
});

test('index pages', function () {
    File::ensureDirectoryExists(resource_path('views/pages/index/index'));
    File::put(resource_path('views/pages/index.blade.php'), '<?php Laravel\Folio\name("root");');
    File::put(resource_path('views/pages/index/index/index.blade.php'), '<?php Laravel\Folio\name("index.index");');

    Folio::path(resource_path('views/pages'));

    expect((new Ziggy())->toArray()['routes']['root'])->toBe([
        'uri' => '/',
        'methods' => ['GET'],
    ]);
    expect((new Ziggy())->toArray()['routes']['index.index'])->toBe([
        'uri' => 'index/index',
        'methods' => ['GET'],
    ]);
});

test('nested pages', function () {
    File::ensureDirectoryExists(resource_path('views/pages/[slug]'));
    File::put(resource_path('views/pages/[slug]/[id].blade.php'), '<?php Laravel\Folio\name("nested");');

    Folio::path(resource_path('views/pages'));

    expect(Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'))->toBe([
        'nested' => [
            'uri' => '{slug}/{id}',
            'methods' => ['GET'],
            'parameters' => ['slug', 'id'],
        ],
    ]);
});

test('custom view data variable name', function () {
    File::ensureDirectoryExists(resource_path('views/pages/users/[.App.User-$leader]/users'));
    File::put(resource_path('views/pages/users/[.App.User-$leader]/users/[.App.User-$follower].blade.php'), '<?php Laravel\Folio\name("follower");');
    if (! windows_os()) {
        File::ensureDirectoryExists(resource_path('views/pages/linux-users/[.App.User|leader]/users'));
        File::put(resource_path('views/pages/linux-users/[.App.User|leader]/users/[.App.User|follower].blade.php'), '<?php Laravel\Folio\name("linux.follower");');
    }

    Folio::path(resource_path('views/pages'));

    expect((new Ziggy())->toArray()['routes']['follower'])->toBe([
        'uri' => 'users/{leader}/users/{follower}',
        'methods' => ['GET'],
        'parameters' => ['leader', 'follower'],
    ]);
    if (! windows_os()) {
        expect((new Ziggy())->toArray()['routes']['linux.follower'])->toBe([
            'uri' => 'linux-users/{leader}/users/{follower}',
            'methods' => ['GET'],
            'parameters' => ['leader', 'follower'],
        ]);
    }
});

test('middleware', function () {
    File::ensureDirectoryExists(resource_path('views/pages/admin'));
    File::put(resource_path('views/pages/admin/index.blade.php'), '<?php Laravel\Folio\name("admin.index");');
    File::put(resource_path('views/pages/admin/special.blade.php'), '<?php Laravel\Folio\name("admin.special"); Laravel\Folio\middleware("special");');

    Folio::path(resource_path('views/pages/admin'))
        ->uri('admin')
        ->middleware(['*' => ['auth']]);

    config(['ziggy.middleware' => true]);

    expect((new Ziggy())->toArray()['routes']['admin.index'])->toBe([
        'uri' => 'admin',
        'methods' => ['GET'],
        'middleware' => ['web', 'auth'],
    ]);
    expect((new Ziggy())->toArray()['routes']['admin.special'])->toBe([
        'uri' => 'admin/special',
        'methods' => ['GET'],
        'middleware' => ['web', 'auth', 'special'],
    ]);
});

test('custom route model binding field', function () {
    File::ensureDirectoryExists(resource_path('views/pages/things'));
    File::put(resource_path('views/pages/things/[Thing].blade.php'), '<?php Laravel\Folio\name("things.show");');
    if (! windows_os()) {
        File::ensureDirectoryExists(resource_path('views/pages/posts'));
        File::put(resource_path('views/pages/posts/[Post:slug].blade.php'), '<?php Laravel\Folio\name("posts.show");');
    }
    File::ensureDirectoryExists(resource_path('views/pages/teams'));
    File::put(resource_path('views/pages/teams/[Team-uid].blade.php'), '<?php Laravel\Folio\name("teams.show");');

    Folio::path(resource_path('views/pages'));

    if (! windows_os()) {
        expect((new Ziggy())->toArray()['routes']['posts.show'])->toBe([
            'uri' => 'posts/{post}',
            'methods' => ['GET'],
            'parameters' => ['post'],
            'bindings' => [
                'post' => 'slug',
            ],
        ]);
    }
    expect((new Ziggy())->toArray()['routes']['things.show'])->toBe([
        'uri' => 'things/{thing}',
        'methods' => ['GET'],
        'parameters' => ['thing'],
    ]);
    expect((new Ziggy())->toArray()['routes']['teams.show'])->toBe([
        'uri' => 'teams/{team}',
        'methods' => ['GET'],
        'parameters' => ['team'],
        'bindings' => [
            'team' => 'uid',
        ],
    ]);
});

test('custom model paths', function () {
    File::ensureDirectoryExists(resource_path('views/pages/users'));
    File::put(resource_path('views/pages/users/[.App.User].blade.php'), '<?php Laravel\Folio\name("users.show");');
    if (! windows_os()) {
        File::ensureDirectoryExists(resource_path('views/pages/posts'));
        File::put(resource_path('views/pages/posts/[.App.Post:slug].blade.php'), '<?php Laravel\Folio\name("posts.show");');
    }
    File::ensureDirectoryExists(resource_path('views/pages/teams'));
    File::put(resource_path('views/pages/teams/[.App.Team-uid].blade.php'), '<?php Laravel\Folio\name("teams.show");');

    Folio::path(resource_path('views/pages'));

    if (! windows_os()) {
        expect((new Ziggy())->toArray()['routes']['posts.show'])->toBe([
            'uri' => 'posts/{post}',
            'methods' => ['GET'],
            'parameters' => ['post'],
            'bindings' => [
                'post' => 'slug',
            ],
        ]);
    }
    expect((new Ziggy())->toArray()['routes']['users.show'])->toBe([
        'uri' => 'users/{user}',
        'methods' => ['GET'],
        'parameters' => ['user'],
    ]);
    expect((new Ziggy())->toArray()['routes']['teams.show'])->toBe([
        'uri' => 'teams/{team}',
        'methods' => ['GET'],
        'parameters' => ['team'],
        'bindings' => [
            'team' => 'uid',
        ],
    ]);
});

test('implicit route model binding', function () {
    File::ensureDirectoryExists(resource_path('views/pages/users'));
    File::put(resource_path('views/pages/users/[FolioUser].blade.php'), '<?php Laravel\Folio\name("users.show");');
    File::ensureDirectoryExists(resource_path('views/pages/tags'));
    File::put(resource_path('views/pages/tags/[FolioTag].blade.php'), '<?php Laravel\Folio\name("tags.show");');

    Folio::path(resource_path('views/pages'));

    expect((new Ziggy)->toArray()['routes']['users.show'])->toBe([
        'uri' => 'users/{folioUser}',
        'methods' => ['GET'],
        'parameters' => ['folioUser'],
        'bindings' => [
            'folioUser' => 'uuid',
        ],
    ]);
    expect((new Ziggy)->toArray()['routes']['tags.show'])->toBe([
        'uri' => 'tags/{folioTag}',
        'methods' => ['GET'],
        'parameters' => ['folioTag'],
        'bindings' => [
            'folioTag' => 'id',
        ],
    ]);

    expect(FolioUser::$wasBooted)->toBeTrue();
    expect(FolioTag::$wasBooted)->toBeFalse();
});

test('implicit route model binding and custom view data variable name', function () {
    File::ensureDirectoryExists(resource_path('views/pages/users'));
    File::put(resource_path('views/pages/users/[FolioUser-$user].blade.php'), '<?php Laravel\Folio\name("users.show");');
    if (! windows_os()) {
        File::ensureDirectoryExists(resource_path('views/pages/tags'));
        File::put(resource_path('views/pages/tags/[FolioTag|tag].blade.php'), '<?php Laravel\Folio\name("tags.show");');
    }

    Folio::path(resource_path('views/pages'));

    expect((new Ziggy)->toArray()['routes']['users.show'])->toBe([
        'uri' => 'users/{user}',
        'methods' => ['GET'],
        'parameters' => ['user'],
        'bindings' => [
            'user' => 'uuid',
        ],
    ]);
    if (! windows_os()) {
        expect((new Ziggy)->toArray()['routes']['tags.show'])->toBe([
            'uri' => 'tags/{tag}',
            'methods' => ['GET'],
            'parameters' => ['tag'],
            'bindings' => [
                'tag' => 'id',
            ],
        ]);
    }
});

test('custom route model binding field and custom view data variable name', function () {
    if (! windows_os()) {
        File::ensureDirectoryExists(resource_path('views/pages/users'));
        File::put(resource_path('views/pages/users/[FolioUser:email|user].blade.php'), '<?php Laravel\Folio\name("users.show");');
    }
    File::ensureDirectoryExists(resource_path('views/pages/tags'));
    File::put(resource_path('views/pages/tags/[FolioTag-slug-$tag].blade.php'), '<?php Laravel\Folio\name("tags.show");');

    Folio::path(resource_path('views/pages'));

    if (! windows_os()) {
        expect((new Ziggy)->toArray()['routes']['users.show'])->toBe([
            'uri' => 'users/{user}',
            'methods' => ['GET'],
            'parameters' => ['user'],
            'bindings' => [
                'user' => 'email',
            ],
        ]);
    }
    expect((new Ziggy)->toArray()['routes']['tags.show'])->toBe([
        'uri' => 'tags/{tag}',
        'methods' => ['GET'],
        'parameters' => ['tag'],
        'bindings' => [
            'tag' => 'slug',
        ],
    ]);
});

class FolioUser extends Model
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

class FolioTag extends Model
{
    public static $wasBooted = false;

    public static function boot()
    {
        parent::boot();
        static::$wasBooted = true;
    }
}

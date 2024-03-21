<?php

namespace Tests\Unit;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Laravel\Folio\Folio;
use Laravel\Folio\FolioServiceProvider;
use Tests\TestCase;
use Tighten\Ziggy\Ziggy;
use Tighten\Ziggy\ZiggyServiceProvider;

class FolioTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if ((int) head(explode('.', app()->version())) < 10) {
            $this->markTestSkipped('Folio requires Laravel >=10');
        }
    }

    protected function tearDown(): void
    {
        File::deleteDirectories(resource_path('views'));

        parent::tearDown();
    }

    protected function getPackageProviders($app)
    {
        return [
            ZiggyServiceProvider::class,
            ...((int) head(explode('.', app()->version())) >= 10 ? [FolioServiceProvider::class] : []),
        ];
    }

    /** @test */
    public function include_named_folio_routes()
    {
        File::ensureDirectoryExists(resource_path('views/pages'));
        File::put(resource_path('views/pages/about.blade.php'), '<?php Laravel\Folio\name("about");');
        File::put(resource_path('views/pages/anonymous.blade.php'), '<?php');
        File::ensureDirectoryExists(resource_path('views/pages/users'));
        File::put(resource_path('views/pages/users/[id].blade.php'), '<?php Laravel\Folio\name("users.show");');

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
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
        ], (new Ziggy())->toArray()['routes']);
    }

    /** @test */
    public function normal_routes_override_folio_routes()
    {
        app('router')->get('about', $this->noop())->name('about');
        app('router')->getRoutes()->refreshNameLookups();

        File::ensureDirectoryExists(resource_path('views/pages'));
        File::put(resource_path('views/pages/about.blade.php'), '<?php Laravel\Folio\name("about");');

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'about' => [
                'uri' => 'about',
                // Folio routes only respond to 'GET', so this is the web route
                'methods' => ['GET', 'HEAD'],
            ],
        ], Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'));
    }

    /** @test */
    public function parameters()
    {
        File::ensureDirectoryExists(resource_path('views/pages/users'));
        File::put(resource_path('views/pages/users/[id].blade.php'), '<?php Laravel\Folio\name("users.show");');
        File::put(resource_path('views/pages/users/[...ids].blade.php'), '<?php Laravel\Folio\name("users.some");');

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'uri' => 'users/{id}',
            'methods' => ['GET'],
            'parameters' => ['id'],
        ], (new Ziggy())->toArray()['routes']['users.show']);
        $this->assertSame([
            'uri' => 'users/{ids}',
            'methods' => ['GET'],
            'parameters' => ['ids'],
        ], (new Ziggy())->toArray()['routes']['users.some']);
    }

    /** @test */
    public function domains()
    {
        File::ensureDirectoryExists(resource_path('views/pages/admin'));
        File::put(resource_path('views/pages/admin/[...ids].blade.php'), '<?php Laravel\Folio\name("admins.some");');

        Folio::domain('{account}.{org}.ziggy.dev')->path(resource_path('views/pages/admin'))->uri('admin');

        $this->assertSame([
            'admins.some' => [
                'uri' => 'admin/{ids}',
                'methods' => ['GET'],
                'domain' => '{account}.{org}.ziggy.dev',
                'parameters' => ['account', 'org', 'ids'],
            ],
        ], Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'));
    }

    /** @test */
    public function paths_and_uris()
    {
        File::ensureDirectoryExists(resource_path('views/pages/guest'));
        File::ensureDirectoryExists(resource_path('views/pages/admin'));
        File::put(resource_path('views/pages/guest/[id].blade.php'), '<?php Laravel\Folio\name("guests.show");');
        File::put(resource_path('views/pages/admin/[...ids].blade.php'), '<?php Laravel\Folio\name("admins.some");');

        Folio::path(resource_path('views/pages/guest'))->uri('/');
        Folio::path(resource_path('views/pages/admin'))->uri('/admin');

        $this->assertSame([
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
        ], Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'));
    }

    /** @test */
    public function index_pages()
    {
        File::ensureDirectoryExists(resource_path('views/pages/index/index'));
        File::put(resource_path('views/pages/index.blade.php'), '<?php Laravel\Folio\name("root");');
        File::put(resource_path('views/pages/index/index/index.blade.php'), '<?php Laravel\Folio\name("index.index");');

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'uri' => '/',
            'methods' => ['GET'],
        ], (new Ziggy())->toArray()['routes']['root']);
        $this->assertSame([
            'uri' => 'index/index',
            'methods' => ['GET'],
        ], (new Ziggy())->toArray()['routes']['index.index']);
    }

    /** @test */
    public function nested_pages()
    {
        File::ensureDirectoryExists(resource_path('views/pages/[slug]'));
        File::put(resource_path('views/pages/[slug]/[id].blade.php'), '<?php Laravel\Folio\name("nested");');

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'nested' => [
                'uri' => '{slug}/{id}',
                'methods' => ['GET'],
                'parameters' => ['slug', 'id'],
            ],
        ], Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'));
    }

    /** @test */
    public function custom_view_data_variable_names()
    {
        File::ensureDirectoryExists(resource_path('views/pages/users/[.App.User-$leader]/users'));
        File::put(resource_path('views/pages/users/[.App.User-$leader]/users/[.App.User-$follower].blade.php'), '<?php Laravel\Folio\name("follower");');
        if (! windows_os()) {
            File::ensureDirectoryExists(resource_path('views/pages/linux-users/[.App.User|leader]/users'));
            File::put(resource_path('views/pages/linux-users/[.App.User|leader]/users/[.App.User|follower].blade.php'), '<?php Laravel\Folio\name("linux.follower");');
        }

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'uri' => 'users/{leader}/users/{follower}',
            'methods' => ['GET'],
            'parameters' => ['leader', 'follower'],
        ], (new Ziggy())->toArray()['routes']['follower']);
        if (! windows_os()) {
            $this->assertSame([
                'uri' => 'linux-users/{leader}/users/{follower}',
                'methods' => ['GET'],
                'parameters' => ['leader', 'follower'],
            ], (new Ziggy())->toArray()['routes']['linux.follower']);
        }
    }

    /** @test */
    public function middleware()
    {
        File::ensureDirectoryExists(resource_path('views/pages/admin'));
        File::put(resource_path('views/pages/admin/index.blade.php'), '<?php Laravel\Folio\name("admin.index");');
        File::put(resource_path('views/pages/admin/special.blade.php'), '<?php Laravel\Folio\name("admin.special"); Laravel\Folio\middleware("special");');

        Folio::path(resource_path('views/pages/admin'))
            ->uri('admin')
            ->middleware(['*' => ['auth']]);

        config(['ziggy.middleware' => true]);

        $this->assertSame([
            'uri' => 'admin',
            'methods' => ['GET'],
            'middleware' => ['web', 'auth'],
        ], (new Ziggy())->toArray()['routes']['admin.index']);
        $this->assertSame([
            'uri' => 'admin/special',
            'methods' => ['GET'],
            'middleware' => ['web', 'auth', 'special'],
        ], (new Ziggy())->toArray()['routes']['admin.special']);
    }

    /** @test */
    public function binding_fields()
    {
        File::ensureDirectoryExists(resource_path('views/pages/users'));
        File::put(resource_path('views/pages/users/[User].blade.php'), '<?php Laravel\Folio\name("users.show");');
        if (! windows_os()) {
            File::ensureDirectoryExists(resource_path('views/pages/posts'));
            File::put(resource_path('views/pages/posts/[Post:slug].blade.php'), '<?php Laravel\Folio\name("posts.show");');
        }
        File::ensureDirectoryExists(resource_path('views/pages/teams'));
        File::put(resource_path('views/pages/teams/[Team-uid].blade.php'), '<?php Laravel\Folio\name("teams.show");');

        Folio::path(resource_path('views/pages'));

        if (! windows_os()) {
            $this->assertSame([
                'uri' => 'posts/{post}',
                'methods' => ['GET'],
                'parameters' => ['post'],
                'bindings' => [
                    'post' => 'slug',
                ],
            ], (new Ziggy())->toArray()['routes']['posts.show']);
        }
        $this->assertSame([
            'uri' => 'users/{user}',
            'methods' => ['GET'],
            'parameters' => ['user'],
        ], (new Ziggy())->toArray()['routes']['users.show']);
        $this->assertSame([
            'uri' => 'teams/{team}',
            'methods' => ['GET'],
            'parameters' => ['team'],
            'bindings' => [
                'team' => 'uid',
            ],
        ], (new Ziggy())->toArray()['routes']['teams.show']);
    }

    /** @test */
    public function custom_model_paths()
    {
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
            $this->assertSame([
                'uri' => 'posts/{post}',
                'methods' => ['GET'],
                'parameters' => ['post'],
                'bindings' => [
                    'post' => 'slug',
                ],
            ], (new Ziggy())->toArray()['routes']['posts.show']);
        }
        $this->assertSame([
            'uri' => 'users/{user}',
            'methods' => ['GET'],
            'parameters' => ['user'],
        ], (new Ziggy())->toArray()['routes']['users.show']);
        $this->assertSame([
            'uri' => 'teams/{team}',
            'methods' => ['GET'],
            'parameters' => ['team'],
            'bindings' => [
                'team' => 'uid',
            ],
        ], (new Ziggy())->toArray()['routes']['teams.show']);
    }

    /** @test */
    public function implicit_route_model_bindings()
    {
        File::ensureDirectoryExists(resource_path('views/pages/users'));
        File::put(resource_path('views/pages/users/[.Tests.Unit.FolioUser].blade.php'), '<?php Laravel\Folio\name("users.show");');
        File::ensureDirectoryExists(resource_path('views/pages/tags'));
        File::put(resource_path('views/pages/tags/[.Tests.Unit.FolioTag].blade.php'), '<?php Laravel\Folio\name("tags.show");');

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'uri' => 'users/{folioUser}',
            'methods' => ['GET'],
            'parameters' => ['folioUser'],
            'bindings' => [
                'folioUser' => 'uuid',
            ],
        ], (new Ziggy)->toArray()['routes']['users.show']);
        $this->assertSame([
            'uri' => 'tags/{folioTag}',
            'methods' => ['GET'],
            'parameters' => ['folioTag'],
            'bindings' => [
                'folioTag' => 'id',
            ],
        ], (new Ziggy)->toArray()['routes']['tags.show']);

        $this->assertTrue(FolioUser::$wasBooted);
        $this->assertFalse(FolioTag::$wasBooted);
    }

    /** @test */
    public function implicit_route_model_bindings_with_custom_variable()
    {
        File::ensureDirectoryExists(resource_path('views/pages/users'));
        File::put(resource_path('views/pages/users/[.Tests.Unit.FolioUser-$user].blade.php'), '<?php Laravel\Folio\name("users.show");');
        if (! windows_os()) {
            File::ensureDirectoryExists(resource_path('views/pages/tags'));
            File::put(resource_path('views/pages/tags/[.Tests.Unit.FolioTag|tag].blade.php'), '<?php Laravel\Folio\name("tags.show");');
        }

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'uri' => 'users/{user}',
            'methods' => ['GET'],
            'parameters' => ['user'],
            'bindings' => [
                'user' => 'uuid',
            ],
        ], (new Ziggy)->toArray()['routes']['users.show']);
        if (! windows_os()) {
            $this->assertSame([
                'uri' => 'tags/{tag}',
                'methods' => ['GET'],
                'parameters' => ['tag'],
                'bindings' => [
                    'tag' => 'id',
                ],
            ], (new Ziggy)->toArray()['routes']['tags.show']);
        }
    }

    /** @test */
    public function model_bindings_with_both_custom_field_and_custom_variable()
    {
        File::ensureDirectoryExists(resource_path('views/pages/users'));
        File::put(resource_path('views/pages/users/[.Tests.Unit.FolioUser:email|user].blade.php'), '<?php Laravel\Folio\name("users.show");');
        if (! windows_os()) {
            File::ensureDirectoryExists(resource_path('views/pages/tags'));
            File::put(resource_path('views/pages/tags/[.Tests.Unit.FolioTag-slug-$tag].blade.php'), '<?php Laravel\Folio\name("tags.show");');
        }

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'uri' => 'users/{user}',
            'methods' => ['GET'],
            'parameters' => ['user'],
            'bindings' => [
                'user' => 'email',
            ],
        ], (new Ziggy)->toArray()['routes']['users.show']);
        if (! windows_os()) {
            $this->assertSame([
                'uri' => 'tags/{tag}',
                'methods' => ['GET'],
                'parameters' => ['tag'],
                'bindings' => [
                    'tag' => 'slug',
                ],
            ], (new Ziggy)->toArray()['routes']['tags.show']);
        }
    }
}

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

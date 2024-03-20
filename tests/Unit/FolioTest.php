<?php

namespace Tests\Unit;

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
    public function include_folio_routes()
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
                'middleware' => ['web'],
            ],
            'users.show' => [
                'uri' => 'users/{id}',
                'methods' => ['GET'],
                'parameters' => ['id'],
                'middleware' => ['web'],
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
            'middleware' => ['web'],
        ], (new Ziggy())->toArray()['routes']['users.show']);
        $this->assertSame([
            'uri' => 'users/{ids}',
            'methods' => ['GET'],
            'parameters' => ['ids'],
            'middleware' => ['web'],
        ], (new Ziggy())->toArray()['routes']['users.some']);
    }

    /** @test */
    public function domains()
    {
        File::ensureDirectoryExists(resource_path('views/pages/admin'));
        File::put(resource_path('views/pages/admin/[...ids].blade.php'), '<?php Laravel\Folio\name("admins.some");');

        Folio::domain('{account}.ziggy.dev')->path(resource_path('views/pages/admin'))->uri('admin');

        $this->assertSame([
            'admins.some' => [
                'uri' => 'admin/{ids}',
                'methods' => ['GET'],
                'domain' => '{account}.ziggy.dev',
                'parameters' => ['account', 'ids'],
                'middleware' => ['web'],
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
                'middleware' => ['web'],
            ],
            'admins.some' => [
                'uri' => 'admin/{ids}',
                'methods' => ['GET'],
                'parameters' => ['ids'],
                'middleware' => ['web'],
            ],
        ], Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'));
    }

    /** @test */
    public function index_pages()
    {
        File::ensureDirectoryExists(resource_path('views/pages/blog/releases'));
        File::put(resource_path('views/pages/blog/index.blade.php'), '<?php Laravel\Folio\name("blog.index");');
        File::put(resource_path('views/pages/blog/releases/index.blade.php'), '<?php Laravel\Folio\name("blog.categories.releases.index");');

        Folio::path(resource_path('views/pages'));

        $this->assertSame([
            'blog.index' => [
                'uri' => 'blog',
                'methods' => ['GET'],
                'middleware' => ['web'],
            ],
            'blog.categories.releases.index' => [
                'uri' => 'blog/releases',
                'methods' => ['GET'],
                'middleware' => ['web'],
            ],
        ], Arr::except((new Ziggy())->toArray()['routes'], 'laravel-folio'));
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
        if (! str_starts_with(strtoupper(PHP_OS), 'WIN')) {
            File::ensureDirectoryExists(resource_path('views/pages/posts'));
            File::put(resource_path('views/pages/posts/[Post:slug].blade.php'), '<?php Laravel\Folio\name("posts.show");');
        }
        File::ensureDirectoryExists(resource_path('views/pages/teams'));
        File::put(resource_path('views/pages/teams/[Team-uid].blade.php'), '<?php Laravel\Folio\name("teams.show");');

        Folio::path(resource_path('views/pages'));

        if (! str_starts_with(strtoupper(PHP_OS), 'WIN')) {
            $this->assertSame([
                'uri' => 'posts/{post}',
                'methods' => ['GET'],
                'parameters' => ['post'],
                'bindings' => [
                    'post' => 'slug',
                ],
                'middleware' => ['web'],
            ], (new Ziggy())->toArray()['routes']['posts.show']);
        }
        $this->assertSame([
            'uri' => 'users/{user}',
            'methods' => ['GET'],
            'parameters' => ['user'],
            'middleware' => ['web'],
        ], (new Ziggy())->toArray()['routes']['users.show']);
        $this->assertSame([
            'uri' => 'teams/{team}',
            'methods' => ['GET'],
            'parameters' => ['team'],
            'bindings' => [
                'team' => 'uid',
            ],
            'middleware' => ['web'],
        ], (new Ziggy())->toArray()['routes']['teams.show']);
    }
}

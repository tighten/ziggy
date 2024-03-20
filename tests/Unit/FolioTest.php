<?php

namespace Tests\Unit;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Laravel\Folio\Folio;
use Laravel\Folio\FolioRoutes;
use Laravel\Folio\FolioServiceProvider;
use Tests\TestCase;
use Tighten\Ziggy\Ziggy;
use Tighten\Ziggy\ZiggyServiceProvider;

class FolioTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $router = app('router');

        $router->get('home', $this->noop())->name('home');
        $router->get('posts', $this->noop())->name('posts.index');

        $router->getRoutes()->refreshNameLookups();
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
            FolioServiceProvider::class,
        ];
    }

    /** @test */
    public function include_folio_routes()
    {
        // middleware!
        // route model binding
        // wheres?
        File::ensureDirectoryExists(resource_path('views/pages'));
        File::put(resource_path('views/pages/about.blade.php'), '<?php Laravel\Folio\name("about");');
        File::put(resource_path('views/pages/anonymous.blade.php'), '<?php');
        File::ensureDirectoryExists(resource_path('views/pages/users'));
        File::put(resource_path('views/pages/users/[id].blade.php'), '<?php Laravel\Folio\name("users.show");');
        Folio::path(resource_path('views/pages'));

        dump(app(FolioRoutes::class)->routes());

        $this->assertSame([
            'about' => [
                // 'uri' => 'about',
                'methods' => ['GET'],
            ],
            'users.show' => [
                // 'uri' => 'users/{id}',
                'methods' => ['GET'],
                // 'parameters' => ['id'],
            ],
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
            ],
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
            'laravel-folio' => [
                'uri' => '{fallbackPlaceholder}',
                'methods' => ['GET', 'HEAD'],
                'wheres' => ['fallbackPlaceholder' => '.*'],
                'parameters' => ['fallbackPlaceholder'],
            ],
        ], (new Ziggy())->toArray()['routes']);
    }
}

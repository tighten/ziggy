<?php

namespace Tests\Unit;

use Illuminate\Support\Facades\File;
use Laravel\Folio\Folio;
use Laravel\Folio\FolioRoutes;
use Laravel\Folio\FolioServiceProvider;
use Tests\TestCase;
use Tighten\Ziggy\Ziggy;
use Tighten\Ziggy\ZiggyServiceProvider;

class FolioTest extends TestCase
{
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
            'uri' => 'about',
            // Folio routes don't respond to 'HEAD', so we know this is the web route
            'methods' => ['GET', 'HEAD'],
        ], (new Ziggy())->toArray()['routes']['about']);
    }

    /** @test */
    public function handle_parameters()
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
            'uri' => 'users/{...ids}',
            'methods' => ['GET'],
            'parameters' => ['ids'],
        ], (new Ziggy())->toArray()['routes']['users.some']);
    }

    /** @test */
    public function handle_binding_fields()
    {
        //
    }

    /** @test */
    public function handle_domains()
    {
        //
    }

    /** @test */
    public function handle_middleware()
    {
        //
    }

    /** @test */
    public function handle_multiple_root_paths()
    {
        //
    }

    /** @test */
    public function handle_index_pages()
    {
        //
    }
}

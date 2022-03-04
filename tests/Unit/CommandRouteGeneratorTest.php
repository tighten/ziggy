<?php

namespace Tests\Unit;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;
use Tightenco\Ziggy\Output\File;

class CommandRouteGeneratorTest extends TestCase
{
    protected function tearDown(): void
    {
        if (file_exists(base_path('resources/js')) && is_dir(base_path('resources/js'))) {
            array_map(function ($file) {
                unlink($file);
            }, glob(base_path('resources/js/*')));
        }

        parent::tearDown();
    }

    /** @test */
    public function can_create_file()
    {
        Artisan::call('ziggy:generate');

        $this->assertFileExists(base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_create_file_in_correct_location_when_called_outside_project_root()
    {
        chdir('..');
        $this->assertNotEquals(base_path(), getcwd());

        Artisan::call('ziggy:generate');

        $this->assertFileExists(base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_generate_file_with_named_routes()
    {
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->get('slashes/{slug}', $this->noop())->where('slug', '.*')->name('slashes');
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate');

        $this->assertFileEquals('./tests/fixtures/ziggy.js', base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_generate_file_with_custom_url()
    {
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->getRoutes()->refreshNameLookups();
        URL::defaults(['locale' => 'en']);

        Artisan::call('ziggy:generate', ['--url' => 'http://example.org']);

        $this->assertFileEquals('./tests/fixtures/custom-url.js', base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_generate_file_with_custom_pathname()
    {
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->getRoutes()->refreshNameLookups();
        URL::defaults(['locale' => 'en']);

        Artisan::call('ziggy:generate', ['--url' => '/foo/bar']);

        $this->assertFileEquals('./tests/fixtures/custom-pathname.js', base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_generate_file_with_config_applied()
    {
        config(['ziggy.except' => ['admin.*']]);
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->get('slashes/{slug}', $this->noop())->where('slug', '.*')->name('slashes');
        $router->get('admin', $this->noop())->name('admin.dashboard'); // Excluded, should NOT be present in file
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate');

        $this->assertFileEquals('./tests/fixtures/ziggy.js', base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_generate_file_with_custom_output_formatter()
    {
        config([
            'ziggy' => [
                'except' => ['admin.*'],
                'output' => [
                    'file' => CustomFileFormatter::class,
                ],
            ],
        ]);

        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->get('admin', $this->noop())->name('admin.dashboard'); // Excluded, should NOT be present in file
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate');

        $this->assertFileEquals('./tests/fixtures/ziggy-custom.js', base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_generate_file_for_specific_configured_route_group()
    {
        config([
            'ziggy.except' => ['admin.*'],
            'ziggy.groups' => ['admin' => ['admin.*']],
        ]);
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->get('admin', $this->noop())->name('admin.dashboard');
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate', ['path' => 'resources/js/admin.js', '--group' => 'admin']);

        $this->assertFileEquals('./tests/fixtures/admin.js', base_path('resources/js/admin.js'));
    }
}

class CustomFileFormatter extends File
{
    public function __toString(): string
    {
        return <<<JAVASCRIPT
// This is a custom template
const Ziggy = {$this->ziggy->toJson()};
export { Ziggy };

JAVASCRIPT;
    }
}

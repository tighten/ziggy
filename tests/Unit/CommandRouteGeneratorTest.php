<?php

namespace Tightenco\Tests\Unit;

use Illuminate\Support\Facades\Artisan;
use Tightenco\Tests\TestCase;

class CommandRouteGeneratorTest extends TestCase
{
    /** @test */
    function file_is_created_when_ziggy_generate_is_called()
    {
        Artisan::call('ziggy:generate');

        $this->assertFileExists(base_path('resources/assets/js/ziggy.js'));
    }

    /** @test */
    function file_is_created_when_ziggy_generate_is_called_from_outside_project_root()
    {
        chdir('..');
        $this->assertNotEquals(base_path(), getcwd());

        Artisan::call('ziggy:generate');

        $this->assertFileExists(base_path('resources/assets/js/ziggy.js'));
    }

    /** @test */
    function file_is_created_with_the_expected_structure_when_named_routes_exist()
    {
        $router = app('router');

        $router->get('/posts/{post}/comments', function () {
            return '';
        })
            ->name('postComments.index');

        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate');

        $this->assertFileEquals('./tests/assets/js/ziggy.js', base_path('resources/assets/js/ziggy.js'));
    }

    /** @test */
    function file_is_created_with_a_custom_url()
    {
        $router = app('router');

        $router->get('/posts/{post}/comments', function () {
            return '';
        })
            ->name('postComments.index');

        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate', ['--url' => 'http://example.org']);

        $this->assertFileEquals('./tests/assets/js/custom-url.js', base_path('resources/assets/js/ziggy.js'));
    }

    /** @test */
    function file_is_created_with_the_expected_group()
    {
        app()['config']->set('ziggy', [
            'blacklist' => ['admin.*'],

            'groups' => [
                'admin' => ['admin.*'],
            ],
        ]);

        $router = app('router');

        $router->get('/posts/{post}/comments', function () {
            return '';
        })
            ->name('postComments.index');

        $router->get('/admin', function () {
            return '';
        })
            ->name('admin.dashboard');

        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate');

        $this->assertFileEquals('./tests/assets/js/ziggy.js', base_path('resources/assets/js/ziggy.js'));

        Artisan::call('ziggy:generate', ['path' => 'resources/assets/js/admin.js', '--group' => 'admin']);

        $this->assertFileEquals('./tests/assets/js/admin.js', base_path('resources/assets/js/admin.js'));
    }

    protected function tearDown(): void
    {
        if (file_exists(base_path('resources/assets/js')) && is_dir(base_path('resources/assets/js'))) {
            array_map(function ($file) {
                unlink($file);
            }, glob(base_path('resources/assets/js/*')));
        }

        parent::tearDown();
    }
}

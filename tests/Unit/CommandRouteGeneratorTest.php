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

        $this->assertFileExists(base_path('resources/js/ziggy.js'));
    }

    /** @test */
    function file_is_created_when_ziggy_generate_is_called_from_outside_project_root()
    {
        chdir('..');
        $this->assertNotEquals(base_path(), getcwd());

        Artisan::call('ziggy:generate');

        $this->assertFileExists(base_path('resources/js/ziggy.js'));
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

        if ($this->laravelVersion(7)) {
            $this->assertFileEquals('./tests/fixtures/ziggy.js', base_path('resources/js/ziggy.js'));
        } else {
            $this->assertSame(
                str_replace(',"bindings":[]', '', file_get_contents(__DIR__ . '/tests/fixtures/ziggy.js')),
                file_get_contents(base_path('resources/js/ziggy.js'))
            );
        }
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

        if ($this->laravelVersion(7)) {
            $this->assertFileEquals('./tests/fixtures/custom-url.js', base_path('resources/js/ziggy.js'));
        } else {
            $this->assertSame(
                str_replace(',"bindings":[]', '', file_get_contents(__DIR__ . '/tests/fixtures/custom-url.js')),
                file_get_contents(base_path('resources/js/ziggy.js'))
            );
        }
    }

    /** @test */
    function file_is_created_with_the_expected_group()
    {
        app()['config']->set('ziggy', [
            'except' => ['admin.*'],

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

        if ($this->laravelVersion(7)) {
            $this->assertFileEquals('./tests/fixtures/ziggy.js', base_path('resources/js/ziggy.js'));
        } else {
            $this->assertSame(
                str_replace(',"bindings":[]', '', file_get_contents(__DIR__ . '/tests/fixtures/ziggy.js')),
                file_get_contents(base_path('resources/js/ziggy.js'))
            );
        }

        Artisan::call('ziggy:generate', ['path' => 'resources/js/admin.js', '--group' => 'admin']);

        if ($this->laravelVersion(7)) {
            $this->assertFileEquals('./tests/fixtures/admin.js', base_path('resources/js/admin.js'));
        } else {
            $this->assertSame(
                str_replace(',"bindings":[]', '', file_get_contents(__DIR__ . '/tests/fixtures/admin.js')),
                file_get_contents(base_path('resources/js/admin.js'))
            );
        }
    }

    protected function tearDown(): void
    {
        if (file_exists(base_path('resources/js')) && is_dir(base_path('resources/js'))) {
            array_map(function ($file) {
                unlink($file);
            }, glob(base_path('resources/js/*')));
        }

        parent::tearDown();
    }
}

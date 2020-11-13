<?php

namespace Tests\Unit;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Tests\TestCase;

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
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate');

        $this->assertFileEquals('./tests/fixtures/ziggy.js', base_path('resources/js/ziggy.js'));
    }

    /**
     * @test
     * This covers an edge case where the APP_URL environment variable doesn't
     * include a protocol. We can't override environment variables for a single
     * test, so to run this we have to change APP_URL to just 'ziggy.dev' in
     * phpunit.xml.dist, run just this test, and then change it back.
     */
    public function can_generate_file_when_app_url_is_missing_protocol()
    {
        if (Str::startsWith(config('app.url'), 'http')) {
            $this->markTestSkipped('N/A: valid APP_URL.');
        }

        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate');

        $this->assertFileEquals('./tests/fixtures/no-protocol.js', base_path('resources/js/ziggy.js'));
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

    /**
     * @test
     * This test fails when APP_URL doesn't include a protocol—this is expected
     * and correct. If the --url options is passed an invalid URL it has to use
     * the url() helper, which is known to behave weirdly if APP_URL is invalid.
     */
    public function can_generate_file_with_invalid_custom_url()
    {
        if (! Str::startsWith(config('app.url'), 'http')) {
            $this->markTestIncomplete('N/A: invalid APP_URL.');
        }

        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->getRoutes()->refreshNameLookups();
        URL::defaults(['locale' => 'en']);

        Artisan::call('ziggy:generate', ['--url' => '/foo/bar']);

        $this->assertFileEquals('./tests/fixtures/invalid-url.js', base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_generate_file_with_config_applied()
    {
        config(['ziggy' => [
            'except' => ['admin.*'],
        ]]);
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->get('admin', $this->noop())->name('admin.dashboard'); // Excluded, should NOT be present in file
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate');

        $this->assertFileEquals('./tests/fixtures/ziggy.js', base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_generate_file_for_specific_configured_route_group()
    {
        config(['ziggy' => [
            'except' => ['admin.*'],
            'groups' => [
                'admin' => ['admin.*'],
            ],
        ]]);
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->get('admin', $this->noop())->name('admin.dashboard');
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate', ['path' => 'resources/js/admin.js', '--group' => 'admin']);

        $this->assertFileEquals('./tests/fixtures/admin.js', base_path('resources/js/admin.js'));
    }
}

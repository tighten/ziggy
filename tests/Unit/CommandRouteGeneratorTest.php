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
        foreach (['config/watched.php', 'routes/watched.php'] as $file) {
            if (file_exists(base_path($file))) {
                unlink(base_path($file));
            }
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

    /** @test */
    public function can_generate_file_for_multiple_arguments()
    {
        config([
            'ziggy.except' => ['admin.*'],
            'ziggy.groups' => ['admin' => ['admin.*']],
        ]);
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->get('admin', $this->noop())->name('admin.dashboard');
        $router->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate', ['path' => ['resources/js/admin.js', 'resources/js/public.js'], '--group' => ['admin'], '--url' => [null, 'http://example.org']]);

        $this->assertFileEquals('./tests/fixtures/admin.js', base_path('resources/js/admin.js'));
        $this->assertFileEquals('./tests/fixtures/public.js', base_path('resources/js/public.js'));
    }

    /** @test */
    public function can_watch_file_for_changes()
    {
        if (!class_exists(\Fiber::class)) {
            $this->markTestSkipped('Watcher test requires fibers and can only run on PHP >= 8.1');
        }
        if (!function_exists('inotify_init')) {
            $this->markTestSkipped('Watcher test requires inotify extension');
        }

        $config = [
            'reset' => true,
            'ziggy.except' => ['admin.*'],
            'ziggy.groups' => ['admin' => ['admin.*']],
        ];
        config($config);
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->get('admin', $this->noop())->name('admin.dashboard');
        $router->getRoutes()->refreshNameLookups();

        file_put_contents(base_path('config/watched.php'), '<?php //1');

        $fiber = new \Fiber(function() : void {
            Artisan::call('ziggy:generate', ['path' => ['resources/js/admin.js', 'resources/js/public.js'], '--group' => ['admin'], '--url' => [null, 'http://example.org'], '--watch' => 'config/watched.php']);
        });
        $fiber->start();

        $this->assertFileEquals('./tests/fixtures/admin.js', base_path('resources/js/admin.js'));
        $this->assertFileEquals('./tests/fixtures/public.js', base_path('resources/js/public.js'));

        $router->get('admin/second', $this->noop())->name('admin.second');
        $router->getRoutes()->refreshNameLookups();

        $this->assertEquals('waiting', $fiber->resume(true));

        file_put_contents(base_path('config/watched.php'), '<?php //2');

        $this->assertEquals('before-generate', $fiber->resume(true));

        // Manual config should be reset
        $this->assertNull(config('reset'));

        // So set it again
        config($config);

        $this->assertEquals('generated', $fiber->resume(true));

        $this->assertFileEquals('./tests/fixtures/admin-watch.js', base_path('resources/js/admin.js'));
        $this->assertFileEquals('./tests/fixtures/public.js', base_path('resources/js/public.js'));

        $this->assertEquals('waiting', $fiber->resume(true));

        file_put_contents(base_path('routes/watched.php'), '<?php //1');

        $this->assertEquals('before-generate', $fiber->resume(true));
        $this->assertEquals('generated', $fiber->resume(true));

        // Should wait indefinitely
        $this->assertEquals('waiting', $fiber->resume(true));
        $this->assertEquals('waiting', $fiber->resume(true));
        $this->assertEquals('waiting', $fiber->resume(true));

        file_put_contents(base_path('config/watched.php'), '<?php { // Parse error ');

        // Should not cause a generation and should still be in the loop
        $this->assertEquals('waiting', $fiber->resume(true));

        file_put_contents(base_path('config/watched.php'), '<?php //2');

        $this->assertEquals('before-generate', $fiber->resume(true));
        $this->assertEquals('generated', $fiber->resume(true));

        $fiber->resume(false); // Exit watcher
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

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

    /** @test */
    public function can_generate_file_using_config_path()
    {
        config(['ziggy.output.path' => 'resources/js/custom.js']);

        Artisan::call('ziggy:generate');

        $this->assertFileExists(base_path('resources/js/custom.js'));
    }

    /** @test */
    public function can_generate_dts_file()
    {
        app('router')->get('posts', $this->noop())->name('posts.index');
        app('router')->post('posts/{post}/comments', PostCommentController::class)->name('postComments.store');
        app('router')->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate',  ['--types' => true]);

        // Normalize line endings (`json_encode` always uses Unix line endings)
        if (PHP_OS_FAMILY === 'Windows') {
            file_put_contents(
                base_path('resources/js/ziggy.d.ts'),
                preg_replace('/\r?\n/', "\r\n", file_get_contents(base_path('resources/js/ziggy.d.ts'))),
            );
        }

        $this->assertFileEquals('./tests/fixtures/ziggy.d.ts', base_path('resources/js/ziggy.d.ts'));
    }

    /** @test */
    public function can_generate_dts_file_with_scoped_bindings()
    {
        if (! $this->laravelVersion(7)) {
            $this->markTestSkipped('Requires Laravel >=7');
        }

        app('router')->get('posts', $this->noop())->name('posts.index');
        app('router')->get('posts/{post}/comments/{comment:uuid}', PostCommentController::class)->name('postComments.show');
        app('router')->post('posts/{post}/comments', PostCommentController::class)->name('postComments.store');
        app('router')->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate',  ['--types' => true]);

        // Normalize line endings (`json_encode` always uses Unix line endings)
        if (PHP_OS_FAMILY === 'Windows') {
            file_put_contents(
                base_path('resources/js/ziggy.d.ts'),
                preg_replace('/\r?\n/', "\r\n", file_get_contents(base_path('resources/js/ziggy.d.ts'))),
            );
        }

        $this->assertFileEquals('./tests/fixtures/ziggy-7.d.ts', base_path('resources/js/ziggy.d.ts'));
    }

    /** @test */
    public function can_generate_dts_file_without_routes()
    {
        app('router')->get('posts', $this->noop())->name('posts.index');
        app('router')->post('posts/{post}/comments', PostCommentController::class)->name('postComments.store');
        app('router')->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate', ['--types-only' => true]);

        $this->assertFileExists(base_path('resources/js/ziggy.d.ts'));
        $this->assertFileDoesNotExist(base_path('resources/js/ziggy.js'));
    }

    /** @test */
    public function can_derive_dts_file_path_from_given_path()
    {
        config(['ziggy.output.path' => 'resources/js/custom.js']);
        app('router')->get('posts', $this->noop())->name('posts.index');
        app('router')->post('posts/{post}/comments', PostCommentController::class)->name('postComments.store');
        app('router')->getRoutes()->refreshNameLookups();

        Artisan::call('ziggy:generate', ['--types-only' => true]);

        $this->assertFileExists(base_path('resources/js/custom.d.ts'));
        $this->assertFileDoesNotExist(base_path('resources/js/ziggy.d.ts'));
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

class PostCommentController
{
    public function __invoke($post, $comment) {
        //
    }
}

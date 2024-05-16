<?php

use Illuminate\Support\Facades\Artisan;
use \Tighten\Ziggy\Output\File;
use Illuminate\Support\Facades\URL;

afterEach(function () {
    if (file_exists(base_path('resources/js')) && is_dir(base_path('resources/js'))) {
        array_map(function ($file) {
            unlink($file);
        }, glob(base_path('resources/js/*')));
    }

});

test('can create file', function () {
    Artisan::call('ziggy:generate');

    expect(base_path('resources/js/ziggy.js'))->toBeFile();
});

test('can create file in correct location when called outside project root', function () {
    chdir('..');
    $this->assertNotEquals(base_path(), getcwd());

    Artisan::call('ziggy:generate');

    expect(base_path('resources/js/ziggy.js'))->toBeFile();
});

test('can generate file with named routes', function () {
    $router = app('router');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->get('slashes/{slug}', fn () => '')->where('slug', '.*')->name('slashes');
    $router->getRoutes()->refreshNameLookups();

    Artisan::call('ziggy:generate');

    $this->assertFileEquals('./tests/fixtures/ziggy.js', base_path('resources/js/ziggy.js'));
});

test('can generate file with custom url', function () {
    $router = app('router');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->getRoutes()->refreshNameLookups();
    URL::defaults(['locale' => 'en']);

    Artisan::call('ziggy:generate', ['--url' => 'http://example.org']);

    $this->assertFileEquals('./tests/fixtures/custom-url.js', base_path('resources/js/ziggy.js'));
});

test('can generate file with custom pathname', function () {
    $router = app('router');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->getRoutes()->refreshNameLookups();
    URL::defaults(['locale' => 'en']);

    Artisan::call('ziggy:generate', ['--url' => '/foo/bar']);

    $this->assertFileEquals('./tests/fixtures/custom-pathname.js', base_path('resources/js/ziggy.js'));
});

test('can generate file with config applied', function () {
    config(['ziggy.except' => ['admin.*']]);
    $router = app('router');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->get('slashes/{slug}', fn () => '')->where('slug', '.*')->name('slashes');
    $router->get('admin', fn () => '')->name('admin.dashboard');
    // Excluded, should NOT be present in file
    $router->getRoutes()->refreshNameLookups();

    Artisan::call('ziggy:generate');

    $this->assertFileEquals('./tests/fixtures/ziggy.js', base_path('resources/js/ziggy.js'));
});

test('can generate file with custom output formatter', function () {
    config([
        'ziggy' => [
            'except' => ['admin.*'],
            'output' => [
                'file' => CustomFileFormatter::class,
            ],
        ],
    ]);

    $router = app('router');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->get('admin', fn () => '')->name('admin.dashboard');
    // Excluded, should NOT be present in file
    $router->getRoutes()->refreshNameLookups();

    Artisan::call('ziggy:generate');

    $this->assertFileEquals('./tests/fixtures/ziggy-custom.js', base_path('resources/js/ziggy.js'));
});

test('can generate file for specific configured route group', function () {
    config([
        'ziggy.except' => ['admin.*'],
        'ziggy.groups' => ['admin' => ['admin.*']],
    ]);
    $router = app('router');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->get('admin', fn () => '')->name('admin.dashboard');
    $router->getRoutes()->refreshNameLookups();

    Artisan::call('ziggy:generate', ['path' => 'resources/js/admin.js', '--group' => 'admin']);

    $this->assertFileEquals('./tests/fixtures/admin.js', base_path('resources/js/admin.js'));
});

test('can generate file using config path', function () {
    config(['ziggy.output.path' => 'resources/js/custom.js']);

    Artisan::call('ziggy:generate');

    expect(base_path('resources/js/custom.js'))->toBeFile();
});

test('can generate dts file', function () {
    app('router')->get('posts', fn () => '')->name('posts.index');
    app('router')->post('posts/{post}/comments', PostCommentController::class)->name('postComments.store');
    app('router')->post('posts/{post}/comments/{comment?}', PostCommentController::class)->name('postComments.storeComment');
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
});

test('can generate dts file with scoped bindings', function () {
    app('router')->get('posts', fn () => '')->name('posts.index');
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
});

test('can generate dts file without routes', function () {
    app('router')->get('posts', fn () => '')->name('posts.index');
    app('router')->post('posts/{post}/comments', PostCommentController::class)->name('postComments.store');
    app('router')->getRoutes()->refreshNameLookups();

    Artisan::call('ziggy:generate', ['--types-only' => true]);

    expect(base_path('resources/js/ziggy.d.ts'))->toBeFile();
    $this->assertFileDoesNotExist(base_path('resources/js/ziggy.js'));
});

test('can derive dts file path from given path', function () {
    config(['ziggy.output.path' => 'resources/js/custom.js']);
    app('router')->get('posts', fn () => '')->name('posts.index');
    app('router')->post('posts/{post}/comments', PostCommentController::class)->name('postComments.store');
    app('router')->getRoutes()->refreshNameLookups();

    Artisan::call('ziggy:generate', ['--types-only' => true]);

    expect(base_path('resources/js/custom.d.ts'))->toBeFile();
    $this->assertFileDoesNotExist(base_path('resources/js/ziggy.d.ts'));
});

test('can generate correct file extensions from js path argument', function () {
    Artisan::call('ziggy:generate', ['path' => 'resources/scripts/x.js', '--types' => true]);

    expect(base_path('resources/scripts/x.js'))->toBeFile();
    expect(base_path('resources/scripts/x.d.ts'))->toBeFile();
});

test('can generate correct file extensions from ts path argument', function () {
    Artisan::call('ziggy:generate', ['path' => 'resources/scripts/y.ts', '--types' => true]);

    expect(base_path('resources/scripts/y.js'))->toBeFile();
    expect(base_path('resources/scripts/y.d.ts'))->toBeFile();
});

test('can generate correct file extensions from dts path argument', function () {
    Artisan::call('ziggy:generate', ['path' => 'resources/scripts/z.d.ts', '--types' => true]);

    expect(base_path('resources/scripts/z.js'))->toBeFile();
    expect(base_path('resources/scripts/z.d.ts'))->toBeFile();
});

test('can generate correct file extensions from ambiguous path argument', function () {
    Artisan::call('ziggy:generate', ['path' => 'resources/scripts/foo', '--types' => true]);

    expect(base_path('resources/scripts/foo.js'))->toBeFile();
    expect(base_path('resources/scripts/foo.d.ts'))->toBeFile();
});

test('can generate correct file extensions from directory path argument', function () {
    Artisan::call('ziggy:generate', ['path' => 'resources/js', '--types' => true]);

    expect(base_path('resources/js/ziggy.js'))->toBeFile();
    expect(base_path('resources/js/ziggy.d.ts'))->toBeFile();
});

class CustomFileFormatter extends File
{
    function __toString(): string
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
    function __invoke($post, $comment)
    {
        //
    }
}

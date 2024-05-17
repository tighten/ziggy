<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Tighten\Ziggy\Output\File;

use function Pest\Laravel\artisan;

beforeEach(function () {
    if (is_dir(base_path('resources/js'))) {
        array_map(fn ($file) => unlink($file), glob(base_path('resources/js/*')));
    }
});

test('create file', function () {
    artisan('ziggy:generate');

    expect(base_path('resources/js/ziggy.js'))->toBeFile();
});

test('create file in correct location when called outside project root', function () {
    chdir('..');

    expect(getcwd())->not->toBe(base_path());

    artisan('ziggy:generate');

    expect(base_path('resources/js/ziggy.js'))->toBeFile();
});

test('generate routes file', function () {
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');
    Route::get('slashes/{slug}', fn () => '')->where('slug', '.*')->name('slashes');

    artisan('ziggy:generate');

    expect(base_path('resources/js/ziggy.js'))->toBeFile('./tests/fixtures/ziggy.js');
});

test('generate file with custom url', function () {
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');
    URL::defaults(['locale' => 'en']);

    artisan('ziggy:generate --url http://example.org');

    expect(base_path('resources/js/ziggy.js'))->toBeFile('./tests/fixtures/custom-url.js');
});

test('generate file with custom pathname', function () {
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');

    artisan('ziggy:generate --url /foo/bar');

    expect(base_path('resources/js/ziggy.js'))->toBeFile('./tests/fixtures/custom-pathname.js');
});

test('generate file respecting config', function () {
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');
    Route::get('slashes/{slug}', fn () => '')->where('slug', '.*')->name('slashes');
    Route::get('admin', fn () => '')->name('admin.dashboard'); // Excluded by config

    config(['ziggy.except' => ['admin.*']]);

    artisan('ziggy:generate');

    expect(base_path('resources/js/ziggy.js'))->toBeFile('./tests/fixtures/ziggy.js');
});

test('generate file with custom output formatter', function () {
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');
    Route::get('admin', fn () => '')->name('admin.dashboard'); // Excluded by config

    config([
        'ziggy' => [
            'except' => ['admin.*'],
            'output' => [
                'file' => CustomFile::class,
            ],
        ],
    ]);

    artisan('ziggy:generate');

    expect(base_path('resources/js/ziggy.js'))->toBeFile('./tests/fixtures/ziggy-custom.js');
});

test('generate file for groups', function () {
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');
    Route::get('admin', fn () => '')->name('admin.dashboard');

    config([
        'ziggy.except' => ['admin.*'],
        'ziggy.groups' => [
            'admin' => ['admin.*'],
        ],
    ]);

    artisan('ziggy:generate resources/js/admin.js --group admin');

    expect(base_path('resources/js/admin.js'))->toBeFile('./tests/fixtures/admin.js');
});

test('generate file at path set in config', function () {
    config(['ziggy.output.path' => 'resources/js/custom.js']);

    artisan('ziggy:generate');

    expect(base_path('resources/js/custom.js'))->toBeFile();
});

test('generate dts file', function () {
    Route::get('posts', fn () => '')->name('posts.index');
    Route::post('posts/{post}/comments', fn ($post, $comment) => '')->name('comments.store');
    Route::get('posts/{post}/comments/{comment:uuid}', fn ($post, $comment) => '')->name('comments.show');
    Route::post('posts/{post}/reactions/{reaction?}', fn ($post, $reaction) => '')->name('reactions.store');

    artisan('ziggy:generate --types');

    if (windows_os()) {
        // `json_encode` always uses Unix line endings
        file_put_contents(
            base_path('resources/js/ziggy.d.ts'),
            preg_replace('/\r?\n/', "\r\n", file_get_contents(base_path('resources/js/ziggy.d.ts'))),
        );
    }

    expect(base_path('resources/js/ziggy.d.ts'))->toBeFile('./tests/fixtures/ziggy.d.ts');
});

test('generate dts file without generating routes file', function () {
    artisan('ziggy:generate --types-only');

    expect(base_path('resources/js/ziggy.d.ts'))->toBeFile();
    expect(base_path('resources/js/ziggy.js'))->not->toBeFile();
});

test('infer dts file name from routes file name', function () {
    config(['ziggy.output.path' => 'resources/js/custom.js']);

    artisan('ziggy:generate --types-only');

    expect(base_path('resources/js/custom.d.ts'))->toBeFile();
    expect(base_path('resources/js/ziggy.d.ts'))->not->toBeFile();
});

test('generate correct routes and dts files based on provided arguments', function (string $args, array $files) {
    if (is_dir(base_path('resources/scripts'))) {
        array_map(fn ($file) => unlink($file), glob(base_path('resources/scripts/*')));
        rmdir(base_path('resources/scripts'));
    }

    artisan("ziggy:generate {$args}");

    expect(array_map(fn ($f) => base_path($f), $files))->each->toBeFile();
})->with([
    ['resources/js/x.js --types', ['resources/js/x.js', 'resources/js/x.d.ts']],
    ['resources/js/y.ts --types', ['resources/js/y.js', 'resources/js/y.d.ts']],
    ['resources/js/z.d.ts --types', ['resources/js/z.js', 'resources/js/z.d.ts']],
    ['resources/scripts/foo --types', ['resources/scripts/foo.js', 'resources/scripts/foo.d.ts']],
    ['resources/js --types', ['resources/js/ziggy.js', 'resources/js/ziggy.d.ts']],
]);

class CustomFile extends File
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

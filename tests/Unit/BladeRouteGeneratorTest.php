<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Tighten\Ziggy\BladeRouteGenerator;
use Tighten\Ziggy\Ziggy;

beforeEach(function () {
    BladeRouteGenerator::$generated = false;
});

test('generate named routes', function () {
    Route::get('/', fn () => ''); // Not named, should not be included in JSON output
    Route::get('posts', fn () => '')->name('posts.index');
    Route::post('posts', fn () => '')->name('posts.store');
    Route::get('posts/{post}', fn () => '')->name('posts.show');
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');

    $output = (new BladeRouteGenerator)->generate();
    $config = json_decode(Str::between($output, 'const Ziggy=', ';!'), true);

    expect($config['routes'])
        ->toHaveCount(4)
        ->toHaveKey('posts.index')
        ->toHaveKey('posts.store')
        ->toHaveKey('posts.show')
        ->toHaveKey('postComments.index');
});

test('generate mergeable route list on repeated compiles', function () {
    Route::get('posts', fn () => '')->name('posts.index');

    (new BladeRouteGenerator)->generate();
    $output = (new BladeRouteGenerator)->generate();
    $config = json_decode(Str::between($output, 'Object.assign(Ziggy.routes,', ');</script>'), true);

    expect($config)->toBe([
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
    ]);
});

test('generate basic route config', function () {
    Route::get('posts/{post}/comments', fn () => '')->name('postComments.index');

    expect((new BladeRouteGenerator)->generate())->toContain(json_encode([
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
    ]));
});

test('generate route config for custom domain', function () {
    Route::domain('{account}.myapp.com')->get('posts/{post}/comments', fn () => '')->name('postComments.index');

    expect((new BladeRouteGenerator)->generate())->toContain(json_encode([
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'domain' => '{account}.myapp.com',
            'parameters' => ['account', 'post'],
        ],
    ]));
});

test('generate route config for groups', function (array $groups, array $names) {
    Route::get('posts', fn () => '')->name('posts.index');
    Route::get('posts/{post}', fn () => '')->name('posts.show');
    Route::get('users/{user}', fn () => '')->name('users.show');

    config(['ziggy.groups' => [
        'guest' => ['posts.*'],
        'admin' => ['users.*'],
    ]]);

    $output = (new BladeRouteGenerator)->generate($groups);
    $config = json_decode(Str::between($output, 'const Ziggy=', ';!'), true);

    expect($config['routes'])
        ->toHaveCount(count($names))
        ->toHaveKeys($names);
})->with([
    [['guest'], ['posts.index', 'posts.show']],
    [['guest', 'admin'], ['posts.index', 'posts.show', 'users.show']],
]);

test('render csp nonce', function () {
    expect((new BladeRouteGenerator)->generate(false, 'test-nonce'))
        ->toContain('<script type="text/javascript" nonce="test-nonce">');
});

test('render script tag', function () {
    Route::get('posts', fn () => '')->name('posts.index');

    $config = (new Ziggy)->toJson();
    $routeFunction = file_get_contents(__DIR__ . '/../../dist/route.umd.js');

    expect((new BladeRouteGenerator)->generate())->toBe(
        <<<HTML
        <script type="text/javascript">const Ziggy={$config};{$routeFunction}</script>
        HTML
    );
});

test('render merge script tag', function () {
    Route::get('posts', fn () => '')->name('posts.index');

    $config = json_encode((new Ziggy)->toArray()['routes']);

    (new BladeRouteGenerator)->generate();

    expect((new BladeRouteGenerator)->generate())->toBe(
        <<<HTML
        <script type="text/javascript">Object.assign(Ziggy.routes,{$config});</script>
        HTML
    );
});

test('compile blade directive', function (string $blade, string $output) {
    expect(app('blade.compiler')->compileString($blade))->toBe($output);
})->with([
    ['@routes', "<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(); ?>"],
    ["@routes('admin')", "<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate('admin'); ?>"],
    ["@routes(['admin', 'guest'])", "<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(['admin', 'guest']); ?>"],
    ["@routes(null, 'nonce')", "<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(null, 'nonce'); ?>"],
    ["@routes(nonce: 'nonce')", "<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(nonce: 'nonce'); ?>"],
    ["@routes(['admin', 'guest'], 'nonce')", "<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(['admin', 'guest'], 'nonce'); ?>"],
]);

<?php

use Illuminate\Support\Str;
use Tighten\Ziggy\BladeRouteGenerator;
use Tighten\Ziggy\Ziggy;


test('can resolve generator from container', function () {
    $generator = app(BladeRouteGenerator::class);

    $this->assertStringContainsString('"routes":[]', $generator->generate());
});

test('can generate named routes', function () {
    $router = app('router');
    $router->get('/', fn () => '');
    // Not named, should NOT be included in JSON output
    $router->get('posts', fn () => '')->name('posts.index');
    $router->get('posts/{post}', fn () => '')->name('posts.show');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->post('posts', fn () => '')->name('posts.store');
    $router->getRoutes()->refreshNameLookups();

    BladeRouteGenerator::$generated = false;
    $output = (new BladeRouteGenerator)->generate();
    $ziggy = json_decode(Str::before(Str::after($output, 'Ziggy='), ';!'), true);

    expect($ziggy['routes'])->toHaveCount(4);
    expect($ziggy['routes'])->toHaveKey('posts.index');
    expect($ziggy['routes'])->toHaveKey('posts.show');
    expect($ziggy['routes'])->toHaveKey('posts.store');
    expect($ziggy['routes'])->toHaveKey('postComments.index');
});

test('can generate mergeable json payload on repeated compiles', function () {
    $router = app('router');
    $router->get('posts', fn () => '')->name('posts.index');
    $router->getRoutes()->refreshNameLookups();

    BladeRouteGenerator::$generated = false;
    (new BladeRouteGenerator)->generate();
    $script = (new BladeRouteGenerator)->generate();

    expect(json_decode(Str::before(Str::after($script, 'Ziggy.routes,'), ');'), true))->toBe([
        'posts.index' => [
            'uri' => 'posts',
            'methods' => ['GET', 'HEAD'],
        ],
    ]);
});

test('can generate routes for default domain', function () {
    $router = app('router');
    $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    $router->getRoutes()->refreshNameLookups();

    $expected = [
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'parameters' => ['post'],
        ],
    ];

    $this->assertStringContainsString(json_encode($expected), (new BladeRouteGenerator)->generate());
});

test('can generate routes for custom domain', function () {
    $router = app('router');
    $router->domain('{account}.myapp.com')->group(function () use ($router) {
        $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
    });
    $router->getRoutes()->refreshNameLookups();

    $expected = [
        'postComments.index' => [
            'uri' => 'posts/{post}/comments',
            'methods' => ['GET', 'HEAD'],
            'domain' => '{account}.myapp.com',
            'parameters' => ['account', 'post'],
        ],
    ];

    $this->assertStringContainsString(json_encode($expected), (new BladeRouteGenerator)->generate());
});

test('can generate routes for given group or groups', function () {
    $router = app('router');
    $router->get('posts', fn () => '')->name('posts.index');
    $router->get('posts/{post}', fn () => '')->name('posts.show');
    $router->get('users/{user}', fn () => '')->name('users.show');
    $router->getRoutes()->refreshNameLookups();

    config(['ziggy.groups' => [
        'guest' => ['posts.*'],
        'admin' => ['users.*'],
    ]]);

    BladeRouteGenerator::$generated = false;
    $output = (new BladeRouteGenerator)->generate('guest');
    $ziggy = json_decode(Str::before(Str::after($output, 'Ziggy='), ';!'), true);

    expect($ziggy['routes'])->toHaveCount(2);
    expect($ziggy['routes'])->toHaveKey('posts.index');
    expect($ziggy['routes'])->toHaveKey('posts.show');

    BladeRouteGenerator::$generated = false;
    $output = (new BladeRouteGenerator)->generate(['guest', 'admin']);
    $ziggy = json_decode(Str::before(Str::after($output, 'Ziggy='), ';!'), true);

    expect($ziggy['routes'])->toHaveCount(3);
    expect($ziggy['routes'])->toHaveKey('posts.index');
    expect($ziggy['routes'])->toHaveKey('posts.show');
    expect($ziggy['routes'])->toHaveKey('users.show');
});

test('can set csp nonce', function () {
    $this->assertStringContainsString(
        '<script type="text/javascript" nonce="supercalifragilisticexpialidocious">',
        (new BladeRouteGenerator)->generate(false, 'supercalifragilisticexpialidocious')
    );
});

test('can output script tag', function () {
    $router = app('router');
    $router->get('posts', fn () => '')->name('posts.index');
    BladeRouteGenerator::$generated = false;

    $json = (new Ziggy)->toJson();
    $routeFunction = file_get_contents(__DIR__ . '/../../dist/route.umd.js');

    expect((new BladeRouteGenerator)->generate())->toBe(<<<HTML
<script type="text/javascript">const Ziggy={$json};{$routeFunction}</script>
HTML);
});

test('can output merge script tag', function () {
    $router = app('router');
    $router->get('posts', fn () => '')->name('posts.index');
    (new BladeRouteGenerator)->generate();

    $json = json_encode((new Ziggy)->toArray()['routes']);

    expect((new BladeRouteGenerator)->generate())->toBe(<<<HTML
<script type="text/javascript">Object.assign(Ziggy.routes,{$json});</script>
HTML);
});

test('can compile blade directive', function () {
    expect(app('blade.compiler')->compileString('@routes'))->toBe("<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(); ?>");

    expect(app('blade.compiler')->compileString("@routes('admin')"))->toBe("<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate('admin'); ?>");
    expect(app('blade.compiler')->compileString("@routes(['admin', 'guest'])"))->toBe("<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(['admin', 'guest']); ?>");

    expect(app('blade.compiler')->compileString("@routes(null, 'nonce')"))->toBe("<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(null, 'nonce'); ?>");
    expect(app('blade.compiler')->compileString("@routes(nonce: 'nonce')"))->toBe("<?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(nonce: 'nonce'); ?>");
});

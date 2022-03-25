<?php

namespace Tests\Unit;

use Illuminate\Support\Str;
use Tests\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;
use Tightenco\Ziggy\Ziggy;

class BladeRouteGeneratorTest extends TestCase
{
    /** @test */
    public function can_resolve_generator_from_container()
    {
        $generator = app(BladeRouteGenerator::class);

        $this->assertStringContainsString('"routes":[]', $generator->generate());
    }

    /** @test */
    public function can_generate_named_routes()
    {
        $router = app('router');
        $router->get('/', $this->noop()); // Not named, should NOT be included in JSON output
        $router->get('posts', $this->noop())->name('posts.index');
        $router->get('posts/{post}', $this->noop())->name('posts.show');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->post('posts', $this->noop())->name('posts.store');
        $router->getRoutes()->refreshNameLookups();

        BladeRouteGenerator::$generated = false;
        $output = (new BladeRouteGenerator)->generate();
        $ziggy = json_decode(Str::after(Str::before($output, ';' . PHP_EOL), ' = '), true);

        $this->assertCount(4, $ziggy['routes']);
        $this->assertArrayHasKey('posts.index', $ziggy['routes']);
        $this->assertArrayHasKey('posts.show', $ziggy['routes']);
        $this->assertArrayHasKey('posts.store', $ziggy['routes']);
        $this->assertArrayHasKey('postComments.index', $ziggy['routes']);
    }

    /** @test */
    public function can_generate_mergeable_json_payload_on_repeated_compiles()
    {
        $router = app('router');
        $router->get('posts', $this->noop())->name('posts.index');
        $router->getRoutes()->refreshNameLookups();

        BladeRouteGenerator::$generated = false;
        (new BladeRouteGenerator)->generate();
        $script = (new BladeRouteGenerator)->generate();

        $this->assertSame([
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
        ], json_decode(Str::after(Str::before($script, ';' . PHP_EOL), 'routes = '), true));
    }

    /** @test */
    public function can_generate_routes_for_default_domain()
    {
        $router = app('router');
        $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        $router->getRoutes()->refreshNameLookups();

        $expected = [
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
            ],
        ];

        $this->assertStringContainsString(json_encode($expected), (new BladeRouteGenerator)->generate());
    }

    /** @test */
    public function can_generate_routes_for_custom_domain()
    {
        $router = app('router');
        $router->domain('{account}.myapp.com')->group(function () use ($router) {
            $router->get('posts/{post}/comments', $this->noop())->name('postComments.index');
        });
        $router->getRoutes()->refreshNameLookups();

        $expected = [
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => '{account}.myapp.com',
            ],
        ];

        $this->assertStringContainsString(json_encode($expected), (new BladeRouteGenerator)->generate());
    }

    /** @test */
    public function can_generate_routes_for_given_group_or_groups()
    {
        $router = app('router');
        $router->get('posts', $this->noop())->name('posts.index');
        $router->get('posts/{post}', $this->noop())->name('posts.show');
        $router->get('users/{user}', $this->noop())->name('users.show');
        $router->getRoutes()->refreshNameLookups();

        config(['ziggy.groups' => [
            'guest' => ['posts.*'],
            'admin' => ['users.*'],
        ]]);

        BladeRouteGenerator::$generated = false;
        $output = (new BladeRouteGenerator)->generate('guest');
        $ziggy = json_decode(Str::after(Str::before($output, ';' . PHP_EOL), ' = '), true);

        $this->assertCount(2, $ziggy['routes']);
        $this->assertArrayHasKey('posts.index', $ziggy['routes']);
        $this->assertArrayHasKey('posts.show', $ziggy['routes']);

        BladeRouteGenerator::$generated = false;
        $output = (new BladeRouteGenerator)->generate(['guest', 'admin']);
        $ziggy = json_decode(Str::after(Str::before($output, ';' . PHP_EOL), ' = '), true);

        $this->assertCount(3, $ziggy['routes']);
        $this->assertArrayHasKey('posts.index', $ziggy['routes']);
        $this->assertArrayHasKey('posts.show', $ziggy['routes']);
        $this->assertArrayHasKey('users.show', $ziggy['routes']);
    }

    /** @test */
    public function can_set_csp_nonce()
    {
        $this->assertStringContainsString(
            '<script type="text/javascript" nonce="supercalifragilisticexpialidocious">',
            (new BladeRouteGenerator)->generate(false, 'supercalifragilisticexpialidocious')
        );
    }

    /** @test */
    public function can_output_script_tag()
    {
        $router = app('router');
        $router->get('posts', $this->noop())->name('posts.index');
        BladeRouteGenerator::$generated = false;

        $json = (new Ziggy)->toJson();
        $routeFunction = file_get_contents(__DIR__ . '/../../dist/index.js');

        $this->assertSame(
            <<<HTML
<script type="text/javascript">
    const Ziggy = {$json};

    {$routeFunction}
</script>
HTML,
            (new BladeRouteGenerator)->generate()
        );
    }

    /** @test */
    public function can_output_merge_script_tag()
    {
        $router = app('router');
        $router->get('posts', $this->noop())->name('posts.index');
        (new BladeRouteGenerator)->generate();

        $json = json_encode((new Ziggy)->toArray()['routes']);

        $this->assertSame(
            <<<HTML
<script type="text/javascript">
    (function () {
        const routes = {$json};

        Object.assign(Ziggy.routes, routes);
    })();
</script>
HTML,
            (new BladeRouteGenerator)->generate()
        );
    }

    /** @test */
    public function can_compile_blade_directive()
    {
        $this->assertSame(
            "<?php echo app('Tightenco\Ziggy\BladeRouteGenerator')->generate(); ?>",
            app('blade.compiler')->compileString('@routes')
        );

        $this->assertSame(
            "<?php echo app('Tightenco\Ziggy\BladeRouteGenerator')->generate('admin'); ?>",
            app('blade.compiler')->compileString("@routes('admin')")
        );
        $this->assertSame(
            "<?php echo app('Tightenco\Ziggy\BladeRouteGenerator')->generate(['admin', 'guest']); ?>",
            app('blade.compiler')->compileString("@routes(['admin', 'guest'])")
        );

        $this->assertSame(
            "<?php echo app('Tightenco\Ziggy\BladeRouteGenerator')->generate(null, 'nonce'); ?>",
            app('blade.compiler')->compileString("@routes(null, 'nonce')")
        );
        $this->assertSame(
            "<?php echo app('Tightenco\Ziggy\BladeRouteGenerator')->generate(nonce: 'nonce'); ?>",
            app('blade.compiler')->compileString("@routes(nonce: 'nonce')")
        );
    }
}

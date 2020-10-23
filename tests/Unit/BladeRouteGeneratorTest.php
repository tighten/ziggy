<?php

namespace Tests\Unit;

use Illuminate\Support\Str;
use Tests\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;

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
        $ziggy = json_decode(Str::after(Str::before($output, ";\n\n"), ' = '), true);

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

        $payload = json_decode(Str::after(Str::before($script, ";\n\n"), 'routes = '), true);
        $this->assertSame([
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
            ],
        ], json_decode(Str::after(Str::before($script, ";\n\n"), 'routes = '), true));
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
    public function can_set_csp_nonce()
    {
        $this->assertStringContainsString(
            '<script type="text/javascript" nonce="supercalifragilisticexpialidocious">',
            (new BladeRouteGenerator)->generate(false, 'supercalifragilisticexpialidocious')
        );
    }

    /** @test */
    public function can_compile_routes_directive()
    {
        $compiler = app('blade.compiler');

        BladeRouteGenerator::$generated = false;
        $script = (new BladeRouteGenerator)->generate();

        BladeRouteGenerator::$generated = false;
        $this->assertSame($script, $compiler->compileString('@routes'));
    }
}

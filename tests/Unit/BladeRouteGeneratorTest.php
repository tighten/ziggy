<?php

namespace Tests\Unit;

use Tests\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;

class BladeRouteGeneratorTest extends TestCase
{
    /** @test */
    public function generator_at_least_vaguely_works_and_outputs_something_vaguely_right_ish()
    {
        $generator = app(BladeRouteGenerator::class);

        $this->assertStringContainsString('namedRoutes: []', $generator->generate());
    }

    /** @test */
    public function generator_outputs_non_domain_named_routes_with_expected_structure()
    {
        $router = app('router');
        $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
        $router->getRoutes()->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $this->assertSame([
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ], $generator->getRoutePayload()->toArray());
    }

    /** @test */
    public function generator_outputs_domain_as_defined()
    {
        $router = app('router');
        $router->domain('{account}.myapp.com')->group(function () use ($router) {
            $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
        });
        $router->getRoutes()->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $this->assertSame([
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => '{account}.myapp.com',
            ],
        ], $generator->getRoutePayload()->toArray());
    }

    /** @test */
    public function generator_returns_only_named_routes()
    {
        $router = app('router');
        $router->get('/', fn () => ''); // Not named, should not be included in JSON output
        $router->get('posts', fn () => '')->name('posts.index');
        $router->get('posts/{post}', fn () => '')->name('posts.show');
        $router->get('posts/{post}/comments', fn () => '')->name('postComments.index');
        $router->post('posts', fn () => '')->name('posts.store');
        $router->getRoutes()->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $routes = $generator->getRoutePayload()->toArray();

        $this->assertCount(4, $routes);
        $this->assertArrayHasKey('posts.index', $routes);
        $this->assertArrayHasKey('posts.show', $routes);
        $this->assertArrayHasKey('posts.store', $routes);
        $this->assertArrayHasKey('postComments.index', $routes);
    }

    /** @test */
    public function generator_can_set_csp_nonce()
    {
        $generator = app(BladeRouteGenerator::class);

        $this->assertStringContainsString(
            '<script type="text/javascript" nonce="supercalifragilisticexpialidocious">',
            $generator->generate(false, 'supercalifragilisticexpialidocious')
        );
    }
}

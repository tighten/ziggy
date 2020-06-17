<?php

namespace Tightenco\Tests\Unit;

use Illuminate\Support\Str;
use Tightenco\Tests\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;

class BladeRouteGeneratorTest extends TestCase
{
    /** @test */
    function generator_at_least_vaguely_works_and_outputs_something_vaguely_right_ish()
    {
        $generator = app(BladeRouteGenerator::class);

        $this->assertStringContainsString('"namedRoutes":[]', $generator->generate());
    }

    /** @test */
    function generator_outputs_non_domain_named_routes_with_expected_structure()
    {
        $router = app('router');

        // Named. Should end up in JSON
        $router->get('/posts/{post}/comments', function () {
            return '';
        })
            ->name('postComments.index');

        $router->getRoutes()->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $this->assertStringContainsString(json_encode([
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ]), $generator->generate());
    }

    /** @test */
    function generator_outputs_domain_as_defined()
    {
        $router = app('router');

        // Named. Should end up in JSON
        $router->domain('{account}.myapp.com')->group(function () use ($router) {
            $router->get('/posts/{post}/comments', function () {
                return '';
            })
                ->name('postComments.index');
        });

        $router->getRoutes()->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $this->assertStringContainsString(json_encode([
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => '{account}.myapp.com',
            ],
        ]), $generator->generate());
    }

    /** @test */
    function generator_returns_only_named_routes()
    {
        $router = app('router');

        // Not named. Shouldn't end up in JSON
        $router->get('/', function () {
            return '';
        });

        // Named. Should end up in JSON
        $router->get('/posts', function () {
            return '';
        })
            ->name('posts.index');
        $router->get('/posts/{post}', function () {
            return '';
        })
            ->name('posts.show');
        $router->get('/posts/{post}/comments', function () {
            return '';
        })
            ->name('postComments.index');
        $router->post('/posts', function () {
            return '';
        })
            ->name('posts.store');

        $router->getRoutes()->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $payload = $generator->generate();
        $array = json_decode(Str::between($payload, ' = ', ";\n\n"), true);

        $this->assertCount(4, $array['namedRoutes']);

        $this->assertArrayHasKey('posts.index', $array['namedRoutes']);
        $this->assertArrayHasKey('posts.show', $array['namedRoutes']);
        $this->assertArrayHasKey('posts.store', $array['namedRoutes']);
        $this->assertArrayHasKey('postComments.index', $array['namedRoutes']);
    }

    /** @test */
    function generator_can_set_csp_nonce()
    {
        $generator = app(BladeRouteGenerator::class);

        $this->assertStringContainsString(
            '<script type="text/javascript" nonce="supercalifragilisticexpialidocious">',
            $generator->generate(false, 'supercalifragilisticexpialidocious')
        );
    }
}

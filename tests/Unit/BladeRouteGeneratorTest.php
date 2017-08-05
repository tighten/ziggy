<?php

namespace Tightenco\Tests\Unit;

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Route;
use Tightenco\Tests\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;

class BladeRouteGeneratorTest extends TestCase
{
    /** @test */
    function generator_at_least_vaguely_works_and_outputs_something_vageuly_right_ish()
    {
        $generator = app(BladeRouteGenerator::class);

        $this->assertContains("JSON.parse('[]')", $generator->generate());
    }

    /** @test */
    function generator_outputs_named_routes_with_expected_structure()
    {
        $router = app('router');

        // Named. Should end up in JSON
        $router->get('/posts/{post}/comments', function () { return ''; })
            ->name('postComments.index');

        $router->getRoutes()->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $this->assertEquals([
            'postComments.index' =>[
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD']
            ],
        ], $generator->nameKeyedRoutes()->toArray());
    }

    /** @test */
    function generator_returns_only_named_routes()
    {
        $router = app('router');

        // Not named. Shouldn't end up in JSON
        $router->get('/', function () { return ''; });

        // Named. Should end up in JSON
        $router->get('/posts', function () { return ''; })
            ->name('posts.index');
        $router->get('/posts/{post}', function () { return ''; })
            ->name('posts.show');
        $router->get('/posts/{post}/comments', function () { return ''; })
            ->name('postComments.index');
        $router->post('/posts', function () { return ''; })
            ->name('posts.store');

        $router->getRoutes()->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $array = $generator->nameKeyedRoutes()->toArray();

        $this->assertCount(4, $array);

        $this->assertJsonContains($array, [
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD']
            ]
        ]);

        $this->assertJsonContains($array, [
            'posts.show' =>[
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD']
            ],
        ]);

        $this->assertJsonContains($array, [
            'postComments.index' =>[
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD']
            ],
        ]);

        $this->assertJsonContains($array, [
            'posts.store' =>[
                'uri' => 'posts',
                'methods' => ['POST']
            ],
        ]);
    }
}

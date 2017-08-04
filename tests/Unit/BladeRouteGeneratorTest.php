<?php

namespace Tightenco\Tests\Unit;

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Route;
use Orchestra\Testbench\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;

class BladeRouteGeneratorTest extends TestCase
{
    /** @test */
    public function generator_returns_only_named_routes()
    {
        $router = app()->make('router');

        // Not Named. Shouldn't end up in JSON
        $router->get('/', function () { return ''; });

        // Named. Should end up in JSON
        $router->get('/posts', function () { return ''; })->name('posts.index');
        $router->get('/posts/{post}', function () { return ''; })->name('posts.show');
        $router->get('/posts/{post}/comments', function () { return ''; })->name('postComments.index');
        $router->post('/posts', function () { return ''; })->name('posts.store');

        $c = $router->getRoutes();
        $c->refreshNameLookups();

        $generator = (new BladeRouteGenerator($router));

        $this->assertEquals([
            'posts.index' =>[
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD']
            ],
            'posts.show' =>[
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD']
            ],
            'postComments.index' =>[
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD']
            ],
            'posts.store' =>[
                'uri' => 'posts',
                'methods' => ['POST']
            ],
        ], $generator->routes->toArray());
    }
}
<?php

namespace Tightenco\Tests\Unit;

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Route;
use Tightenco\Tests\TestCase;
use Tightenco\Ziggy\BladeRouteGenerator;
use Tightenco\Ziggy\RoutePayload;

class RoutePayloadTest extends TestCase
{
    protected $router;

    public function setUp()
    {
        parent::setUp();

        $this->router = app('router');
        $this->router->get('/home', function () { return ''; })
               ->name('home');

        $this->router->get('/posts', function () { return ''; })
               ->name('posts.index');

        $this->router->get('/posts/{post}', function () { return ''; })
               ->name('posts.show');

        $this->router->get('/posts/{post}/comments', function () { return ''; })
               ->name('postComments.index');

        $this->router->post('/posts', function () { return ''; })
               ->name('posts.store');

        $this->router->getRoutes()->refreshNameLookups();
    }

    /** @test */
    public function only_matching_routes_included_with_whitelist_enabled()
    {
        $routePayload = new RoutePayload($this->router);
        $filters = ['posts.s*', 'home'];
        $routes = $routePayload->filter($filters, true);

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes->toArray());
    }

    /** @test */
    public function only_matching_routes_excluded_with_blacklist_enabled()
    {
        $routePayload = new RoutePayload($this->router);
        $filters = ['posts.s*', 'home'];
        $routes = $routePayload->filter($filters, false);

        $expected = [
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes->toArray());
    }

    /** @test */
    public function existance_of_whitelist_config_causes_routes_to_whitelist()
    {
        app()['config']->set('ziggy', [
            'whitelist' => ['posts.s*', 'home']
        ]);

        $routes = RoutePayload::compile($this->router);

        $expected = [
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes->toArray());
    }

    /** @test */
    public function existance_of_blacklist_config_causes_routes_to_blacklist()
    {
        app()['config']->set('ziggy', [
            'blacklist' => ['posts.s*', 'home']
        ]);

        $routes = RoutePayload::compile($this->router);

        $expected = [
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes->toArray());
    }

    /** @test */
    public function existance_of_both_configs_returns_unfiltered_routes()
    {
        app()['config']->set('ziggy', [
            'blacklist' => ['posts.s*'],
            'whitelist' => ['home'],
        ]);

        $routes = RoutePayload::compile($this->router);

        $expected = [
            'posts.index' => [
                'uri' => 'posts',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'postComments.index' => [
                'uri' => 'posts/{post}/comments',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'home' => [
                'uri' => 'home',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.show' => [
                'uri' => 'posts/{post}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'posts.store' => [
                'uri' => 'posts',
                'methods' => ['POST'],
                'domain' => null,
            ],
        ];

        $this->assertEquals($expected, $routes->toArray());
    }
}

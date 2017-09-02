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

class MacroTest extends TestCase
{
    protected $router;

    protected function getPackageProviders($app)
    {
        return [
            \Tightenco\Ziggy\ZiggyServiceProvider::class,
        ];
    }

    public function setUp()
    {
        parent::setUp();

        $this->router = app('router');
        $this->router->get('/home', function () { return ''; })
               ->name('home');

        $this->router->blacklist()
               ->name('posts.index')
               ->get('/posts', function () { return ''; });

        $this->router->get('/posts/{post}', function () { return ''; })
               ->name('posts.show');

        $this->router->blacklist()
               ->get('/tags', function () { return ''; })
               ->name('tags.index');

        $this->router->get('/tags/{tag}', function () { return ''; })
               ->name('tags.show');

        $this->router->getRoutes()->refreshNameLookups();
    }

    /** @test */
    function only_matching_routes_excluded_with_blacklist_macro_enabled()
    {
        $routePayload = new RoutePayload($this->router);
        $routes = $routePayload->blacklist();

        $this->assertEquals($this->expectedPayload(), $routes->toArray());
    }

    /** @test */
    function only_matching_route_groups_excluded_with_blacklist_macro_enabled()
    {
        $this->router->blacklist()->group(['prefix' => 'posts'], function ($router) {
            $router->get('/comments', function () { return ''; })
                ->name('comments.index');

            $router->get('/comments/{comment}', function () { return ''; })
                ->name('comments.show');
        });

        $this->router->getRoutes()->refreshNameLookups();

        $routePayload = new RoutePayload($this->router);
        $routes = $routePayload->blacklist();

        $this->assertEquals($this->expectedPayload(), $routes->toArray());
    }

    protected function expectedPayload()
    {
        return [
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
            'tags.show' => [
                'uri' => 'tags/{tag}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];
    }
}

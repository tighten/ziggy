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
    protected function getPackageProviders($app)
    {
        return [
            \Tightenco\Ziggy\ZiggyServiceProvider::class,
        ];
    }

    /** @test */
    function only_matching_routes_excluded_with_blacklist_macro_enabled()
    {
        $router = app('router');

        $router->get('/', function () { return ''; });

        $router->blacklist(function ($router) {
            $router->get('/posts', function () { return ''; });
            $router->get('/posts/show', function () { return ''; })
                ->name('posts.show');
        });

        $router->get('/tags/{tag}', function () { return ''; })
                ->name('tags.show');

        $router->blacklist(function ($router) {
            $router->get('/pages', function () { return ''; })
                ->name('pages.index');
        });

        $router->get('/pages/{slug}', function () { return ''; })
            ->name('pages.show');

        $router->getRoutes()->refreshNameLookups();

        $routePayload = new RoutePayload($router);
        $routes = $routePayload->blacklist();

        $this->assertEquals($this->expectedPayload(), $routes->toArray());
    }

    protected function expectedPayload()
    {
        return [
            'tags.show' => [
                'uri' => 'tags/{tag}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
            'pages.show' => [
                'uri' => 'pages/{slug}',
                'methods' => ['GET', 'HEAD'],
                'domain' => null,
            ],
        ];
    }
}

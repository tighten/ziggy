<?php

namespace Tightenco\Tests\Unit;

use Tightenco\Tests\TestCase;
use Illuminate\Routing\Router;
use Illuminate\Events\Dispatcher;
use Tightenco\Ziggy\RoutePayload;
use Illuminate\Container\Container;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Facade;
use Tightenco\Ziggy\BladeRouteGenerator;
use Tightenco\Tests\Stubs\TestRouteCollector;

class RouteCollectorTest extends TestCase
{
    /** @test */
    public function it_provides_correct_routes_when_using_custom_RouteCollector()
    {
        config(['ziggy.routeCollector' => TestRouteCollector::class]);

        $nameKeyedRoutes = (new RoutePayload)->routes;

        $this->assertEquals('Charlotte', $nameKeyedRoutes);
    }
}

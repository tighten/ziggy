<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use Tightenco\Ziggy\DefaultRouteCollector;

class RoutePayload
{
    public $routes;

    public function __construct()
    {
        $this->routes = $this->nameKeyedRoutes();
    }

    public static function compile($group = false)
    {
        return (new static)->applyFilters($group);
    }

    public function applyFilters($group)
    {
        if ($group && config()->has("ziggy.groups.{$group}")) {
            return $this->group($group);
        }

        // return unfiltered routes if user set both config options.
        if (config()->has('ziggy.blacklist') && config()->has('ziggy.whitelist')) {
            return $this->routes;
        }

        if (config()->has('ziggy.blacklist')) {
            return $this->blacklist();
        }

        if (config()->has('ziggy.whitelist')) {
            return $this->whitelist();
        }

        return $this->routes;
    }

    public function group($group)
    {
        return $this->filter(config("ziggy.groups.{$group}"), true);
    }

    public function blacklist()
    {
        return $this->filter(config('ziggy.blacklist'), false);
    }

    public function whitelist()
    {
        return $this->filter(config('ziggy.whitelist'), true);
    }

    public function filter($filters = [], $include = true)
    {
        return $this->routes->filter(function ($route, $name) use ($filters, $include) {
            foreach ($filters as $filter) {
                if (str_is($filter, $name)) {
                    return $include;
                }
            }

            return ! $include;
        });
    }

    protected function nameKeyedRoutes()
    {
        $routeCollector = config('ziggy.routeCollector', DefaultRouteCollector::class);

        return (new $routeCollector)->collect();
    }
}

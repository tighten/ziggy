<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;

class RoutePayload
{
    protected $routes;

    public function __construct(Router $router)
    {
        $this->router = $router;
        $this->routes = $this->nameKeyedRoutes();
    }

    public static function compile(Router $router, $group = false)
    {
        return (new static($router))->applyFilters($group);
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
            if (array_get($route, 'blacklist', false) === true) {
                return false;
            }

            foreach ($filters as $filter) {
                if (str_is($filter, $name)) {
                    return $include;
                }
            }

            return ! $include;
        })->map(function ($route) {
            array_forget($route, 'blacklist');
            return $route;
        });
    }

    protected function nameKeyedRoutes()
    {
        return collect($this->router->getRoutes()->getRoutesByName())
            ->map(function ($route) {
                $blacklisted = $route->getAction('blacklist');

                if ($blacklisted && $name = $route->getName()) {
                    $this->appendToBlacklist($name);
                }

                return collect($route)->only(['uri', 'methods'])
                    ->put('blacklist', $blacklisted)
                    ->put('domain', $route->domain());
            });
    }

    protected function appendToBlacklist($routeName)
    {
        config()->set('ziggy.blacklist', array_merge(
            config('ziggy.blacklist', []), [$routeName]
        ));
    }
}

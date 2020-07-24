<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use JsonSerializable;

class Ziggy implements JsonSerializable
{
    protected $baseDomain;
    protected $basePort;
    protected $baseProtocol;
    protected $baseUrl;
    protected $group;
    protected $routes;

    public function __construct(string $group = null, string $url = null)
    {
        $this->group = $group;

        $this->baseUrl = Str::finish($url ?? url('/'), '/');

        tap(parse_url($this->baseUrl), function ($url) {
            $this->baseProtocol = $url['scheme'] ?? 'http';
            $this->baseDomain = $url['host'] ?? '';
            $this->basePort = $url['port'] ?? null;
        });

        $this->routes = $this->nameKeyedRoutes();
    }

    public function applyFilters($group)
    {
        if ($group) {
            return $this->group($group);
        }

        // return unfiltered routes if user set both config options.
        if (config()->has('ziggy.except') && config()->has('ziggy.only')) {
            return $this->routes;
        }

        if (config()->has('ziggy.except')) {
            return $this->except();
        }

        if (config()->has('ziggy.only')) {
            return $this->only();
        }

        return $this->routes;
    }

    /**
     * Filter routes by group.
     */
    public function group($group)
    {
        if (is_array($group)) {
            $filters = [];

            foreach ($group as $groupName) {
                $filters = array_merge($filters, config("ziggy.groups.{$groupName}"));
            }

            return $this->filter($filters, true);
        }

        if (config()->has("ziggy.groups.{$group}")) {
            return $this->filter(config("ziggy.groups.{$group}"), true);
        }

        return $this->routes;
    }

    public function except()
    {
        return $this->filter(config('ziggy.except'), false);
    }

    public function only()
    {
        return $this->filter(config('ziggy.only'), true);
    }

    /**
     * Filter routes by name using the given patterns.
     */
    public function filter($filters = [], $include = true)
    {
        return $this->routes->filter(function ($route, $name) use ($filters, $include) {
            foreach ($filters as $filter) {
                if (Str::is($filter, $name)) {
                    return $include;
                }
            }

            return ! $include;
        });
    }

    /**
     * Get a list of the application's named routes, keyed by their names.
     */
    protected function nameKeyedRoutes()
    {
        return collect(app('router')->getRoutes()->getRoutesByName())
            ->map(function ($route) {
                if ($this->isListedAs($route, 'except')) {
                    $this->appendRouteToList($route->getName(), 'except');
                } elseif ($this->isListedAs($route, 'only')) {
                    $this->appendRouteToList($route->getName(), 'only');
                }

                return collect($route)->only(['uri', 'methods'])
                    ->put('domain', $route->domain())
                    ->when(method_exists($route, 'bindingFields'), function ($collection) use ($route) {
                        return $collection->put('bindings', $route->bindingFields());
                    })
                    ->when($middleware = config('ziggy.middleware'), function ($collection) use ($middleware, $route) {
                        if (is_array($middleware)) {
                            return $collection->put('middleware', collect($route->middleware())->intersect($middleware)->values());
                        }

                        return $collection->put('middleware', $route->middleware());
                    });
            });
    }

    /**
     * Convert this Ziggy instance to an array.
     */
    public function toArray(): array
    {
        return [
            'baseUrl' => $this->baseUrl,
            'baseProtocol' => $this->baseProtocol,
            'baseDomain' => $this->baseDomain,
            'basePort' => $this->basePort,
            'defaultParameters' => method_exists(app('url'), 'getDefaultParameters')
                ? app('url')->getDefaultParameters()
                : [],
            'namedRoutes' => $this->applyFilters($this->group)->toArray(),
        ];
    }

    /**
     * Convert this Ziggy instance into something JSON serializable.
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }

    /**
     * Convert this Ziggy instance to JSON.
     */
    public function toJson(int $options = 0): string
    {
        return json_encode($this->jsonSerialize(), $options);
    }

    /**
     * Add the given route name to the current list of routes.
     */
    protected function appendRouteToList($name, $list)
    {
        config()->push("ziggy.{$list}", $name);
    }

    /**
     * Check if the given route name is present in the given list.
     */
    protected function isListedAs($route, $list)
    {
        return (isset($route->listedAs) && $route->listedAs === $list)
            || Arr::get($route->getAction(), 'listed_as', null) === $list;
    }
}

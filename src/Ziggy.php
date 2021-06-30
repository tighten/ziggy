<?php

namespace Tightenco\Ziggy;

use Illuminate\Contracts\Routing\UrlRoutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Reflector;
use Illuminate\Support\Str;
use JsonSerializable;
use ReflectionMethod;

class Ziggy implements JsonSerializable
{
    protected $port;
    protected $url;
    protected $group;
    protected $routes;

    public function __construct($group = null, string $url = null)
    {
        $this->group = $group;

        $this->url = rtrim($url ?? url('/'), '/');
        $this->port = parse_url($this->url)['port'] ?? null;

        $this->routes = $this->nameKeyedRoutes();
    }

    private function applyFilters($group)
    {
        if ($group) {
            return $this->group($group);
        }

        // return unfiltered routes if user set both config options.
        if (config()->has('ziggy.except') && config()->has('ziggy.only')) {
            return $this->routes;
        }

        if (config()->has('ziggy.except')) {
            return $this->filter(config('ziggy.except'), false)->routes;
        }

        if (config()->has('ziggy.only')) {
            return $this->filter(config('ziggy.only'))->routes;
        }

        return $this->routes;
    }

    /**
     * Filter routes by group.
     */
    private function group($group)
    {
        if (is_array($group)) {
            $filters = [];

            foreach ($group as $groupName) {
                $filters = array_merge($filters, config("ziggy.groups.{$groupName}"));
            }

            return $this->filter($filters, true)->routes;
        }

        if (config()->has("ziggy.groups.{$group}")) {
            return $this->filter(config("ziggy.groups.{$group}"), true)->routes;
        }

        return $this->routes;
    }

    /**
     * Filter routes by name using the given patterns.
     */
    public function filter($filters = [], $include = true): self
    {
        $this->routes = $this->routes->filter(function ($route, $name) use ($filters, $include) {
            return Str::is(Arr::wrap($filters), $name) ? $include : ! $include;
        });

        return $this;
    }

     /**
     * Check if route name is excluded
     */
    private function isExcluded($routeName)
    {
        $isExcluded = false;
        $groups = $this->getGroups();

        // return unfiltered routes if user set both config options
        if (config()->has('ziggy.except') && config()->has('ziggy.only')) {
            return $isExcluded;
        }

        // exclude any routes in except, unless included in groups
        if (config()->has('ziggy.except')) {
            $exclusions = config('ziggy.except');

            if (!empty($groups)) {
                $exclusions = Arr::where($exclusions, function ($exclusion) use ($groups) {
                    return !in_array($exclusion, $groups);
                });
            }

            $isExcluded = $this->inRoutes($exclusions, $routeName);

            return $isExcluded;
        }

        // exclude any routes not in only or groups
        if (config()->has('ziggy.only')) {
            $inclusions = array_merge(config('ziggy.only'), $groups);
            $isExcluded = !$this->inRoutes($inclusions, $routeName);

            return $isExcluded;
        }

        return $isExcluded;
    }

    // returns flat array of groups
    private function getGroups()
    {
        $groups = [];

        // collect any routes included via groups
        if (config()->has('ziggy.groups')) {
            $groups = config('ziggy.groups');

            foreach ($groups as $group) {
                $groups = array_merge($groups, $group);
            }
        }

        return $groups;
    }

    private function inRoutes($routes, $routeName)
    {
        foreach ($routes as $route) {
            if (Str::is($route, $routeName)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get a list of the application's named routes, keyed by their names.
     */
    private function nameKeyedRoutes()
    {
        [$fallbacks, $routes] = collect(app('router')->getRoutes()->getRoutesByName())
            ->reject(function ($route) {
                return Str::startsWith($route->getName(), 'generated::');
            })
            ->reject(function ($route) {
                return $this->isExcluded($route->getName());
            })
            ->partition(function ($route) {
                return $route->isFallback;
            });


        $bindings = $this->resolveBindings($routes->toArray());

        return $routes->merge($fallbacks)
            ->map(function ($route) use ($bindings) {
                return collect($route)->only(['uri', 'methods'])
                    ->put('domain', $route->domain())
                    ->put('bindings', $bindings[$route->getName()] ?? [])
                    ->when($middleware = config('ziggy.middleware'), function ($collection) use ($middleware, $route) {
                        if (is_array($middleware)) {
                            return $collection->put('middleware', collect($route->middleware())->intersect($middleware)->values()->all());
                        }

                        return $collection->put('middleware', $route->middleware());
                    })->filter();
            });
    }

    /**
     * Convert this Ziggy instance to an array.
     */
    public function toArray(): array
    {
        return [
            'url' => $this->url,
            'port' => $this->port,
            'defaults' => method_exists(app('url'), 'getDefaultParameters')
                ? app('url')->getDefaultParameters()
                : [],
            'routes' => $this->applyFilters($this->group)->toArray(),
        ];
    }

    /**
     * Convert this Ziggy instance into something JSON serializable.
     */
    public function jsonSerialize(): array
    {
        return array_merge($routes = $this->toArray(), [
            'defaults' => (object) $routes['defaults'],
        ]);
    }

    /**
     * Convert this Ziggy instance to JSON.
     */
    public function toJson(int $options = 0): string
    {
        return json_encode($this->jsonSerialize(), $options);
    }

    /**
     * Resolve route key names for any route parameters using Eloquent route model binding.
     */
    private function resolveBindings(array $routes): array
    {
        $scopedBindings = method_exists(head($routes) ?: '', 'bindingFields');

        foreach ($routes as $name => $route) {
            $bindings = [];

            foreach ($route->signatureParameters(UrlRoutable::class) as $parameter) {
                $model = class_exists(Reflector::class)
                    ? Reflector::getParameterClassName($parameter)
                    : $parameter->getType()->getName();
                $override = $model === (new ReflectionMethod($model, 'getRouteKeyName'))->class;

                // Avoid booting this model if it doesn't override the default route key name
                $bindings[$parameter->getName()] = $override ? app($model)->getRouteKeyName() : 'id';
            }

            $routes[$name] = $scopedBindings ? array_merge($bindings, $route->bindingFields()) : $bindings;
        }

        return $routes;
    }
}

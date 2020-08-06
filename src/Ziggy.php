<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
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
        $this->prepareBaseDetails($url);
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
        return $this->filter(config('ziggy.only'));
    }

    /**
     * Filter routes by name using the given patterns.
     */
    public function filter($filters = [], $include = true)
    {
        return $this->routes->filter(function ($route, $name) use ($filters, $include) {
            return Str::is(Arr::wrap($filters), $name) ? $include : ! $include;
        });
    }

    /**
     * Get a list of the application's named routes, keyed by their names.
     */
    protected function nameKeyedRoutes()
    {
        [$fallbacks, $routes] = collect(app('router')->getRoutes()->getRoutesByName())
            ->partition(function ($route) {
                return $route->isFallback;
            });

        return $routes->merge($fallbacks)
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

    /**
     * Gathers and prepares this Ziggy instance's base details.
     */
    protected function prepareBaseDetails(string $url = null)
    {
        $defaults = [
            'url' => url('/'),
            'scheme' => 'http',
            'host' => '',
            'port' => null,
        ];

        $settings = Collection::make($defaults)
            // First, we attempt to parse our App's default using Laravel's URL helper.
            ->merge(parse_url(Str::finish($defaults['url'], '/')) ?? [])
            // Next, we overload these defaults with any Ziggy-configured settings.
            ->merge(config()->get('ziggy', []))
            // If the user configured a URL in Ziggy, it takes precedence over
            // all the other user-configured settings. We'll try to parse
            // this URL, and overload the defaults with it again.
            ->when(config()->has('ziggy.url'), function (Collection $settings) {
                return $settings
                    ->merge(['port' => null])
                    ->merge(parse_url(Str::finish($settings->get('url'), '/')) ?? []);
            })
            // Finally, we'll accept the given URL (if any), which takes the
            // highest priority. We'll attempt parsing it and overwrite
            // the defaults with it one last time.
            ->when($url, function (Collection $settings) use ($url) {
                return $settings
                    ->merge(['port' => null])
                    ->merge(parse_url(Str::finish($url, '/')) ?? []);
            });

        $this->baseProtocol = $settings->get('scheme');
        $this->baseDomain = $settings->get('host');
        $this->basePort = $settings->get('port');

        $this->baseUrl = Str::finish($this->baseProtocol, '://')
            . rtrim($this->baseDomain, '/')
            . ($this->basePort ? ':' . ltrim($this->basePort) : '')
            . '/';
    }
}

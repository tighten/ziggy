<?php

namespace Tighten\Ziggy;

use Illuminate\Contracts\Routing\UrlRoutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Reflector;
use Illuminate\Support\Str;
use JsonSerializable;
use Laravel\Folio\FolioManager;
use Laravel\Folio\FolioRoutes;
use Laravel\Folio\Pipeline\MatchedView;
use Laravel\Folio\Pipeline\PotentiallyBindablePathSegment;
use ReflectionClass;
use ReflectionMethod;
use ReflectionProperty;

class Ziggy implements JsonSerializable
{
    protected static $cache;

    protected $url;
    protected $group;
    protected $routes;

    public function __construct($group = null, string $url = null)
    {
        $this->group = $group;

        $this->url = rtrim($url ?? url('/'), '/');

        if (! static::$cache) {
            static::$cache = $this->nameKeyedRoutes();
        }

        $this->routes = static::$cache;
    }

    public static function clearRoutes()
    {
        static::$cache = null;
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
                $filters = array_merge($filters, Arr::wrap(config("ziggy.groups.{$groupName}")));
            }

            return $this->filter($filters)->routes;
        }

        if (config()->has("ziggy.groups.{$group}")) {
            return $this->filter(config("ziggy.groups.{$group}"))->routes;
        }

        return $this->routes;
    }

    /**
     * Filter routes by name using the given patterns.
     */
    public function filter($filters = [], $include = true): self
    {
        $filters = Arr::wrap($filters);

        $reject = collect($filters)->every(function (string $pattern) {
            return Str::startsWith($pattern, '!');
        });

        $this->routes = $reject
            ? $this->routes->reject(function ($route, $name) use ($filters) {
                foreach ($filters as $pattern) {
                    if (Str::is(substr($pattern, 1), $name)) {
                        return true;
                    }
                }
            })
            : $this->routes->filter(function ($route, $name) use ($filters, $include) {
                if ($include === false) {
                    return ! Str::is($filters, $name);
                }

                foreach ($filters as $pattern) {
                    if (Str::startsWith($pattern, '!') && Str::is(substr($pattern, 1), $name)) {
                        return false;
                    }
                }

                return Str::is($filters, $name);
            });

        return $this;
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
            ->partition(function ($route) {
                return $route->isFallback;
            });

        $bindings = $this->resolveBindings($routes->toArray());

        $fallbacks->map(function ($route, $name) use ($routes) {
            $routes->put($name, $route);
        });

        return tap($this->folioRoutes(), fn ($all) => $routes->each(
            fn ($route, $name) => $all->put(
                $name,
                collect($route)->only(['uri', 'methods', 'wheres'])
                    ->put('domain', $route->domain())
                    ->put('parameters', $route->parameterNames())
                    ->put('bindings', $bindings[$route->getName()] ?? [])
                    ->when($middleware = config('ziggy.middleware'), function ($collection) use ($middleware, $route) {
                        if (is_array($middleware)) {
                            return $collection->put('middleware', collect($route->middleware())->intersect($middleware)->values()->all());
                        }

                        return $collection->put('middleware', $route->middleware());
                    })
                    ->filter()
            )
        ));
    }

    /**
     * Convert this Ziggy instance to an array.
     */
    public function toArray(): array
    {
        return [
            'url' => $this->url,
            'port' => parse_url($this->url)['port'] ?? null,
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
            if (!in_array($parameter->getName(), $route->parameterNames())) {
                break;
            }

            try {
                $model = class_exists(Reflector::class)
                    ? Reflector::getParameterClassName($parameter)
                    : $parameter->getType()->getName();

                if (!class_exists($model) || (new \ReflectionClass($model))->isAbstract()) {
                    continue; // Skip if model class does not exist or is abstract
                }

                $reflectionClass = new \ReflectionClass($model);
                if (!$reflectionClass->isInstantiable()) {
                    continue; // Skip if model class cannot be instantiated
                }

                $override = $reflectionClass->hasMethod('getRouteKeyName')
                    && $reflectionClass->getMethod('getRouteKeyName')->class !== Model::class
                    || $reflectionClass->hasMethod('getKeyName')
                    && $reflectionClass->getMethod('getKeyName')->class !== Model::class
                    || $reflectionClass->hasProperty('primaryKey')
                    && $reflectionClass->getProperty('primaryKey')->class !== Model::class;

                // Avoid booting this model if it doesn't override the default route key name
                $bindings[$parameter->getName()] = $override ? app($model)->getRouteKeyName() : 'id';
            } catch (\Exception $e) {
                // Log the error and continue with default 'id'
                // \Log::error("Error resolving bindings for parameter {$parameter->getName()}: " . $e->getMessage());
                $bindings[$parameter->getName()] = 'id';
            }
        }

        $routes[$name] = $scopedBindings ? array_merge($bindings, $route->bindingFields()) : $bindings;
    }

    return $routes;
}

    /**
     * @see https://github.com/laravel/folio/blob/master/src/Console/ListCommand.php
     */
    private function folioRoutes(): Collection
    {
        if (! app()->has(FolioRoutes::class)) {
            return collect();
        }

        // Use existing named Folio routes (instead of searching view files) to respect route caching
        return collect(app(FolioRoutes::class)->routes())->map(function (array $route) {
            $uri = rtrim($route['baseUri'], '/') . str_replace([$route['mountPath'], '.blade.php'], '', $route['path']);

            $segments = explode('/', $uri);
            $parameters = [];
            $bindings = [];

            foreach ($segments as $i => $segment) {
                // Folio doesn't support sub-segment parameters
                if (Str::startsWith($segment, '[')) {
                    $param = new PotentiallyBindablePathSegment($segment);

                    $parameters[] = $name = $param->variable();
                    $segments[$i] = "{{$name}}";

                    if ($field = $param->field()) {
                        $bindings[$name] = $field;
                    } elseif ($param->bindable()) {
                        $override = (new ReflectionClass($param->class()))->isInstantiable() && (
                            (new ReflectionMethod($param->class(), 'getRouteKeyName'))->class !== Model::class
                            || (new ReflectionMethod($param->class(), 'getKeyName'))->class !== Model::class
                            || (new ReflectionProperty($param->class(), 'primaryKey'))->class !== Model::class
                        );

                        $bindings[$name] = $override ? app($param->class())->getRouteKeyName() : 'id';
                    }
                }
            }

            $uri = implode('/', $segments);
            $uri = Str::replaceEnd('/index', '', $uri);

            if ($route['domain'] && str_contains($route['domain'], '{')) {
                preg_match_all('/{(.*?)}/', $route['domain'], $matches);
                array_unshift($parameters, ...$matches[1]);
            }

            $middleware = [];

            if ($ziggyMiddleware = config('ziggy.middleware')) {
                $mountPath = Arr::first(
                    app(FolioManager::class)->mountPaths(),
                    fn ($mountPath) => $mountPath->path === realpath($route['mountPath'])
                );
                $matchedView = new MatchedView(realpath($route['path']), [], $route['mountPath']);

                $middleware = $mountPath->middleware
                    ->match($matchedView)
                    ->prepend('web')
                    ->merge($matchedView->inlineMiddleware())
                    ->unique()
                    ->when(is_array($ziggyMiddleware), fn ($middleware) => $middleware->intersect($ziggyMiddleware))
                    ->values()->all();
            }

            return array_filter([
                'uri' => $uri === '' ? '/' : trim($uri, '/'),
                'methods' => ['GET'],
                'domain' => $route['domain'],
                'parameters' => $parameters,
                'bindings' => $bindings,
                'middleware' => $middleware,
            ]);
        });
    }
}

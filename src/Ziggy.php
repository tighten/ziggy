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

    protected Collection $routes;

    public function __construct(
        protected array|string|null $group = null,
        protected ?string $url = null,
    ) {
        $this->url = rtrim($url ?? url('/'), '/');

        $this->routes = static::$cache ??= $this->nameKeyedRoutes();
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

        if (config()->has('ziggy.except') && ! config()->has('ziggy.only')) {
            return $this->filter(config('ziggy.except'), false)->routes;
        }

        if (config()->has('ziggy.only') && ! config()->has('ziggy.except')) {
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

        $reject = collect($filters)->every(fn (string $pattern) => str_starts_with($pattern, '!'));

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
                    if (str_starts_with($pattern, '!') && Str::is(substr($pattern, 1), $name)) {
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
    private function nameKeyedRoutes(): Collection
    {
        [$fallbacks, $routes] = collect(app('router')->getRoutes()->getRoutesByName())
            ->reject(fn ($route) => str_starts_with($route->getName(), 'generated::'))
            ->partition('isFallback');

        $bindings = $this->resolveBindings($routes->toArray());

        $fallbacks->each(fn ($route, $name) => $routes->put($name, $route));

        return tap($this->folioRoutes(), fn ($all) => $routes->each(
            fn ($route, $name) => $all->put(
                $name,
                collect($route)->only(['uri', 'methods', 'wheres'])
                    ->put('domain', $route->domain())
                    ->put('parameters', $route->parameterNames())
                    ->put('bindings', $bindings[$route->getName()] ?? [])
                    ->when(config('ziggy.middleware'), fn ($collection, $middleware) => is_array($middleware)
                        ? $collection->put('middleware', collect($route->middleware())->intersect($middleware)->values()->all())
                        : $collection->put('middleware', $route->middleware()),
                    )
                    ->filter()
            )
        ));
    }

    public function toArray(): array
    {
        return [
            'url' => $this->url,
            'port' => parse_url($this->url, PHP_URL_PORT) ?? null,
            'defaults' => app('url')->getDefaultParameters(),
            'routes' => $this->applyFilters($this->group)->toArray(),
        ];
    }

    public function jsonSerialize(): array
    {
        return [
            ...($routes = $this->toArray()),
            'defaults' => (object) $routes['defaults'],
        ];
    }

    public function toJson(int $options = 0): string
    {
        return json_encode($this->jsonSerialize(), $options);
    }

    /**
     * Resolve route key names for any route parameters using Eloquent route model binding.
     */
    private function resolveBindings(array $routes): array
    {
        foreach ($routes as $name => $route) {
            $bindings = [];

            foreach ($route->signatureParameters(UrlRoutable::class) as $parameter) {
                if (! in_array($parameter->getName(), $route->parameterNames())) {
                    break;
                }

                $model = Reflector::getParameterClassName($parameter);

                $override = (new ReflectionClass($model))->isInstantiable() && (
                    (new ReflectionMethod($model, 'getRouteKeyName'))->class !== Model::class
                    || (new ReflectionMethod($model, 'getKeyName'))->class !== Model::class
                    || (new ReflectionProperty($model, 'primaryKey'))->class !== Model::class
                );

                // Avoid booting this model if it doesn't override the default route key name
                $bindings[$parameter->getName()] = $override ? app($model)->getRouteKeyName() : 'id';
            }

            $routes[$name] = [...$bindings, ...$route->bindingFields()];
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
                if (str_starts_with($segment, '[')) {
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

<?php

namespace Tightenco\Ziggy\Output;

use Illuminate\Support\Arr;
use Stringable;
use Tightenco\Ziggy\Ziggy;

class Types implements Stringable
{
    protected $ziggy;

    public function __construct(Ziggy $ziggy)
    {
        $this->ziggy = $ziggy;
    }

    public function __toString(): string
    {
        $routes = collect($this->ziggy->toArray()['routes'])->map(function ($route) {
            return collect($route['parameterNames'] ?? [])->map(function ($param) use ($route) {
                return Arr::has($route, "bindings.{$param}")
                    ? ['name' => $param, 'binding' => $route['bindings'][$param]]
                    : ['name' => $param];
            });
        });

        return <<<JAVASCRIPT
/* This file is generated automatically! */
declare module 'ziggy-js' {
  interface RouteLookup {$routes->toJson()}
}
export {};

JAVASCRIPT;
    }
}

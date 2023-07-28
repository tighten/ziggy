<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Collection;

class TypeScriptDeclarationGenerator
{
    private Collection $routes;

    protected $indent = "  ";

    public function __construct(Collection $routes)
    {
        $this->routes = $routes;
    }

    private function preamble()
    {
        return join("\n", [
            "/*",
            " * Do not modify this file. It is auto-generated and corresponds to your routes",
            " * exposed by ziggy route helper. Changes will not be preserved.",
            " */",
            "export {}"
        ]);
    }

    private function generateArgsType($route)
    {
        $parameters = collect($route['parameterNames'] ?? []);
        $bindings = collect($route['bindings'] ?? []);

        $list = $parameters->map(function($param) use ($bindings) {
            if($bindings->has($param)) {
                $binding = $bindings[$param];
                return "{ name: '$param', binding: '$binding' }";
            } else {
                return "{ name: '$param' }";
            }
        });
        return '['.join(', ', $list->toArray()).']';
    }

    private function generateRouteDefinition() {
        $overloads = $this->routes->map(function ($route, $name) {
            $routeArgs = $this->generateArgsType($route);
            return "'$name': $routeArgs,";
        });
        return join("\n", ["declare module 'ziggy-js' {",
            $this->indent.'interface RouteLookup {',
            str_repeat($this->indent, 2) . join("\n". str_repeat($this->indent, 2), $overloads->toArray()),
            $this->indent.'}',
            "}"]);
    }

    public function generateDeclarations()
    {
        return join("\n\n", [
            $this->preamble(),
            $this->generateRouteDefinition()
        ]);
    }
}

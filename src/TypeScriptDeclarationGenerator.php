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
        return collect([
            "/*",
            " * Do not modify this file. It is auto-generated and corresponds to your routes",
            " * exposed by ziggy route helper. Changes will not be preserved.",
            " */",
            "export {}"
        ])->join("\n");
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
        return '['.$list->join(', ').']';
    }

    private function generateRouteDefinition() {
        $overloads = $this->routes->map(function ($route, $name) {
            $routeArgs = $this->generateArgsType($route);
            return "'$name': $routeArgs,";
        });
        return collect(["declare module 'ziggy-js' {",
            $this->indent.'interface RouteLookup {',
            str_repeat($this->indent, 2) . $overloads->join("\n" . str_repeat($this->indent, 2)),
            $this->indent.'}',
            "}"])->join("\n");
    }

    public function generateDeclarations()
    {
        return collect([
            $this->preamble(),
            $this->generateRouteDefinition()
        ])->join("\n\n");
    }
}

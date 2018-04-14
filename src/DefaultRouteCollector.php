<?php
namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\Route;

class DefaultRouteCollector
{
    public function collect()
    {
        return collect(Route::getRoutes()->getRoutesByName())
            ->map(function ($route) {
                if ($this->isListedAs($route, 'blacklist')) {
                    $this->appendRouteToList($route->getName(), 'blacklist');
                } elseif ($this->isListedAs($route, 'whitelist')) {
                    $this->appendRouteToList($route->getName(), 'whitelist');
                }

                return collect($route)->only(['uri', 'methods'])
                    ->put('domain', $route->domain());
            });
    }

    protected function appendRouteToList($name, $list)
    {
        config()->push("ziggy.{$list}", $name);
    }

    protected function isListedAs($route, $list)
    {
        return (isset($route->listedAs) && $route->listedAs === $list)
            || array_get($route->getAction(), 'listed_as', null) === $list;
    }
}

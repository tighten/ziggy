<?php

namespace Coulbourne\JsNamedRoutes;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class JsNamedRoutesServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Blade::directive('jsroutes', function () {
            $routes = (string) collect(Route::getRoutes()->getRoutesByName())->map(function ($route) {
                return collect($route)->only(['uri', 'methods', 'parameters']);
            });

            return "<script type='text/javascript'>" . $routes . "</script>";
        });
    }
}

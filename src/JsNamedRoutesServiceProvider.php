<?php

namespace JsNamedRoutes;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Route;

class JsNamedRoutesServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Blade::directive('routes', function () {
            $routes = (string) collect(Route::getRoutes()->getRoutesByName())->map(function ($route) {
                return collect($route)->only(['uri', 'methods', 'parameters']);
            });

            return "<script type='text/javascript'>
                        var namedRoutes = JSON.parse('" . $routes . "');
                        
                        function route(name, params) {
                            return namedRoutes[name].uri.replace(
                                /\{([^}]+)\}/,
                                function(tag) {
                                    return params[tag.replace(/\{|\}/gi, '')];
                                }
                            );
                        }
                    </script>";
        });
    }
}

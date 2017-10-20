<?php

namespace Tightenco\Ziggy;

use Closure;
use Tightenco\Ziggy\BlacklistMacro;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Tightenco\Ziggy\CommandRouteGenerator;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Route::macro('blacklist', function (Closure $routes) {
            $this->group(['blacklist' => true], $routes);
        });

        Blade::directive('routes', function ($group) {
            return "<?php echo app('" . BladeRouteGenerator::class . "')->generate({$group}); ?>";
        });

        if ($this->app->runningInConsole()) {
            $this->commands([
                CommandRouteGenerator::class,
            ]);
        }
    }
}

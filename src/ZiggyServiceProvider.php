<?php

namespace Tightenco\Ziggy;

use Closure;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Route::macro('blacklist', function ($group = null) {
            return Macro::blacklist($this, $group);
        });

        Route::macro('whitelist', function ($group = null) {
            return Macro::whitelist($this, $group);
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

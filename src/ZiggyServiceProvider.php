<?php

namespace Tightenco\Ziggy;

use Tightenco\Ziggy\BlacklistMacro;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Considering Mixin usage for 5.5
        // Route::mixin(new BlacklistMixin);

        Route::macro('blacklist', function () {
            return new BlacklistMacro($this);
        });

        Blade::directive('routes', function ($group) {
            return "<?php echo app('" . BladeRouteGenerator::class . "')->generate({$group}); ?>";
        });
    }
}

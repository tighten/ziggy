<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Blade::directive('routes', function ($group) {
            return "<?php echo app('" . BladeRouteGenerator::class . "')->generate({$group}); ?>";
        });
    }
}

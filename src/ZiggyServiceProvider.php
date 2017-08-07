<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Tightenco\Ziggy\ZiggyTokenBladeCompiler;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Blade::directive('routes', function () {
            return "<?php echo app('" . BladeRouteGenerator::class . "')->generate(); ?>";
        });
    }
}

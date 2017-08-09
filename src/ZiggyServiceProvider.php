<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // config
        $this->publishes([
            __DIR__.'/config' => config_path(),
        ], 'config');

        Blade::directive('routes', function () {
            return "<?php echo app('" . BladeRouteGenerator::class . "')->generate(); ?>";
        });
    }
}

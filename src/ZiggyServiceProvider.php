<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Blade::directive('routes', function () {
            return "<?php echo app('" . BladeRouteGenerator::class . "')->generate(); ?>";
        });

        /**
         * generate file automatically.
         *
         * todo: add blade directive or whatever to
         * get the file dis-regarding of the time stamp
         */
        $routes_folder     = base_path('routes');
        $modification_time = filemtime($routes_folder);
        $js_data           = File::get(__DIR__.'/js/route.js');

        $new_path = public_path("assets/js/ziggy.{$modification_time}.js");
        $old_path = public_path('assets/js/ziggy.*.js');

        if (!File::exists($new_path)) {
            File::delete(File::glob($old_path));
            File::put($new_path, $js_data);
        }
    }
}

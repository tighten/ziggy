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

        $this->autoGen();
    }

    /**
     * generate file automatically.
     *
     * todo: add a blade directive to load the file ex."mix(...)"
     */
    protected function autoGen()
    {
        $routes_folder     = base_path('routes');
        $modification_time = filemtime($routes_folder);

        // create vendor if not already
        $dir = resource_path('assets/vendor');
        if (!File::exists($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        $new_path = $dir . "/ziggy.{$modification_time}.js";
        $old_path = $dir . '/ziggy.*';

        // create js file when routes has changed
        if (!File::exists($new_path)) {
            app(BladeRouteGenerator::class)->generate();
            $js_data = File::get(__DIR__ . '/js/route.js'); // or where ever u gonna save the compiled file

            File::delete(File::glob($old_path));
            File::put($new_path, $js_data);
        }
    }
}

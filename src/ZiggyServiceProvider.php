<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\Compilers\BladeCompiler;
use Laravel\Octane\Events\RequestReceived;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot()
    {
        if ($this->app->resolved('blade.compiler')) {
            $this->registerDirective($this->app['blade.compiler']);
        } else {
            $this->app->afterResolving('blade.compiler', function (BladeCompiler $bladeCompiler) {
                $this->registerDirective($bladeCompiler);
            });
        }

        Event::listen(RequestReceived::class, function () {
            BladeRouteGenerator::$generated = false;
        });

        if ($this->app->runningInConsole()) {
            $this->commands(CommandRouteGenerator::class);
        }
    }

    protected function registerDirective(BladeCompiler $bladeCompiler)
    {
        $bladeCompiler->directive('routes', function ($group) {
            return "<?php echo app('" . BladeRouteGenerator::class . "')->generate({$group}); ?>";
        });
    }
}

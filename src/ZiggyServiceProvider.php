<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Tightenco\Ziggy\ZiggyTokenBladeCompiler;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot(BladeRouteGenerator $generator)
    {
        if (config('app.env') === 'local' || config('ziggy.skip_view_cache') === true) {
            $this->app->singleton('blade.compiler', function () {
                return new ZiggyTokenBladeCompiler(
                    $this->app['files'], $this->app['config']['view.compiled']
                );
            });
        }

        Blade::directive('routes', function () use ($generator) {
            return $generator->generate();
        });
    }
}

<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Tightenco\Ziggy\NoCacheBladeCompiler;
use Tightenco\Ziggy\UnCachedViewFinder;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot(BladeRouteGenerator $generator)
    {
        if (config('app.env') === 'local' || config('app.ziggy_cache') === false) {
            $this->app->singleton('blade.compiler', function () {
                return new NoCacheBladeCompiler(
                    $this->app['files'], $this->app['config']['view.compiled']
                );
            });
        }

        Blade::directive('routes', function () use ($generator) {
            return $generator->generate();
        });
    }
}

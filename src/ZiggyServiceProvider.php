<?php

namespace Tightenco\Ziggy;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class ZiggyServiceProvider extends ServiceProvider
{
    public function boot(BladeRouteGenerator $generator)
    {
        Blade::directive('routes', function () use ($generator) {
            return $generator->generate();
        });
    }
}

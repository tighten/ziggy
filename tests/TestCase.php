<?php

namespace Tests;

use Closure;
use Orchestra\Testbench\TestCase as OrchestraTestCase;
use Tightenco\Ziggy\Ziggy;
use Tightenco\Ziggy\ZiggyServiceProvider;

class TestCase extends OrchestraTestCase
{
    protected function tearDown(): void
    {
        Ziggy::clearRoutes();

        parent::tearDown();
    }

    protected function getPackageProviders($app)
    {
        return [ZiggyServiceProvider::class];
    }

    protected function laravelVersion(int $v = null)
    {
        $version = (int) head(explode('.', app()->version()));

        return isset($v) ? $version >= $v : $version;
    }

    protected function noop(): Closure
    {
        return function () {
            return '';
        };
    }
}

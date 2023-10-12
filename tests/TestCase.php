<?php

namespace Tests;

use Closure;
use Orchestra\Testbench\TestCase as OrchestraTestCase;
use Tighten\Ziggy\Ziggy;
use Tighten\Ziggy\ZiggyServiceProvider;

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

    protected function noop(): Closure
    {
        return function () {
            return '';
        };
    }
}

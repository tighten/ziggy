<?php

namespace Tests;

use Orchestra\Testbench\TestCase as OrchestraTestCase;
use Tighten\Ziggy\Ziggy;
use Tighten\Ziggy\ZiggyServiceProvider;

abstract class TestCase extends OrchestraTestCase
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
}

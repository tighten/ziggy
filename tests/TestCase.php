<?php

namespace Tests;

use Orchestra\Testbench\TestCase as OrchestraTestCase;
use Tightenco\Ziggy\ZiggyServiceProvider;

class TestCase extends OrchestraTestCase
{
    protected function getPackageProviders($app)
    {
        return [
            ZiggyServiceProvider::class,
        ];
    }

    protected function noop()
    {
        return function () {
            return '';
        };
    }
}

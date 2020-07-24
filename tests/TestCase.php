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

    protected function laravelVersion(int $v = null)
    {
        $version = (int) head(explode('.', app()->version()));

        return isset($v) ? $version >= $v : $version;
    }

    protected function noop()
    {
        return function () {
            return '';
        };
    }
}

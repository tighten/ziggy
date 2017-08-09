<?php

namespace Tightenco\Tests;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Orchestra\Testbench\TestCase as OrchestraTestCase;

class TestCase extends OrchestraTestCase
{
    protected function assertJsonContains(array $haystack, array $needle)
    {
        $actual = json_encode(Arr::sortRecursive(
            (array) $haystack
        ));

        foreach (Arr::sortRecursive($needle) as $key => $value) {
            $expected = $this->formatToExpectedJson($key, $value);

            $this->assertTrue(
                Str::contains($actual, $expected),
                'Unable to find JSON fragment'.PHP_EOL."[{$expected}]".PHP_EOL.'within'.PHP_EOL."[{$actual}]."
            );
        }

        return $this;
    }

    protected function formatToExpectedJson($key, $value)
    {
        $expected = json_encode([$key => $value]);

        if (Str::startsWith($expected, '{')) {
            $expected = substr($expected, 1);
        }

        if (Str::endsWith($expected, '}')) {
            $expected = substr($expected, 0, -1);
        }

        return trim($expected);
    }
}

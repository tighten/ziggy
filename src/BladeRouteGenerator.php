<?php

namespace Tightenco\Ziggy;

use Tightenco\Ziggy\Output\MergeScript;
use Tightenco\Ziggy\Output\Script;

class BladeRouteGenerator
{
    public static $generated;

    public function generate($group = null, $nonce = null)
    {
        $ziggy = new Ziggy($group);

        $nonce = $nonce ? ' nonce="' . $nonce . '"' : '';

        if (static::$generated) {
            return (string) $this->generateMergeJavascript($ziggy, $nonce);
        }

        $routeFunction = $this->getRouteFunction();

        static::$generated = true;

        $formatter = config()->get('ziggy.formatters.script', ScriptFormatter::class);

        return (string) new $formatter($ziggy, $routeFunction, $nonce);
    }

    private function generateMergeJavascript(Ziggy $ziggy, $nonce)
    {
        $formatter = config()->get('ziggy.formatters.mergeScript', MergeScript::class);

        return new $formatter($ziggy, $nonce);
    }

    private function getRouteFilePath()
    {
        return __DIR__ . '/../dist/index.js';
    }

    private function getRouteFunction()
    {
        if (config()->get('ziggy.skip-route-function')) {
            return '';
        }

        return file_get_contents($this->getRouteFilePath());
    }
}

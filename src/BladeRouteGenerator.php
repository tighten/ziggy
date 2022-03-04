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

        $function = $this->getRouteFunction();

        static::$generated = true;

        $output = config('ziggy.output.script', Script::class);

        return (string) new $output($ziggy, $function, $nonce);
    }

    private function generateMergeJavascript(Ziggy $ziggy, $nonce)
    {
        $output = config('ziggy.output.merge_script', MergeScript::class);

        return new $output($ziggy, $nonce);
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

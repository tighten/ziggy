<?php

namespace Tighten\Ziggy;

use Tighten\Ziggy\Output\MergeScript;
use Tighten\Ziggy\Output\Script;

class BladeRouteGenerator
{
    public static $generated;

    public function generate($group = null, string $nonce = null): string
    {
        $ziggy = new Ziggy($group);

        $nonce = $nonce ? " nonce=\"{$nonce}\"" : '';

        if (static::$generated) {
            return (string) $this->generateMergeJavascript($ziggy, $nonce);
        }

        static::$generated = true;

        $output = config('ziggy.output.script', Script::class);

        return (string) new $output($ziggy, $this->getRouteFunction(), $nonce);
    }

    private function generateMergeJavascript(Ziggy $ziggy, $nonce)
    {
        $output = config('ziggy.output.merge_script', MergeScript::class);

        return new $output($ziggy, $nonce);
    }

    private function getRouteFunction()
    {
        return config('ziggy.skip-route-function') ? '' : file_get_contents(__DIR__ . '/../dist/route.umd.js');
    }
}

<?php

namespace Tighten\Ziggy;

use Tighten\Ziggy\Output\Json;
use Tighten\Ziggy\Output\MergeScript;
use Tighten\Ziggy\Output\Script;

class BladeRouteGenerator
{
    public static $generated;

    public function generate(array|string|null $group = null, ?string $nonce = null, ?bool $json = false): string
    {
        $ziggy = new Ziggy($group);

        if ($json) {
            $output = config('ziggy.output.json', Json::class);

            return (string) new $output($ziggy);
        }

        $nonce = $nonce ? " nonce=\"{$nonce}\"" : '';

        if (static::$generated) {
            return (string) $this->generateMergeJavascript($ziggy, $nonce);
        }

        static::$generated = true;

        $output = config('ziggy.output.script', Script::class);

        $routeFunction = config('ziggy.skip-route-function') ? '' : file_get_contents(__DIR__ . '/../dist/route.umd.js');

        return (string) new $output($ziggy, $routeFunction, $nonce);
    }

    private function generateMergeJavascript(Ziggy $ziggy, string $nonce)
    {
        $output = config('ziggy.output.merge_script', MergeScript::class);

        return new $output($ziggy, $nonce);
    }
}

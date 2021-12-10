<?php

namespace Tighten\Ziggy;

class BladeRouteGenerator
{
    public static $generated;

    public function generate($group = null, string $nonce = null): string
    {
        $payload = new Ziggy($group);
        $nonce = $nonce ? " nonce=\"{$nonce}\"" : '';

        if (static::$generated) {
            $json = json_encode($payload->toArray()['routes']);

            return <<<HTML
<script type="text/javascript"{$nonce}>Object.assign(Ziggy.routes,{$json});</script>
HTML;
        }

        static::$generated = true;

        $function = config('ziggy.skip-route-function') ? '' : file_get_contents(__DIR__ . '/../dist/route.umd.js');

        return <<<HTML
<script type="text/javascript"{$nonce}>const Ziggy={$payload->toJson()};{$function}</script>
HTML;
    }
}

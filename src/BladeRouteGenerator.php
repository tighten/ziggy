<?php

namespace Tighten\Ziggy;

class BladeRouteGenerator
{
    public static $generated;

    public function generate($group = null, $nonce = null)
    {
        $payload = new Ziggy($group);

        $nonce = $nonce ? ' nonce="' . $nonce . '"' : '';

        if (static::$generated) {
            return $this->generateMergeJavascript(json_encode($payload->toArray()['routes']), $nonce);
        }

        $routeFunction = $this->getRouteFunction();

        static::$generated = true;

        return <<<HTML
<script type="text/javascript"{$nonce}>
    const Ziggy={$payload->toJson()};
    {$routeFunction}
</script>
HTML;
    }

    private function generateMergeJavascript($json, $nonce)
    {
        return <<<HTML
<script type="text/javascript"{$nonce}>
    (function () {
        const routes = {$json};

        Object.assign(Ziggy.routes, routes);
    })();
</script>
HTML;
    }

    private function getRouteFunction(): string
    {
        return config('ziggy.skip-route-function') ? '' : file_get_contents(__DIR__ . '/../dist/route.umd.js');
    }
}

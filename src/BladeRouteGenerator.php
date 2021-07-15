<?php

namespace Tightenco\Ziggy;

class BladeRouteGenerator
{
    public static $generated;
    public static $payload;

    public function generate($group = null, $nonce = null)
    {
        if (! static::$payload) {
            static::$payload = new Ziggy($group);
        }

        $nonce = $nonce ? ' nonce="' . $nonce . '"' : '';

        if (static::$generated) {
            return $this->generateMergeJavascript(json_encode(static::$payload->toArray()['routes']), $nonce);
        }

        $ziggy = static::$payload->toJson();
        $routeFunction = $this->getRouteFunction();

        static::$generated = true;

        return <<<HTML
<script type="text/javascript"{$nonce}>
    const Ziggy = {$ziggy};

    $routeFunction
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

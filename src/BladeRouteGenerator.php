<?php

namespace Tightenco\Ziggy;

class BladeRouteGenerator
{
    public static $generated;

    public function generate($group = false, $nonce = false)
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
    const Ziggy = {$payload->toJson()};

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

        for (let name in routes) {
            Ziggy.routes[name] = routes[name];
        }
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

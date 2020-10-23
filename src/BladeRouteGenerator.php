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
            return $this->generateMergeJavascript(json_encode($payload->toArray()['namedRoutes']), $nonce);
        }

        $routeFunction = $this->getRouteFunction();

        static::$generated = true;

        return <<<HTML
<script type="text/javascript"{$nonce}>
    var Ziggy = {$payload->toJson()};

    $routeFunction
</script>
HTML;
    }

    private function generateMergeJavascript($json, $nonce)
    {
        return <<<HTML
<script type="text/javascript"{$nonce}>
    (function() {
        var routes = {$json};

        for (var name in routes) {
            Ziggy.namedRoutes[name] = routes[name];
        }
    })();
</script>
HTML;
    }

    private function getRouteFilePath()
    {
        return __DIR__ . '/../dist/route.js';
    }

    private function getRouteFunction()
    {
        if (config()->get('ziggy.skip-route-function')) {
            return '';
        }

        return file_get_contents($this->getRouteFilePath());
    }
}

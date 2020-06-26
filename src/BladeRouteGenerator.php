<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;

class BladeRouteGenerator
{
    public static $generated;

    private $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function generate($group = false, $nonce = false)
    {
        $payload = (new RoutePayload($this->router, $group))->toJson();
        $nonce = $nonce ? ' nonce="' . $nonce . '"' : '';

        if (static::$generated) {
            return $this->generateMergeJavascript($payload, $nonce);
        }

        $routeFunction = $this->getRouteFunction();

        static::$generated = true;

        return <<<EOT
<script type="text/javascript"{$nonce}>
    var Ziggy = {$payload};

    $routeFunction
</script>
EOT;
    }

    private function generateMergeJavascript($json, $nonce)
    {
        return <<<EOT
<script type="text/javascript"{$nonce}>
    (function() {
        var routes = $json;

        for (var name in routes) {
            Ziggy.namedRoutes[name] = routes[name];
        }
    })();
</script>
EOT;
    }

    private function getRouteFilePath()
    {
        return __DIR__ . '/../dist/js/route' . (app()->isLocal() ? '' : '.min') . '.js';
    }

    private function getRouteFunction()
    {
        if (config()->get('ziggy.skip-route-function')) {
            return '';
        }

        return file_get_contents($this->getRouteFilePath());
    }
}

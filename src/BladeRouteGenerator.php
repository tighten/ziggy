<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;
use function array_key_exists;

class BladeRouteGenerator
{
    private static $generated;
    private $baseDomain;
    private $basePort;
    private $baseUrl;
    private $baseProtocol;
    private $router;
    public  $routePayload;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function getRoutePayload($group = false)
    {
        return RoutePayload::compile($this->router, $group);
    }

    public function generate($group = false)
    {
        $payload = ZiggyConfig::json(
            $this->router,
            $group
        );

        if (static::$generated) {
            return $this->generateMergeJavascript($payload);
        }

        $routeFunction = $this->getRouteFunction();

        static::$generated = true;

        return <<<EOT
<script type="text/javascript">
    var Ziggy = $payload;

    $routeFunction
</script>
EOT;
    }

    private function generateMergeJavascript($json)
    {
        return <<<EOT
<script type="text/javascript">
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
        $isMin = app()->isLocal() ? '' : '.min';
        return __DIR__ . "/../dist/js/route{$isMin}.js";
    }

    private function getRouteFunction()
    {
        if (config()->get('ziggy.skip-route-function')) {
            return '';
        }
        return file_get_contents($this->getRouteFilePath());
    }
}

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
        $json = $this->getRoutePayload($group)->toJson();

        if (static::$generated) {
            return $this->generateMergeJavascript($json);
        }

        $this->prepareDomain();

        $routeFunction = $this->getRouteFunction();

        $defaultParameters = method_exists(app('url'), 'getDefaultParameters') ? json_encode(app('url')->getDefaultParameters()) : '[]';

        static::$generated = true;

        return <<<EOT
<script type="text/javascript">
    var Ziggy = {
        namedRoutes: $json,
        baseUrl: '{$this->baseUrl}',
        baseProtocol: '{$this->baseProtocol}',
        baseDomain: '{$this->baseDomain}',
        basePort: {$this->basePort},
        defaultParameters: $defaultParameters
    };

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

    private function prepareDomain()
    {
        $url = config('ziggy.base_url', url('/'));
        $parsedUrl = parse_url($url);

        $this->baseUrl = $url . '/';
        $this->baseProtocol = array_key_exists('scheme', $parsedUrl) ? $parsedUrl['scheme'] : 'http';
        $this->baseDomain = array_key_exists('host', $parsedUrl) ? $parsedUrl['host'] : '';
        $this->basePort = array_key_exists('port', $parsedUrl) ? $parsedUrl['port'] : 'false';
    }
}

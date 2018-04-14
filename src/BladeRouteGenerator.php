<?php

namespace Tightenco\Ziggy;

use function array_key_exists;
use Tightenco\Ziggy\RoutePayload;

class BladeRouteGenerator
{

    private $baseDomain;
    private $basePort;
    private $baseUrl;
    private $baseProtocol;
    public  $routePayload;

    public static function getRoutePayload($group = false)
    {
        return RoutePayload::compile($group);
    }

    public function generate($group = false)
    {
        $this->prepareDomain();

        $json = $this->getRoutePayload($group)->toJson();

        $routeFunction = $this->getRouteFunction();

        $defaultParameters = method_exists(app('url'), 'getDefaultParameters') ? json_encode(app('url')->getDefaultParameters()) : '[]';

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
        $url = url('/');
        $parsedUrl = parse_url($url);

        $this->baseUrl = $url . '/';
        $this->baseProtocol = array_key_exists('scheme', $parsedUrl) ? $parsedUrl['scheme'] : 'http';
        $this->baseDomain = array_key_exists('host', $parsedUrl) ? $parsedUrl['host'] : '';
        $this->basePort = array_key_exists('port', $parsedUrl) ? $parsedUrl['port'] : 'false';
    }
}

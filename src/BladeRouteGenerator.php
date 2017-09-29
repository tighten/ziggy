<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;
use function array_key_exists;

class BladeRouteGenerator
{

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
        $this->prepareDomain();

        $json = $this->getRoutePayload($group)->toJson();

        $routeFunction = file_get_contents(__DIR__ . '/js/route.js');

        return <<<EOT
<script type="text/javascript">
    var namedRoutes = JSON.parse('$json'),
        baseUrl = '{$this->baseUrl}',
        baseProtocol = '{$this->baseProtocol}',
        baseDomain = '{$this->baseDomain}',
        basePort = {$this->basePort};
    $routeFunction
</script>
EOT;
    }

    private function prepareDomain()
    {
        $url = url('/');
        $parsedUrl = parse_url($url);
        $this->baseUrl = $url . '/';
        $this->baseProtocol = array_key_exists(PHP_URL_SCHEME, $parsedUrl) ? $parsedUrl[PHP_URL_SCHEME] : 'http';
        $this->baseDomain = array_key_exists(PHP_URL_HOST, $parsedUrl) ? $parsedUrl[PHP_URL_HOST] : '';
        $this->basePort = array_key_exists(PHP_URL_PORT, $parsedUrl) ? $parsedUrl[PHP_URL_PORT] : 'false';
    }
}

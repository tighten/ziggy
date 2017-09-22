<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;
use function str_before;

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
        basePort = {$this->basePort},
        $routeFunction
</script>
EOT;
    }

    private function prepareDomain()
    {
        $url = url('/');
        $this->baseUrl = $url . '/';
        $this->baseProtocol = str_before($url, ':');
        $this->baseDomain = str_replace($this->baseProtocol . '://', '', $url);
        $this->basePort = false;
        if (strpos($this->baseDomain, ':')) {
            $urlParts = explode(':', $this->baseDomain);
            $this->baseDomain = $urlParts[0];
            $this->basePort = $urlParts[1];
        }
    }
}

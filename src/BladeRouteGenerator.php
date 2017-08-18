<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;

class BladeRouteGenerator
{
    private $router;
    public $routePayload;

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
        $appUrl = url('/') . '/';
        $routeFunction = file_get_contents(__DIR__ . '/js/route.js');

        return <<<EOT
<script type="text/javascript">
    var namedRoutes = JSON.parse('$json'),
        baseUrl = '$appUrl';
        $routeFunction
</script>
EOT;
    }
}

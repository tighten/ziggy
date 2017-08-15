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
        $this->routePayload = RoutePayload::compile($this->router);
    }

    public function generate()
    {
        $json = $this->routePayload->toJson();
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

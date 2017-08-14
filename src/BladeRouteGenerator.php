<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;

class BladeRouteGenerator
{
    private $router;
    public $routes;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function generate()
    {
        $json = $this->nameKeyedRoutes()->toJson();
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

    public function nameKeyedRoutes()
    {
        return collect($this->router->getRoutes()->getRoutesByName())
            ->map(function ($route) {
                return collect($route)->only(['uri'])
                    ->put('domain', $route->domain());
            });
    }
}

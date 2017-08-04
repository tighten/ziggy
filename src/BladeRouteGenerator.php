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
        $this->routes = $this->nameKeyedRoutes();
    }

    public function generate()
    {
        $json = (string) $routes;
        return <<<EOT
<script type="text/javascript">
    var namedRoutes = JSON.parse('$json');

    function route (name, params) {
        return namedRoutes[name].uri.replace(
            /\{([^}]+)\}/,
            function (tag) {
                return params[tag.replace(/\{|\}/gi, '')];
            }
        );
    }
</script>
EOT;
    }

    private function nameKeyedRoutes()
    {
        $routesByName = $this->router->getRoutes();

        return collect($routesByName->getRoutesByName())->map(function ($route) {
            return collect($route)->only(['uri', 'methods']);
        });
    }
}

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
        $json = (string) $this->nameKeyedRoutes();

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

    public function nameKeyedRoutes()
    {
        return collect($this->router->getRoutes()->getRoutesByName())
            ->map(function ($route) {
                return collect($route)->only(['uri', 'methods']);
            });
    }
}

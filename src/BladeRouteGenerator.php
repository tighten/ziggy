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
        $json = (string) $this->routesList();

        return <<<EOT
<script type="text/javascript">
    var namedRoutes = JSON.parse('$json');

    function route(routeName, params) {
        var res = namedRoutes.filter(function (obj) {
            return obj.name == routeName
        })[0]

        return res.uri.replace(
            /\{([^}]+)\}/,
            function (tag) {
                return params[tag.replace(/\{|\}/gi, '')];
            }
        );
    }
</script>
EOT;
    }

    public function routesList()
    {
        $collection     = [];
        $expose         = config('ziggy.expose');
        $action_pattern = config('ziggy.ignore_by_action');
        $uri_pattern    = config('ziggy.ignore_by_uri');
        $name_check     = config('ziggy.ignore_routes_without_names');

        foreach ($this->router->getRoutes() as $route) {
            $host    = $route->domain();
            $methods = $route->methods();
            $uri     = $route->uri();
            $name    = $route->getName();
            $action  = $route->getActionName();

            if ($name_check && !$name) {
                continue;
            }

            if (!empty($action_pattern)) {
                if (preg_match($action_pattern, $action)) {
                    continue;
                }
            }

            if (!empty($uri_pattern)) {
                if (preg_match($uri_pattern, $uri)) {
                    continue;
                }
            }

            $items = ['host', 'methods', 'uri', 'action', 'name'];

            $collection[] = compact(array_intersect($items, $expose));
        }

        return collect($collection);
    }
}

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
        $appUrl = rtrim(config('app.url'), '/') . '/';

        return <<<EOT
<script type="text/javascript">
    var namedRoutes = JSON.parse('$json'),
        baseUrl = '$appUrl';

    function route (name, params = {}, absolute = true) {
        var domain = namedRoutes[name].domain || baseUrl,
            url = (absolute ? domain : '') + namedRoutes[name].uri

        return url.replace(
            /\{([^}]+)\}/gi,
            function (tag) {
                var key = tag.replace(/\{|\}/gi, '');
                if (params[key] === undefined) {
                    throw 'Ziggy Error: "' + key + '" key is required for route "' + name + '"';
                }
                return params[key];
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
                return collect($route)->only(['uri', 'methods'])
                    ->put('domain', $route->domain());
            });
    }
}

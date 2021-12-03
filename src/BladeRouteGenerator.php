<?php

namespace Tightenco\Ziggy;

class BladeRouteGenerator
{
    public static $generated;

    public function generate($group = null, $nonce = null)
    {
        $payload = new Ziggy($group);

        $nonce = $nonce ? ' nonce="' . $nonce . '"' : '';

        if (static::$generated) {
            return $this->generateMergeJavascript(json_encode($payload->toArray()['routes']), $nonce);
        }

        $routeFunction = $this->getRouteFunction();
        $ziggy = $payload->toJson();
        
        $template = config()->get('ziggy.templates.file', <<<HTML
<script type="text/javascript":nonce>
    const Ziggy = :ziggy;

    :routeFunction
</script>
HTML);

        static::$generated = true;

        return strtr($template, [ ':ziggy' => $ziggy, ':nonce' => $nonce, ':routeFunction' => $routeFunction ]);
    }

    private function generateMergeJavascript($json, $nonce)
    {
        $template = config()->get('ziggy.templates.javascript', <<<HTML
<script type="text/javascript":nonce>
    (function () {
        const routes = :json;

        Object.assign(Ziggy.routes, routes);
    })();
</script>
HTML);

        return strtr($template, [ ':json' => $json, ':nonce' => $nonce ]);
    }

    private function getRouteFilePath()
    {
        return __DIR__ . '/../dist/index.js';
    }

    private function getRouteFunction()
    {
        if (config()->get('ziggy.skip-route-function')) {
            return '';
        }

        return file_get_contents($this->getRouteFilePath());
    }
}

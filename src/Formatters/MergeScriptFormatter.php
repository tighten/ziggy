<?php

namespace Tightenco\Ziggy\Formatters;

use Tightenco\Ziggy\Ziggy;

class MergeScriptFormatter
{
    protected $ziggy;
    protected $nonce;

    public function __construct(Ziggy $ziggy, string $nonce = '')
    {
        $this->ziggy = $ziggy;
        $this->nonce = $nonce;
    }

    public function format()
    {
        $routes = json_encode($this->ziggy->toArray()['routes']);

        return <<<HTML
            <script type="text/javascript"{$this->nonce}>
                (function () {
                    const routes = {$routes};

                    Object.assign(Ziggy.routes, routes);
                })();
            </script>
            HTML;
    }
}

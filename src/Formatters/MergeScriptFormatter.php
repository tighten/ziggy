<?php

namespace Tightenco\Ziggy\Formatters;

use Stringable;
use Tightenco\Ziggy\Ziggy;

class MergeScriptFormatter implements Stringable
{
    protected $ziggy;
    protected $nonce;

    public function __construct(Ziggy $ziggy, string $nonce = '')
    {
        $this->ziggy = $ziggy;
        $this->nonce = $nonce;
    }

    public function __toString()
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

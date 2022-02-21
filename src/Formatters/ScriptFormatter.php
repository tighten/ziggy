<?php

namespace Tightenco\Ziggy\Formatters;

use Stringable;
use Tightenco\Ziggy\Ziggy;

class ScriptFormatter implements Stringable
{
    protected $ziggy;
    protected $routeFunction;
    protected $nonce;

    public function __construct(Ziggy $ziggy, string $routeFunction, string $nonce = '')
    {
        $this->ziggy = $ziggy;
        $this->routeFunction = $routeFunction;
        $this->nonce = $nonce;
    }

    public function __toString()
    {
        return <<<HTML
            <script type="text/javascript"{$this->nonce}>
                const Ziggy = {$this->ziggy->toJson()};

                {$this->routeFunction}
            </script>
            HTML;
    }
}

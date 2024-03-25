<?php

namespace Tighten\Ziggy\Output;

use Stringable;
use Tighten\Ziggy\Ziggy;

class MergeScript implements Stringable
{
    protected $ziggy;
    protected $nonce;

    public function __construct(Ziggy $ziggy, string $nonce = '')
    {
        $this->ziggy = $ziggy;
        $this->nonce = $nonce;
    }

    public function __toString(): string
    {
        $routes = json_encode($this->ziggy->toArray()['routes']);

        return <<<HTML
<script type="text/javascript"{$this->nonce}>Object.assign(Ziggy.routes,{$routes});</script>
HTML;
    }
}

<?php

namespace Tighten\Ziggy\Output;

use Stringable;
use Tighten\Ziggy\Ziggy;

class MergeScript implements Stringable
{
    public function __construct(
        protected Ziggy $ziggy,
        protected string $nonce = '',
        protected bool $asJson = false,
    ) {}

    public function __toString(): string
    {
        $routes = json_encode($this->ziggy->toArray()['routes']);

        if ($this->asJson) {
            return <<<JSON
            <script id="Ziggy_routes" type="application/json"{$this->nonce}>$routes</script>
            JSON;
        }

        return <<<HTML
        <script type="text/javascript"{$this->nonce}>Object.assign(Ziggy.routes,{$routes});</script>
        HTML;
    }
}

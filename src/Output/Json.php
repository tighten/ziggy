<?php

namespace Tighten\Ziggy\Output;

use Stringable;
use Tighten\Ziggy\Ziggy;

class Json implements Stringable
{
    public function __construct(
        protected Ziggy $ziggy,
        protected string $nonce = '',
    ) {}

    public function __toString(): string
    {
        return <<<HTML
        <script id="Ziggy_routes" type="application/json"{$this->nonce}>{$this->ziggy->toJson()}</script>
        HTML;
    }
}

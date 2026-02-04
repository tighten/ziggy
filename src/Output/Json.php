<?php

namespace Tighten\Ziggy\Output;

use Stringable;
use Tighten\Ziggy\Ziggy;

class Json implements Stringable
{
    public function __construct(
        protected Ziggy $ziggy,
    ) {}

    public function __toString(): string
    {
        return <<<HTML
        <script id="ziggy-routes-json" type="application/json">{$this->ziggy->toJson()}</script>
        HTML;
    }
}

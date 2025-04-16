<?php

namespace Tighten\Ziggy\Output;

use Stringable;
use Tighten\Ziggy\Ziggy;

class Script implements Stringable
{
    public function __construct(
        protected Ziggy $ziggy,
        protected string $function,
        protected string $nonce = '',
        protected bool $asJson = false,
    ) {}

    public function __toString(): string
    {
        if ($this->asJson) {
            return <<<JSON
            <script id="Ziggy_routes" type="application/json"{$this->nonce}>{$this->ziggy->toJson()}</script>
            JSON;
        }
        return <<<HTML
        <script type="text/javascript"{$this->nonce}>const Ziggy={$this->ziggy->toJson()};{$this->function}</script>
        HTML;
    }
}

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
    ) {}

    public function __toString(): string
    {
        return <<<HTML
        <script type="text/javascript"{$this->nonce}>const Ziggy={$this->ziggy->toJson()};{$this->function}</script>
        HTML;
    }
}

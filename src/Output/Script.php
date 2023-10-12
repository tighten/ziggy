<?php

namespace Tighten\Ziggy\Output;

use Stringable;
use Tighten\Ziggy\Ziggy;

class Script implements Stringable
{
    protected $ziggy;
    protected $function;
    protected $nonce;

    public function __construct(Ziggy $ziggy, string $function, string $nonce = '')
    {
        $this->ziggy = $ziggy;
        $this->function = $function;
        $this->nonce = $nonce;
    }

    public function __toString(): string
    {
        return <<<HTML
<script type="text/javascript"{$this->nonce}>const Ziggy={$this->ziggy->toJson()};{$this->function}</script>
HTML;
    }
}

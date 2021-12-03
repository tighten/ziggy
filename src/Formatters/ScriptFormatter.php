<?php

namespace Tightenco\Ziggy\Formatters;

use Tightenco\Ziggy\Ziggy;

class ScriptFormatter
{
  protected $ziggy;

  protected string $routeFunction;

  protected string $nonce;

  public function __construct(Ziggy $ziggy, string $routeFunction, string $nonce = '')
  {
    $this->ziggy = $ziggy;
    $this->routeFunction = $routeFunction;
    $this->nonce = $nonce;
  }

  public function format() {
    return <<<HTML
<script type="text/javascript"{$this->nonce}>
    const Ziggy = {$this->ziggy->toJson()};

    {$this->routeFunction}
</script>
HTML;
  }
}
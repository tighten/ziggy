<?php

namespace Tests\Formatters;

use Tightenco\Ziggy\Formatters\FileFormatter;

class CustomFileFormatter extends FileFormatter
{
  public function __toString() {
    return <<<JAVASCRIPT
// This is a custom template
const Ziggy = {$this->ziggy->toJson()};

export { Ziggy };

JAVASCRIPT;
  }
}

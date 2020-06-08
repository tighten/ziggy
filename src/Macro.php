<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;

class Macro
{
    const EXCLUDE = 'exclude';
    const INCLUDE = 'include';

    public function __construct(Router $router, $list, $group = null)
    {
        $this->list = $list;
        $this->router = $router;
        $this->group = $group;
    }

    public function compile()
    {
        if (is_callable($this->group)) {
            $this->router->group(['listed_as' => $this->list], $this->group);
        }

        return $this;
    }

    public static function include(Router $router, $group = null)
    {
        return (new static($router, static::INCLUDE, $group))->compile();
    }

    public static function exclude(Router $router, $group = null)
    {
        return (new static($router, static::EXCLUDE, $group))->compile();
    }

    public function __call($method, $parameters)
    {
        $route = call_user_func_array([$this->router, $method], $parameters);

        switch ($this->list) {
            case static::EXCLUDE:
                $route->listedAs = 'exclude';
                break;
            case static::INCLUDE:
                $route->listedAs = 'include';
                break;
        }

        return $route;
    }
}

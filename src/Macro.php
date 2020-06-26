<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;

class Macro
{
    const EXCEPT = 'except';
    const ONLY = 'only';

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

    public static function only(Router $router, $group = null)
    {
        return (new static($router, static::ONLY, $group))->compile();
    }

    public static function except(Router $router, $group = null)
    {
        return (new static($router, static::EXCEPT, $group))->compile();
    }

    public function __call($method, $parameters)
    {
        $route = call_user_func_array([$this->router, $method], $parameters);

        switch ($this->list) {
            case static::EXCEPT:
                $route->listedAs = 'except';
                break;
            case static::ONLY:
                $route->listedAs = 'only';
                break;
        }

        return $route;
    }
}

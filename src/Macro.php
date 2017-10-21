<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Router;

class Macro
{
    const BLACKLIST = 'blacklist';
    const WHITELIST = 'whitelist';

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

    public static function whitelist(Router $router, $group = null)
    {
        return (new static($router, static::WHITELIST, $group))->compile();
    }

    public static function blacklist(Router $router, $group = null)
    {
        return (new static($router, static::BLACKLIST, $group))->compile();
    }

    public function __call($method, $parameters)
    {
        $route = call_user_func_array([$this->router, $method], $parameters);

        switch ($this->list) {
            case static::BLACKLIST:
                $route->listedAs = 'blacklist';
                break;
            case static::WHITELIST:
                $route->listedAs = 'whitelist';
                break;
        }

        return $route;
    }
}

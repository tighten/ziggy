<?php

namespace Tightenco\Ziggy;

class Macro
{
    const BLACKLIST = 'blacklist';
    const WHITELIST = 'whitelist';

    public function __construct($list, $group = null)
    {
        $this->list = $list;
        $this->group = $group;
    }

    public function compile()
    {
        if (is_callable($this->group)) {
            app('router')->group(['listed_as' => $this->list], $this->group);
        }

        return $this;
    }

    public static function whitelist($group = null)
    {
        return (new static(static::WHITELIST, $group))->compile();
    }

    public static function blacklist($group = null)
    {
        return (new static(static::BLACKLIST, $group))->compile();
    }

    public function __call($method, $parameters)
    {
        $route = call_user_func_array([app('router'), $method], $parameters);

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

<?php

namespace Tightenco\Ziggy;

class Macro
{
    const EXCEPT = 'except';
    const ONLY = 'only';

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

    public static function only($group = null)
    {
        return (new static(static::ONLY, $group))->compile();
    }

    public static function except($group = null)
    {
        return (new static(static::EXCEPT, $group))->compile();
    }

    public function __call($method, $parameters)
    {
        $route = call_user_func_array([app('router'), $method], $parameters);

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

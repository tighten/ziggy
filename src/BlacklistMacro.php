<?php

namespace Tightenco\Ziggy;

use Illuminate\Routing\Route;
use Illuminate\Routing\Router;

class BlacklistMacro
{
    protected $router;

    protected $groupMethods = [
        'namespace',
        'prefix',
        'middleware',
        'domain',
    ];

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    protected function blacklistRoute($method, $parameters)
    {
        $route = call_user_func_array([$this->router, $method], $parameters);

        if ($route instanceof Route) {
            $route->setAction(array_merge($route->getAction(), ['blacklist' => true]));
        }

        return $route;
    }

    protected function blacklistName($method, $parameters)
    {
        config()->set('ziggy.blacklist', array_merge(
            config('ziggy.blacklist', []), [array_get($parameters, '0')]
        ));

        return call_user_func_array([$this->router, $method], $parameters);
    }

    protected function blacklistGroup($method, $parameters)
    {
        array_set($parameters, '0', array_merge((array) $parameters[0], ['blacklist' => true]));

        // Route::group normally returns null...
        return call_user_func_array([$this->router, $method], $parameters);
    }

    public function __call($method, $parameters)
    {
        if ($method === 'name' || $method === 'as') {
            return $this->blacklistName($method, $parameters);
        }

        if ($method === 'group') {
            return $this->blacklistGroup($method, $parameters);
        }

        // This needs some more thought. New updates to Laravel's route functionality
        // allowing for attributes like "prefix" to be fluently added causes issues.

        // if (in_array($method, $this->groupMethods)) {
        //     return $this->blacklistGroupAttributes($method, $parameters);
        // }

        return $this->blacklistRoute($method, $parameters);
    }
}

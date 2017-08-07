<?php

namespace Tightenco\Ziggy;

use Illuminate\View\Compilers\BladeCompiler;

class ZiggyTokenBladeCompiler extends BladeCompiler
{
	public function isExpired($path)
	{
        if (parent::isExpired($path)) {
            return true;
        }

        if ($this->containsZiggyDirective($path) && $this->routesAreDirty()) {
            return true;
        }
	}

    protected function containsZiggyDirective($path)
    {
        $compiled = $this->getCompiledPath($path);

        return $this->fileContainsString($compiled, BladeRouteGenerator::getToken());
    }

    protected function fileContainsString($path, $string)
    {
        $handle = fopen($path, 'r');
        $found = false;

        while (($buffer = fgets($handle)) !== false) {
            if (strpos($buffer, $string) !== false) {
                $found = true;
                break;
            }
        }

        fclose($handle);

        return $found;
    }

    protected function routesAreDirty()
    {
        $cache = app('cache');

        $oldhash = $cache->get('ziggy-route-list-hash');

        $newhash = md5(print_r($this->getRoutesHash(), true));

        if ($newhash == $oldhash) {
            return false;
        }

        // Routes are different than they were when cached
        $cache->forever('ziggy-route-list-hash', $newhash);

        return true;
    }

    protected function getRoutesHash()
    {
        $routes = app('router')->getRoutes()->getRoutes();

        $return = [];

        foreach ($routes as $route) {
            $return[] = $this->getRouteHash($route);
        }

        return $return;
    }

    protected function getRouteHash($route)
    {
        return [
            'uri' => $route->uri,
            'methods' => $route->methods,
            'as' => array_get($route->action, 'as'),
        ];
    }
}

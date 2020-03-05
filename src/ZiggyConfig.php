<?php

namespace Tightenco\Ziggy;

use function array_key_exists;
use Illuminate\Routing\Router;

class ZiggyConfig
{
    private $baseDomain;
    private $basePort;
    private $baseProtocol;
    private $baseUrl;
    private $group;
    private $router;

    public function __construct(Router $router, $group, $url)
    {
        $url = $url ?? url('/');
        $parsedUrl = parse_url($url);

        $this->group = $group;
        $this->router = $router;
        $this->baseUrl = $url . '/';
        $this->baseProtocol = array_key_exists('scheme', $parsedUrl) ? $parsedUrl['scheme'] : 'http';
        $this->baseDomain = array_key_exists('host', $parsedUrl) ? $parsedUrl['host'] : '';
        $this->basePort = array_key_exists('port', $parsedUrl) ? $parsedUrl['port'] : 'false';
    }

    public function generate()
    {
        return [
            'namedRoutes' => RoutePayload::compile($this->router, $this->group),
            'baseUrl' => $this->baseUrl,
            'baseProtocol' => $this->baseProtocol,
            'baseDomain' => $this->baseDomain,
            'basePort' => $this->basePort,
            'defaultParameters' => method_exists(app('url'), 'getDefaultParameters')
                ? app('url')->getDefaultParameters()
                : []
        ];
    }

    public static function json($router, $group = null, $url = null)
    {
        return json_encode(
            (new static($router, $group, $url))->generate(),
            true
        );
    }
}

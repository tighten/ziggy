<?php

namespace Tightenco\Ziggy;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Routing\Router;
use Tightenco\Ziggy\BladeRouteGenerator;
use Tightenco\Ziggy\RoutePayload;

class CommandRouteGenerator extends Command
{
    protected $signature = 'ziggy:generate {path=./resources/assets/js/ziggy.js} {--url=/} {--group=}';

    protected $description = 'Generate js file for including in build process';

    protected $baseUrl;
    protected $baseProtocol;
    protected $baseDomain;
    protected $basePort;
    protected $router;

    public function __construct(Router $router, Filesystem $files)
    {
        parent::__construct();

        $this->router = $router;
        $this->files = $files;
    }

    public function handle()
    {
        $path = $this->argument('path');
        $group = $this->option('group');

        $generatedRoutes = $this->generate($group);

        $this->makeDirectory($path);

        $this->files->put(base_path($path), $generatedRoutes);
        
        $this->info('File generated!');
    }

    public function generate($group = false)
    {
        $this->prepareDomain();

        $json = $this->getRoutePayload($group)->toJson();

        $defaultParameters = method_exists(app('url'), 'getDefaultParameters') ? json_encode(app('url')->getDefaultParameters()) : '[]';

        return <<<EOT
    var Ziggy = {
        namedRoutes: $json,
        baseUrl: '{$this->baseUrl}',
        baseProtocol: '{$this->baseProtocol}',
        baseDomain: '{$this->baseDomain}',
        basePort: {$this->basePort},
        defaultParameters: $defaultParameters
    };

    if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
        for (var name in window.Ziggy.namedRoutes) {
            Ziggy.namedRoutes[name] = window.Ziggy.namedRoutes[name];
        }
    }

    export {
        Ziggy
    }

EOT;
    }

    private function prepareDomain()
    {
        $url = url($this->option('url'));
        $parsedUrl = parse_url($url);

        $this->baseUrl = $url . '/';
        $this->baseProtocol = array_key_exists('scheme', $parsedUrl) ? $parsedUrl['scheme'] : 'http';
        $this->baseDomain = array_key_exists('host', $parsedUrl) ? $parsedUrl['host'] : '';
        $this->basePort = array_key_exists('port', $parsedUrl) ? $parsedUrl['port'] : 'false';
    }

    public function getRoutePayload($group = false)
    {
        return RoutePayload::compile($this->router, $group);
    }

    protected function makeDirectory($path)
    {
        if (! $this->files->isDirectory(dirname(base_path($path)))) {
            $this->files->makeDirectory(dirname(base_path($path)), 0777, true, true);
        }
        return $path;
    }
}

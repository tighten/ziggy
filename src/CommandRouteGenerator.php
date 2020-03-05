<?php

namespace Tightenco\Ziggy;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Routing\Router;
use Tightenco\Ziggy\ZiggyConfig;
use Tightenco\Ziggy\RoutePayload;

class CommandRouteGenerator extends Command
{
    protected $signature = 'ziggy:generate {path=./resources/assets/js/ziggy.js} {--url=/} {--group=}';

    protected $description = 'Generate js file for including in build process';

    protected $baseDomain;
    protected $basePort;
    protected $baseProtocol;
    protected $baseUrl;
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
        $this->files->put($path, $generatedRoutes);

        $this->info('File generated!');
    }

    public function generate($group = false)
    {
        $payload = ZiggyConfig::json(
            $this->router,
            $group,
            url($this->option('url'))
        );

        return <<<EOT
var Ziggy = $payload;

if (typeof window.Ziggy !== 'undefined') {
    for (var name in window.Ziggy.namedRoutes) {
        Ziggy.namedRoutes[name] = window.Ziggy.namedRoutes[name];
    }
}

export {
    Ziggy
}

EOT;
    }

    protected function makeDirectory($path)
    {
        if (!$this->files->isDirectory(dirname($path))) {
            $this->files->makeDirectory(dirname($path), 0777, true, true);
        }
        return $path;
    }
}

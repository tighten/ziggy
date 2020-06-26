<?php

namespace Tightenco\Ziggy;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Routing\Router;
use Tightenco\Ziggy\Ziggy;

class CommandRouteGenerator extends Command
{
    protected $signature = 'ziggy:generate {path=./resources/js/ziggy.js} {--url=/} {--group=}';

    protected $description = 'Generate js file for including in build process';

    protected $files;
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
        $payload = (new Ziggy($this->router, $group, url($this->option('url'))))->toJson();

        return <<<EOT
var Ziggy = {$payload};

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

    protected function makeDirectory($path)
    {
        if (! $this->files->isDirectory(dirname(base_path($path)))) {
            $this->files->makeDirectory(dirname(base_path($path)), 0777, true, true);
        }

        return $path;
    }
}

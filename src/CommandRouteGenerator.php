<?php

namespace Tightenco\Ziggy;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Tightenco\Ziggy\Output\File;
use Tightenco\Ziggy\Ziggy;

class CommandRouteGenerator extends Command
{
    protected $signature = 'ziggy:generate
                            {path? : Path to the generated JavaScript file. Default: `resources/js/ziggy.js`.}
                            {--url=}
                            {--group=}';

    protected $description = 'Generate a JavaScript file containing Ziggy’s routes and configuration.';

    protected $files;

    public function __construct(Filesystem $files)
    {
        parent::__construct();

        $this->files = $files;
    }

    public function handle()
    {
        $path = $this->argument('path') ?? config('ziggy.output.path', 'resources/js/ziggy.js');
        $generatedRoutes = $this->generate($this->option('group'));

        $this->makeDirectory($path);
        $this->files->put(base_path($path), $generatedRoutes);

        $this->info('File generated!');
    }

    protected function makeDirectory($path)
    {
        if (! $this->files->isDirectory(dirname(base_path($path)))) {
            $this->files->makeDirectory(dirname(base_path($path)), 0755, true, true);
        }

        return $path;
    }

    private function generate($group = false)
    {
        $ziggy = (new Ziggy($group, $this->option('url') ? url($this->option('url')) : null));

        $output = config('ziggy.output.file', File::class);

        return (string) new $output($ziggy);
    }
}

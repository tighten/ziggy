<?php

namespace Tightenco\Ziggy;

use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\Filesystem;
use Tightenco\Ziggy\Output\File;

class CommandRouteGenerator extends Command
{
    protected $signature = 'ziggy:generate
                            {path=*./resources/js/ziggy.js : Path to the generated JavaScript file.}
                            {--url=*}
                            {--group=*}';

    protected $description = 'Generate a JavaScript file containing Ziggy’s routes and configuration.';

    protected $files;

    public function __construct(Filesystem $files)
    {
        parent::__construct();

        $this->files = $files;
    }

    public function handle()
    {
        $paths = $this->argument('path');
        foreach ((array)$paths as $index => $path) {
            $generatedRoutes = $this->generate(
                $this->get($this->option('group'), $index) ?? '',
                $this->get($this->option('url'), $index) ? url($this->get($this->option('url'), $index)) : null
            );

            $this->makeDirectory($path);
            try {
                $prevContent = $this->files->get(base_path($path));
            } catch (FileNotFoundException $e) {
                $prevContent = '';
            }
            if ($prevContent != $generatedRoutes) {
                $this->files->put(base_path($path), $generatedRoutes);
                $this->info('File '.$path.' generated!');
            }
        }
    }

    private function get($value, $index) {
        if (is_array($value)) {
            return $value[$index] ?? null;
        }
        return $value;
    }

    protected function makeDirectory($path)
    {
        if (! $this->files->isDirectory(dirname(base_path($path)))) {
            $this->files->makeDirectory(dirname(base_path($path)), 0755, true, true);
        }

        return $path;
    }

    private function generate($group = false, $url = null)
    {
        $ziggy = new Ziggy($group, $url);

        $output = config('ziggy.output.file', File::class);

        return (string) new $output($ziggy);
    }
}

<?php

namespace Tighten\Ziggy;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Tighten\Ziggy\Output\File;
use Tighten\Ziggy\Output\Types;
use Tighten\Ziggy\Ziggy;

class CommandRouteGenerator extends Command
{
    protected $signature = 'ziggy:generate
                            {path? : Path to the generated JavaScript file. Default: `resources/js/ziggy.js`.}
                            {--types : Generate a TypeScript declaration file.}
                            {--types-only : Generate only a TypeScript declaration file.}
                            {--url=}
                            {--group=}';

    protected $description = 'Generate a JavaScript file containing Ziggy’s routes and configuration.';

    public function handle(Filesystem $filesystem)
    {
        $ziggy = new Ziggy($this->option('group'), $this->option('url') ? url($this->option('url')) : null);

        $path = $this->argument('path') ?? config('ziggy.output.path', 'resources/js/ziggy.js');

        if ($filesystem->isDirectory(base_path($path))) {
            $path .= '/ziggy';
        } else {
            $filesystem->ensureDirectoryExists(dirname(base_path($path)), recursive: true);
        }

        $name = preg_replace('/(\.d)?\.ts$|\.js$/', '', $path);

        if (! $this->option('types-only')) {
            $output = config('ziggy.output.file', File::class);

            $filesystem->put(base_path("{$name}.js"), new $output($ziggy));
        }

        if ($this->option('types') || $this->option('types-only')) {
            $types = config('ziggy.output.types', Types::class);

            $filesystem->put(base_path("{$name}.d.ts"), new $types($ziggy));
        }

        $this->info('Files generated!');
    }
}

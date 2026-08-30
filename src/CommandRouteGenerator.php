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
                            {--types=false : Generate a TypeScript declaration file at the given path. Default: `resources/js/ziggy.d.ts`.}
                            {--types-only : Generate only a TypeScript declaration file.}
                            {--url=}
                            {--group=}
                            {--except= : Route name patterns to exclude.}
                            {--only= : Route name patterns to include.}';

    protected $description = 'Generate a JavaScript file containing Ziggy’s routes and configuration.';

    public function handle(Filesystem $filesystem)
    {
        $ziggy = new Ziggy($this->option('group'), $this->option('url') ? url($this->option('url')) : null);

        if ($this->option('except') && ! $this->option('only')) {
            $ziggy->filter(explode(',', $this->option('except')), false);
        } else if ($this->option('only') && ! $this->option('except')) {
            $ziggy->filter(explode(',', $this->option('only')));
        }

        $path = $this->argument('path') ?? config('ziggy.output.path', 'resources/js/ziggy.js');

        if ($filesystem->isDirectory($this->path($path))) {
            $path .= '/ziggy';
        } else {
            $filesystem->ensureDirectoryExists(dirname($this->path($path)), recursive: true);
        }

        $name = preg_replace('/(\.d)?\.ts$|\.js$/', '', $path);

        if (! $this->option('types-only')) {
            $output = config('ziggy.output.file', File::class);

            $filesystem->put($this->path("{$name}.js"), new $output($ziggy));
        }

        if ($this->option('types') !== 'false' || $this->option('types-only')) {
            $types = config('ziggy.output.types', Types::class);

            $typesPath = match ($this->option('types')) {
                'false', null => config('ziggy.output.types-path', "{$name}.d.ts"),
                default => $this->option('types'),
            };

            $filesystem->ensureDirectoryExists(dirname($this->path($typesPath)), recursive: true);

            $filesystem->put($this->path($typesPath), new $types($ziggy));
        }

        $this->info('Files generated!');
    }

    private function path(string $path): string
    {
        $isAbsolute = str_starts_with($path, '/')
            || str_starts_with($path, '\\')
            || (strlen($path) > 1 && ctype_alpha($path[0]) && $path[1] === ':');

        return $isAbsolute ? $path : base_path($path);
    }
}

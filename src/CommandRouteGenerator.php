<?php

namespace Tightenco\Ziggy;

use Directory;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Tightenco\Ziggy\Output\File;
use Tightenco\Ziggy\Ziggy;

class CommandRouteGenerator extends Command
{
    protected $signature = 'ziggy:generate
                            {path? : Path to the generated JavaScript file. Default: `resources/js/ziggy.js`.}
                            {--t|declarations}
                            {--T|declarations-only}
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
        $group = $this->option('group');
        $url = $this->option('url') ? url($this->option('url')) : null;
        $ziggy = (new Ziggy($group, $url));

        $declarationsOnly = $this->option('declarations-only');
        $declarations = $declarationsOnly || $this->option('declarations');

        $path = $this->argument('path') ?? config('ziggy.output.path', 'resources/js/ziggy.js');
        $this->makeDirectory($path);

        if(!$declarationsOnly){
            $generatedRoutes = $this->generateJs($ziggy);
            $this->files->put(base_path($path), $generatedRoutes);
        }
        if($declarations){
            $generatedDeclarations = $this->generateDts($ziggy);
            $this->files->put(base_path($this->deriveDtsFile($path)), $generatedDeclarations);
        }

        $this->info('File generated!');
    }

    protected function makeDirectory($path)
    {
        if (! $this->files->isDirectory(dirname(base_path($path)))) {
            $this->files->makeDirectory(dirname(base_path($path)), 0755, true, true);
        }

        return $path;
    }

    private function deriveDtsFile($path) {
        if(preg_match('/.d.ts$/', $path)) {
            return $path;
        } else {
            $dir = dirname($path) ?? '.';
            $file = preg_replace("/\.[^\.]+$/", '', basename($path)) . '.d.ts';
            return join(DIRECTORY_SEPARATOR, [$dir, $file]);
        }
    }

    private function generateJs(Ziggy $ziggy)
    {
        $output = config('ziggy.output.file', File::class);
        return (string) new $output($ziggy);
    }

    private function generateDts(Ziggy $ziggy)
    {
        $declarations = $ziggy->typescriptDeclarationGenerator();
        return $declarations->generateDeclarations();
    }
}

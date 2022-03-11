<?php

namespace Tightenco\Ziggy;

use Illuminate\Console\Command;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\Filesystem;
use Tightenco\Ziggy\Output\File;
use Illuminate\Foundation\Bootstrap\LoadConfiguration;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider;
use Symfony\Component\Console\Input\StreamableInputInterface;

class CommandRouteGenerator extends Command
{
    protected $signature = 'ziggy:generate
                            {path=*./resources/js/ziggy.js : Path to the generated JavaScript file.}
                            {--watch=false}
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
        $watch = $this->option('watch');

        if ($watch !== 'false' && function_exists('inotify_init')) {
            $this->process();

            $stream = ($this->input instanceof StreamableInputInterface ? $this->input->getStream() : null) ?? \STDIN;
            if (!$stream) {
                $this->error('Not an interactive stream, avoiding infinite execution');
            }

            $fd = inotify_init();

            // Prepare list of files to watch
            $files = [
                config_path('ziggy.php'),
                base_path('routes')
            ];
            if (!empty($watch) && is_string($watch)) {
                $files = array_merge($files, array_map(function ($file) {
                    return base_path(trim($file));
                }, explode(',', $watch)));
            }
            $files = array_filter($files, 'file_exists');

            $this->info('Watching '.join(', ', $files));

            // We don't want to block the execution while waiting for Enter
            stream_set_blocking($stream, 0);
            $this->question('Press enter to exit');


            // We also don't want to block the execution while waiting for a file change
            stream_set_blocking($fd, 0);

            // Start watching
            $watchers = array_map(function ($file) use ($fd) {
                return inotify_add_watch($fd, $file, IN_MODIFY);
            }, $files);

            // We need to reboot the app
            // but it's only possible by modifying a protected property in laravel
            // so use some reflection magic
            $app = app();
            $booted = new \ReflectionProperty($app, 'booted');
            $providers = new \ReflectionProperty($app, 'serviceProviders');
            $backup = $providers->getValue($app);
            $routeOnly = array_filter($backup, function ($p) {
                return $p instanceof RouteServiceProvider;
            });

            do {
                if (inotify_read($fd)) {
                    try {
                        // Reload config
                        (new LoadConfiguration())->bootstrap($app);

                        // Reload routes with reflection magic
                        $booted->setValue($app, false);
                        $providers->setValue($app, $routeOnly);
                        $app->boot();
                        $providers->setValue($app, $backup);

                        // Clear ziggy cache and generate
                        Ziggy::clearRoutes();

                        if ($app->runningUnitTests() && class_exists(\Fiber::class)) {
                            \Fiber::suspend('before-generate');
                        }

                        $this->process();
                        if ($app->runningUnitTests() && class_exists(\Fiber::class)) {
                            \Fiber::suspend('generated');
                        }
                    } catch (\Throwable $e) {
                        $this->error($e->getMessage());
                        // Don't exit the loop but display the error
                    }
                }
                if ($app->runningUnitTests() && class_exists(\Fiber::class)) {
                    $continue = \Fiber::suspend('waiting');
                } else {
                    sleep(1);
                    $continue = ("" === fread($stream, 1));
                }
            } while ($continue);

            array_map(function ($watcher) use ($fd) {
                return inotify_rm_watch($fd, $watcher);
            }, $watchers);
            fclose($fd);
            $this->info('Thanks for watching! ;)');
            return;
        } else if ($watch !== 'false') {
            $this->error('The watch option requires the PHP extension ext-inotify');
        }
        $this->process();
    }

    private function get($value, $index) {
        if (is_array($value)) {
            return $value[$index] ?? null;
        }
        return $value;
    }

    private function process() {
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

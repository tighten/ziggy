
import { ChildProcess, exec } from 'child_process';
import { existsSync } from 'fs';
import { relative, resolve } from 'path';
import colors from 'picocolors';
import picomatch from 'picomatch';
import { Plugin, normalizePath } from 'vite';

export interface ZiggyPluginConfig {
    /**
     * Issue the command using laravel sail. Use 'auto' to automatically determine if sails is available and running.
     */
    sail?: boolean | 'auto',
    /**
     * Whether to output TS declarations. Use 'only' to emit only declartion and no routes file.
     */
    declarations?: boolean | 'only'
    /**
     * Destination path where ziggy output files should be placed.
     */
    destination?: string,
    log?: boolean,
    delay?: number,
}

export default function ZiggyPlugin(config: ZiggyPluginConfig): Plugin {
    const { log = true, delay = 0, destination, declarations } = config;
    let { sail } = config;
    const root = process.cwd();

    const commandArgs = `artisan ziggy:generate ${destination} ${declarations ? declarations === 'only' ? '-T' : '-t' : ''}`;
    let proc: ChildProcess | null = null;

    function command(): Promise<void> {
        if (proc) {
            proc.kill('SIGINT');
        }

        return new Promise<void>((done, reject) => {
            if (sail) {
                if (existsSync(resolve(root, 'vendor/bin/sail'))) {
                    proc = exec(`vendor/bin/sail ${commandArgs}`);
                    proc.on('close', (code, signal) => {
                        proc = null;
                    });
                } else {
                    sail = false;
                    return command();
                }
            } else {
                proc = exec(`php ${commandArgs}`);
            }
            proc.on('close', (code, signal) => {
                if (code === 0) {
                    proc = null;
                    done();
                }
            });
            proc.on('error', (error) => {
                reject(error)
            })
        })
    }

    return {
        name: 'ziggy-plugin',
        enforce: 'pre',

        // NOTE: Enable globbing so that Vite keeps track of the template files.
        config: () => ({ server: { watch: { disableGlobbing: false } } }),
        configureServer(server) {
            const files = normalizePath(resolve(root, 'routes/**'));

            command();

            const shouldReload = picomatch(files);
            const checkReload = (path) => {
                if (shouldReload(path)) {
                    setTimeout(command, delay);
                    if (log) {
                        server.config.logger.info(`${colors.green(`${relative(root, path)} changed, regenarating ziggy file.`)}`, { clear: true, timestamp: true });
                    }
                }
            };

            // Ensure Vite keeps track of the files and triggers generation as needed.
            server.watcher.add(files);

            // Perform a generation if any of the watched files changes.
            server.watcher.on('add', checkReload);
            server.watcher.on('change', checkReload);
        },
        buildStart() {
            command();
        }
    };
}

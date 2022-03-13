const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Those are both webpack dependencies
const validate = require('schema-utils').validate || require('schema-utils'); // In a previous version it was exported as default
const Watchpack = require('watchpack');

module.exports = class ZiggyWebpackPlugin {
    /**
     *
     * @param {string|function} command
     * @param {{path: string, filesToWatchCallback: function}} [options]
     */
    constructor(command, options = {}) {
        validate({
            anyOf: [
                { type: 'string' },
                { instanceof: 'Function' },
            ],
            description: 'The command or async callback to run the compilation',
        }, command, {
            name: 'Ziggy Webpack Plugin',
            baseDataPath: 'command',
        });
        validate({
            type: 'object',
            properties: {
                path: {
                    description: 'This is the base path, where laravel is installed',
                    type: 'string',
                },
                filesToWatchCallback: {
                    description: 'If you need to change the list of watched files',
                    instanceof: 'Function',
                },
            },
            additionalProperties: false,
        }, options, {
            name: 'Ziggy Webpack Plugin',
            baseDataPath: 'options',
        });
        this.command = command;
        this.path = options.path || './';
        this.filesToWatchCallback = (options.filesToWatchCallback || (files => files));
    }

    apply(compiler) {
        // Create a separate watcher
        compiler.hooks.watchRun.tapPromise('ZiggyWebpackPlugin', () => {
            if (!this._init) {
                this._init = true;
                this.watcher = new Watchpack({ aggregateTimeout: 50, ...compiler.watching?.watchOptions });

                let toWatch = [path.resolve(this.path, './routes/'), path.resolve(this.path, './config/ziggy.php')];
                toWatch = this.filesToWatchCallback(toWatch) || toWatch;

                // Run the generation command which in turn will trigger a rebuild if needed
                this.watcher.on('aggregated', () => this._runCommand());

                Promise.all(toWatch.map((file) => fs.promises.lstat(file).catch(() => null))).then((stats) => {
                    const directories = [];
                    const files = [];
                    const missing = [];
                    stats.forEach((stat, index) => (stat ? (stat.isDirectory() ? directories : files) : missing).push(toWatch[index]));

                    this.watcher.watch({ files, directories, missing });
                });
                // Run the generation command before webpack compilation
                return this._runCommand();
            } else {
                return Promise.resolve();
            }
        });
        compiler.hooks.watchClose.tap('ZiggyWebpackPlugin', () => this.watcher.close());

        // Run the generation command before webpack compilation when we're not watching
        compiler.hooks.run.tapPromise('ZiggyWebpackPlugin', () => this._runCommand());
    }

    _runCommand() {
        return typeof this.command === 'function' ? Promise.resolve(this.command()) :
            new Promise((resolve, reject) => {
                const process = exec(this.command);
                process.stdout.on('data', (data) => {
                    console.log(data);
                });
                process.stderr.on('data', (data) => {
                    console.error(data);
                });
                process.on('exit', code => {
                    if (code !== 0) {
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
    }
};

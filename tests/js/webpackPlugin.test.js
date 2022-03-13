import webpack from 'webpack';

import ZiggyWebpackPlugin from '../../webpackPlugin';

const fs = require('fs');
const path = require('path');

let compiler;
const make = (command, options) => {
    compiler = webpack({
        mode: 'none',
        output: {
            path: path.resolve(__dirname, '../dist'),
        },
        watchOptions: {
            aggregateTimeout: 0,
        },
        entry: path.resolve(__dirname, '../fixtures/entry.js'),
        plugins: [new ZiggyWebpackPlugin(command, { path: 'vendor/orchestra/testbench-core/laravel', ...options })],
    });
    return compiler;
};

const consoleError = console.error;
const consoleLog = console.log;
const mockConsole = () => {
    console.log = jest.fn();
    console.error = jest.fn();
};

const restoreConsole = () => {
    console.log = consoleLog;
    console.error = consoleError;
};

const mockAsync = () => jest.fn(() => new Promise(resolve => setTimeout(resolve, 10)));

beforeEach(() => {
    mockConsole();
});

afterEach((done) => {
    if (compiler) {
        compiler.close((closeErr) => {
            console.log('closed')
            done(closeErr);
        });
    } else {
        done();
    }

    restoreConsole();
});

afterAll(() => {
    // Cleanup files
    try {
        fs.rmdirSync(path.resolve(__dirname, '../dist'), { recursive: true });
    } catch (e) {
        console.error(e);
    }
    try {
        fs.rmSync(path.resolve(__dirname, '../fixtures/watch.txt'));
    } catch (e) {
        console.error(e);
    }
})

describe('webpack plugin', () => {
    test('compiles before run', () => new Promise((resolve, reject) => {
        const fn = mockAsync();
        make((...a) => fn.apply(null, a)) // fn instanceof Function is false, so wrap it
            .run((err, stats) => {
                if (err) {
                    return reject(err);
                } else if (stats.hasErrors()) {
                    return reject(stats.toString());
                }
                expect(fn).toHaveBeenCalledTimes(1);
                resolve();
            });
    }));

    test('run command redirects output', () => new Promise((resolve, reject) => {
        make('echo "ok" && >&2 echo "error"')
            .run((err, stats) => {
                if (err) {
                    return reject(err);
                } else if (stats.hasErrors()) {
                    return reject(stats.toString());
                }
                expect(console.log).toHaveBeenCalledWith('ok\n');
                expect(console.error).toHaveBeenCalledWith('error\n');
                resolve();
            });
    }));

    test('watches for change', () => {
        restoreConsole();
        const prev = fs.readFileSync(path.resolve(__dirname, '../fixtures/ziggy.js'));
        return new Promise((resolve, reject) => {
            const watch = path.resolve(__dirname, '../fixtures/watch.txt');
            fs.writeFileSync(watch, 'test1');
            const filesCb = jest.fn((files) => {
                expect(files).toContain(path.resolve(__dirname, '../../vendor/orchestra/testbench-core/laravel/config/ziggy.php'));
                files.push(watch);
                return files;
            });
            let run = 1;
            const fn = mockAsync();
            make((...a) => fn.apply(null, a), { filesToWatchCallback: (...a) => filesCb.apply(null, a) });
            const emitted = jest.fn();
            compiler.hooks.emit.tap('Test', emitted);
            compiler = compiler.watch({}, (err, stats) => {
                if (err) {
                    return reject(err);
                } else if (stats.hasErrors()) {
                    return reject(stats.toString());
                }

                switch (run) {
                    case 1:
                        expect(emitted).toHaveBeenCalledTimes(1); // It should have been called once on initial compilation
                        expect(fn).toHaveBeenCalledTimes(1);
                        fs.promises.writeFile(watch, 'test2').catch(reject);
                        setTimeout(() => {
                            expect(fn).toHaveBeenCalledTimes(2);
                            // It shouldn't have triggered a rebuild because watched file is not actually required by our entry.js
                            expect(emitted).toHaveBeenCalledTimes(1);
                            fs.promises.appendFile(path.resolve(__dirname, '../fixtures/ziggy.js'), 'console.log("test");').catch(reject);
                        }, 100);
                        break;
                    default:
                        expect(emitted).toHaveBeenCalledTimes(run);
                        resolve();
                        break;
                }
                run++;
            });
        }).then(() => fs.writeFileSync(path.resolve(__dirname, '../fixtures/ziggy.js'), prev));
    });
});

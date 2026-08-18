import { defineConfig } from 'tsdown';
import { writeFileSync } from 'node:fs';

export default defineConfig([
    {
        entry: './src/js/index.js',
        dts: false,
        deps: {
            onlyBundle: ['qs-esm'],
            alwaysBundle: ['qs-esm'],
        },
        platform: 'browser',
        minify: true,
        hooks: {
            'build:done'() {
                writeFileSync('dist/index.esm.js', "export * from './index.js';\n");
            },
        },
    },
    {
        entry: { route: './src/js/browser.js' },
        dts: false,
        format: 'umd',
        deps: {
            onlyBundle: ['qs-esm'],
            alwaysBundle: ['qs-esm'],
        },
        platform: 'browser',
        minify: true,
        globalName: 'route',
    },
]);

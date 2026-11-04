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
        target: 'es2015',
        minify: true,
        // Leave `process.env.NODE_ENV` for the app's bundler to replace
        define: { 'process.env.NODE_ENV': 'process.env.NODE_ENV' },
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
        target: 'es2015',
        minify: true,
        globalName: 'route',
    },
]);

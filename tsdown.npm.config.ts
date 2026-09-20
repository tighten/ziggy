import { defineConfig } from 'tsdown';
import { writeFileSync } from 'node:fs';

export default defineConfig({
    entry: './src/js/index.js',
    dts: false,
    platform: 'browser',
    target: 'es2015',
    minify: true,
    hooks: {
        'build:done'() {
            writeFileSync('dist/index.esm.js', "export * from './index.js';\n");
        },
    },
});

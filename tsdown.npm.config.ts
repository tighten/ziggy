import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: './src/js/index.js',
    dts: false,
    platform: 'browser',
    minify: true,
});

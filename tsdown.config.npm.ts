import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: ['./src/js/index.js'],
    format: ['esm'],
    outDir: 'dist',
    sourcemap: false,
    dts: false,
    clean: true,
    platform: 'neutral',
    outExtensions: () => ({ js: '.js' }),
})

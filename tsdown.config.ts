import { defineConfig } from 'tsdown'

export default defineConfig([
    {
        // ESM bundle — deps bundled (npm package entry + CDN use)
        entry: ['./src/js/index.js'],
        format: ['esm'],
        outDir: 'dist',
        sourcemap: false,
        dts: false,
        clean: true,
        platform: 'neutral',
        outExtensions: () => ({ js: '.js' }),
        deps: { alwaysBundle: ['qs-esm'], onlyBundle: false },
        inputOptions: {
            resolve: {
                mainFields: ['module', 'main'],
                conditionNames: ['import', 'default'],
            },
        },
    },
    {
        // UMD browser bundle — deps bundled (for legacy <script> tags, global: route)
        entry: { route: './src/js/browser.js' },
        format: ['umd'],
        outDir: 'dist',
        sourcemap: false,
        dts: false,
        platform: 'browser',
        globalName: 'route',
        outExtensions: () => ({ js: '.js' }),
        deps: { alwaysBundle: ['qs-esm'], onlyBundle: false },
    },
])

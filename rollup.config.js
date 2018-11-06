import babel from 'rollup-plugin-babel';
import {uglify} from "rollup-plugin-uglify";

export default [
    {
        input: './src/js/route.js',
        output: {
            file: './dist/js/route.js',
            name: 'route',
            format: 'umd',
            exports: 'default',
            strict: true,
            sourcemap: false,
        },
        plugins: [
            babel({
                exclude: ['node_modules/**']
            }),
        ]
    },
    {
        input: './src/js/route.js',
        output: {
            file: './dist/js/route.min.js',
            name: 'route',
            format: 'umd',
            exports: 'default',
            strict: true,
            sourcemap: false,
        },
        plugins: [
            babel({
                exclude: ['node_modules/**']
            }),
            uglify({
                sourcemap: false
            }),
        ]
    },

];
import buble from 'rollup-plugin-buble';
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
            buble({
                exclude: ['node_modules/**'],
                objectAssign: 'Object.assign',
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
            buble({
                exclude: ['node_modules/**'],
                objectAssign: 'Object.assign',
            }),
            uglify({
                sourcemap: false
            }),
        ]
    },

];
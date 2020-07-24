module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: 'defaults, not IE 11',
                modules: false,
                forceAllTransforms: true,
            },
        ],
    ],
    env: {
        test: {
            presets: ['power-assert'],
            plugins: ['@babel/plugin-transform-modules-commonjs'],
        },
    },
};

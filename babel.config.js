module.exports = {
    presets: [
        ['@babel/preset-env', { targets: 'defaults, not IE 11' }],
    ],
    plugins: ['@babel/plugin-proposal-optional-chaining'],
    env: {
        test: {
            presets: ['power-assert'],
            plugins: ['@babel/plugin-transform-modules-commonjs'],
        },
    },
};

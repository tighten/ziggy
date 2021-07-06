module.exports = {
    plugins: ['@babel/plugin-proposal-optional-chaining'],
    env: {
        test: {
            presets: ['power-assert'],
            plugins: ['@babel/plugin-transform-modules-commonjs'],
        },
    },
};

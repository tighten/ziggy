module.exports = {
    env: {
        test: {
            presets: ['power-assert'],
            plugins: ['@babel/plugin-transform-modules-commonjs'],
        },
    },
};

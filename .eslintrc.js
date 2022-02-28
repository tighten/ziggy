module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    globals: {
        globalThis: false, // means it is not writeable
    },
    extends: [
        'eslint:recommended',
    ],
    plugins: [
        'import',
    ],
    parser: '@babel/eslint-parser',
    ignorePatterns: [
        'dist/*.js',
        'tests/fixtures/*.js',
    ],
    overrides: [
        {
            files: [
                '**/tests/js/**/*.test.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
        },
    ],
    rules: {
        'space-before-function-paren': ['error', {anonymous: 'always', named: 'never'}],
        'no-console': 'warn',
        'no-debugger': 'warn',
        semi: ['error', 'always'],
        quotes: ['error', 'single', {avoidEscape: true}],
        'no-empty': ['error'],
        'no-unreachable': ['error'],
        'no-undefined': 'off',
        curly: ['error'],
        'quote-props': ['error', 'as-needed'],
        'comma-dangle': ['error', 'always-multiline'],
        'new-cap': 'off',
        indent: ['error', 4],
        'space-infix-ops': 'error',
    },
};

module.exports = {
    env: {
        commonjs: true,
        es6: true,
        mocha: true,
    },
    extends: 'airbnb-base',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        indent: ['error', 4],
        'no-console': ['error'],
        'no-debugger': 'warn',
        'arrow-parens': ['error', 'as-needed'],
        'no-throw-literal': 'off',
        'prefer-promise-reject-errors': 'off',
        'no-underscore-dangle': 'off',
        'no-param-reassign': ['error', { props: false }],
    },
    settings: {
        'import/resolver': {
            node: {
                moduleDirectory: [
                    'node_modules',
                    '.',
                ],
            },
        },
    },
};

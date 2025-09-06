module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        // Code style
        'indent': ['error', 2],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'no-trailing-spaces': 'error',
        'eol-last': 'error',

        // Best practices
        'no-console': 'off', // Allow console for robot control library
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'error',

        // ES6+
        'arrow-spacing': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': 'error',

        // Potential problems
        'no-duplicate-imports': 'error',
        'no-unreachable': 'error',
        'no-unused-expressions': 'error',
        'consistent-return': 'error',

        // Async/await
        'require-await': 'error',
        'no-async-promise-executor': 'error',
        'no-await-in-loop': 'warn',

        // Objects and arrays
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],

        // Functions
        'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
        'no-param-reassign': 'warn',

        // Comments
        'spaced-comment': ['error', 'always'],

        // Spacing
        'space-before-blocks': 'error',
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': 'error',
        'keyword-spacing': 'error'
    },
    globals: {
        // Browser APIs that might not be recognized
        'navigator': 'readonly',
        'WebSocket': 'readonly',
        'SerialPort': 'readonly',
        'TextEncoder': 'readonly',
        'TextDecoder': 'readonly',
        'TextEncoderStream': 'readonly',
        'TextDecoderStream': 'readonly'
    },
    overrides: [
        {
            files: ['examples/**/*.html'],
            rules: {
                // Relax rules for HTML examples
                'no-undef': 'off',
                'no-unused-vars': 'off'
            }
        },
        {
            files: ['rollup.config.js'],
            env: {
                node: true
            }
        }
    ]
};
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    browsers: [
                        'last 2 versions',
                        '> 1%',
                        'not dead'
                    ],
                    node: '14'
                },
                modules: false, // Let bundler handle modules
                useBuiltIns: 'usage',
                corejs: 3
            }
        ]
    ],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator'
    ],
    env: {
        test: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            node: 'current'
                        },
                        modules: 'commonjs' // Use CommonJS for Jest
                    }
                ]
            ]
        },
        development: {
            plugins: [
                // Add development-specific plugins if needed
            ]
        },
        production: {
            plugins: [
                // Add production optimizations
                ['transform-remove-console', { exclude: ['error', 'warn'] }]
            ]
        }
    }
};
module.exports = {
    // Test environment
    testEnvironment: 'jsdom',

    // Module file extensions
    moduleFileExtensions: ['js', 'json'],

    // Transform files
    transform: {
        '^.+\\.js$': 'babel-jest'
    },

    // Module name mapping
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },

    // Test match patterns
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/src/**/*.test.js'
    ],

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/examples/'
    ],

    // Coverage configuration
    collectCoverage: false,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/index.js'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Global variables
    globals: {
        'navigator': {
            'serial': undefined
        },
        'WebSocket': undefined
    },

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true,

    // Verbose output
    verbose: true,

    // Test timeout
    testTimeout: 10000,

    // Module directories
    moduleDirectories: ['node_modules', 'src'],

    // Babel configuration for Jest
    transform: {
        '^.+\\.js$': ['babel-jest', {
            presets: [
                ['@babel/preset-env', {
                    targets: {
                        node: 'current'
                    }
                }]
            ]
        }]
    }
};
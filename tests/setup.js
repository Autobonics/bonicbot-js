/**
 * Jest test setup file
 * Configures global test environment and mocks
 */

// Mock Web Serial API
global.navigator = {
    serial: {
        requestPort: jest.fn().mockResolvedValue({
            open: jest.fn().mockResolvedValue(),
            close: jest.fn().mockResolvedValue(),
            readable: {
                pipeTo: jest.fn().mockResolvedValue()
            },
            writable: {
                getWriter: jest.fn().mockReturnValue({
                    write: jest.fn().mockResolvedValue(),
                    close: jest.fn().mockResolvedValue()
                })
            }
        })
    }
};

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation((url) => {
    const ws = {
        url,
        readyState: 1, // OPEN
        send: jest.fn(),
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,

        // Helper methods for testing
        _trigger: function (event, data) {
            if (this[`on${event}`]) {
                this[`on${event}`](data);
            }
        },

        _mockOpen: function () {
            this.readyState = 1;
            this._trigger('open');
        },

        _mockMessage: function (data) {
            this._trigger('message', { data: JSON.stringify(data) });
        },

        _mockClose: function () {
            this.readyState = 3;
            this._trigger('close');
        },

        _mockError: function (error) {
            this._trigger('error', error);
        }
    };

    // Auto-trigger open after construction
    setTimeout(() => ws._mockOpen(), 0);

    return ws;
});

// Mock TextEncoder/TextDecoder streams
global.TextEncoderStream = jest.fn().mockImplementation(() => ({
    readable: {
        pipeTo: jest.fn().mockResolvedValue()
    },
    writable: {
        getWriter: jest.fn().mockReturnValue({
            write: jest.fn().mockResolvedValue(),
            close: jest.fn().mockResolvedValue()
        })
    }
}));

global.TextDecoderStream = jest.fn().mockImplementation(() => ({
    readable: {
        getReader: jest.fn().mockReturnValue({
            read: jest.fn().mockResolvedValue({ value: 'test data', done: false }),
            cancel: jest.fn().mockResolvedValue()
        })
    },
    writable: {}
}));

// Console suppress for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Optionally suppress console output during tests
    // Uncomment these lines to reduce noise in test output
    // console.log = jest.fn();
    // console.error = jest.fn();
    // console.warn = jest.fn();
});

afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(10000);

// Add custom matchers if needed
expect.extend({
    toBeValidServoAngle(received, servoId) {
        // Custom matcher for servo angle validation
        const pass = received >= -180 && received <= 180;
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid servo angle`,
                pass: true
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid servo angle between -180 and 180`,
                pass: false
            };
        }
    }
});

// Utility functions for tests
global.createMockRobot = () => {
    return {
        connect: jest.fn().mockResolvedValue(true),
        close: jest.fn().mockResolvedValue(),
        controlServo: jest.fn().mockResolvedValue(true),
        controlHead: jest.fn().mockResolvedValue(true),
        moveForward: jest.fn().mockResolvedValue(true),
        speak: jest.fn().mockResolvedValue(true),
        isConnected: jest.fn().mockReturnValue(true)
    };
};

global.mockWebSocketResponse = (ws, response) => {
    setTimeout(() => {
        ws._mockMessage(response);
    }, 10);
};

// Mock performance.now for consistent timing in tests
global.performance = {
    now: jest.fn(() => Date.now())
};

console.log('Test environment setup complete');
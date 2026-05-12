/**
 * Jest test setup file
 * Configures global test environment and mocks for BonicBot v3.0
 */

// Mock Web Bluetooth API
global.navigator = {
    bluetooth: {
        requestDevice: jest.fn().mockResolvedValue({
            name: 'TestBot',
            gatt: {
                connect: jest.fn().mockResolvedValue({
                    getPrimaryService: jest.fn().mockResolvedValue({
                        getCharacteristic: jest.fn().mockResolvedValue({
                            startNotifications: jest.fn().mockResolvedValue(),
                            addEventListener: jest.fn(),
                            writeValue: jest.fn().mockResolvedValue()
                        })
                    })
                }),
                connected: true,
                disconnect: jest.fn()
            },
            addEventListener: jest.fn()
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
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,

        _trigger: function (event, data) {
            if (this[`on${event}`]) this[`on${event}`](data);
        },

        _mockOpen: function () {
            this.readyState = 1;
            this._trigger('open');
        }
    };

    setTimeout(() => ws._mockOpen(), 0);
    return ws;
});

// Mock TextEncoder
global.TextEncoder = class {
    encode(text) { return Buffer.from(text); }
};

// Suppress console during tests
console.log = jest.fn();
console.error = jest.fn();

jest.setTimeout(10000);
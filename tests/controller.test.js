/**
 * Test suite for BonicBot controllers
 */

import {
    createWebSocketController,
    createSerialController,
    ServoID,
    HeadModes,
    ServoConstants
} from '../src/index.js';

describe('BonicBot Controllers', () => {

    describe('WebSocket Controller', () => {
        let robot;

        beforeEach(() => {
            robot = createWebSocketController('localhost', 8080);
        });

        afterEach(async () => {
            if (robot && robot.isConnected()) {
                await robot.close();
            }
        });

        test('should create WebSocket controller with default values', () => {
            expect(robot).toBeDefined();
            expect(robot.host).toBe('localhost');
            expect(robot.port).toBe(8080);
            expect(robot.isConnected()).toBe(false);
        });

        test('should create WebSocket controller with custom values', () => {
            const customRobot = createWebSocketController('192.168.1.100', 9090);
            expect(customRobot.host).toBe('192.168.1.100');
            expect(customRobot.port).toBe(9090);
        });

        test('should connect successfully', async () => {
            const result = await robot.connect();
            expect(result).toBe(true);
            expect(robot.isConnected()).toBe(true);
        });

        test('should handle connection failure gracefully', async () => {
            // Mock WebSocket to fail
            const originalWebSocket = global.WebSocket;
            global.WebSocket = jest.fn().mockImplementation(() => {
                throw new Error('Connection failed');
            });

            const result = await robot.connect();
            expect(result).toBe(false);
            expect(robot.isConnected()).toBe(false);

            // Restore WebSocket
            global.WebSocket = originalWebSocket;
        });

        test('should control servo with valid parameters', async () => {
            await robot.connect();
            const result = await robot.controlServo(ServoID.HEAD_PAN, 45, 150);
            expect(result).toBe(true);
        });

        test('should reject invalid servo angles', async () => {
            await robot.connect();
            const result = await robot.controlServo(ServoID.HEAD_PAN, 200); // Out of range
            expect(result).toBe(false);
        });

        test('should control head with multiple parameters', async () => {
            await robot.connect();
            const result = await robot.controlHead(30, 15, HeadModes.HAPPY, 120);
            expect(result).toBe(true);
        });

        test('should control right hand servos', async () => {
            await robot.connect();
            const result = await robot.controlRightHand({
                gripper: 45,
                wrist: 30,
                elbow: -30,
                shoulderPitch: 90
            });
            expect(result).toBe(true);
        });

        test('should control left hand servos', async () => {
            await robot.connect();
            const result = await robot.controlLeftHand({
                gripper: -45,
                wrist: -30,
                shoulderPitch: 60
            });
            expect(result).toBe(true);
        });

        test('should perform movement commands', async () => {
            await robot.connect();

            expect(await robot.moveForward(100, 1)).toBe(true);
            expect(await robot.moveBackward(80, 1)).toBe(true);
            expect(await robot.turnLeft(60, 0.5)).toBe(true);
            expect(await robot.turnRight(60, 0.5)).toBe(true);
            expect(await robot.stopMovement()).toBe(true);
        });

        test('should handle speaking functionality', async () => {
            await robot.connect();
            const result = await robot.speak('Hello World');
            expect(result).toBe(true);
        });

        test('should reject empty speech text', async () => {
            await robot.connect();
            const result = await robot.speak('');
            expect(result).toBe(false);
        });

        test('should perform high-level actions', async () => {
            await robot.connect();

            expect(await robot.waveHello(true)).toBe(true);
            expect(await robot.waveHello(false)).toBe(true);
            expect(await robot.lookAround()).toBe(true);
            expect(await robot.resetToHomePosition()).toBe(true);
        });

        test('should register sensor listeners', async () => {
            await robot.connect();

            const callback = jest.fn();
            const result = robot.registerSensorListener('battery', 'test-listener', callback);
            expect(result).toBe(true);
        });

        test('should start sensor streams', async () => {
            await robot.connect();

            const result = await robot.startSensorStream('battery', 1000);
            expect(result).toBe(true);
        });

        test('should close connection properly', async () => {
            await robot.connect();
            expect(robot.isConnected()).toBe(true);

            await robot.close();
            expect(robot.isConnected()).toBe(false);
        });
    });

    describe('Serial Controller', () => {
        let robot;

        beforeEach(() => {
            robot = createSerialController({ baudrate: 115200 });
        });

        afterEach(async () => {
            if (robot && robot.isConnected()) {
                await robot.close();
            }
        });

        test('should create Serial controller with default baudrate', () => {
            const defaultRobot = createSerialController();
            expect(defaultRobot).toBeDefined();
            expect(defaultRobot.baudrate).toBe(115200);
        });

        test('should create Serial controller with custom baudrate', () => {
            expect(robot.baudrate).toBe(115200);
        });

        test('should handle missing Web Serial API', async () => {
            // Mock missing serial API
            const originalSerial = global.navigator.serial;
            delete global.navigator.serial;

            await expect(robot.connect()).rejects.toThrow('Web Serial API is not supported');

            // Restore serial API
            global.navigator.serial = originalSerial;
        });

        test('should connect via Serial API', async () => {
            const result = await robot.connect();
            expect(result).toBe(true);
            expect(robot.isConnected()).toBe(true);
        });

        test('should control servos via serial', async () => {
            await robot.connect();
            const result = await robot.controlServo(ServoID.RIGHT_GRIPPER, 45);
            expect(result).toBe(true);
        });

        test('should handle movement via serial', async () => {
            await robot.connect();
            expect(await robot.moveForward(100)).toBe(true);
            expect(await robot.stopMovement()).toBe(true);
        });

        test('should handle unsupported features gracefully', async () => {
            await robot.connect();

            // Serial mode doesn't support these features
            expect(await robot.speak('test')).toBe(false);
            expect(await robot.getSequences()).toEqual([]);
        });
    });

    describe('Servo Validation', () => {
        test('should validate servo angles correctly', () => {
            const { ServoCommand } = require('../src/types.js');

            // Valid angles
            const validCmd = new ServoCommand(ServoID.HEAD_PAN, 45);
            expect(validCmd.validateAngle()).toBe(true);

            // Invalid angles
            const invalidCmd = new ServoCommand(ServoID.HEAD_PAN, 200);
            expect(invalidCmd.validateAngle()).toBe(false);
        });

        test('should have correct servo limits', () => {
            expect(ServoConstants.HEAD_PAN_MIN).toBe(-90);
            expect(ServoConstants.HEAD_PAN_MAX).toBe(90);
            expect(ServoConstants.HEAD_TILT_MIN).toBe(-38);
            expect(ServoConstants.HEAD_TILT_MAX).toBe(45);
        });
    });

    describe('Error Handling', () => {
        test('should handle WebSocket connection errors', async () => {
            const robot = createWebSocketController('invalid-host', 9999);

            // Mock WebSocket to simulate connection error
            global.WebSocket = jest.fn().mockImplementation(() => {
                const ws = { close: jest.fn() };
                setTimeout(() => {
                    if (ws.onerror) ws.onerror(new Error('Connection failed'));
                }, 0);
                return ws;
            });

            const result = await robot.connect();
            expect(result).toBe(false);
        });

        test('should handle commands when not connected', async () => {
            const robot = createWebSocketController();

            // Try commands without connecting
            expect(await robot.controlServo(ServoID.HEAD_PAN, 0)).toBe(false);
            expect(await robot.speak('test')).toBe(false);
            expect(await robot.moveForward(100)).toBe(false);
        });
    });

    describe('Utility Functions', () => {
        test('should detect browser capabilities', () => {
            const { isSerialSupported, isWebSocketSupported } = require('../src/index.js');

            expect(isWebSocketSupported()).toBe(true); // Mocked in setup
            expect(isSerialSupported()).toBe(true); // Mocked in setup
        });

        test('should return correct version', () => {
            const { getVersion } = require('../src/index.js');
            expect(getVersion()).toBe('2.0.1');
        });

        test('should return supported communication types', () => {
            const { getSupportedCommunicationTypes } = require('../src/index.js');
            const types = getSupportedCommunicationTypes();

            expect(types).toHaveProperty('serial');
            expect(types).toHaveProperty('websocket');
            expect(typeof types.serial).toBe('boolean');
            expect(typeof types.websocket).toBe('boolean');
        });
    });
});
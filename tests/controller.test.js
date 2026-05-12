/**
 * Test suite for Unified BonicBot Controller v3.0
 */

import { BonicBotController, ServoID } from '../src/index.js';

describe('BonicBot Unified Controller', () => {
    let bot;

    beforeEach(() => {
        bot = new BonicBotController('TestBot', '1.2.3.4');
        // Mock BLE transport
        bot.ble = {
            connect: jest.fn().mockResolvedValue(true),
            send: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(true),
            connected: true
        };
        // Mock WebSocket transport
        bot.bridge = {
            connect: jest.fn().mockResolvedValue(true),
            send: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(true),
            connected: true
        };
    });

    test('should initialize with correct parameters', () => {
        expect(bot.deviceName).toBe('TestBot');
        expect(bot.bridge).toBeDefined();
        expect(bot.isConnected).toBe(true);
    });

    test('should control servo via BLE', async () => {
        const result = await bot.controlServo('headPan', 45);
        expect(result).toBe(true);
        expect(bot.ble.send).toHaveBeenCalled();
        
        // Check binary packet structure (0xAA 0x55 type=0x03)
        const packet = bot.ble.send.mock.calls[0][0];
        expect(packet[0]).toBe(0xAA);
        expect(packet[1]).toBe(0x55);
        expect(packet[2]).toBe(0x03); // CMD_SERVO_SINGLE
    });

    test('should move base via BLE', async () => {
        const result = await bot.moveForward(100);
        expect(result).toBe(true);
        const packet = bot.ble.send.mock.calls[0][0];
        expect(packet[2]).toBe(0x02); // CMD_MOTOR_MOVE
    });

    test('should delegate speech to App Bridge', async () => {
        await bot.speak("Hello");
        expect(bot.bridge.send).toHaveBeenCalledWith(expect.objectContaining({
            dataType: 'speak',
            payload: { text: "Hello" }
        }));
    });

    test('should throw error if bridge feature used without host', async () => {
        const botNoHost = new BonicBotController('TestBot');
        await expect(botNoHost.speak("Hello")).rejects.toThrow();
    });

    test('should update internal state on BLE data', () => {
        // Mock a battery packet: 0xAA 0x55 0x01(type) 0x0A 0x00(len=10) ...
        const payload = new Uint8Array(10);
        const dv = new DataView(payload.buffer);
        dv.setFloat32(0, 12.5, true); // voltage
        dv.setFloat32(4, 1.2, true);  // current
        dv.setUint16(8, 85, true);    // soc
        
        const packet = new Uint8Array(15);
        packet.set([0xAA, 0x55, 0x01, 0x0A, 0x00]);
        packet.set(payload, 5);

        bot._onBleData(packet);
        expect(bot.latestSensorData.battery.soc).toBe(85);
        expect(bot.latestSensorData.battery.voltage).toBe(12.5);
    });
});
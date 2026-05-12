/**
 * Platform-agnostic BLE Transport
 * Uses Web Bluetooth in Browser and Noble in Node.js
 */

import { BLE_SERVICE_FRAGMENTS } from '../constants.js';

class BleTransport {
    constructor() {
        this.connected = false;
        this.onData = null;
        this.device = null;
        this.server = null;
        this.writeChar = null;
        this._noblePeripheral = null; // stored for Noble disconnect
    }

    async connect(deviceName) {
        if (typeof navigator !== 'undefined' && navigator.bluetooth) {
            return await this._connectWebBluetooth(deviceName);
        } else {
            return await this._connectNoble(deviceName);
        }
    }

    async _connectWebBluetooth(deviceName) {
        try {
            // acceptAllDevices so the user can pick the robot by name;
            // we discover services ourselves after connecting.
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ name: deviceName }],
                optionalServices: ['generic_access', 'generic_attribute'],
                acceptAllServices: true
            });

            this.server = await this.device.gatt.connect();
            const services = await this.server.getPrimaryServices();

            for (const service of services) {
                const uuid = service.uuid.toLowerCase();
                const isControl = uuid.includes(BLE_SERVICE_FRAGMENTS.CONTROL);
                const isFeedback = uuid.includes(BLE_SERVICE_FRAGMENTS.FEEDBACK) ||
                                   uuid.includes(BLE_SERVICE_FRAGMENTS.SERVO_FEEDBACK);

                if (!isControl && !isFeedback) continue;
                const chars = await service.getCharacteristics();

                for (const c of chars) {
                    if (isControl && (c.properties.writeWithoutResponse || c.properties.write) && !this.writeChar) {
                        this.writeChar = c;
                    }
                    if (c.properties.notify) {
                        await c.startNotifications();
                        c.addEventListener('characteristicvaluechanged', (event) => {
                            if (this.onData) this.onData(new Uint8Array(event.target.value.buffer));
                        });
                    }
                }
            }

            if (!this.writeChar) {
                console.error('Control write characteristic not found');
                return false;
            }

            this.connected = true;
            this.device.addEventListener('gattserverdisconnected', () => {
                this.connected = false;
            });
            return true;
        } catch (error) {
            console.error('Web Bluetooth Connection Failed:', error);
            return false;
        }
    }

    async _connectNoble(deviceName) {
        try {
            const noble = (await import('@abandonware/noble')).default;

            return new Promise((resolve) => {
                noble.on('stateChange', (state) => {
                    if (state === 'poweredOn') noble.startScanning([], false);
                });

                const timeout = setTimeout(() => {
                    noble.stopScanning();
                    resolve(false);
                }, 10000);

                noble.on('discover', async (peripheral) => {
                    const name = peripheral.advertisement.localName || '';
                    if (!name.toLowerCase().includes(deviceName.toLowerCase())) return;

                    clearTimeout(timeout);
                    noble.stopScanning();

                    try {
                        await peripheral.connectAsync();
                        const { services } = await peripheral.discoverAllServicesAndCharacteristicsAsync();

                        for (const service of services) {
                            const uuid = service.uuid.toLowerCase();
                            const isControl = uuid.includes(BLE_SERVICE_FRAGMENTS.CONTROL.toLowerCase());
                            const isFeedback = uuid.includes(BLE_SERVICE_FRAGMENTS.FEEDBACK.toLowerCase()) ||
                                               uuid.includes(BLE_SERVICE_FRAGMENTS.SERVO_FEEDBACK.toLowerCase());

                            if (!isControl && !isFeedback) continue;

                            for (const c of service.characteristics) {
                                if (isControl && (c.properties.includes('writeWithoutResponse') || c.properties.includes('write')) && !this.writeChar) {
                                    this.writeChar = c;
                                }
                                if (c.properties.includes('notify')) {
                                    c.on('data', (data) => {
                                        if (this.onData) this.onData(new Uint8Array(data));
                                    });
                                    await c.subscribeAsync();
                                }
                            }
                        }

                        if (!this.writeChar) { resolve(false); return; }

                        this._noblePeripheral = peripheral;
                        this.connected = true;
                        peripheral.on('disconnect', () => { this.connected = false; this._noblePeripheral = null; });
                        resolve(true);
                    } catch (e) {
                        console.error('Noble setup failed:', e);
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('Noble Connection Failed:', error);
            return false;
        }
    }

    async send(data) {
        if (!this.connected || !this.writeChar) return false;
        try {
            if (this.writeChar.writeValueWithoutResponse) {
                await this.writeChar.writeValueWithoutResponse(data);
            } else if (this.writeChar.writeValue) {
                await this.writeChar.writeValue(data);
            } else {
                await this.writeChar.writeAsync(Buffer.from(data), true);
            }
            return true;
        } catch (error) {
            console.error('BLE Send Failed:', error);
            return false;
        }
    }

    async disconnect() {
        if (this.server && this.server.connected) {
            this.server.disconnect(); // Web Bluetooth
        }
        if (this._noblePeripheral) {
            try { await this._noblePeripheral.disconnectAsync(); } catch (_) { /* ignore */ }
            this._noblePeripheral = null;
        }
        this.connected = false;
    }
}

export default BleTransport;

/**
 * Unified BonicBot Controller for Direct BLE and App Bridge (WebSocket)
 */

import BleTransport from './transports/ble.js';
import WebSocketTransport from './transports/websocket.js';
import {
    COMMAND_TYPES, RESPONSE_TYPES, SERVO_MAP, ServoConstants, BLE_SERVICE_FRAGMENTS
} from './constants.js';
import {
    MatrixAction, SequenceAction, CameraAction, HeadModeIds
} from './enums.js';
import { 
    BatteryReading, SequenceInfo, SequenceStatus, 
    CameraStatus, CapturedImage 
} from './types.js';

class BonicBotController {
    /**
     * @param {string} deviceName - BLE name (e.g. 'BonicBot-S1')
     * @param {string} [wsHost] - IP of Android device for App Bridge
     * @param {number} [wsPort=8080] - WebSocket port
     */
    constructor(deviceName, wsHost = null, wsPort = 8080) {
        this.deviceName = deviceName;
        this.ble = new BleTransport();
        this.bridge = wsHost ? new WebSocketTransport(wsHost, wsPort) : null;
        
        this.latestSensorData = {
            battery: new BatteryReading(),
            distance: 0,
            base: { leftMotor: {}, rightMotor: {} },
            head: {}, leftHand: {}, rightHand: {}
        };
        
        this.sequenceStatus = new SequenceStatus();
        this.cameraStatus = new CameraStatus();
        this.sensorListeners = {};
        this._buffer = new Uint8Array(0);
        this._latestBridgeData = {};

        this.ble.onData = (data) => this._onBleData(data);
        if (this.bridge) {
            this.bridge.onMessage = (msg) => this._onBridgeMessage(msg);
        }
    }

    async connect() {
        console.log(`Connecting to ${this.deviceName}...`);
        const bleSuccess = await this.ble.connect(this.deviceName);
        if (bleSuccess && this.bridge) {
            await this.bridge.connect();
        }
        return bleSuccess;
    }

    async close() {
        await this.ble.disconnect();
        if (this.bridge) this.bridge.disconnect();
    }

    async disconnect() { return this.close(); }

    get isConnected() { return this.ble.connected; }

    // ============ BLE PACKET BUILDERS ============

    _buildPacket(type, payload = new Uint8Array(0)) {
        const frame = new Uint8Array(5 + payload.length);
        frame[0] = 0xAA;
        frame[1] = 0x55;
        frame[2] = type;
        frame[3] = payload.length & 0xFF;
        frame[4] = (payload.length >> 8) & 0xFF;
        frame.set(payload, 5);
        return frame;
    }

    async _send(packet) {
        return await this.ble.send(packet);
    }

    // ============ HARDWARE METHODS (BLE) ============

    async controlServo(servoId, angle, speed = ServoConstants.DEFAULT_SPEED, acc = ServoConstants.DEFAULT_ACC) {
        const id = typeof servoId === 'string' ? SERVO_MAP[servoId] : servoId;
        if (!id) throw new Error(`Invalid Servo ID: ${servoId}`);

        // 9 bytes: id(u8), action(u8), angle(f32-le), speed(u16-le), acc(u8)
        const payload = new Uint8Array(9);
        const dv = new DataView(payload.buffer);
        dv.setUint8(0, id);
        dv.setUint8(1, 0);              // action = MOVE
        dv.setFloat32(2, angle, true);
        dv.setUint16(6, speed, true);
        dv.setUint8(8, acc);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_SERVO_SINGLE, payload));
    }

    async controlHead(pan = null, tilt = null, mode = null, speed = ServoConstants.DEFAULT_SPEED) {
        if (mode !== null) {
            const modeId = HeadModeIds[mode] ?? 1;
            if (!await this._send(this._buildPacket(COMMAND_TYPES.CMD_HEAD_MODE, new Uint8Array([modeId])))) return false;
        }
        if (pan !== null && !await this.controlServo('headPan', pan, speed)) return false;
        if (tilt !== null && !await this.controlServo('headTilt', tilt, speed)) return false;
        return true;
    }

    async controlHand(side, angles = {}) {
        const prefix = side === 'left' ? 'left' : 'right';
        const speed = angles.speed != null ? angles.speed : ServoConstants.DEFAULT_SPEED;
        const acc = angles.acc != null ? angles.acc : ServoConstants.DEFAULT_ACC;

        for (const [key, val] of Object.entries(angles)) {
            const servoKey = `${prefix}${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (SERVO_MAP[servoKey]) {
                await this.controlServo(servoKey, val, speed, acc);
            }
        }
        return true;
    }

    async controlLeftHand(angles) { return this.controlHand('left', angles); }
    async controlRightHand(angles) { return this.controlHand('right', angles); }

    async _moveBase(left, right, acc = 50) {
        // 5 bytes: left(i16-le), right(i16-le), acc(u8)
        const payload = new Uint8Array(5);
        const dv = new DataView(payload.buffer);
        dv.setInt16(0, left, true);
        dv.setInt16(2, right, true);
        dv.setUint8(4, acc);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MOTOR_MOVE, payload));
    }

    async moveForward(speed = 100, duration = null) {
        const res = await this._moveBase(speed, speed);
        if (duration && res) {
            setTimeout(() => this.stopMovement(), duration * 1000);
        }
        return res;
    }

    async moveBackward(speed = 100, duration = null) {
        return this.moveForward(-speed, duration);
    }

    async turnLeft(speed = 80, duration = null) {
        const res = await this._moveBase(-speed, speed);
        if (duration && res) setTimeout(() => this.stopMovement(), duration * 1000);
        return res;
    }

    async turnRight(speed = 80, duration = null) {
        return this.turnLeft(-speed, duration);
    }

    async stopMovement() { return this._moveBase(0, 0); }

    // ============ GESTURES ============

    async waveHello(speed = 150) {
        await this.controlRightHand({ shoulderPitch: 90, elbow: -30, speed });
        for (let i = 0; i < 3; i++) {
            await this.controlServo('rightWrist', 30, speed);
            await new Promise(r => setTimeout(r, 300));
            await this.controlServo('rightWrist', -30, speed);
            await new Promise(r => setTimeout(r, 300));
        }
        return this.resetToHomePosition();
    }

    async lookAround(speed = 100) {
        await this.controlHead(45, 0, null, speed);
        await new Promise(r => setTimeout(r, 1000));
        await this.controlHead(-45, 0, null, speed);
        await new Promise(r => setTimeout(r, 1000));
        return this.controlHead(0, 0, null, speed);
    }

    async resetToHomePosition(speed = 100) {
        await this.controlHead(0, 0, null, speed);
        await this.controlLeftHand({ gripper: 0, wrist: 0, elbow: 0, shoulderPitch: 0, shoulderYaw: 0, shoulderRoll: 0, speed });
        await this.controlRightHand({ gripper: 0, wrist: 0, elbow: 0, shoulderPitch: 0, shoulderYaw: 0, shoulderRoll: 0, speed });
        return true;
    }

    // ============ SENSORS (BLE) ============

    _requestData(dataType, mode, interval = 200) {
        const payload = new Uint8Array(5);
        const dv = new DataView(payload.buffer);
        dv.setUint8(0, dataType);
        dv.setUint8(1, mode);
        dv.setUint16(2, interval, true);
        dv.setUint8(4, 0);
        return this._send(this._buildPacket(COMMAND_TYPES.CMD_DATA_REQUEST, payload));
    }

    readBattery() { return this._requestData(1, 0); }
    readDistance() { return this._requestData(6, 0); }

    startBatteryStream(interval = 1000, callback = null) {
        if (callback) this.registerSensorListener('battery', '_stream_bat', callback);
        return this._requestData(1, 1, interval);
    }

    startDistanceStream(interval = 200, callback = null) {
        if (callback) this.registerSensorListener('distance', '_stream_dist', callback);
        return this._requestData(6, 1, interval);
    }

    // ============ LED MATRIX (BLE) ============

    async setDisplayText(text) {
        const encoded = new TextEncoder().encode(text);
        const payload = new Uint8Array(1 + encoded.length);
        payload[0] = MatrixAction.SET_TEXT;
        payload.set(encoded, 1);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, payload));
    }

    async setDisplayColor(r, g, b) {
        const payload = new Uint8Array([MatrixAction.SET_COLOR, r, g, b]);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, payload));
    }

    async setDisplayAnimation(mode) {
        const payload = new Uint8Array([MatrixAction.SET_ANIMATION, mode & 0xFF]);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, payload));
    }

    async setDisplayBrightness(val) {
        const payload = new Uint8Array(5);
        payload[0] = MatrixAction.SET_BRIGHTNESS;
        new DataView(payload.buffer).setUint32(1, val, true);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, payload));
    }

    async setDisplaySpeed(val) {
        const payload = new Uint8Array(5);
        payload[0] = MatrixAction.SET_SPEED;
        new DataView(payload.buffer).setUint32(1, val, true);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, payload));
    }

    async playDisplayAnimation() {
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, new Uint8Array([MatrixAction.PLAY])));
    }

    async pauseDisplayAnimation() {
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, new Uint8Array([MatrixAction.PAUSE])));
    }

    async clearDisplay() {
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, new Uint8Array([MatrixAction.CLEAR])));
    }

    async setDisplayPixel(x, y, r, g, b) {
        const payload = new Uint8Array([MatrixAction.SET_PIXEL, x & 0xFF, y & 0xFF, r & 0xFF, g & 0xFF, b & 0xFF]);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, payload));
    }

    async setDisplayFrame(data) {
        if (data.length !== 252) return false;
        const payload = new Uint8Array(1 + data.length);
        payload[0] = MatrixAction.SET_FRAME;
        payload.set(data, 1);
        return await this._send(this._buildPacket(COMMAND_TYPES.CMD_MATRIX_ACTION, payload));
    }

    // ============ APP BRIDGE METHODS (WebSocket) ============

    _requireBridge(method) {
        if (!this.bridge || !this.bridge.connected) {
            throw new Error(`${method}() requires wsHost and BonicBot app running.`);
        }
    }

    async speak(text) {
        this._requireBridge('speak');
        return this.bridge.send({
            commandType: 'command', dataType: 'speak', payload: { text: text.trim() }
        });
    }

    async playSequence(name = null, id = null) {
        if (!name && !id) throw new Error('playSequence requires at least one of name or id');
        this._requireBridge('playSequence');
        const payload = { action: SequenceAction.PLAY };
        if (name) payload.name = name;
        if (id) payload.id = id;
        return this.bridge.send({ commandType: 'command', dataType: 'sequence', payload });
    }

    async stopSequence() {
        this._requireBridge('stopSequence');
        return this.bridge.send({ commandType: 'command', dataType: 'sequence', payload: { action: SequenceAction.STOP } });
    }

    async pauseSequence() {
        this._requireBridge('pauseSequence');
        return this.bridge.send({ commandType: 'command', dataType: 'sequence', payload: { action: SequenceAction.PAUSE } });
    }

    async resumeSequence() {
        this._requireBridge('resumeSequence');
        return this.bridge.send({ commandType: 'command', dataType: 'sequence', payload: { action: SequenceAction.RESUME } });
    }

    async jumpToStep(index) {
        this._requireBridge('jumpToStep');
        return this.bridge.send({ commandType: 'command', dataType: 'sequence', payload: { action: SequenceAction.JUMPTO, step: index } });
    }

    async startCameraStream() {
        this._requireBridge('startCameraStream');
        return this.bridge.send({ commandType: 'command', dataType: 'camera', payload: { action: CameraAction.START } });
    }

    async stopCameraStream() {
        this._requireBridge('stopCameraStream');
        return this.bridge.send({ commandType: 'command', dataType: 'camera', payload: { action: CameraAction.STOP } });
    }

    getSequenceStatus() { return this.sequenceStatus; }
    getCameraStatus()   { return this.cameraStatus; }

    async getSequences() {
        this._requireBridge('getSequences');
        this.bridge.send({ commandType: 'command', dataType: 'sequence', payload: { action: SequenceAction.LIST } });
        await new Promise(r => setTimeout(r, 500));
        const data = this._latestBridgeData['sequence'];
        return (data && Array.isArray(data.sequences)) ? data.sequences : [];
    }

    async captureImage() {
        this._requireBridge('captureImage');
        try {
            const url = `http://${this.bridge.host}:8081/snapshot`;
            const resp = await fetch(url);
            const blob = await resp.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(new CapturedImage(base64));
                };
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('Capture failed:', e);
            return null;
        }
    }

    // ============ DATA PARSING ============

    _onBleData(data) {
        // Simple binary protocol parser
        let newBuffer = new Uint8Array(this._buffer.length + data.length);
        newBuffer.set(this._buffer);
        newBuffer.set(data, this._buffer.length);
        this._buffer = newBuffer;

        while (this._buffer.length >= 5) {
            if (this._buffer[0] === 0xAA && this._buffer[1] === 0x55) {
                const type = this._buffer[2];
                const len = this._buffer[3] | (this._buffer[4] << 8);
                if (this._buffer.length >= 5 + len) {
                    const payload = this._buffer.slice(5, 5 + len);
                    this._processBlePacket(type, payload);
                    this._buffer = this._buffer.slice(5 + len);
                } else break;
            } else {
                this._buffer = this._buffer.slice(1);
            }
        }
    }

    _processBlePacket(type, payload) {
        const dv = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);

        if (type === RESPONSE_TYPES.RESP_ACK) {
            // pong/ack — no action needed
        } else if (type === RESPONSE_TYPES.RESP_BATTERY) {
            if (payload.byteLength >= 12) {
                this.latestSensorData.battery = new BatteryReading(
                    dv.getFloat32(0, true),  // voltage
                    dv.getFloat32(4, true),  // current
                    dv.getFloat32(8, true),  // soc — float32, not uint16
                );
                this._notifyListeners('battery', this.latestSensorData.battery);
            }
        } else if (type === RESPONSE_TYPES.RESP_DISTANCE) {
            if (payload.byteLength >= 4) {
                this.latestSensorData.distance = dv.getFloat32(0, true);
                this._notifyListeners('distance', this.latestSensorData.distance);
            }
        } else if (type === RESPONSE_TYPES.RESP_MOTOR_FEEDBACK) {
            if (payload.byteLength >= 8) {
                this.latestSensorData.base = {
                    leftMotor:  { position: dv.getInt32(0, true), speed: payload.byteLength >= 12 ? dv.getFloat32(8,  true) : 0 },
                    rightMotor: { position: dv.getInt32(4, true), speed: payload.byteLength >= 16 ? dv.getFloat32(12, true) : 0 },
                };
                this._notifyListeners('base', this.latestSensorData.base);
            }
        } else if (type === RESPONSE_TYPES.RESP_SERVO_FEEDBACK) {
            if (payload.byteLength >= 2) {
                const groupId = payload[0];
                const count   = payload[1];
                const servoSize = 11; // id(1)+angle(f32)+speed(u16)+acc(u8)+load(u16)+temp(u8)
                if (payload.byteLength >= 2 + count * servoSize) {
                    const key = { 0: 'rightHand', 1: 'leftHand', 2: 'head' }[groupId] ?? 'unknown';
                    const servos = {};
                    for (let i = 0; i < count; i++) {
                        const o = 2 + i * servoSize;
                        const sid = payload[o];
                        servos[sid] = {
                            angle: dv.getFloat32(o + 1, true),
                            speed: dv.getUint16(o + 5, true),
                            acc:   payload[o + 7],
                            load:  dv.getUint16(o + 8, true),
                            temp:  payload[o + 10],
                        };
                    }
                    this.latestSensorData[key] = servos;
                    this._notifyListeners(key, servos);
                }
            }
        }
    }

    _onBridgeMessage(msg) {
        if (msg.type === 'welcome') {
            this._applyStatusData(msg.robotStatus || {});
        } else if (msg.type === 'robotUpdate') {
            this._applyStatusData(msg.data || {});
        } else if (msg.type === 'sequenceUpdate') {
            const seq = msg.data || {};
            if (Object.keys(seq).length) this.sequenceStatus = new SequenceStatus(seq);
            this._notifyListeners('status', seq);
        } else if (msg.type === 'response' && msg.success) {
            if (msg.dataType) this._latestBridgeData[msg.dataType] = msg.result;
        }
    }

    _applyStatusData(data) {
        if (data.camera) this.cameraStatus = new CameraStatus(data.camera);
        if (data.sequenceStatus) this.sequenceStatus = new SequenceStatus(data.sequenceStatus);
        this._notifyListeners('status', data);
    }

    registerSensorListener(type, id, callback) {
        if (!this.sensorListeners[type]) this.sensorListeners[type] = {};
        this.sensorListeners[type][id] = callback;
    }

    _notifyListeners(type, data) {
        if (this.sensorListeners[type]) {
            Object.values(this.sensorListeners[type]).forEach(cb => cb(data));
        }
    }
}

export default BonicBotController;
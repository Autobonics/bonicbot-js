/**
 * BonicBot Controller Module
 * 
 * Provides both serial and WebSocket communication interfaces for controlling
 * BonicBot humanoid robots with comprehensive sequence and camera support.
 */

import { CommunicationType, ServoID, HeadModes, MotorType, SequenceAction, CameraAction } from './enums.js';
import { ServoConstants } from './constants.js';
import {
    ServoCommand,
    HeadCommand,
    HandCommand,
    BaseCommand,
    ServoReading,
    BatteryReading,
    MotorReading,
    SequenceInfo,
    SequenceStatus,
    CameraStatus,
    CapturedImage
} from './types.js';

/**
 * Base controller class providing common interface for both
 * serial and WebSocket communication with BonicBot.
 */
export class BonicBotController {
    constructor(communicationType) {
        this.communicationType = communicationType;
        this.connected = false;
    }

    // Abstract methods to be implemented by subclasses
    async connect() {
        throw new Error('Subclasses must implement connect()');
    }

    async close() {
        throw new Error('Subclasses must implement close()');
    }

    isConnected() {
        return this.connected;
    }

    /**
     * Control individual servo
     */
    async controlServo(servoId, angle, speed = null, acceleration = null) {
        const cmd = new ServoCommand(
            servoId,
            angle,
            speed || ServoConstants.DEFAULT_SPEED,
            acceleration || ServoConstants.DEFAULT_ACCELERATION
        );

        if (!cmd.validateAngle()) {
            console.error(`Servo ${servoId} angle ${angle} is out of bounds`);
            return false;
        }

        return this._sendServoCommand(cmd);
    }

    // Abstract method for sending servo commands
    async _sendServoCommand(cmd) {
        throw new Error('Subclasses must implement _sendServoCommand()');
    }

    // Convenience methods
    async controlHead(panAngle = null, tiltAngle = null, mode = null, speed = null) {
        let result = true;
        if (panAngle !== null) {
            result &= await this.controlServo(ServoID.HEAD_PAN, panAngle, speed);
        }
        if (tiltAngle !== null) {
            result &= await this.controlServo(ServoID.HEAD_TILT, tiltAngle, speed);
        }
        if (mode !== null) {
            result &= await this._setHeadMode(mode);
        }
        return result;
    }

    async controlRightHand({
        gripper = null,
        wrist = null,
        elbow = null,
        shoulderPitch = null,
        shoulderYaw = null,
        shoulderRoll = null,
        speed = null
    } = {}) {
        let result = true;
        if (gripper !== null) {
            result &= await this.controlServo(ServoID.RIGHT_GRIPPER, gripper, speed);
        }
        if (wrist !== null) {
            result &= await this.controlServo(ServoID.RIGHT_WRIST, wrist, speed);
        }
        if (elbow !== null) {
            result &= await this.controlServo(ServoID.RIGHT_ELBOW, elbow, speed);
        }
        if (shoulderPitch !== null) {
            result &= await this.controlServo(ServoID.RIGHT_SHOULDER_PITCH, shoulderPitch, speed);
        }
        if (shoulderYaw !== null) {
            result &= await this.controlServo(ServoID.RIGHT_SHOULDER_YAW, shoulderYaw, speed);
        }
        if (shoulderRoll !== null) {
            result &= await this.controlServo(ServoID.RIGHT_SHOULDER_ROLL, shoulderRoll, speed);
        }
        return result;
    }

    async controlLeftHand({
        gripper = null,
        wrist = null,
        elbow = null,
        shoulderPitch = null,
        shoulderYaw = null,
        shoulderRoll = null,
        speed = null
    } = {}) {
        let result = true;
        if (gripper !== null) {
            result &= await this.controlServo(ServoID.LEFT_GRIPPER, gripper, speed);
        }
        if (wrist !== null) {
            result &= await this.controlServo(ServoID.LEFT_WRIST, wrist, speed);
        }
        if (elbow !== null) {
            result &= await this.controlServo(ServoID.LEFT_ELBOW, elbow, speed);
        }
        if (shoulderPitch !== null) {
            result &= await this.controlServo(ServoID.LEFT_SHOULDER_PITCH, shoulderPitch, speed);
        }
        if (shoulderYaw !== null) {
            result &= await this.controlServo(ServoID.LEFT_SHOULDER_YAW, shoulderYaw, speed);
        }
        if (shoulderRoll !== null) {
            result &= await this.controlServo(ServoID.LEFT_SHOULDER_ROLL, shoulderRoll, speed);
        }
        return result;
    }

    async moveForward(speed = 100.0, duration = null) {
        return this._moveBase(speed, speed, duration);
    }

    async moveBackward(speed = 100.0, duration = null) {
        return this._moveBase(-speed, -speed, duration);
    }

    async turnLeft(speed = 100.0, duration = null) {
        return this._moveBase(-speed, speed, duration);
    }

    async turnRight(speed = 100.0, duration = null) {
        return this._moveBase(speed, -speed, duration);
    }

    async stopMovement() {
        return this._moveBase(0, 0);
    }

    // Abstract methods
    async _setHeadMode(mode) {
        throw new Error('Subclasses must implement _setHeadMode()');
    }

    async _moveBase(leftSpeed, rightSpeed, duration = null) {
        throw new Error('Subclasses must implement _moveBase()');
    }
}

/**
 * Serial communication implementation for BonicBot control.
 * Uses Web Serial API for browser compatibility.
 */
export class SerialBonicBotController extends BonicBotController {
    constructor(options = {}) {
        super(CommunicationType.SERIAL);
        this.baudrate = options.baudrate || 115200;
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.readableStreamClosed = null;
        this.writableStreamClosed = null;
    }

    async connect() {
        if (!('serial' in navigator)) {
            throw new Error('Web Serial API is not supported in this browser');
        }

        try {
            // Request a port and open a connection
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: this.baudrate });

            // Set up reader and writer
            const textDecoder = new TextDecoderStream();
            this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
            this.reader = textDecoder.readable.getReader();

            const textEncoder = new TextEncoderStream();
            this.writableStreamClosed = textEncoder.readable.pipeTo(this.port.writable);
            this.writer = textEncoder.writable.getWriter();

            this.connected = true;
            console.log('Connected to robot via serial');
            return true;
        } catch (error) {
            console.error('Failed to connect to serial port:', error);
            return false;
        }
    }

    async close() {
        if (this.connected && this.port) {
            try {
                if (this.reader) {
                    await this.reader.cancel();
                    await this.readableStreamClosed.catch(() => { /* Ignore error */ });
                }

                if (this.writer) {
                    await this.writer.close();
                    await this.writableStreamClosed;
                }

                await this.port.close();
                this.connected = false;
                console.log('Serial connection closed');
            } catch (error) {
                console.error('Error closing serial connection:', error);
            }
        }
    }

    async _sendServoCommand(cmd) {
        if (!this.connected || !this.writer) {
            console.error('Not connected to robot');
            return false;
        }

        try {
            const commandStr = `SERVO:${cmd.id}:${cmd.angle}:${cmd.speed}:${cmd.acc}\n`;
            await this.writer.write(commandStr);
            return true;
        } catch (error) {
            console.error('Failed to send servo command:', error);
            return false;
        }
    }

    async _setHeadMode(mode) {
        if (!this.connected || !this.writer) {
            console.error('Not connected to robot');
            return false;
        }

        try {
            const commandStr = `HEAD_MODE:${mode}\n`;
            await this.writer.write(commandStr);
            return true;
        } catch (error) {
            console.error('Failed to set head mode:', error);
            return false;
        }
    }

    async _moveBase(leftSpeed, rightSpeed, duration = null) {
        if (!this.connected || !this.writer) {
            console.error('Not connected to robot');
            return false;
        }

        try {
            const commandStr = `BASE:${leftSpeed}:${rightSpeed}\n`;
            await this.writer.write(commandStr);

            if (duration) {
                setTimeout(async () => {
                    const stopCommand = 'BASE:0:0\n';
                    await this.writer.write(stopCommand);
                }, duration * 1000);
            }

            return true;
        } catch (error) {
            console.error('Failed to move base:', error);
            return false;
        }
    }

    async readSensorData() {
        if (!this.connected || !this.reader) {
            return null;
        }

        try {
            const { value, done } = await this.reader.read();
            if (done) {
                return null;
            }
            return value.trim();
        } catch (error) {
            console.error('Error reading sensor data:', error);
            return null;
        }
    }

    // Serial doesn't support sequence/camera operations
    async speak(text) {
        console.warn('Speak function not supported in serial mode');
        return false;
    }

    async getSequences() {
        console.warn('Sequence operations not supported in serial mode');
        return [];
    }
}

/**
 * WebSocket communication implementation for BonicBot control.
 * Provides enhanced sensor monitoring, sequence control, and camera operations.
 */
export class WebSocketBonicBotController extends BonicBotController {
    constructor(host = 'localhost', port = 8080) {
        super(CommunicationType.WEBSOCKET);
        this.host = host;
        this.port = port;
        this.websocket = null;
        this.clientId = null;
        this.robotStatus = {};

        // Enhanced sensor data storage
        this.latestSensorData = {
            battery: null,
            leftHand: null,
            rightHand: null,
            head: null,
            base: null,
            distance: null,
            sequence: null,
            camera: null
        };
        this.sensorHistory = {};
        this.sensorListeners = {};
        this.messageCallbacks = {};

        // Sequence and camera status
        this.sequenceStatus = new SequenceStatus();
        this.cameraStatus = new CameraStatus();
    }

    async connect() {
        try {
            const uri = `ws://${this.host}:${this.port}`;
            console.log(`Connecting to robot at ${uri}`);

            this.websocket = new WebSocket(uri);

            return new Promise((resolve, reject) => {
                this.websocket.onopen = () => {
                    this.connected = true;
                    this._setupMessageHandler();
                    console.log('Connected to robot WebSocket server');
                    resolve(true);
                };

                this.websocket.onerror = (error) => {
                    console.error('WebSocket connection error:', error);
                    reject(false);
                };

                this.websocket.onclose = () => {
                    this.connected = false;
                    console.log('WebSocket connection closed');
                };
            });
        } catch (error) {
            console.error('Failed to connect:', error);
            return false;
        }
    }

    async close() {
        if (this.websocket && this.connected) {
            this.websocket.close();
            this.connected = false;
            console.log('Disconnected from robot WebSocket server');
        }
    }

    _setupMessageHandler() {
        this.websocket.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                await this._processMessage(data);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        };
    }

    async _processMessage(data) {
        const messageType = data.type;

        if (messageType === 'welcome') {
            this.clientId = data.clientId;
            this.robotStatus = data.robotStatus || {};
            this._updateStatusFromRobotData(this.robotStatus);
            console.log(`Welcome message received. Client ID: ${this.clientId}`);

        } else if (messageType === 'response') {
            const success = data.success || false;
            const commandType = data.commandType;
            const dataType = data.dataType;
            const result = data.result;

            if (success) {
                console.debug(`Command successful: ${commandType}/${dataType}`);
                if (result) {
                    this._storeSensorData(dataType, result);
                }
            } else {
                const errorMsg = data.error || 'Unknown error';
                console.error(`Command failed: ${commandType}/${dataType} - ${errorMsg}`);
            }

        } else if (messageType === 'continuousData') {
            const dataType = data.dataType;
            const sensorData = data.data;
            this._storeSensorData(dataType, sensorData);

        } else if (messageType === 'robotUpdate') {
            this.robotStatus = data.data || {};
            this._updateStatusFromRobotData(this.robotStatus);

        } else if (messageType === 'sequenceUpdate') {
            const sequenceData = data.data || {};
            this._updateSequenceStatus(sequenceData);

        } else if (messageType === 'error') {
            const errorMsg = data.error;
            console.error(`Server error: ${errorMsg}`);
        }

        // Trigger message callbacks
        if (this.messageCallbacks[messageType]) {
            this.messageCallbacks[messageType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in message callback:', error);
                }
            });
        }
    }

    _updateStatusFromRobotData(robotData) {
        // Update sequence status
        const sequenceStatus = robotData.sequenceStatus;
        if (sequenceStatus) {
            this._updateSequenceStatus(sequenceStatus);
        }

        // Update camera status
        const cameraStatus = robotData.cameraStatus;
        if (cameraStatus) {
            this.cameraStatus = new CameraStatus({
                isStreaming: cameraStatus.isStreaming || false,
                isInitialized: cameraStatus.isInitialized || false,
                connectedClients: cameraStatus.connectedClients || 0,
                streamUrl: cameraStatus.streamUrl
            });
        }
    }

    _updateSequenceStatus(sequenceData) {
        this.sequenceStatus = new SequenceStatus({
            isPlaying: sequenceData.isPlaying || false,
            isPaused: sequenceData.isPaused || false,
            isRecording: sequenceData.isRecording || false,
            currentSequence: sequenceData.currentSequence,
            currentStep: sequenceData.currentStep || 0,
            totalSteps: sequenceData.totalSteps || 0,
            playbackProgress: sequenceData.playbackProgress || 0.0,
            availableSequenceCount: sequenceData.availableSequenceCount || 0
        });
    }

    _storeSensorData(dataType, sensorData) {
        if (!sensorData) return;

        const storageKey = this._getStorageKey(dataType);
        if (storageKey) {
            // Store latest data
            this.latestSensorData[storageKey] = {
                data: sensorData,
                timestamp: new Date(),
                dataType: dataType
            };

            // Store in history (keep last 100 readings)
            if (!this.sensorHistory[storageKey]) {
                this.sensorHistory[storageKey] = [];
            }

            this.sensorHistory[storageKey].push({
                data: sensorData,
                timestamp: new Date()
            });

            if (this.sensorHistory[storageKey].length > 100) {
                this.sensorHistory[storageKey] = this.sensorHistory[storageKey].slice(-100);
            }

            // Trigger listeners
            this._triggerListeners(storageKey, sensorData);
        }
    }

    _getStorageKey(dataType) {
        const mapping = {
            'RobotDataType.battery': 'battery',
            'RobotDataType.leftHand': 'leftHand',
            'RobotDataType.rightHand': 'rightHand',
            'RobotDataType.head': 'head',
            'RobotDataType.base': 'base',
            'RobotDataType.distance': 'distance',
            'battery': 'battery',
            'lefthand': 'leftHand',
            'righthand': 'rightHand',
            'head': 'head',
            'base': 'base',
            'distance': 'distance',
            'sequence': 'sequence',
            'camera': 'camera'
        };
        return mapping[dataType];
    }

    _triggerListeners(storageKey, sensorData) {
        if (this.sensorListeners[storageKey]) {
            Object.values(this.sensorListeners[storageKey]).forEach(listenerConfig => {
                try {
                    const callback = listenerConfig.callback;
                    const dataFilter = listenerConfig.filter;

                    if (dataFilter && typeof dataFilter === 'function') {
                        if (!dataFilter(sensorData)) {
                            return;
                        }
                    }

                    callback(sensorData);
                } catch (error) {
                    console.error('Error in sensor listener:', error);
                }
            });
        }
    }

    async _sendCommand(commandType, dataType, payload = {}, interval = 0) {
        if (!this.connected || !this.websocket) {
            console.error('Not connected to robot');
            return false;
        }

        const message = {
            commandType: commandType,
            dataType: dataType,
            payload: payload,
            interval: interval
        };

        try {
            this.websocket.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Failed to send command:', error);
            return false;
        }
    }

    async _sendServoCommand(cmd) {
        const payload = {
            id: cmd.id,
            angle: cmd.angle,
            speed: cmd.speed,
            acc: cmd.acc
        };
        return this._sendCommand('command', 'servo', payload);
    }

    async _setHeadMode(mode) {
        const payload = { mode: mode };
        return this._sendCommand('command', 'head', payload);
    }

    async _moveBase(leftSpeed, rightSpeed, duration = null) {
        const payload = {
            leftMotor: { currentSpeed: leftSpeed, type: MotorType.GEAR_MOTOR },
            rightMotor: { currentSpeed: rightSpeed, type: MotorType.GEAR_MOTOR }
        };
        const result = await this._sendCommand('command', 'base', payload);

        if (duration && result) {
            setTimeout(async () => {
                const stopPayload = {
                    leftMotor: { currentSpeed: 0, type: MotorType.GEAR_MOTOR },
                    rightMotor: { currentSpeed: 0, type: MotorType.GEAR_MOTOR }
                };
                await this._sendCommand('command', 'base', stopPayload);
            }, duration * 1000);
        }

        return result;
    }

    // Enhanced sensor monitoring methods
    registerSensorListener(sensorType, listenerId, callback, dataFilter = null) {
        if (!this.latestSensorData.hasOwnProperty(sensorType)) {
            console.error(`Invalid sensor type: ${sensorType}`);
            return false;
        }

        if (!this.sensorListeners[sensorType]) {
            this.sensorListeners[sensorType] = {};
        }

        this.sensorListeners[sensorType][listenerId] = {
            callback: callback,
            filter: dataFilter,
            registeredAt: new Date()
        };

        console.log(`Registered listener ${listenerId} for ${sensorType}`);
        return true;
    }

    getLatestSensorData(sensorType) {
        return this.latestSensorData[sensorType];
    }

    getBatteryStatus() {
        const data = this.getLatestSensorData('battery');
        if (data && data.data) {
            const batteryData = data.data;
            return new BatteryReading({
                voltage: batteryData.voltage || 0,
                current: batteryData.current || 0,
                soc: batteryData.soc || 0,
                temperature: batteryData.temperature || 0,
                hasError: batteryData.hasError || false,
                errorMessage: batteryData.errorMessage || ''
            });
        }
        return null;
    }

    getDistanceReading() {
        const data = this.getLatestSensorData('distance');
        if (data && data.data) {
            return data.data.distance;
        }
        return null;
    }

    async startSensorStream(sensorType, intervalMs = 1000, callback = null) {
        if (callback) {
            this.registerSensorListener(sensorType, `stream_${Date.now()}`, callback);
        }
        return this._sendCommand('request', sensorType, {}, intervalMs);
    }

    isRobotOnline() {
        return this.robotStatus.isConnected || false;
    }

    // Sequence control methods
    async getSequences() {
        try {
            const result = await this._sendCommand('command', 'sequence', {
                action: SequenceAction.LIST
            });
            if (result) {
                // Wait for response and parse sequences
                await this._waitForData(500);
                const seqData = this.getLatestSensorData('sequence');
                if (seqData && seqData.data && seqData.data.sequences) {
                    return seqData.data.sequences.map(seq => new SequenceInfo({
                        id: seq.id,
                        name: seq.name,
                        description: seq.description,
                        stepCount: seq.stepCount,
                        duration: seq.duration,
                        isLoop: seq.isLoop,
                        createdAt: seq.createdAt,
                        componentUsage: seq.componentUsage
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to get sequences:', error);
        }
        return [];
    }

    async playSequence(sequenceName = null, sequenceId = null) {
        if (!sequenceName && !sequenceId) {
            console.error('Either sequenceName or sequenceId must be provided');
            return false;
        }

        const payload = { action: SequenceAction.PLAY };
        if (sequenceName) payload.name = sequenceName;
        if (sequenceId) payload.id = sequenceId;

        return this._sendCommand('command', 'sequence', payload);
    }

    async stopSequence() {
        const payload = { action: SequenceAction.STOP };
        return this._sendCommand('command', 'sequence', payload);
    }

    async pauseSequence() {
        const payload = { action: SequenceAction.PAUSE };
        return this._sendCommand('command', 'sequence', payload);
    }

    async resumeSequence() {
        const payload = { action: SequenceAction.RESUME };
        return this._sendCommand('command', 'sequence', payload);
    }

    async jumpToStep(stepIndex) {
        const payload = {
            action: SequenceAction.JUMPTO,
            step: stepIndex
        };
        return this._sendCommand('command', 'sequence', payload);
    }

    async getSequenceStatus() {
        const payload = { action: SequenceAction.STATUS };
        await this._sendCommand('command', 'sequence', payload);
        return this.sequenceStatus;
    }

    // Camera control methods
    async startCameraStream() {
        const payload = { action: CameraAction.START };
        return this._sendCommand('command', 'camera', payload);
    }

    async stopCameraStream() {
        const payload = { action: CameraAction.STOP };
        return this._sendCommand('command', 'camera', payload);
    }

    async captureImage() {
        const payload = { action: CameraAction.CAPTURE };
        const result = await this._sendCommand('command', 'camera', payload);
        if (result) {
            await this._waitForData(1000);
            const cameraData = this.getLatestSensorData('camera');
            if (cameraData && cameraData.data && cameraData.data.imageData) {
                const data = cameraData.data;
                return new CapturedImage({
                    imageData: data.imageData,
                    format: data.format || 'jpeg',
                    timestamp: data.timestamp || new Date().toISOString()
                });
            }
        }
        return null;
    }

    async getCameraStatus() {
        const payload = { action: CameraAction.STATUS };
        await this._sendCommand('command', 'camera', payload);
        return this.cameraStatus;
    }

    // Speaking/TTS methods
    async speak(text) {
        if (!text || !text.trim()) {
            console.error('Text cannot be empty');
            return false;
        }

        const payload = { text: text.trim() };
        return this._sendCommand('command', 'speak', payload);
    }

    // High-level convenience methods
    async waveHello(useRightHand = true, speed = 150.0) {
        if (useRightHand) {
            await this.controlRightHand({ shoulderPitch: 90 });
            await this._wait(500);
            for (let i = 0; i < 3; i++) {
                await this.controlRightHand({ wrist: 45 });
                await this._wait(300);
                await this.controlRightHand({ wrist: -45 });
                await this._wait(300);
            }
            await this.controlRightHand({ wrist: 0 });
            await this.controlRightHand({ shoulderPitch: 0 });
        } else {
            await this.controlLeftHand({ shoulderPitch: 90 });
            await this._wait(500);
            for (let i = 0; i < 3; i++) {
                await this.controlLeftHand({ wrist: 45 });
                await this._wait(300);
                await this.controlLeftHand({ wrist: -45 });
                await this._wait(300);
            }
            await this.controlLeftHand({ wrist: 0 });
            await this.controlLeftHand({ shoulderPitch: 0 });
        }
        return true;
    }

    async lookAround(speed = 100.0) {
        const positions = [[-45, 0], [45, 0], [0, 30], [0, -30], [0, 0]];
        for (const [pan, tilt] of positions) {
            await this.controlHead(pan, tilt);
            await this._wait(1000);
        }
        return true;
    }

    async resetToHomePosition(speed = 100.0) {
        // Head to center
        await this.controlHead(0, 0);

        // Both hands to neutral
        await this.controlRightHand({
            shoulderPitch: 0,
            shoulderYaw: 0,
            shoulderRoll: 0,
            elbow: 0,
            wrist: 0,
            gripper: 0
        });

        await this.controlLeftHand({
            shoulderPitch: 0,
            shoulderYaw: 0,
            shoulderRoll: 0,
            elbow: 0,
            wrist: 0,
            gripper: 0
        });

        // Stop base movement
        await this.stopMovement();
        return true;
    }

    // Utility methods
    async _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async _waitForData(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Message callback registration
    onMessage(messageType, callback) {
        if (!this.messageCallbacks[messageType]) {
            this.messageCallbacks[messageType] = [];
        }
        this.messageCallbacks[messageType].push(callback);
    }

    offMessage(messageType, callback) {
        if (this.messageCallbacks[messageType]) {
            const index = this.messageCallbacks[messageType].indexOf(callback);
            if (index > -1) {
                this.messageCallbacks[messageType].splice(index, 1);
            }
        }
    }
}
/**
 * BonicBot JavaScript Library
 * 
 * A comprehensive JavaScript library for controlling BonicBot humanoid robots 
 * via serial communication and WebSocket with sequence and camera support.
 * 
 * Main Components:
 * - BonicBotController: Core controller class for robot communication
 * - SerialBonicBotController: Serial communication implementation (Web Serial API)
 * - WebSocketBonicBotController: WebSocket communication with enhanced monitoring, sequences, and camera
 * - ServoID: Enumeration of available servo identifiers
 * - HeadModes: Head expression modes
 * - Command classes: ServoCommand, HeadCommand, HandCommand, BaseCommand
 * - Reading classes: ServoReading, BatteryReading, MotorReading
 * - Sequence classes: SequenceInfo, SequenceStatus
 * - Camera classes: CameraStatus, CapturedImage
 * 
 * @example
 * Basic WebSocket usage:
 * 
 * import { createWebSocketController, HeadModes } from 'bonicbot';
 * 
 * const robot = createWebSocketController('192.168.1.100', 8080);
 * await robot.connect();
 * await robot.controlHead(45, 0);
 * await robot.speak("Hello, I am BonicBot!");
 * await robot.close();
 * 
 * @example
 * Serial usage (requires Web Serial API):
 * 
 * import { createSerialController } from 'bonicbot';
 * 
 * const robot = createSerialController({ baudrate: 115200 });
 * await robot.connect(); // Will prompt user to select serial port
 * await robot.moveForward(100, 2); // Move forward for 2 seconds
 * await robot.close();
 * 
 * @example
 * Advanced usage with monitoring:
 * 
 * import { createWebSocketController } from 'bonicbot';
 * 
 * const robot = createWebSocketController('localhost', 8080);
 * await robot.connect();
 * 
 * // Register sensor listener
 * robot.registerSensorListener('battery', 'battery-monitor', (data) => {
 *   console.log('Battery level:', data.soc);
 * });
 * 
 * // Start battery monitoring
 * await robot.startSensorStream('battery', 1000);
 * 
 * // Play a sequence
 * const sequences = await robot.getSequences();
 * if (sequences.length > 0) {
 *   await robot.playSequence(sequences[0].name);
 * }
 * 
 * // Capture image
 * const image = await robot.captureImage();
 * if (image) {
 *   image.download('robot-selfie.jpg');
 * }
 * 
 * await robot.close();
 */

// Core controller classes
export {
    BonicBotController,
    SerialBonicBotController,
    WebSocketBonicBotController
} from './controller.js';

// Enums
export {
    CommunicationType,
    ServoID,
    HeadModes,
    VideoStreamMode,
    MotorType,
    SequenceAction,
    CameraAction
} from './enums.js';

// Constants
export { ServoConstants } from './constants.js';

// Data types and classes
export {
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

// Import controller classes for factory functions
import {
    BonicBotController,
    SerialBonicBotController,
    WebSocketBonicBotController
} from './controller.js';
import { CommunicationType } from './enums.js';

// Import other classes for default export
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
import {
    ServoID,
    HeadModes,
    VideoStreamMode,
    MotorType,
    SequenceAction,
    CameraAction
} from './enums.js';

/**
 * Create a serial BonicBot controller
 * 
 * @param {Object} options - Configuration options
 * @param {number} [options.baudrate=115200] - Serial baudrate
 * @returns {SerialBonicBotController} Serial controller instance
 * 
 * @example
 * const robot = createSerialController({ baudrate: 115200 });
 * await robot.connect(); // Will prompt user for port selection
 */
export function createSerialController(options = {}) {
    return new SerialBonicBotController(options);
}

/**
 * Create a WebSocket BonicBot controller
 * 
 * @param {string} [host='localhost'] - WebSocket host
 * @param {number} [port=8080] - WebSocket port
 * @returns {WebSocketBonicBotController} WebSocket controller instance
 * 
 * @example
 * const robot = createWebSocketController('192.168.1.100', 8080);
 * await robot.connect();
 */
export function createWebSocketController(host = 'localhost', port = 8080) {
    return new WebSocketBonicBotController(host, port);
}

/**
 * Create a BonicBot controller with automatic type detection.
 * 
 * @param {string|Object} hostOrOptions - WebSocket host or serial options
 * @param {number} [portOrBaudrate] - WebSocket port or serial baudrate
 * @param {CommunicationType} [communicationType] - Force specific communication type
 * @returns {BonicBotController} Appropriate controller instance
 * 
 * @example
 * // Auto-detected as WebSocket
 * const robotWS = createController('192.168.1.100', 8080);
 * 
 * // Auto-detected as serial
 * const robotSerial = createController({ baudrate: 115200 });
 * 
 * // Explicitly specified
 * const robotExplicit = createController('localhost', 8080, CommunicationType.WEBSOCKET);
 */
export function createController(hostOrOptions, portOrBaudrate = null, communicationType = null) {
    // Auto-detect communication type if not specified
    if (communicationType === null) {
        if (typeof hostOrOptions === 'object') {
            // Options object provided, assume serial
            communicationType = CommunicationType.SERIAL;
        } else if (typeof hostOrOptions === 'string' && typeof portOrBaudrate === 'number') {
            // Host and port provided, assume WebSocket
            communicationType = CommunicationType.WEBSOCKET;
        } else {
            // Default to WebSocket
            communicationType = CommunicationType.WEBSOCKET;
        }
    }

    if (communicationType === CommunicationType.SERIAL) {
        const options = typeof hostOrOptions === 'object' ? hostOrOptions : { baudrate: portOrBaudrate || 115200 };
        return new SerialBonicBotController(options);
    } else {
        const host = typeof hostOrOptions === 'string' ? hostOrOptions : 'localhost';
        const port = portOrBaudrate || 8080;
        return new WebSocketBonicBotController(host, port);
    }
}

/**
 * Check if Web Serial API is supported in the current browser
 * 
 * @returns {boolean} True if Web Serial API is supported
 */
export function isSerialSupported() {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
}

/**
 * Check if WebSocket is supported in the current environment
 * 
 * @returns {boolean} True if WebSocket is supported
 */
export function isWebSocketSupported() {
    return typeof WebSocket !== 'undefined';
}

/**
 * Get library version
 * 
 * @returns {string} Library version
 */
export function getVersion() {
    return '2.0.1';
}

/**
 * Get supported communication types in current environment
 * 
 * @returns {Object} Object with boolean properties for each communication type
 */
export function getSupportedCommunicationTypes() {
    return {
        serial: isSerialSupported(),
        websocket: isWebSocketSupported()
    };
}

// For convenience, also export the main classes as default
const BonicBot = {
    // Core controllers
    BonicBotController,
    SerialBonicBotController,
    WebSocketBonicBotController,

    // Factory functions
    createSerialController,
    createWebSocketController,
    createController,

    // Enums
    CommunicationType,
    ServoID,
    HeadModes,
    VideoStreamMode,
    MotorType,
    SequenceAction,
    CameraAction,

    // Constants
    ServoConstants,

    // Data types
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
    CapturedImage,

    // Utility functions
    isSerialSupported,
    isWebSocketSupported,
    getVersion,
    getSupportedCommunicationTypes
};

export default BonicBot;
/**
 * BonicBot JavaScript Library v3.0.0
 */

import BonicBotController from './controller.js';
import * as Enums from './enums.js';
import * as Constants from './constants.js';
import * as Types from './types.js';

export {
    BonicBotController,
    Enums,
    Constants,
    Types
};

// Flattened exports for convenience
export const { ServoID, HeadModes, SequenceAction, CameraAction, MatrixAction } = Enums;
export const { ServoConstants } = Constants;
export const { 
    BatteryReading, SequenceInfo, SequenceStatus, CameraStatus, CapturedImage 
} = Types;

/**
 * Check if Web Bluetooth is supported in the current browser
 */
export function isBluetoothSupported() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

const BonicBot = {
    BonicBotController,
    ...Enums,
    ...Constants,
    ...Types,
    isBluetoothSupported
};

export default BonicBot;
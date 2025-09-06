/**
 * Data classes and types for BonicBot controller
 */

import { ServoConstants } from './constants.js';
import { ServoID, HeadModes, MotorType } from './enums.js';

/**
 * Individual servo control command
 */
export class ServoCommand {
    constructor(id, angle, speed = ServoConstants.DEFAULT_SPEED, acc = ServoConstants.DEFAULT_ACCELERATION) {
        this.id = id;
        this.angle = angle;
        this.speed = speed;
        this.acc = acc;
    }

    /**
     * Validate servo angle is within limits
     */
    validateAngle() {
        const limits = this._getServoLimits();
        if (limits) {
            const [minAngle, maxAngle] = limits;
            return this.angle >= minAngle && this.angle <= maxAngle;
        }
        return true;
    }

    _getServoLimits() {
        const limitsMap = {
            // Right hand
            [ServoID.RIGHT_GRIPPER]: [ServoConstants.RIGHT_GRIPPER_MIN, ServoConstants.RIGHT_GRIPPER_MAX],
            [ServoID.RIGHT_WRIST]: [ServoConstants.RIGHT_WRIST_MIN, ServoConstants.RIGHT_WRIST_MAX],
            [ServoID.RIGHT_ELBOW]: [ServoConstants.RIGHT_ELBOW_MIN, ServoConstants.RIGHT_ELBOW_MAX],
            [ServoID.RIGHT_SHOULDER_PITCH]: [ServoConstants.RIGHT_SHOULDER_PITCH_MIN, ServoConstants.RIGHT_SHOULDER_PITCH_MAX],
            [ServoID.RIGHT_SHOULDER_YAW]: [ServoConstants.RIGHT_SHOULDER_YAW_MIN, ServoConstants.RIGHT_SHOULDER_YAW_MAX],
            [ServoID.RIGHT_SHOULDER_ROLL]: [ServoConstants.RIGHT_SHOULDER_ROLL_MIN, ServoConstants.RIGHT_SHOULDER_ROLL_MAX],
            // Left hand
            [ServoID.LEFT_GRIPPER]: [ServoConstants.LEFT_GRIPPER_MIN, ServoConstants.LEFT_GRIPPER_MAX],
            [ServoID.LEFT_WRIST]: [ServoConstants.LEFT_WRIST_MIN, ServoConstants.LEFT_WRIST_MAX],
            [ServoID.LEFT_ELBOW]: [ServoConstants.LEFT_ELBOW_MIN, ServoConstants.LEFT_ELBOW_MAX],
            [ServoID.LEFT_SHOULDER_PITCH]: [ServoConstants.LEFT_SHOULDER_PITCH_MIN, ServoConstants.LEFT_SHOULDER_PITCH_MAX],
            [ServoID.LEFT_SHOULDER_YAW]: [ServoConstants.LEFT_SHOULDER_YAW_MIN, ServoConstants.LEFT_SHOULDER_YAW_MAX],
            [ServoID.LEFT_SHOULDER_ROLL]: [ServoConstants.LEFT_SHOULDER_ROLL_MIN, ServoConstants.LEFT_SHOULDER_ROLL_MAX],
            // Head
            [ServoID.HEAD_PAN]: [ServoConstants.HEAD_PAN_MIN, ServoConstants.HEAD_PAN_MAX],
            [ServoID.HEAD_TILT]: [ServoConstants.HEAD_TILT_MIN, ServoConstants.HEAD_TILT_MAX]
        };
        return limitsMap[this.id];
    }
}

/**
 * Head control command
 */
export class HeadCommand {
    constructor({
        pan = 0.0,
        tilt = 0.0,
        mode = HeadModes.NONE,
        speed = ServoConstants.DEFAULT_SPEED,
        acceleration = ServoConstants.DEFAULT_ACCELERATION
    } = {}) {
        this.pan = pan;
        this.tilt = tilt;
        this.mode = mode;
        this.speed = speed;
        this.acceleration = acceleration;
    }
}

/**
 * Hand control command with all 6 servos
 */
export class HandCommand {
    constructor({
        shoulderPitch = 0.0,
        shoulderYaw = 0.0,
        shoulderRoll = 0.0,
        elbow = 0.0,
        wrist = 0.0,
        gripper = 0.0,
        speed = ServoConstants.DEFAULT_SPEED,
        acceleration = ServoConstants.DEFAULT_ACCELERATION
    } = {}) {
        this.shoulderPitch = shoulderPitch;
        this.shoulderYaw = shoulderYaw;
        this.shoulderRoll = shoulderRoll;
        this.elbow = elbow;
        this.wrist = wrist;
        this.gripper = gripper;
        this.speed = speed;
        this.acceleration = acceleration;
    }
}

/**
 * Base movement command
 */
export class BaseCommand {
    constructor({
        leftMotorSpeed = 0.0,
        rightMotorSpeed = 0.0,
        motorType = MotorType.GEAR_MOTOR
    } = {}) {
        this.leftMotorSpeed = leftMotorSpeed;
        this.rightMotorSpeed = rightMotorSpeed;
        this.motorType = motorType;
    }
}

/**
 * Servo sensor reading
 */
export class ServoReading {
    constructor({
        id,
        name,
        feedbackAngle,
        feedbackSpeed,
        load,
        temperature,
        hasError
    }) {
        this.id = id;
        this.name = name;
        this.feedbackAngle = feedbackAngle;
        this.feedbackSpeed = feedbackSpeed;
        this.load = load;
        this.temperature = temperature;
        this.hasError = hasError;
    }
}

/**
 * Battery sensor reading
 */
export class BatteryReading {
    constructor({
        voltage,
        current,
        soc, // State of charge
        temperature,
        hasError,
        errorMessage
    }) {
        this.voltage = voltage;
        this.current = current;
        this.soc = soc;
        this.temperature = temperature;
        this.hasError = hasError;
        this.errorMessage = errorMessage;
    }
}

/**
 * Motor sensor reading
 */
export class MotorReading {
    constructor({
        id,
        feedbackSpeed,
        feedbackPosition,
        torque,
        temperature,
        mode,
        hasError
    }) {
        this.id = id;
        this.feedbackSpeed = feedbackSpeed;
        this.feedbackPosition = feedbackPosition;
        this.torque = torque;
        this.temperature = temperature;
        this.mode = mode;
        this.hasError = hasError;
    }
}

/**
 * Sequence information
 */
export class SequenceInfo {
    constructor({
        id,
        name,
        description,
        stepCount,
        duration,
        isLoop,
        createdAt,
        componentUsage
    }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.stepCount = stepCount;
        this.duration = duration;
        this.isLoop = isLoop;
        this.createdAt = createdAt;
        this.componentUsage = componentUsage;
    }
}

/**
 * Current sequence playback status
 */
export class SequenceStatus {
    constructor({
        isPlaying = false,
        isPaused = false,
        isRecording = false,
        currentSequence = null,
        currentStep = 0,
        totalSteps = 0,
        playbackProgress = 0.0,
        availableSequenceCount = 0
    } = {}) {
        this.isPlaying = isPlaying;
        this.isPaused = isPaused;
        this.isRecording = isRecording;
        this.currentSequence = currentSequence;
        this.currentStep = currentStep;
        this.totalSteps = totalSteps;
        this.playbackProgress = playbackProgress;
        this.availableSequenceCount = availableSequenceCount;
    }
}

/**
 * Camera status information
 */
export class CameraStatus {
    constructor({
        isStreaming = false,
        isInitialized = false,
        connectedClients = 0,
        streamUrl = null
    } = {}) {
        this.isStreaming = isStreaming;
        this.isInitialized = isInitialized;
        this.connectedClients = connectedClients;
        this.streamUrl = streamUrl;
    }
}

/**
 * Captured image data
 */
export class CapturedImage {
    constructor({
        imageData, // Base64 encoded
        format,
        timestamp
    }) {
        this.imageData = imageData;
        this.format = format;
        this.timestamp = timestamp;
    }

    /**
     * Convert to data URL for use in img tags
     */
    toDataURL() {
        return `data:image/${this.format};base64,${this.imageData}`;
    }

    /**
     * Download image as file
     */
    download(filename = 'bonicbot-capture.jpg') {
        const link = document.createElement('a');
        link.href = this.toDataURL();
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
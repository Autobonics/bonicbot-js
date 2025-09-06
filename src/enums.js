/**
 * Enumerations for BonicBot controller
 */

/**
 * Communication interface types
 */
export const CommunicationType = Object.freeze({
    SERIAL: 'serial',
    WEBSOCKET: 'websocket'
});

/**
 * Servo identifier enumeration for BonicBot
 */
export const ServoID = Object.freeze({
    // Right hand servos
    RIGHT_GRIPPER: 'rightGripper',
    RIGHT_WRIST: 'rightWrist',
    RIGHT_ELBOW: 'rightElbow',
    RIGHT_SHOULDER_PITCH: 'rightSholderPitch',
    RIGHT_SHOULDER_YAW: 'rightSholderYaw',
    RIGHT_SHOULDER_ROLL: 'rightSholderRoll',

    // Left hand servos
    LEFT_GRIPPER: 'leftGripper',
    LEFT_WRIST: 'leftWrist',
    LEFT_ELBOW: 'leftElbow',
    LEFT_SHOULDER_PITCH: 'leftSholderPitch',
    LEFT_SHOULDER_YAW: 'leftSholderYaw',
    LEFT_SHOULDER_ROLL: 'leftSholderRoll',

    // Head servos
    HEAD_PAN: 'headPan',
    HEAD_TILT: 'headTilt'
});

/**
 * Head expression modes
 */
export const HeadModes = Object.freeze({
    NONE: 'None',
    NORMAL: 'Normal',
    HAPPY: 'Happy',
    SAD: 'Sad',
    ANGRY: 'Angry',
    SURPRISED: 'Surprised',
    CONFUSED: 'Confused'
});

/**
 * Video streaming modes
 */
export const VideoStreamMode = Object.freeze({
    NONE: 'None',
    ONE_WAY_FROM_ROBOT: 'OneWayFromRobot',
    ONE_WAY_TO_ROBOT: 'OneWayToRobot',
    TWO_WAY: 'TwoWay'
});

/**
 * Motor types for base movement
 */
export const MotorType = Object.freeze({
    GEAR_MOTOR: 'GearMotor',
    DDSM115: 'DDSM115'
});

/**
 * Sequence control actions
 */
export const SequenceAction = Object.freeze({
    LIST: 'list',
    PLAY: 'play',
    STOP: 'stop',
    PAUSE: 'pause',
    RESUME: 'resume',
    STATUS: 'status',
    JUMPTO: 'jumpto'
});

/**
 * Camera control actions
 */
export const CameraAction = Object.freeze({
    START: 'start',
    STOP: 'stop',
    CAPTURE: 'capture',
    STATUS: 'status'
});
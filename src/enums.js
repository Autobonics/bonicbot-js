/**
 * Enumerations for BonicBot controller
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

export const HeadModes = Object.freeze({
    NORMAL: 'Normal',
    HAPPY: 'Happy',
    SAD: 'Sad',
    ANGRY: 'Angry',
    SURPRISED: 'Surprised',
    CONFUSED: 'Confused'
});

// Single-byte integer IDs sent in the BLE head-mode packet
export const HeadModeIds = Object.freeze({
    'Normal': 1, 'Happy': 2, 'Sad': 3,
    'Angry': 4, 'Surprised': 5, 'Confused': 6
});

export const SequenceAction = Object.freeze({
    LIST: 'list',
    PLAY: 'play',
    STOP: 'stop',
    PAUSE: 'pause',
    RESUME: 'resume',
    STATUS: 'status',
    JUMPTO: 'jumpto'
});

export const CameraAction = Object.freeze({
    START: 'start',
    STOP: 'stop',
    CAPTURE: 'capture',
    STATUS: 'status'
});

export const MatrixAction = Object.freeze({
    SET_TEXT: 0x01,
    SET_COLOR: 0x02,
    SET_ANIMATION: 0x03,
    SET_BRIGHTNESS: 0x04,
    SET_SPEED: 0x05,
    PLAY: 0x09,
    PAUSE: 0x0A,
    GET_STATUS: 0x0B,
    SET_PIXEL: 0x0C,
    CLEAR: 0x0D,
    SET_FRAME: 0x0E
});
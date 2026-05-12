/**
 * Constants for BonicBot controller
 */

// Partial UUID fragments used for substring matching against full BLE service UUIDs
export const BLE_SERVICE_FRAGMENTS = {
    CONTROL: '00010000',  // write characteristic lives here
    FEEDBACK: '00020000',  // motor/battery notify
    SERVO_FEEDBACK: '00030000' // servo notify
};

export const COMMAND_TYPES = {
    CMD_PING: 0x01,
    CMD_MOTOR_MOVE: 0x02,
    CMD_SERVO_SINGLE: 0x03,
    CMD_SERVO_GROUP: 0x04,
    CMD_MATRIX_ACTION: 0x05,
    CMD_HEAD_MODE: 0x05,        // same byte as matrix — firmware shares 0x05
    CMD_DATA_REQUEST: 0x07
};

export const RESPONSE_TYPES = {
    RESP_ACK: 0x50,
    RESP_BATTERY: 0x52,
    RESP_SERVO_FEEDBACK: 0x54,
    RESP_DISTANCE: 0x56,
    RESP_MOTOR_FEEDBACK: 0x57
};

export const SERVO_MAP = {
    'rightGripper': 1, 'rightWrist': 2, 'rightElbow': 3,
    'rightSholderYaw': 4, 'rightSholderRoll': 5, 'rightSholderPitch': 6,
    // Correctly-spelled aliases — controlHand() capitalises user keys so these are needed
    'rightShoulderYaw': 4, 'rightShoulderRoll': 5, 'rightShoulderPitch': 6,
    'leftGripper': 7, 'leftWrist': 8, 'leftElbow': 9,
    'leftSholderYaw': 10, 'leftSholderRoll': 11, 'leftSholderPitch': 12,
    'leftShoulderYaw': 10, 'leftShoulderRoll': 11, 'leftShoulderPitch': 12,
    'headPan': 13, 'headTilt': 14
};

export const ServoConstants = {
    DEFAULT_SPEED: 200,
    DEFAULT_ACC: 20,
    HEAD_PAN_MIN: -90.0, HEAD_PAN_MAX: 90.0,
    HEAD_TILT_MIN: -38.0, HEAD_TILT_MAX: 45.0
};
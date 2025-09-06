/**
 * Constants for BonicBot controller
 */

/**
 * Servo angle limits and default values
 */
export const ServoConstants = Object.freeze({
    // Default values
    DEFAULT_ANGLE: 0.0,
    DEFAULT_SPEED: 200.0,
    DEFAULT_ACCELERATION: 20.0,

    // Right hand limits
    RIGHT_GRIPPER_MIN: -90.0,
    RIGHT_GRIPPER_MAX: 90.0,
    RIGHT_WRIST_MIN: -90.0,
    RIGHT_WRIST_MAX: 90.0,
    RIGHT_ELBOW_MIN: -90.0,
    RIGHT_ELBOW_MAX: 0.0,
    RIGHT_SHOULDER_PITCH_MIN: -45.0,
    RIGHT_SHOULDER_PITCH_MAX: 180.0,
    RIGHT_SHOULDER_ROLL_MIN: -3.0,
    RIGHT_SHOULDER_ROLL_MAX: 144.0,
    RIGHT_SHOULDER_YAW_MIN: -90.0,
    RIGHT_SHOULDER_YAW_MAX: 90.0,

    // Left hand limits (same as right)
    LEFT_GRIPPER_MIN: -90.0,
    LEFT_GRIPPER_MAX: 90.0,
    LEFT_WRIST_MIN: -90.0,
    LEFT_WRIST_MAX: 90.0,
    LEFT_ELBOW_MIN: -90.0,
    LEFT_ELBOW_MAX: 0.0,
    LEFT_SHOULDER_PITCH_MIN: -45.0,
    LEFT_SHOULDER_PITCH_MAX: 180.0,
    LEFT_SHOULDER_ROLL_MIN: -3.0,
    LEFT_SHOULDER_ROLL_MAX: 144.0,
    LEFT_SHOULDER_YAW_MIN: -90.0,
    LEFT_SHOULDER_YAW_MAX: 90.0,

    // Head limits
    HEAD_PAN_MIN: -90.0,
    HEAD_PAN_MAX: 90.0,
    HEAD_TILT_MIN: -38.0,
    HEAD_TILT_MAX: 45.0
});
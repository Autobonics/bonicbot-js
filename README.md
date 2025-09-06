# BonicBot JavaScript Library

A comprehensive JavaScript library for controlling BonicBot humanoid robots via serial communication and WebSocket with sequence and camera support. Works in modern browsers and supports both ES6 modules and UMD builds.

## Features

- **🔌 Dual Communication**: WebSocket and Serial (Web Serial API) support
- **🤖 Full Robot Control**: All servos, base movement, head expressions
- **📸 Camera Support**: Image capture, streaming control
- **🎬 Sequence Control**: Play, pause, stop predefined sequences
- **🔊 Text-to-Speech**: Make your robot speak
- **📊 Real-time Monitoring**: Sensor data streaming and callbacks
- **🌐 Browser Compatible**: Works directly in web browsers
- **📦 Multiple Builds**: ESM, UMD, and minified versions

## Installation

```bash
npm install bonicbot
```

Or use directly in browser via CDN:

```html
<!-- Latest version -->
<script src="https://unpkg.com/bonicbot@latest/dist/index.umd.min.js"></script>

<!-- Specific version -->
<script src="https://unpkg.com/bonicbot@2.0.1/dist/index.umd.min.js"></script>
```

## Quick Start

### WebSocket Connection (Recommended)

```javascript
import { createWebSocketController, HeadModes } from 'bonicbot';

// Connect to robot
const robot = createWebSocketController('192.168.1.100', 8080);
await robot.connect();

// Basic movements
await robot.controlHead(45, 0); // Pan 45°, tilt 0°
await robot.moveForward(100, 2); // Move forward for 2 seconds
await robot.waveHello(); // Predefined wave gesture

// Text-to-speech
await robot.speak("Hello, I am BonicBot!");

// Set head expression
await robot.controlHead(null, null, HeadModes.HAPPY);

// Close connection
await robot.close();
```

### Serial Connection (Web Serial API)

```javascript
import { createSerialController } from 'bonicbot';

// Create controller (will prompt user for port selection)
const robot = createSerialController({ baudrate: 115200 });
await robot.connect();

// Control servos
await robot.controlServo('rightGripper', 45, 150);
await robot.moveBackward(80, 1.5);

await robot.close();
```

### Browser Script Tag Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>BonicBot Control</title>
</head>
<body>
    <button onclick="connectRobot()">Connect Robot</button>
    <button onclick="waveHello()">Wave Hello</button>
    <button onclick="speak()">Speak</button>

    <script src="https://unpkg.com/bonicbot@latest/dist/index.umd.min.js"></script>
    <script>
        let robot = null;

        async function connectRobot() {
            robot = BonicBot.createWebSocketController('localhost', 8080);
            await robot.connect();
            console.log('Robot connected!');
        }

        async function waveHello() {
            if (robot) {
                await robot.waveHello();
            }
        }

        async function speak() {
            if (robot) {
                await robot.speak('Hello from the browser!');
            }
        }
    </script>
</body>
</html>
```

## API Reference

### Controllers

#### WebSocketBonicBotController

The primary controller for full-featured robot communication.

```javascript
const robot = createWebSocketController('192.168.1.100', 8080);
```

**Key Methods:**
- `connect()` - Connect to robot
- `close()` - Close connection
- `controlServo(servoId, angle, speed?, acceleration?)` - Control individual servo
- `controlHead(pan?, tilt?, mode?, speed?)` - Control head movement and expression
- `controlRightHand(options)` / `controlLeftHand(options)` - Control hand servos
- `moveForward(speed, duration?)` / `moveBackward(speed, duration?)` - Base movement
- `turnLeft(speed, duration?)` / `turnRight(speed, duration?)` - Turning
- `speak(text)` - Text-to-speech
- `playSequence(name)` / `stopSequence()` - Sequence control
- `captureImage()` - Take photo
- `startSensorStream(type, interval)` - Stream sensor data

#### SerialBonicBotController

Basic robot control via Web Serial API.

```javascript
const robot = createSerialController({ baudrate: 115200 });
```

**Note:** Serial mode supports basic servo and movement control but not advanced features like sequences, camera, or TTS.

### Servo Control

```javascript
import { ServoID } from 'bonicbot';

// Individual servo control
await robot.controlServo(ServoID.RIGHT_GRIPPER, 45, 150);
await robot.controlServo(ServoID.HEAD_PAN, -30);

// Hand control (all servos at once)
await robot.controlRightHand({
    shoulderPitch: 90,
    shoulderYaw: 45,
    elbow: -45,
    wrist: 30,
    gripper: 60,
    speed: 150
});

// Individual servo methods
await robot.controlRightGripper(45, 150);
await robot.controlLeftShoulder(90);
await robot.controlHeadPan(-30);
```

### Movement Control

```javascript
// Basic movements
await robot.moveForward(100);        // Continuous forward
await robot.moveForward(100, 2);     // Forward for 2 seconds
await robot.moveBackward(80, 1.5);   // Backward for 1.5 seconds
await robot.turnLeft(60, 3);         // Turn left for 3 seconds
await robot.stopMovement();          // Stop all movement

// Custom base control
await robot.controlBase({
    leftMotorSpeed: 100,
    rightMotorSpeed: 50,  // Gradual right turn
    motorType: 'GearMotor'
});
```

### Sequences

```javascript
// List available sequences
const sequences = await robot.getSequences();
console.log('Available sequences:', sequences);

// Play sequence
await robot.playSequence('wave_sequence');
await robot.playSequence(null, 'seq_001'); // By ID

// Control playback
await robot.pauseSequence();
await robot.resumeSequence();
await robot.stopSequence();
await robot.jumpToStep(5);

// Monitor sequence status
const status = await robot.getSequenceStatus();
console.log('Playing:', status.isPlaying);
console.log('Progress:', status.playbackProgress);
```

### Camera Control

```javascript
// Capture single image
const image = await robot.captureImage();
if (image) {
    // Display in img element
    document.getElementById('robot-view').src = image.toDataURL();
    
    // Download image
    image.download('robot-selfie.jpg');
}

// Video streaming
await robot.startCameraStream();
const status = await robot.getCameraStatus();
console.log('Stream URL:', status.streamUrl);
await robot.stopCameraStream();
```

### Sensor Monitoring

```javascript
// Register sensor listeners
robot.registerSensorListener('battery', 'battery-monitor', (data) => {
    console.log(`Battery: ${data.soc}%`);
    if (data.soc < 20) {
        console.warn('Low battery!');
    }
});

// Start continuous monitoring
await robot.startSensorStream('battery', 5000); // Every 5 seconds
await robot.startSensorStream('distance', 200); // Every 200ms

// Get latest readings
const battery = robot.getBatteryStatus();
const distance = robot.getDistanceReading();

// Sensor types: 'battery', 'leftHand', 'rightHand', 'head', 'base', 'distance'
```

### High-Level Actions

```javascript
// Predefined gestures
await robot.waveHello(true);  // Right hand wave
await robot.waveHello(false); // Left hand wave
await robot.lookAround();     // Look around sequence
await robot.resetToHomePosition(); // Return to neutral pose

// Gripper control
await robot.openGripper(true);  // Open right gripper
await robot.closeGripper(false); // Close left gripper

// Head expressions
import { HeadModes } from 'bonicbot';
await robot.setHeadMode(HeadModes.HAPPY);
await robot.setHeadMode(HeadModes.SURPRISED);
```

## Servo Reference

### Servo IDs and Ranges

| Servo | ID | Range | Description |
|-------|----|---------|----|
| Right Gripper | `rightGripper` | -90° to 90° | Right hand gripper |
| Right Wrist | `rightWrist` | -90° to 90° | Right wrist rotation |
| Right Elbow | `rightElbow` | -90° to 0° | Right elbow bend |
| Right Shoulder Pitch | `rightSholderPitch` | -45° to 180° | Right shoulder up/down |
| Right Shoulder Yaw | `rightSholderYaw` | -90° to 90° | Right shoulder left/right |
| Right Shoulder Roll | `rightSholderRoll` | -3° to 144° | Right shoulder roll |
| Left Gripper | `leftGripper` | -90° to 90° | Left hand gripper |
| Left Wrist | `leftWrist` | -90° to 90° | Left wrist rotation |
| Left Elbow | `leftElbow` | -90° to 0° | Left elbow bend |
| Left Shoulder Pitch | `leftSholderPitch` | -45° to 180° | Left shoulder up/down |
| Left Shoulder Yaw | `leftSholderYaw` | -90° to 90° | Left shoulder left/right |
| Left Shoulder Roll | `leftSholderRoll` | -3° to 144° | Left shoulder roll |
| Head Pan | `headPan` | -90° to 90° | Head left/right |
| Head Tilt | `headTilt` | -38° to 45° | Head up/down |

### Head Expression Modes

- `HeadModes.NONE` - Default expression
- `HeadModes.NORMAL` - Neutral expression
- `HeadModes.HAPPY` - Happy expression
- `HeadModes.SAD` - Sad expression
- `HeadModes.ANGRY` - Angry expression
- `HeadModes.SURPRISED` - Surprised expression
- `HeadModes.CONFUSED` - Confused expression

## Browser Compatibility

### Web Serial API Support

The serial communication requires the Web Serial API, which is supported in:
- ✅ Chrome 89+
- ✅ Edge 89+
- ✅ Opera 75+
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

```javascript
import { isSerialSupported } from 'bonicbot';

if (isSerialSupported()) {
    console.log('Serial communication available');
} else {
    console.log('Use WebSocket communication instead');
}
```

### WebSocket Support

WebSocket communication works in all modern browsers.

```javascript
import { isWebSocketSupported } from 'bonicbot';

console.log('WebSocket supported:', isWebSocketSupported());
```

## Error Handling

```javascript
try {
    const robot = createWebSocketController('192.168.1.100', 8080);
    await robot.connect();
    
    // Robot operations
    await robot.speak('Hello World');
    
} catch (error) {
    console.error('Robot error:', error);
} finally {
    if (robot) {
        await robot.close();
    }
}
```

## Examples

Check out the `examples/` directory for complete working examples:

- `basic-control.html` - Basic robot control in browser
- `sequence-demo.html` - Sequence playback and control
- `sensor-monitoring.html` - Real-time sensor monitoring
- `camera-capture.html` - Camera capture and streaming
- `serial-control.html` - Serial communication example

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT License - see LICENSE file for details.

## Support

- 📧 Email: shahir@autobonics.com
- 🐛 Issues: [GitHub Issues](https://github.com/autobonics/bonicbot-js/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/autobonics/bonicbot-js/wiki)

## Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

---

Made with ❤️ for the robotics community
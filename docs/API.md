# BonicBot JavaScript API Documentation v3.0.0

## Overview

The `bonicbot` JavaScript library provides a unified interface for controlling BonicBot humanoid robots, working identically in **Browsers** (Chrome, Edge) and **Node.js**.

### Architecture
- **Direct BLE Control**: Hardware commands sent as binary packets over BLE.
- **App Bridge (WebSocket)**: Speech, Sequences, and Camera routed through the BonicBot Android app.

---

## BonicBotController

### Constructor
```javascript
new BonicBotController(deviceName, wsHost = null, wsPort = 8080)
```
- `deviceName` — BLE name of the robot (e.g. `"BonicBot-S1"`).
- `wsHost` — (Optional) IP of the Android device for App Bridge features.
- `wsPort` — (Optional) WebSocket port (default: `8080`).

### Lifecycle

| Method | Returns | Description |
|--------|---------|-------------|
| `async connect()` | `boolean` | Connect BLE (and WebSocket if `wsHost` set). |
| `async close()` | — | Disconnect all services. |
| `async disconnect()` | — | Alias for `close()`. |
| `get isConnected` | `boolean` | BLE connection state. |

---

## Hardware Control (BLE)

### Base Movement

| Method | Default speed | Description |
|--------|--------------|-------------|
| `async moveForward(speed=100, duration=null)` | 100 | Move forward. |
| `async moveBackward(speed=100, duration=null)` | 100 | Move backward. |
| `async turnLeft(speed=80, duration=null)` | 80 | Rotate counter-clockwise. |
| `async turnRight(speed=80, duration=null)` | 80 | Rotate clockwise. |
| `async stopMovement()` | — | Stop all base motors. |

`duration` (seconds) — if provided, sends a stop command automatically after the duration.

### Servo Control

#### `async controlServo(servoId, angle, speed = 200, acc = 20)`
- `servoId` — String key (e.g. `"headPan"`) or numeric physical ID.
- `angle` — Target angle in degrees.

### Head Control

#### `async controlHead(pan = null, tilt = null, mode = null, speed = 200)`
- `pan` — Pan angle (−90 to 90).
- `tilt` — Tilt angle (−38 to 45).
- `mode` — Head mode string from `HeadModes` (e.g. `HeadModes.HAPPY`).
- `speed` — Movement speed.

### Hand Control

#### `async controlHand(side, angles = {})`
- `side` — `"left"` or `"right"`.
- `angles` — Object with any of: `gripper`, `wrist`, `elbow`, `shoulderPitch`, `shoulderYaw`, `shoulderRoll`, `speed`, `acc`.

#### `async controlLeftHand(angles)` / `async controlRightHand(angles)`
Convenience wrappers for `controlHand`.

### Gestures

| Method | Description |
|--------|-------------|
| `async waveHello(speed=150)` | Raises right arm and waves. |
| `async lookAround(speed=100)` | Pans head left, right, then centres. |
| `async resetToHomePosition(speed=100)` | Returns head and both hands to neutral. |

### LED Matrix

| Method | Description |
|--------|-------------|
| `async setDisplayText(text)` | Scroll text on the LED matrix. |
| `async setDisplayColor(r, g, b)` | Set matrix colour (0–255 each). |
| `async setDisplayAnimation(mode)` | Set animation mode ID. |
| `async setDisplayBrightness(val)` | Set brightness (uint32). |
| `async setDisplaySpeed(val)` | Set animation speed (uint32). |
| `async playDisplayAnimation()` | Play the current animation. |
| `async pauseDisplayAnimation()` | Pause the current animation. |
| `async clearDisplay()` | Clear all LEDs. |
| `async setDisplayPixel(x, y, r, g, b)` | Set a single pixel. |
| `async setDisplayFrame(data)` | Send a full 252-byte `Uint8Array` frame. |

### Sensor Streaming

| Method | Description |
|--------|-------------|
| `readBattery()` | Request a single battery reading. |
| `readDistance()` | Request a single distance reading. |
| `startBatteryStream(interval=1000, callback=null)` | Stream battery at `interval` ms. |
| `startDistanceStream(interval=200, callback=null)` | Stream distance at `interval` ms. |
| `registerSensorListener(type, id, callback)` | Register a callback for sensor data. |

Sensor types: `"battery"`, `"distance"`, `"leftHand"`, `"rightHand"`, `"head"`, `"base"`.

---

## App Bridge Features (WebSocket)

> Requires `wsHost` set and the BonicBot app running.

### Speech
| Method | Description |
|--------|-------------|
| `async speak(text)` | Android TTS. |

### Sequences
| Method | Description |
|--------|-------------|
| `async getSequences()` | Returns array of sequence objects from the app. |
| `async playSequence(name=null, id=null)` | Play sequence by name or ID. |
| `async stopSequence()` | Stop playback. |
| `async pauseSequence()` | Pause playback. |
| `async resumeSequence()` | Resume playback. |
| `async jumpToStep(index)` | Jump to a specific step. |
| `getSequenceStatus()` | Returns current `SequenceStatus` object. |

### Camera
| Method | Description |
|--------|-------------|
| `async startCameraStream()` | Start MJPEG stream on the Android device. |
| `async stopCameraStream()` | Stop MJPEG stream. |
| `getCameraStatus()` | Returns current `CameraStatus` object. |
| `async captureImage()` | Returns a `CapturedImage` object (JPEG snapshot). |

---

## Data Models

### BatteryReading
```javascript
{ voltage: number, current: number, soc: number }
```

### SequenceStatus
```javascript
{ isPlaying: boolean, isPaused: boolean, currentSequence: string|null,
  currentStep: number, totalSteps: number, playbackProgress: number }
```

### CameraStatus
```javascript
{ isStreaming: boolean, isInitialized: boolean, streamUrl: string|null }
```

### CapturedImage
- `imageData` — Base64 string.
- `format` — `"jpeg"`.
- `timestamp` — ISO string.
- `download(filename)` — Triggers file download (Browser only).

---

## Error Handling

- **`Error`** thrown if `playSequence()` is called with no `name` or `id`.
- **`Error`** thrown if any App Bridge method is called without a connected bridge.

---

## Complete Example

```javascript
import { BonicBotController, HeadModes } from 'bonicbot';

const bot = new BonicBotController("BonicBot-S1", "192.168.1.100");

if (await bot.connect()) {
    await bot.controlHead(0, 0, HeadModes.HAPPY);
    await bot.waveHello();
    await bot.speak("Hello! I am ready.");

    bot.startBatteryStream(1000, (data) => console.log(`Battery: ${data.soc}%`));

    await new Promise(r => setTimeout(r, 5000));
    await bot.close();
}
```

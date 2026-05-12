# BonicBot JavaScript Library 🤖

[![npm version](https://badge.fury.io/js/bonicbot.svg)](https://www.npmjs.com/package/bonicbot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The official JavaScript library for controlling **BonicBot** humanoid robots. Designed for high-performance, low-latency interactions in both **Web Browsers** and **Node.js** environments.

---

## 🚀 Unified Architecture

Version 3.0 introduces a unified communication model:
1.  **Direct BLE (Hardware)**: Connect directly to the robot's Bluetooth for zero-latency control of 14+ servos, base motors, and the 8x8 LED matrix.
2.  **WebSocket Bridge (Software)**: Connect to the BonicBot Android App to leverage the device's processing power for Text-to-Speech (TTS), complex motion sequences, and camera streaming.

---

## 📦 Installation

```bash
npm install bonicbot
```

### Environment Support
- **Browsers**: Chrome, Edge, Opera (supports native Web Bluetooth).
- **Node.js**: Windows, macOS, Linux (via `@abandonware/noble`).
- **Frameworks**: React, Vue, Angular, Svelte, etc.

---

## 💻 Quick Start

### Browser Usage (React/Vue/HTML)
Due to browser security, `.connect()` must be called from a user-initiated event (like a button click).

```javascript
import { BonicBotController } from 'bonicbot';

// Initialize with BLE name and optional App IP
const bot = new BonicBotController("BonicBot-S1", "192.168.1.100");

async function handleConnect() {
    const success = await bot.connect();
    if (success) {
        await bot.speak("System online!");
        await bot.controlHead(30, -10);
    }
}
```

### Node.js Usage
```javascript
import { BonicBotController } from 'bonicbot';

const bot = new BonicBotController("BonicBot-S1");

(async () => {
    if (await bot.connect()) {
        await bot.moveForward(100, 2); // Speed 100 for 2 seconds
        await bot.close();
    }
})();
```

---

## 🛠️ Key API Features

| Feature | Method | Platform |
| :--- | :--- | :--- |
| **Movement** | `moveForward()`, `turnLeft()`, `stop()` | BLE |
| **Servos** | `controlServo()`, `controlHead()`, `controlHand()` | BLE |
| **LED Matrix** | `setDisplayText()`, `setDisplayColor()` | BLE |
| **Speech** | `speak("Hello")` | App Bridge |
| **Vision** | `captureImage()` | App Bridge |
| **Sequences** | `playSequence("Dance")` | App Bridge |

---

## 📄 Documentation

For the full API reference, data models, and advanced usage, see the [API Documentation](docs/API.md).

## 🎨 Examples

Explore the [examples/](examples/) directory for:
- `basic_control.html`: Comprehensive dashboard.
- `sensor-monitoring.html`: Real-time telemetry charts.
- `camera-capture.html`: Robot vision and snapshots.

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit Pull Requests or open Issues on our GitHub repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

© 2026 **Autobonics Team** - admin@autobonics.com
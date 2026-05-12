# BonicBot JavaScript Project Structure v3.0

## 📁 Repository Overview

```text
bonicbot-js/
├── dist/               # Compiled bundles (ESM, UMD)
├── docs/               # Detailed API documentation
│   └── API.md          # Unified Controller Reference
├── examples/           # Web-based control dashboards
│   ├── basic_control.html
│   ├── camera-capture.html
│   ├── sensor-monitoring.html
│   └── sequence-demo.html
├── src/                # Core library source code
│   ├── transports/     # Platform abstraction layer
│   │   ├── ble.js      # Web Bluetooth / Noble logic
│   │   └── websocket.js # Bridge communication
│   ├── constants.js    # BLE UUIDs and Command Codes
│   ├── controller.js   # Unified BonicBotController
│   ├── enums.js        # IDs, Modes, and Actions
│   ├── index.js        # Package entry point
│   └── types.js        # Data models (Battery, Sequence)
├── tests/              # Jest test suite
│   ├── controller.test.js
│   └── setup.js        # BLE/WS Mocks
├── package.json        # Dependencies and scripts
└── rollup.config.mjs   # Bundle configuration
```

---

## 🏗️ Architecture: Unified Communication

The library is designed around a single, environment-aware controller that manages two primary communication channels:

### 1. Direct BLE (Hardware Tier)
Controls the low-level robotics hardware using a custom binary protocol (`0xAA 0x55` frame).
- **Transports**: Uses `navigator.bluetooth` in browsers and `@abandonware/noble` in Node.js.
- **Capabilities**: Motor movement, Servo positioning (14+ channels), LED Matrix control, and Sensor feedback.

### 2. App Bridge (Logic Tier)
Delegates high-level computational tasks to the BonicBot Android app via WebSockets.
- **Transports**: Standard WebSockets (browser) or `ws` (Node.js).
- **Capabilities**: Text-to-Speech (TTS), MJPEG Camera streaming, and complex Motion Sequences.

---

## 💻 Usage Patterns

### Direct Hardware Control (BLE Only)
```javascript
import { BonicBotController } from 'bonicbot';

const bot = new BonicBotController('BonicBot-S1');
await bot.connect();
await bot.moveForward(100, 2); // 2-second movement
```

### Full Integration (BLE + App Bridge)
```javascript
const bot = new BonicBotController('BonicBot-S1', '192.168.1.100');
await bot.connect();
await bot.speak('System online');
await bot.playSequence('Dance');
```

---

## 🛠️ Development & Build

- **Build**: `npm run build` (Generates files in `/dist`)
- **Lint**: `npm run lint`
- **Test**: `npm test` (Uses Jest with BLE mocks)

---

## 📜 License
MIT © 2026 Autobonics Team
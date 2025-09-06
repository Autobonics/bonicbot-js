# BonicBot JavaScript Library - Complete NPM Package

This is a complete, production-ready npm package for controlling BonicBot humanoid robots in web browsers. The library has been converted from the original Python library to provide browser-native robot control.

## 📁 Project Structure

```
bonicbot-js/
├── src/                          # Source code
│   ├── index.js                  # Main entry point and exports
│   ├── controller.js             # Core controller classes
│   ├── enums.js                  # Enumerations (ServoID, HeadModes, etc.)
│   ├── constants.js              # Constants (servo limits, defaults)
│   └── types.js                  # Data types and classes
│
├── dist/                         # Built files (generated)
│   ├── index.esm.js              # ES module build
│   ├── index.umd.js              # UMD build for browsers
│   ├── index.umd.min.js          # Minified UMD build
│   └── index.d.ts                # TypeScript definitions
│
├── tests/                        # Test files
│   ├── setup.js                  # Jest test environment setup
│   └── controller.test.js        # Controller tests
│
├── examples/                     # Working HTML examples
│   ├── basic-control.html        # Basic robot control interface
│   ├── sequence-demo.html        # Sequence playback and control
│   ├── sensor-monitoring.html    # Real-time sensor monitoring
│   └── camera-capture.html       # Camera capture and streaming
│
├── package.json                  # NPM package configuration
├── rollup.config.js              # Build configuration
├── jest.config.js                # Test configuration
├── babel.config.js               # Babel transpilation config
├── .eslintrc.js                  # Code linting rules
├── .gitignore                    # Git ignore patterns
├── .npmignore                    # NPM publish ignore patterns
├── README.md                     # Comprehensive documentation
├── CHANGELOG.md                  # Version history
├── LICENSE                       # MIT license
└── PROJECT-STRUCTURE.md          # This file
```

## 🚀 Quick Start

### 1. Setup Development Environment

```bash
# Initialize the project
mkdir bonicbot-js && cd bonicbot-js
npm init -y

# Install dependencies
npm install --save-dev @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-terser rollup eslint jest @babel/preset-env babel-jest

# Create all the files as shown in the artifacts above
```

### 2. Build the Library

```bash
# Development build (with watching)
npm run dev

# Production build
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### 3. Test Locally

Open any of the example HTML files in a web browser to test the library:

```bash
# Serve examples locally (optional)
npx http-server examples/
```

### 4. Publish to NPM

```bash
# Login to NPM
npm login

# Publish package
npm publish
```

## 📋 Features Implemented

### ✅ Core Robot Control
- **Servo Control**: All 14 servos with angle validation
- **Head Control**: Pan, tilt, and expression modes
- **Hand Control**: Individual and composite hand control
- **Base Movement**: Forward, backward, turning, stopping
- **High-level Actions**: Wave, look around, reset position

### ✅ Advanced Features (WebSocket)
- **Sequence Control**: Play, pause, stop, jump to step
- **Camera Control**: Image capture, streaming control
- **Text-to-Speech**: Make robot speak
- **Sensor Monitoring**: Real-time data with callbacks
- **Battery Monitoring**: Voltage, current, charge level
- **Distance Sensing**: Proximity detection
- **Error Detection**: Servo errors and temperature monitoring

### ✅ Browser Compatibility
- **WebSocket**: All modern browsers
- **Serial API**: Chrome 89+, Edge 89+, Opera 75+
- **Graceful Degradation**: Features check availability
- **TypeScript Support**: Full type definitions

### ✅ Developer Experience
- **Multiple Build Formats**: ESM, UMD, minified
- **Working Examples**: 4 complete HTML demos
- **Comprehensive Testing**: Jest test suite
- **Code Quality**: ESLint configuration
- **Documentation**: Detailed README and API docs

## 🔧 Usage Examples

### Browser Script Tag
```html
<script src="https://unpkg.com/bonicbot@2.0.1/dist/index.umd.min.js"></script>
<script>
  const robot = BonicBot.createWebSocketController('192.168.1.100', 8080);
  robot.connect().then(() => {
    robot.speak('Hello from the browser!');
    robot.waveHello();
  });
</script>
```

### ES6 Modules
```javascript
import { createWebSocketController, HeadModes } from 'bonicbot';

const robot = createWebSocketController('localhost', 8080);
await robot.connect();
await robot.controlHead(45, 0, HeadModes.HAPPY);
await robot.speak('Hello World!');
await robot.close();
```

### Node.js (for testing/development)
```javascript
const { createWebSocketController } = require('bonicbot');

async function controlRobot() {
  const robot = createWebSocketController('192.168.1.100', 8080);
  await robot.connect();
  await robot.moveForward(100, 2);
  await robot.close();
}
```

## 🧪 Testing

The package includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- controller.test.js

# Watch mode for development
npm test -- --watch
```

Test coverage includes:
- WebSocket controller functionality
- Serial controller functionality
- Servo angle validation
- Error handling
- Browser compatibility checks
- High-level robot actions

## 📦 Package Contents

When published to NPM, the package includes:

- **`dist/`** - Built JavaScript files (ESM, UMD, minified)
- **`dist/index.d.ts`** - TypeScript definitions
- **`README.md`** - Documentation
- **`LICENSE`** - MIT license
- **`package.json`** - Package metadata

Files excluded from NPM package (via `.npmignore`):
- Source files (`src/`)
- Tests (`tests/`)
- Examples (`examples/`)
- Configuration files
- Development dependencies

## 🌐 CDN Usage

The library will be available via CDN once published:

```html
<!-- Latest version -->
<script src="https://unpkg.com/bonicbot@latest/dist/index.umd.min.js"></script>

<!-- Specific version -->
<script src="https://unpkg.com/bonicbot@2.0.1/dist/index.umd.min.js"></script>

<!-- ES module via CDN -->
<script type="module">
  import { createWebSocketController } from 'https://unpkg.com/bonicbot@latest/dist/index.esm.js';
</script>
```

## 🔄 Development Workflow

1. **Make Changes**: Edit files in `src/`
2. **Test**: Run `npm test` to ensure functionality
3. **Lint**: Run `npm run lint` to check code quality
4. **Build**: Run `npm run build` to create distribution files
5. **Test Examples**: Open HTML files to test in browser
6. **Version**: Update version in `package.json`
7. **Publish**: Run `npm publish` to release

## 🤝 Contributing

To contribute to this library:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

- **Documentation**: See README.md for detailed API reference
- **Examples**: Check the `examples/` directory for working demos
- **Issues**: Report bugs and request features via GitHub issues
- **Email**: shahir@autobonics.com

## 📄 License

MIT License - see LICENSE file for details.

---

**Note**: This library requires a BonicBot robot with WebSocket server capability for full functionality. Serial communication requires a browser with Web Serial API support (Chrome 89+, Edge 89+, Opera 75+).
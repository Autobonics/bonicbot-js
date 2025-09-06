# Changelog

All notable changes to the BonicBot JavaScript library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial development setup

## [2.0.1] - 2024-12-17
## [2.0.4] - 2025-09-05

### Added
- Initial release of BonicBot JavaScript library
- WebSocket communication support for full robot control
- Serial communication support via Web Serial API
- Complete servo control with angle validation
- Head expression modes and control
- Base movement control (forward, backward, turning)
- Sequence control (play, pause, stop, jump to step)
- Camera capture and streaming control
- Text-to-speech functionality
- Real-time sensor monitoring with callbacks
- Battery status monitoring
- Distance sensor support
- Servo temperature and error monitoring
- High-level convenience methods (wave, look around, reset position)
- Comprehensive example HTML pages
- TypeScript definitions
- Browser compatibility checks

### Features
- **Communication Types**: WebSocket and Serial (Web Serial API)
- **Robot Control**: Full servo control, movement, head expressions
- **Advanced Features**: Sequences, camera, TTS, sensor monitoring
- **Browser Support**: Modern browsers with WebSocket and optional Serial API
- **Developer Experience**: TypeScript support, comprehensive examples, detailed documentation

### Browser Compatibility
- **WebSocket**: All modern browsers
- **Serial**: Chrome 89+, Edge 89+, Opera 75+
- **Fallback**: Graceful degradation when features unavailable

### Examples Included
- `basic-control.html` - Basic robot control interface
- `sequence-demo.html` - Sequence playback and control
- `sensor-monitoring.html` - Real-time sensor monitoring
- `camera-capture.html` - Camera capture and streaming

### Technical Details
- ES6 modules with UMD build for browser compatibility
- Rollup build system with multiple output formats
- ESLint configuration for code quality
- Jest testing framework setup
- Comprehensive TypeScript definitions
- MIT License

### Installation
```bash
npm install bonicbot
```

### CDN Usage
```html
<script src="https://unpkg.com/bonicbot@2.0.4/dist/index.umd.min.js"></script>
```

---

## Release Notes

### v2.0.4 - Initial JavaScript Release

This is the first JavaScript/browser version of the BonicBot library. It provides comprehensive robot control capabilities directly in web browsers.

**Key Highlights:**
- 🌐 **Browser-First**: Designed specifically for web applications
- 🔌 **Dual Communication**: WebSocket (recommended) and Serial API support  
- 🤖 **Complete Control**: All robot features accessible via clean JavaScript API
- 📱 **Responsive Examples**: Ready-to-use HTML control interfaces
- 🛡️ **Type Safe**: Full TypeScript definitions included
- ⚡ **Performance**: Optimized builds for fast loading

**Migration from Python Library:**
- Similar API structure for easy migration
- Enhanced browser-specific features
- Improved error handling and validation
- Better async/await patterns
- Real-time monitoring capabilities

**Getting Started:**
```javascript
import { createWebSocketController } from 'bonicbot';

const robot = createWebSocketController('192.168.1.100', 8080);
await robot.connect();
await robot.speak('Hello from JavaScript!');
await robot.waveHello();
await robot.close();
```

For detailed documentation and examples, see the [README.md](README.md) file.
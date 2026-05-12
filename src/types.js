/**
 * Data types and models for BonicBot
 */

export class BatteryReading {
    constructor(voltage = 0, current = 0, soc = 0, temperature = 0, hasError = false) {
        this.voltage = voltage;
        this.current = current;
        this.soc = soc;
        this.temperature = temperature;
        this.hasError = hasError;
    }
}

export class SequenceInfo {
    constructor(data = {}) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.stepCount = data.stepCount || 0;
        this.duration = data.duration || 0;
        this.isLoop = data.isLoop || false;
    }
}

export class SequenceStatus {
    constructor(data = {}) {
        this.isPlaying = data.isPlaying || false;
        this.isPaused = data.isPaused || false;
        this.currentSequence = data.currentSequence || null;
        this.currentStep = data.currentStep || 0;
        this.totalSteps = data.totalSteps || 0;
        this.playbackProgress = data.playbackProgress || 0.0;
    }
}

export class CameraStatus {
    constructor(data = {}) {
        this.isStreaming = data.isStreaming || false;
        this.isInitialized = data.isInitialized || false;
        this.connectedClients = data.connectedClients || 0;
        this.streamUrl = data.streamUrl || null;
    }
}

export class CapturedImage {
    constructor(imageData, format = 'jpeg', timestamp = null) {
        this.imageData = imageData; // Base64
        this.format = format;
        this.timestamp = timestamp || new Date().toISOString();
    }

    /**
     * Download image (Browser only)
     */
    download(filename = 'bonicbot-capture.jpg') {
        if (typeof document === 'undefined') return;
        const link = document.createElement('a');
        link.href = `data:image/${this.format};base64,${this.imageData}`;
        link.download = filename;
        link.click();
    }
}
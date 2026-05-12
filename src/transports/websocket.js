/**
 * Platform-agnostic WebSocket Transport
 * Uses native WebSocket in Browser and 'ws' in Node.js
 */

class WebSocketTransport {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.url = `ws://${host}:${port}/control`;
        this.socket = null;
        this.connected = false;
        this.onMessage = null;
    }

    async connect() {
        let WS;
        if (typeof window !== 'undefined' && window.WebSocket) {
            WS = window.WebSocket;
        } else {
            WS = (await import('ws')).default;
        }

        return new Promise((resolve) => {
            try {
                this.socket = new WS(this.url);
                this.socket.onopen = () => {
                    this.connected = true;
                    resolve(true);
                };
                this.socket.onmessage = (event) => {
                    if (this.onMessage) {
                        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                        this.onMessage(data);
                    }
                };
                this.socket.onclose = () => {
                    this.connected = false;
                };
                this.socket.onerror = (error) => {
                    console.error('WebSocket Error:', error);
                    resolve(false);
                };

                // Safety timeout
                setTimeout(() => resolve(false), 5000);
            } catch (error) {
                console.error('WebSocket Connection Failed:', error);
                resolve(false);
            }
        });
    }

    send(data) {
        if (!this.connected || !this.socket) return false;
        try {
            const message = typeof data === 'object' ? JSON.stringify(data) : data;
            this.socket.send(message);
            return true;
        } catch (error) {
            console.error('WebSocket Send Failed:', error);
            return false;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.connected = false;
    }
}

export default WebSocketTransport;

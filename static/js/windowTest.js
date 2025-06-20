export class TestWindow {
    constructor() {
        this.socket = null;
    }

    // Initialize WebSocket and set up event listeners
    initSocket() {
        // Initialize WebSocket connection (you would replace 'your-server-url' with the actual server URL)
        this.socket = new WebSocket('http://192.168.1.27:5000/');

        // Event listener for when the WebSocket is opened
        this.socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        // Event listener for when a message is received from the server
        this.socket.onmessage = (event) => {
            console.log('Message from server:', event.data);
        };

        // Event listener for when the WebSocket is closed
        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Event listener for when there's an error with the WebSocket
        this.socket.onerror = (error) => {
            console.log('WebSocket Error:', error);
        };
    }

    // Send a message to the server (can be used to notify server before the page unloads)
    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.log('Socket is not open');
        }
    }

    // Clean up the WebSocket connection
    closeSocket() {
        if (this.socket) {
            this.socket.close();
        }
    }

    // Handle page unload or window close event
    handleUnload() {
        window.addEventListener('beforeunload', (event) => {
            console.log('Window is about to close');
            this.sendMessage('User is leaving the page');
        });
    }
}

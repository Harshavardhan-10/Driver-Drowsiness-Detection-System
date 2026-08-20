/**
 * WebSocket Service
 * 
 * Handles real-time WebSocket communication with the FastAPI backend
 * for sending video frames and receiving drowsiness detection results.
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = '';
    this.isConnected = false;
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.openHandlers = [];
    this.closeHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.manualClose = false;
  }

  /**
   * Establish WebSocket connection to backend
   * 
   * @param {string} endpoint - WebSocket endpoint (e.g., '/ws/detect')
   * @param {Function} onMessage - Callback for incoming messages
   * @param {Function} onError - Callback for errors
   * @param {Function} onOpen - Callback for connection open
   * @param {Function} onClose - Callback for connection close
   * @returns {Promise<void>}
   */
  connect(endpoint = '/ws/detect', onMessage, onError, onOpen, onClose) {
    return new Promise((resolve, reject) => {
      try {
        // Determine backend URL (support both development and production)
        // Production: set VITE_API_URL at build time, e.g. https://drowsiness-api.onrender.com
        const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
        const protocol = apiUrl.startsWith('https:') ? 'wss:' : 'ws:';
        const host = apiUrl.replace(/^https?:\/\//, '');
        this.url = `${protocol}//${host}${endpoint}`;

        console.log(`[WebSocket] Connecting to: ${this.url}`);
        this.manualClose = false;
        // Create WebSocket instance
        this.ws = new WebSocket(this.url);

        // Register message handler
        if (onMessage) {
          this.messageHandlers.push(onMessage);
        }

        // Register error handler
        if (onError) {
          this.errorHandlers.push(onError);
        }

        // Register open handler
        if (onOpen) {
          this.openHandlers.push(onOpen);
        }

        // Register close handler
        if (onClose) {
          this.closeHandlers.push(onClose);
        }

        /**
         * WebSocket onopen event
         */
        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('[WebSocket] Connected successfully');
          
          // Call all registered open handlers
          this.openHandlers.forEach(handler => {
            try {
              handler();
            } catch (error) {
              console.error('[WebSocket] Error in onOpen handler:', error);
            }
          });

          resolve();
        };

        /**
         * WebSocket onmessage event
         */
        this.ws.onmessage = (event) => {
          console.log("RAW MESSAGE:", event.data);
          try {
            const data = JSON.parse(event.data);
            console.log("PARSED DATA:", data);
            // Call all registered message handlers
            this.messageHandlers.forEach(handler => {
              try {
                handler(data);
              } catch (error) {
                console.error('[WebSocket] Error in message handler:', error);
              }
            });
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        /**
         * WebSocket onerror event
         */
        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          
          // Call all registered error handlers
          this.errorHandlers.forEach(handler => {
            try {
              handler(error);
            } catch (e) {
              console.error('[WebSocket] Error in error handler:', e);
            }
          });

          reject(error);
        };

        /**
         * WebSocket onclose event
         */
        this.ws.onclose = (event) => {
          this.isConnected = false;
          console.log('[WebSocket] Connection closed');
          
          // Call all registered close handlers
          this.closeHandlers.forEach(handler => {
            try {
              handler(event);
            } catch (error) {
              console.error('[WebSocket] Error in onClose handler:', error);
            }
          });

          if (!this.manualClose) {
            // Attempt to reconnect
            this._attemptReconnect(endpoint, onMessage, onError, onOpen, onClose);
          }
        };

      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect to WebSocket
   * @private
   */
  _attemptReconnect(endpoint, onMessage, onError, onOpen, onClose) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`
      );

      setTimeout(() => {
        this.connect(endpoint, onMessage, onError, onOpen, onClose).catch(
          error => console.error('[WebSocket] Reconnection failed:', error)
        );
      }, this.reconnectDelay);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
    }
  }

  /**
   * Send image frame to backend
   * 
   * @param {string} frameData - Base64 encoded image frame
   * @returns {boolean} - True if sent successfully, false otherwise
   */
  sendFrame(frameData) {
    if (!this.isConnected || !this.ws) {
      console.warn('[WebSocket] Not connected, cannot send frame');
      return false;
    }

    try {
      const message = {
        frame: frameData,
        timestamp: Date.now()
      };

      console.log("Sending frame", frameData?.length);
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending frame:', error);
      return false;
    }
  }

  /**
   * Send custom message to backend
   * 
   * @param {object} data - Data to send
   * @returns {boolean} - True if sent successfully, false otherwise
   */
  send(data) {
    if (!this.isConnected || !this.ws) {
      console.warn('[WebSocket] Not connected, cannot send message');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
      return false;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.ws) {
      console.log('[WebSocket] Disconnecting...');
      this.manualClose = true;
      this.isConnected = false;
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get connection status
   * 
   * @returns {boolean} - True if connected, false otherwise
   */
  getStatus() {
    return this.isConnected;
  }

  /**
   * Register a message handler
   * 
   * @param {Function} handler - Callback function
   */
  onMessage(handler) {
    if (typeof handler === 'function') {
      this.messageHandlers.push(handler);
    }
  }

  /**
   * Register an error handler
   * 
   * @param {Function} handler - Callback function
   */
  onError(handler) {
    if (typeof handler === 'function') {
      this.errorHandlers.push(handler);
    }
  }

  /**
   * Register an open handler
   * 
   * @param {Function} handler - Callback function
   */
  onOpen(handler) {
    if (typeof handler === 'function') {
      this.openHandlers.push(handler);
    }
  }

  /**
   * Register a close handler
   * 
   * @param {Function} handler - Callback function
   */
  onClose(handler) {
    if (typeof handler === 'function') {
      this.closeHandlers.push(handler);
    }
  }

  /**
   * Remove a message handler
   * 
   * @param {Function} handler - Handler to remove
   */
  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  /**
   * Clear all handlers
   */
  clearHandlers() {
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.openHandlers = [];
    this.closeHandlers = [];
  }
}

// Create and export singleton instance
const wsService = new WebSocketService();

export default {
  /**
   * Connect to WebSocket
   */
  connect: (endpoint, onMessage, onError, onOpen, onClose) =>
    wsService.connect(endpoint, onMessage, onError, onOpen, onClose),

  /**
   * Send frame data
   */

  sendFrame: (frameData) => wsService.sendFrame(frameData),

  /**
   * Send custom message
   */
  send: (data) => wsService.send(data),

  /**
   * Disconnect from WebSocket
   */
  disconnect: () => wsService.disconnect(),

  /**
   * Get connection status
   */
  getStatus: () => wsService.getStatus(),

  /**
   * Register message handler
   */
  onMessage: (handler) => wsService.onMessage(handler),

  /**
   * Register error handler
   */
  onError: (handler) => wsService.onError(handler),

  /**
   * Register open handler
   */
  onOpen: (handler) => wsService.onOpen(handler),

  /**
   * Register close handler
   */
  onClose: (handler) => wsService.onClose(handler),

  /**
   * Remove message handler
   */
  removeMessageHandler: (handler) => wsService.removeMessageHandler(handler),

  /**
   * Clear all handlers
   */
  clearHandlers: () => wsService.clearHandlers()
};

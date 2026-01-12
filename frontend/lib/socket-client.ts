/**
 * Socket.io Client Singleton
 * Clean, professional WebSocket connection management
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

class SocketClient {
  private socket: Socket | null = null;
  private status: SocketStatus = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize socket connection
   * Note: We rely on Socket.io to automatically send httpOnly cookies in the handshake
   * We don't need to manually extract the token since it's httpOnly and not accessible via JavaScript
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.status = 'connecting';

    // Socket.io automatically sends cookies in the handshake when credentials are included
    // The backend will extract the token from cookies in the socket middleware
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      withCredentials: true, // This ensures cookies are sent
      // Don't send token in auth/query - let the backend read it from cookies
    });

    // Connection events
    this.socket.on('connect', () => {
      this.status = 'connected';
      this.reconnectAttempts = 0;
      this.emitStatusChange('connected');
      
      // Automatically set user online when connected
      if (this.socket?.connected) {
        this.socket.emit('presence:online', {});
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.status = 'disconnected';
      this.emitStatusChange('disconnected');
      
      // Automatically set user offline when disconnected (if not reconnecting)
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Only emit offline if it's a deliberate disconnect, not a reconnection attempt
        // The backend will handle offline status on actual disconnect
      }
    });

    this.socket.on('connect_error', (error: any) => {
      this.status = 'error';
      this.reconnectAttempts++;
      this.emitStatusChange('error');
    });

    this.socket.on('connection:success', () => {
      // Connection authenticated successfully
    });

    this.socket.on('connection:error', (data) => {
      // Connection error - handled silently
    });

    // Re-register all existing listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback as any);
      });
    });
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.status = 'disconnected';
      this.emitStatusChange('disconnected');
    }
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // If socket is already connected, register immediately
    if (this.socket?.connected) {
      this.socket.on(event, callback as any);
    }

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
    }
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): SocketStatus {
    return this.status;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Emit status change to listeners
   */
  private emitStatusChange(status: SocketStatus): void {
    const callbacks = this.listeners.get('status:change');
    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(status);
      });
    }
  }
}

// Export singleton instance
export const socketClient = new SocketClient();

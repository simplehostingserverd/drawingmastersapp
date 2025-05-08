'use client';

import { io, Socket } from 'socket.io-client';

// Define drawing action types
export interface DrawAction {
  type: 'draw' | 'erase' | 'clear' | 'undo' | 'redo';
  points?: { x: number; y: number }[];
  color?: string;
  size?: number;
  tool?: string;
  layerId?: string;
  userId: string;
  timestamp: number;
}

// Define user type
export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number } | null;
}

// Define room state
export interface RoomState {
  users: User[];
  actions: DrawAction[];
}

// Define event handlers
export interface EventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (user: { id: string; name: string }) => void;
  onDrawAction?: (action: DrawAction) => void;
  onCursorMove?: (data: { userId: string; x: number; y: number }) => void;
  onRoomState?: (state: RoomState) => void;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private handlers: EventHandlers = {};
  private roomId: string | null = null;
  private userName: string | null = null;
  private serverUrl: string;

  constructor(serverUrl: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:4000') {
    this.serverUrl = serverUrl;
  }

  // Connect to the WebSocket server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.serverUrl, {
          transports: ['websocket'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          if (this.handlers.onConnect) this.handlers.onConnect();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          if (this.handlers.onError) this.handlers.onError(error);
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from WebSocket server:', reason);
          if (this.handlers.onDisconnect) this.handlers.onDisconnect();
        });

        // Set up event listeners
        this.socket.on('user-joined', (user: User) => {
          console.log('User joined:', user);
          if (this.handlers.onUserJoined) this.handlers.onUserJoined(user);
        });

        this.socket.on('user-left', (user: { id: string; name: string }) => {
          console.log('User left:', user);
          if (this.handlers.onUserLeft) this.handlers.onUserLeft(user);
        });

        this.socket.on('draw-action', (action: DrawAction) => {
          if (this.handlers.onDrawAction) this.handlers.onDrawAction(action);
        });

        this.socket.on('cursor-move', (data: { userId: string; x: number; y: number }) => {
          if (this.handlers.onCursorMove) this.handlers.onCursorMove(data);
        });

        this.socket.on('room-state', (state: RoomState) => {
          console.log('Received room state:', state);
          if (this.handlers.onRoomState) this.handlers.onRoomState(state);
        });
      } catch (error) {
        console.error('Error connecting to WebSocket server:', error);
        reject(error);
      }
    });
  }

  // Disconnect from the WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
      this.userName = null;
    }
  }

  // Join a room
  joinRoom(roomId: string, userName: string): void {
    if (!this.socket) {
      throw new Error('Not connected to WebSocket server');
    }

    this.roomId = roomId;
    this.userName = userName;

    this.socket.emit('join-room', { roomId, userName });
  }

  // Send a drawing action
  sendDrawAction(action: Omit<DrawAction, 'userId' | 'timestamp'>): void {
    if (!this.socket || !this.roomId) {
      throw new Error('Not connected to a room');
    }

    const fullAction: DrawAction = {
      ...action,
      userId: this.socket.id,
      timestamp: Date.now(),
    };

    this.socket.emit('draw-action', fullAction, this.roomId);
  }

  // Send cursor position
  sendCursorPosition(x: number, y: number): void {
    if (!this.socket || !this.roomId) {
      return;
    }

    this.socket.emit('cursor-move', { x, y }, this.roomId);
  }

  // Set event handlers
  setEventHandlers(handlers: EventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Get current room ID
  getCurrentRoomId(): string | null {
    return this.roomId;
  }

  // Get current user name
  getCurrentUserName(): string | null {
    return this.userName;
  }

  // Get socket ID
  getSocketId(): string | null {
    return this.socket ? this.socket.id : null;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}

// Create a singleton instance
export const webSocketClient = new WebSocketClient();

export default webSocketClient;
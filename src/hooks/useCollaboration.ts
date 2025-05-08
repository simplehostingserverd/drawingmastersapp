'use client';

import { useState, useEffect, useCallback } from 'react';
import webSocketClient, { 
  DrawAction, 
  User, 
  RoomState,
  EventHandlers 
} from '@/lib/websocket/client';

interface UseCollaborationProps {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (user: { id: string; name: string }) => void;
  onDrawAction?: (action: DrawAction) => void;
  onCursorMove?: (data: { userId: string; x: number; y: number }) => void;
  onRoomState?: (state: RoomState) => void;
}

export const useCollaboration = ({
  autoConnect = false,
  onConnect,
  onDisconnect,
  onError,
  onUserJoined,
  onUserLeft,
  onDrawAction,
  onCursorMove,
  onRoomState,
}: UseCollaborationProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Connect to the WebSocket server
  const connect = useCallback(async () => {
    try {
      await webSocketClient.connect();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
      setIsConnected(false);
    }
  }, []);

  // Disconnect from the WebSocket server
  const disconnect = useCallback(() => {
    webSocketClient.disconnect();
    setIsConnected(false);
    setUsers([]);
    setRoomId(null);
  }, []);

  // Join a room
  const joinRoom = useCallback((roomId: string, userName: string) => {
    if (!isConnected) {
      throw new Error('Not connected to WebSocket server');
    }

    webSocketClient.joinRoom(roomId, userName);
    setRoomId(roomId);
  }, [isConnected]);

  // Send a drawing action
  const sendDrawAction = useCallback((action: Omit<DrawAction, 'userId' | 'timestamp'>) => {
    if (!isConnected || !roomId) {
      throw new Error('Not connected to a room');
    }

    webSocketClient.sendDrawAction(action);
  }, [isConnected, roomId]);

  // Send cursor position
  const sendCursorPosition = useCallback((x: number, y: number) => {
    if (!isConnected || !roomId) {
      return;
    }

    webSocketClient.sendCursorPosition(x, y);
  }, [isConnected, roomId]);

  // Set up event handlers
  useEffect(() => {
    const handlers: EventHandlers = {
      onConnect: () => {
        setIsConnected(true);
        if (onConnect) onConnect();
      },
      onDisconnect: () => {
        setIsConnected(false);
        setUsers([]);
        setRoomId(null);
        if (onDisconnect) onDisconnect();
      },
      onError: (err) => {
        setError(err);
        if (onError) onError(err);
      },
      onUserJoined: (user) => {
        setUsers((prevUsers) => [...prevUsers, user]);
        if (onUserJoined) onUserJoined(user);
      },
      onUserLeft: (user) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
        if (onUserLeft) onUserLeft(user);
      },
      onDrawAction,
      onCursorMove,
      onRoomState: (state) => {
        setUsers(state.users);
        if (onRoomState) onRoomState(state);
      },
    };

    webSocketClient.setEventHandlers(handlers);

    // Auto-connect if enabled
    if (autoConnect && !isConnected) {
      connect();
    }

    // Cleanup
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [
    autoConnect,
    isConnected,
    connect,
    disconnect,
    onConnect,
    onDisconnect,
    onError,
    onUserJoined,
    onUserLeft,
    onDrawAction,
    onCursorMove,
    onRoomState,
  ]);

  return {
    isConnected,
    users,
    roomId,
    error,
    connect,
    disconnect,
    joinRoom,
    sendDrawAction,
    sendCursorPosition,
    socketId: webSocketClient.getSocketId(),
  };
};

export default useCollaboration;
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedButton, AnimatedPanel, AnimatedCard } from './ui/AnimatedComponents';
import useCollaboration from '@/hooks/useCollaboration';
import { User } from '@/lib/websocket/client';
import OptimizedImage from './ui/OptimizedImage';

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onJoinRoom: (roomId: string) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOpen,
  onClose,
  canvasRef,
  onJoinRoom,
}) => {
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'active'>('join');
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  // Use collaboration hook
  const {
    isConnected,
    users,
    connect,
    disconnect,
    joinRoom,
    sendDrawAction,
    sendCursorPosition,
  } = useCollaboration({
    onConnect: () => {
      console.log('Connected to WebSocket server');
      fetchActiveRooms();
    },
    onDisconnect: () => {
      console.log('Disconnected from WebSocket server');
    },
    onError: (err) => {
      setError(err.message);
    },
    onUserJoined: (user) => {
      console.log('User joined:', user);
    },
    onUserLeft: (user) => {
      console.log('User left:', user);
    },
    onDrawAction: (action) => {
      // Handle drawing action
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      // Apply drawing action to canvas
      switch (action.type) {
        case 'draw':
          if (!action.points || action.points.length < 2) return;
          
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          
          for (let i = 1; i < action.points.length; i++) {
            ctx.lineTo(action.points[i].x, action.points[i].y);
          }
          
          ctx.strokeStyle = action.color || '#000000';
          ctx.lineWidth = action.size || 5;
          ctx.stroke();
          ctx.closePath();
          break;
          
        case 'erase':
          if (!action.points || action.points.length < 2) return;
          
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          
          for (let i = 1; i < action.points.length; i++) {
            ctx.lineTo(action.points[i].x, action.points[i].y);
          }
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = action.size || 20;
          ctx.stroke();
          ctx.closePath();
          break;
          
        case 'clear':
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          break;
      }
    },
    onCursorMove: (data) => {
      // Update cursor position for the user
      setCursorPosition({
        x: data.x,
        y: data.y,
      });
    },
  });

  // Fetch active rooms
  const fetchActiveRooms = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`);
      const data = await response.json();
      setActiveRooms(data.rooms || []);
    } catch (err) {
      setError('Failed to fetch active rooms');
      console.error('Error fetching rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to WebSocket server on mount
  useEffect(() => {
    if (isOpen && !isConnected) {
      connect();
    }
    
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isOpen, isConnected, connect, disconnect]);

  // Handle join room
  const handleJoinRoom = () => {
    if (!roomId || !userName) {
      setError('Room ID and username are required');
      return;
    }
    
    try {
      joinRoom(roomId, userName);
      onJoinRoom(roomId);
      setError(null);
    } catch (err) {
      setError('Failed to join room');
      console.error('Error joining room:', err);
    }
  };

  // Handle create room
  const handleCreateRoom = async () => {
    if (!roomName || !userName) {
      setError('Room name and username are required');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create room on server
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          isPrivate,
          password: isPrivate ? password : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }
      
      // Join the newly created room
      joinRoom(data.id, userName);
      onJoinRoom(data.id);
      setError(null);
      
      // Reset form
      setRoomName('');
      setIsPrivate(false);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      console.error('Error creating room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render user list
  const renderUserList = () => {
    if (users.length === 0) {
      return (
        <div className="text-gray-500 italic text-sm">
          No users in this room
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center p-2 bg-white rounded-md shadow-sm"
          >
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: user.color }}
            />
            <span className="text-sm font-medium">{user.name}</span>
            {user.id === 'you' && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                You
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render active rooms
  const renderActiveRooms = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      );
    }
    
    if (activeRooms.length === 0) {
      return (
        <div className="text-gray-500 italic text-sm text-center py-4">
          No active rooms found
        </div>
      );
    }
    
    return (
      <div className="space-y-2 mt-2">
        {activeRooms.map((room) => (
          <AnimatedCard
            key={room.id}
            className="p-3 cursor-pointer"
            onClick={() => setRoomId(room.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{room.name}</h4>
                <p className="text-sm text-gray-500">
                  {room.userCount} {room.userCount === 1 ? 'user' : 'users'}
                </p>
              </div>
              {room.isPrivate && (
                <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                  Private
                </div>
              )}
            </div>
          </AnimatedCard>
        ))}
      </div>
    );
  };

  return (
    <AnimatedPanel
      isOpen={isOpen}
      onClose={onClose}
      direction="right"
      className="w-80 h-full p-4 flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Collaboration</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Connection status */}
      <div className={`mb-4 p-2 rounded-md ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm">
            {isConnected ? 'Connected to server' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'join'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          } rounded-l-md`}
          onClick={() => setActiveTab('join')}
        >
          Join
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'create'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'active'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          } rounded-r-md`}
          onClick={() => {
            setActiveTab('active');
            fetchActiveRooms();
          }}
        >
          Active
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password (if required)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <AnimatedButton
              onClick={handleJoinRoom}
              variant="primary"
              className="w-full"
              disabled={!isConnected || !roomId || !userName}
            >
              Join Room
            </AnimatedButton>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                Private Room
              </label>
            </div>
            {isPrivate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            )}
            <AnimatedButton
              onClick={handleCreateRoom}
              variant="primary"
              className="w-full"
              disabled={
                !isConnected ||
                !roomName ||
                !userName ||
                (isPrivate && !password) ||
                isLoading
              }
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </AnimatedButton>
          </div>
        )}

        {activeTab === 'active' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-medium">Active Rooms</h3>
              <button
                onClick={fetchActiveRooms}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Refresh
              </button>
            </div>
            {renderActiveRooms()}
          </div>
        )}
      </div>

      {/* User list if connected to a room */}
      {users.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-md font-medium mb-2">Users in Room</h3>
          {renderUserList()}
        </div>
      )}
    </AnimatedPanel>
  );
};

export default CollaborationPanel;
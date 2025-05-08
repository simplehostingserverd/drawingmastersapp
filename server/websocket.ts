import { Server, Socket } from 'socket.io';

// Define drawing action types
interface DrawAction {
  type: 'draw' | 'erase' | 'clear' | 'undo' | 'redo';
  points?: { x: number; y: number }[];
  color?: string;
  size?: number;
  tool?: string;
  layerId?: string;
  userId: string;
  timestamp: number;
}

// Define room state
interface RoomState {
  users: {
    id: string;
    name: string;
    color: string;
    cursor: { x: number; y: number } | null;
  }[];
  actions: DrawAction[];
}

// Store room states
const rooms: Map<string, RoomState> = new Map();

// Generate a random color for new users
const getRandomColor = () => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A8', 
    '#33A8FF', '#A833FF', '#FF8333', '#33FFC1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const setupWebsocketHandlers = (io: Server) => {
  // Handle connection
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle joining a room
    socket.on('join-room', ({ roomId, userName }: { roomId: string; userName: string }) => {
      // Leave previous rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
      
      // Join the new room
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          users: [],
          actions: []
        });
      }
      
      // Add user to room
      const room = rooms.get(roomId)!;
      const userColor = getRandomColor();
      
      room.users.push({
        id: socket.id,
        name: userName,
        color: userColor,
        cursor: null
      });
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        id: socket.id,
        name: userName,
        color: userColor
      });
      
      // Send current room state to the new user
      socket.emit('room-state', room);
      
      console.log(`User ${socket.id} (${userName}) joined room ${roomId}`);
    });
    
    // Handle drawing actions
    socket.on('draw-action', (action: DrawAction, roomId: string) => {
      if (!rooms.has(roomId)) return;
      
      const room = rooms.get(roomId)!;
      
      // Add action to room history
      room.actions.push(action);
      
      // Limit history size to prevent memory issues
      if (room.actions.length > 1000) {
        room.actions = room.actions.slice(-1000);
      }
      
      // Broadcast action to others in the room
      socket.to(roomId).emit('draw-action', action);
    });
    
    // Handle cursor movement
    socket.on('cursor-move', ({ x, y }: { x: number; y: number }, roomId: string) => {
      if (!rooms.has(roomId)) return;
      
      const room = rooms.get(roomId)!;
      const user = room.users.find(u => u.id === socket.id);
      
      if (user) {
        user.cursor = { x, y };
        
        // Broadcast cursor position to others in the room
        socket.to(roomId).emit('cursor-move', {
          userId: socket.id,
          x,
          y
        });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove user from all rooms
      rooms.forEach((room, roomId) => {
        const userIndex = room.users.findIndex(u => u.id === socket.id);
        
        if (userIndex !== -1) {
          const user = room.users[userIndex];
          room.users.splice(userIndex, 1);
          
          // Notify others in the room
          io.to(roomId).emit('user-left', {
            id: socket.id,
            name: user.name
          });
          
          // Remove room if empty
          if (room.users.length === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (empty)`);
          }
        }
      });
    });
  });
};
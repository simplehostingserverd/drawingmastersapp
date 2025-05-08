import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { setupWebsocketHandlers } from './websocket';
import apiRoutes from './routes/api';

// Create Express app
const app = express();
const server = http.createServer(app);

// Set up CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://twinkiesdraw.com', 'https://www.twinkiesdraw.com'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://twinkiesdraw.com', 'https://www.twinkiesdraw.com'] 
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Set up WebSocket handlers
setupWebsocketHandlers(io);

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default server;
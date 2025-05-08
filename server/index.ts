// Initialize OpenTelemetry first
import initOpenTelemetry from './monitoring/opentelemetry';
initOpenTelemetry();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import dotenv from 'dotenv';
import { setupWebsocketHandlers } from './websocket.js';
import apiRoutes from './routes/api.js';
import redisClient from './db/redis.js';
import { logger, httpLogger, errorLogger } from './monitoring/logger';

// Load environment variables
dotenv.config();

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

// Security middleware
app.use(helmet()); // Secure HTTP headers
app.use(hpp()); // Protect against HTTP Parameter Pollution attacks

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use(httpLogger);

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({ error: 'Internal Server Error' });
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
  logger.info(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  // Close Redis connection
  await redisClient.quit();
  
  // Close HTTP server
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default server;
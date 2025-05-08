import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
})();

// Handle Redis errors
redisClient.on('error', (error) => {
  console.error('Redis error:', error);
});

// Handle Redis reconnection
redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

// Handle Redis ready
redisClient.on('ready', () => {
  console.log('Redis ready');
});

// Handle Redis end
redisClient.on('end', () => {
  console.log('Redis connection closed');
});

// Handle process termination
process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('Redis connection closed');
  process.exit(0);
});

export default redisClient;
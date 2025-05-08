import redisClient from '../db/redis';

// Define drawing data structure
interface DrawingData {
  id: string;
  name: string;
  userId: string;
  imageData: string;
  metadata?: {
    width: number;
    height: number;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    isPublic?: boolean;
  };
}

// Cache keys
const DRAWING_KEY_PREFIX = 'drawing:';
const USER_DRAWINGS_KEY_PREFIX = 'user:drawings:';
const PUBLIC_DRAWINGS_KEY = 'public:drawings';
const RECENT_DRAWINGS_KEY = 'recent:drawings';

// Cache TTL in seconds
const CACHE_TTL = 60 * 60 * 24; // 24 hours

// Drawing cache service
class DrawingCache {
  // Save drawing to cache
  async saveDrawing(drawing: DrawingData): Promise<void> {
    const drawingKey = `${DRAWING_KEY_PREFIX}${drawing.id}`;
    const userDrawingsKey = `${USER_DRAWINGS_KEY_PREFIX}${drawing.userId}`;
    
    // Set drawing data
    await redisClient.set(drawingKey, JSON.stringify(drawing), {
      EX: CACHE_TTL,
    });
    
    // Add to user's drawings set
    await redisClient.sAdd(userDrawingsKey, drawing.id);
    await redisClient.expire(userDrawingsKey, CACHE_TTL);
    
    // Add to recent drawings list (limited to 100)
    await redisClient.lPush(RECENT_DRAWINGS_KEY, drawing.id);
    await redisClient.lTrim(RECENT_DRAWINGS_KEY, 0, 99);
    await redisClient.expire(RECENT_DRAWINGS_KEY, CACHE_TTL);
    
    // Add to public drawings if public
    if (drawing.metadata?.isPublic) {
      await redisClient.sAdd(PUBLIC_DRAWINGS_KEY, drawing.id);
      await redisClient.expire(PUBLIC_DRAWINGS_KEY, CACHE_TTL);
    }
  }
  
  // Get drawing from cache
  async getDrawing(drawingId: string): Promise<DrawingData | null> {
    const drawingKey = `${DRAWING_KEY_PREFIX}${drawingId}`;
    const drawingData = await redisClient.get(drawingKey);
    
    if (!drawingData) {
      return null;
    }
    
    return JSON.parse(drawingData);
  }
  
  // Get user's drawings
  async getUserDrawings(userId: string): Promise<string[]> {
    const userDrawingsKey = `${USER_DRAWINGS_KEY_PREFIX}${userId}`;
    return await redisClient.sMembers(userDrawingsKey);
  }
  
  // Get public drawings
  async getPublicDrawings(): Promise<string[]> {
    return await redisClient.sMembers(PUBLIC_DRAWINGS_KEY);
  }
  
  // Get recent drawings
  async getRecentDrawings(limit: number = 10): Promise<string[]> {
    return await redisClient.lRange(RECENT_DRAWINGS_KEY, 0, limit - 1);
  }
  
  // Delete drawing from cache
  async deleteDrawing(drawingId: string, userId: string): Promise<void> {
    const drawingKey = `${DRAWING_KEY_PREFIX}${drawingId}`;
    const userDrawingsKey = `${USER_DRAWINGS_KEY_PREFIX}${userId}`;
    
    // Get drawing data to check if public
    const drawingData = await this.getDrawing(drawingId);
    
    // Delete drawing data
    await redisClient.del(drawingKey);
    
    // Remove from user's drawings set
    await redisClient.sRem(userDrawingsKey, drawingId);
    
    // Remove from public drawings if public
    if (drawingData?.metadata?.isPublic) {
      await redisClient.sRem(PUBLIC_DRAWINGS_KEY, drawingId);
    }
    
    // Remove from recent drawings list
    await redisClient.lRem(RECENT_DRAWINGS_KEY, 0, drawingId);
  }
  
  // Update drawing in cache
  async updateDrawing(drawing: DrawingData): Promise<void> {
    // Simply overwrite the existing drawing
    await this.saveDrawing(drawing);
  }
  
  // Clear all drawings for a user
  async clearUserDrawings(userId: string): Promise<void> {
    const userDrawingsKey = `${USER_DRAWINGS_KEY_PREFIX}${userId}`;
    const drawingIds = await redisClient.sMembers(userDrawingsKey);
    
    // Delete each drawing
    for (const drawingId of drawingIds) {
      await this.deleteDrawing(drawingId, userId);
    }
    
    // Delete user's drawings set
    await redisClient.del(userDrawingsKey);
  }
}

// Create a singleton instance
const drawingCache = new DrawingCache();

export default drawingCache;
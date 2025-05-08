'use client';

// Define cache item with expiration
interface CacheItem<T> {
  value: T;
  expiry: number | null; // Timestamp in milliseconds, null for no expiration
}

class ClientCache {
  private storage: Storage | null = null;
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private prefix: string = 'twinkiesdraw:';

  constructor() {
    // Initialize storage if in browser environment
    if (typeof window !== 'undefined') {
      this.storage = window.localStorage;
    }
  }

  // Set an item in the cache
  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const prefixedKey = this.prefix + key;
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    const item: CacheItem<T> = { value, expiry };

    // Store in memory cache
    this.memoryCache.set(prefixedKey, item);

    // Store in localStorage if available
    if (this.storage) {
      try {
        this.storage.setItem(prefixedKey, JSON.stringify(item));
      } catch (error) {
        console.warn('Failed to store item in localStorage:', error);
      }
    }
  }

  // Get an item from the cache
  get<T>(key: string): T | null {
    const prefixedKey = this.prefix + key;
    
    // Try memory cache first
    const memoryItem = this.memoryCache.get(prefixedKey) as CacheItem<T> | undefined;
    
    if (memoryItem) {
      // Check if expired
      if (memoryItem.expiry && memoryItem.expiry < Date.now()) {
        this.delete(key);
        return null;
      }
      return memoryItem.value;
    }
    
    // Try localStorage if available
    if (this.storage) {
      try {
        const storedItem = this.storage.getItem(prefixedKey);
        
        if (storedItem) {
          const item = JSON.parse(storedItem) as CacheItem<T>;
          
          // Check if expired
          if (item.expiry && item.expiry < Date.now()) {
            this.delete(key);
            return null;
          }
          
          // Store in memory cache for faster access next time
          this.memoryCache.set(prefixedKey, item);
          
          return item.value;
        }
      } catch (error) {
        console.warn('Failed to retrieve item from localStorage:', error);
      }
    }
    
    return null;
  }

  // Delete an item from the cache
  delete(key: string): void {
    const prefixedKey = this.prefix + key;
    
    // Remove from memory cache
    this.memoryCache.delete(prefixedKey);
    
    // Remove from localStorage if available
    if (this.storage) {
      try {
        this.storage.removeItem(prefixedKey);
      } catch (error) {
        console.warn('Failed to remove item from localStorage:', error);
      }
    }
  }

  // Clear all items from the cache
  clear(): void {
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear localStorage if available
    if (this.storage) {
      try {
        // Only clear items with our prefix
        const keysToRemove: string[] = [];
        
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          this.storage?.removeItem(key);
        });
      } catch (error) {
        console.warn('Failed to clear items from localStorage:', error);
      }
    }
  }

  // Clear expired items from the cache
  clearExpired(): void {
    const now = Date.now();
    
    // Clear expired items from memory cache
    this.memoryCache.forEach((item, key) => {
      if (item.expiry && item.expiry < now) {
        this.memoryCache.delete(key);
      }
    });
    
    // Clear expired items from localStorage if available
    if (this.storage) {
      try {
        const keysToCheck: string[] = [];
        
        for (let i = 0; i < this.storage.length; i++) {
          const key = this.storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToCheck.push(key);
          }
        }
        
        keysToCheck.forEach(key => {
          const storedItem = this.storage?.getItem(key);
          if (storedItem) {
            try {
              const item = JSON.parse(storedItem) as CacheItem<any>;
              if (item.expiry && item.expiry < now) {
                this.storage?.removeItem(key);
              }
            } catch (e) {
              // If we can't parse the item, remove it
              this.storage?.removeItem(key);
            }
          }
        });
      } catch (error) {
        console.warn('Failed to clear expired items from localStorage:', error);
      }
    }
  }

  // Set cache prefix
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }
}

// Create a singleton instance
export const clientCache = new ClientCache();

export default clientCache;
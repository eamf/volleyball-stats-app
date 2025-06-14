// cache-handler.js
const Redis = require('ioredis');

// Initialize Redis client
let redis;
try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  console.log('Redis cache handler initialized');
} catch (error) {
  console.error('Failed to initialize Redis cache handler:', error);
  // Fallback to in-memory cache if Redis is not available
  const fallbackCache = new Map();
  redis = {
    get: async (key) => {
      const item = fallbackCache.get(key);
      return item ? JSON.stringify(item) : null;
    },
    set: async (key, value) => {
      fallbackCache.set(key, JSON.parse(value));
    },
    del: async (key) => {
      fallbackCache.delete(key);
    }
  };
}

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
    this.redis = redis;
    this.prefix = 'nextjs-cache:';
  }

  async get(key) {
    try {
      const data = await this.redis.get(this.prefix + key);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return parsed.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      const cacheData = {
        value: data,
        lastModified: Date.now(),
        tags: ctx.tags || []
      };
      
      await this.redis.set(
        this.prefix + key,
        JSON.stringify(cacheData),
        'EX',
        60 * 60 * 24 * 7 // Cache for 7 days by default
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async revalidateTag(tags) {
    try {
      // Convert to array if it's a string
      tags = Array.isArray(tags) ? tags : [tags];
      
      // Get all keys
      const keys = await this.redis.keys(`${this.prefix}*`);
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (!data) continue;
        
        try {
          const parsed = JSON.parse(data);
          
          // If this entry has any of the tags we're revalidating, delete it
          if (parsed.tags && parsed.tags.some(tag => tags.includes(tag))) {
            await this.redis.del(key);
          }
        } catch (parseError) {
          console.error('Error parsing cache entry:', parseError);
        }
      }
    } catch (error) {
      console.error('Cache revalidateTag error:', error);
    }
  }

  resetRequestCache() {
    // This method is called before each request
    // We don't need to do anything here since we're using Redis
  }
};
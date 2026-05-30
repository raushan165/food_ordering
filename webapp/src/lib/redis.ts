import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Similarly caching the Redis connection in global to prevent multiple instances
 * during Next.js hot reloads.
 */
let cachedRedis = (global as any).redis;

if (!cachedRedis) {
  cachedRedis = (global as any).redis = new Redis(REDIS_URL);
  
  cachedRedis.on('connect', () => {
    console.log('Successfully connected to Redis.');
  });
  
  cachedRedis.on('error', (err: any) => {
    console.error('Redis connection error:', err);
  });
}

export const redis = cachedRedis;
export default redis;

import { redisClient } from "./client.js";

export class RedisCacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await redisClient.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    const stringVal = typeof value === "string" ? value : JSON.stringify(value);
    await redisClient.set(key, stringVal, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  async has(key: string): Promise<boolean> {
    const val = await this.get(key);
    return val !== null;
  }
}

export const redisCache = new RedisCacheService();


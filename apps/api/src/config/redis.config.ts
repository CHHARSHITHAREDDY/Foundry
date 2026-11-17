import { getApiEnv } from "./env.js";

export interface RedisConfig {
  url: string;
  keyPrefix: string;
  defaultTtlSeconds: number;
  maxRetriesPerRequest: number;
  enableOfflineQueue: boolean;
  lazyConnect: boolean;
}

export function getRedisConfig(): RedisConfig {
  const env = getApiEnv();

  return {
    url: env.REDIS_URL,
    keyPrefix: env.REDIS_KEY_PREFIX,
    defaultTtlSeconds: 3600, // 1 hour default
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
  };
}

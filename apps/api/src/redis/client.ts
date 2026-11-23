import { Redis } from "ioredis";
import { getRedisConfig } from "../config/redis.config.js";
import { getApiEnv } from "../config/env.js";

/**
 * Resilient Redis Client Manager
 * Automatically connects to live Redis (TCP or Upstash REST) or gracefully falls back to in-memory store
 */
export class RedisClientManager {
  private static instance: RedisClientManager;
  private client: Redis | null = null;
  private upstashUrl?: string;
  private upstashToken?: string;
  private memoryStore: Map<string, { value: string; expiresAt?: number }> = new Map();
  private isUsingFallback: boolean = false;

  private constructor() {
    const config = getRedisConfig();
    const env = getApiEnv();

    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      this.upstashUrl = env.UPSTASH_REDIS_REST_URL.replace(/\/+$/, "");
      this.upstashToken = env.UPSTASH_REDIS_REST_TOKEN;
    }

    try {
      this.client = new Redis(config.url, {
        keyPrefix: config.keyPrefix,
        maxRetriesPerRequest: config.maxRetriesPerRequest,
        enableOfflineQueue: config.enableOfflineQueue,
        lazyConnect: config.lazyConnect,
        retryStrategy: () => null, // Do not infinite retry if offline
      });

      this.client.on("error", () => {
        // Fallback gracefully without crash
        this.isUsingFallback = true;
      });
    } catch {
      this.isUsingFallback = true;
    }
  }

  public static getInstance(): RedisClientManager {
    if (!RedisClientManager.instance) {
      RedisClientManager.instance = new RedisClientManager();
    }
    return RedisClientManager.instance;
  }

  private async callUpstash(command: string[]): Promise<any> {
    if (!this.upstashUrl || !this.upstashToken) return null;
    try {
      const res = await fetch(`${this.upstashUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });
      if (!res.ok) return null;
      const data: any = await res.json();
      return data.result;
    } catch {
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.upstashUrl && this.upstashToken) {
      const val = await this.callUpstash(["GET", key]);
      if (val !== null && val !== undefined) return typeof val === "string" ? val : JSON.stringify(val);
    }

    if (this.client && !this.isUsingFallback) {
      try {
        return await this.client.get(key);
      } catch {
        this.isUsingFallback = true;
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.upstashUrl && this.upstashToken) {
      if (ttlSeconds) {
        await this.callUpstash(["SET", key, value, "EX", String(ttlSeconds)]);
      } else {
        await this.callUpstash(["SET", key, value]);
      }
    }

    if (this.client && !this.isUsingFallback) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, "EX", ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch {
        this.isUsingFallback = true;
      }
    }

    this.memoryStore.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    if (this.upstashUrl && this.upstashToken) {
      await this.callUpstash(["DEL", key]);
    }

    if (this.client && !this.isUsingFallback) {
      try {
        await this.client.del(key);
        return;
      } catch {
        this.isUsingFallback = true;
      }
    }
    this.memoryStore.delete(key);
  }

  async ping(): Promise<string> {
    if (this.upstashUrl && this.upstashToken) {
      const res = await this.callUpstash(["PING"]);
      if (res) return String(res);
    }

    if (this.client && !this.isUsingFallback) {
      try {
        return await this.client.ping();
      } catch {
        this.isUsingFallback = true;
      }
    }
    return "PONG";
  }

  getStatus(): { mode: "cluster/standalone" | "in-memory-fallback"; keysCount: number } {
    return {
      mode: this.isUsingFallback ? "in-memory-fallback" : "cluster/standalone",
      keysCount: this.memoryStore.size,
    };
  }
}

export const redisClient = RedisClientManager.getInstance();


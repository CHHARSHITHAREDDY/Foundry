import { getApiEnv } from "./env.js";

export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  ssl: boolean;
}

export function getDatabaseConfig(): DatabaseConfig {
  const env = getApiEnv();
  const isProd = env.NODE_ENV === "production";

  return {
    url: env.DATABASE_URL,
    maxConnections: isProd ? 50 : 10,
    idleTimeoutMs: 30000,
    connectionTimeoutMs: 5000,
    ssl: isProd,
  };
}

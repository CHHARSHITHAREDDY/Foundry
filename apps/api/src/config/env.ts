import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";
import * as process from "node:process";

// Automatically load .env file from possible locations
function loadEnvFromDisk(): void {
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "apps/api/.env"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(process.cwd(), "../../.env"),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["'](.*)["']$/, "$1");
            if (val.length > 0 && (process.env[key] === undefined || process.env[key] === "")) {
              process.env[key] = val;
            }
          }
        }
      } catch {
        // ignore missing or unreadable env files
      }
    }
  }
}

loadEnvFromDisk();

export const ApiEnvSchema = z.object({
  PORT: z.coerce.number().int().default(3001),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
  CORS_ORIGIN: z.string().optional().default("http://localhost:3000,http://localhost:3002"),
  
  // Database Configuration
  DATABASE_URL: z.string().default("postgresql://studio:studio@localhost:5432/studio?schema=public"),
  
  // Redis Configuration
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_KEY_PREFIX: z.string().default("foundry:"),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Model Gateway & LLM
  LITELLM_URL: z.string().optional().default("http://localhost:4000"),
  LITELLM_MASTER_KEY: z.string().optional().default("sk-local-dev"),
  INFERENCE_BASE_URL: z.string().optional(),
  INFERENCE_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Research & Search
  TAVILY_API_KEY: z.string().optional(),
  SEARXNG_URL: z.string().optional().default("http://localhost:8080"),

  // Auth Configuration
  JWT_SECRET: z.string().optional(),
  JWT_USER_AUDIENCE: z.string().optional().default("studio-user"),
  JWT_ADMIN_AUDIENCE: z.string().optional().default("studio-admin"),

  // Storage / S3
  S3_ENDPOINT: z.string().optional().default("http://localhost:9000"),
  S3_ACCESS_KEY: z.string().optional().default("minioadmin"),
  S3_SECRET_KEY: z.string().optional().default("minioadmin"),

  // Integrations
  GITHUB_TOKEN: z.string().optional(),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

let cachedEnv: ApiEnv | null = null;

export function getApiEnv(): ApiEnv {
  if (!cachedEnv) {
    cachedEnv = ApiEnvSchema.parse(process.env);
  }
  return cachedEnv;
}

export function resetApiEnv(): void {
  cachedEnv = null;
}


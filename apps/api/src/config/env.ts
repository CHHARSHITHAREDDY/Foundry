import { z } from "zod";
import fs from "fs";
import path from "path";

// Automatically load .env file from possible locations
function loadEnvFromDisk() {
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
            if (process.env[key] === undefined || process.env[key] === "") {
              process.env[key] = val;
            }
          }
        }
      } catch {}
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
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/venture_studio?schema=public"),
  
  // Redis Configuration
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_KEY_PREFIX: z.string().default("foundry:"),

  // Model Gateway & LLM
  LITELLM_URL: z.string().optional().default("http://localhost:4000"),
  LITELLM_MASTER_KEY: z.string().optional().default("sk-local-dev"),
  INFERENCE_BASE_URL: z.string().optional(),
  INFERENCE_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Research & Search
  TAVILY_API_KEY: z.string().optional(),
  SEARXNG_URL: z.string().optional().default("http://localhost:8080"),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

let cachedEnv: ApiEnv | null = null;

export function getApiEnv(): ApiEnv {
  if (!cachedEnv) {
    cachedEnv = ApiEnvSchema.parse(process.env);
  }
  return cachedEnv;
}

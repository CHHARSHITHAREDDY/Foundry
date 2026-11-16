import { z } from "zod";

export const ApiEnvSchema = z.object({
  PORT: z.coerce.number().int().default(3001),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
  CORS_ORIGIN: z.string().optional().default("http://localhost:3000,http://localhost:3002"),
  LITELLM_URL: z.string().optional().default("http://localhost:4000"),
  LITELLM_MASTER_KEY: z.string().optional().default("sk-local-dev"),
  INFERENCE_BASE_URL: z.string().optional(),
  INFERENCE_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  SEARXNG_URL: z.string().optional().default("http://localhost:8080"),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function getApiEnv(): ApiEnv {
  return ApiEnvSchema.parse(process.env);
}

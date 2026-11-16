import { z } from "zod";

export const ModelTierSchema = z.enum([
  "fast",
  "reasoner",
  "coder",
  "writer",
  "vision",
  "embeddings",
]);

export type ModelTier = z.infer<typeof ModelTierSchema>;

export interface ModelTierConfig {
  tier: ModelTier;
  fallbackModel?: string;
  temperature?: number;
  maxTokens?: number;
}

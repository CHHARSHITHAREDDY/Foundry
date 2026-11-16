import { z } from "zod";

export const ScoreItemSchema = z.object({
  score: z.number().int().min(1).max(5),
  reason: z.string().min(5),
  source_url: z.string().url().optional(),
});

export const ScorecardSchema = z.object({
  demand: ScoreItemSchema,
  competition: ScoreItemSchema,
  differentiation: ScoreItemSchema,
  monetization: ScoreItemSchema,
  buildability: ScoreItemSchema,
  overallScore: z.number().min(1).max(5),
});

export type ScoreItem = z.infer<typeof ScoreItemSchema>;
export type Scorecard = z.infer<typeof ScorecardSchema>;

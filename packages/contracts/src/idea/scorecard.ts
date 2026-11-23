import { z } from "zod";

export const ScoreItemSchema = z.object({
  score: z.number().min(1).max(5).nullable(),
  reason: z.string().min(3),
  source_url: z.string().url().optional(),
  assessed: z.boolean().default(false),
});

export const ScorecardSchema = z.object({
  demand: ScoreItemSchema,
  competition: ScoreItemSchema,
  differentiation: ScoreItemSchema,
  monetization: ScoreItemSchema,
  buildability: ScoreItemSchema,
  overallScore: z.number().min(1).max(5).nullable(),
  scorecardType: z.enum(["HEURISTIC_ESTIMATE", "MARKET_VALIDATED", "INSUFFICIENT_DATA"]).default("HEURISTIC_ESTIMATE"),
  assessedDimensionsCount: z.number().int().min(0).max(5).default(0),
});

export type ScoreItem = z.infer<typeof ScoreItemSchema>;
export type Scorecard = z.infer<typeof ScorecardSchema>;



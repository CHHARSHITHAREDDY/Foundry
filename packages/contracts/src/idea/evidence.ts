import { z } from "zod";

export const EvidenceTypeSchema = z.enum([
  "competitor",
  "forum_complaint",
  "search_demand",
  "pricing",
  "app_review",
]);

export const EvidenceConfidenceSchema = z.enum(["high", "medium", "low", "limited"]);

export const EvidenceSchema = z.object({
  id: z.string().default(() => `ev_${Math.random().toString(36).substring(2, 9)}`),
  type: EvidenceTypeSchema,
  url: z.string().url(),
  title: z.string(),
  snippet: z.string(),
  verified: z.boolean().default(true),
  confidence: EvidenceConfidenceSchema.default("medium"),
  gathered_at: z.string().datetime().default(() => new Date().toISOString()),
});

export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type EvidenceConfidence = z.infer<typeof EvidenceConfidenceSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;


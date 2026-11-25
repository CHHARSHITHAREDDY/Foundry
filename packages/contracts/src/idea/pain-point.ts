import { z } from "zod";

export const PainPointSchema = z.object({
  id: z.string().default(() => `pp_${Math.random().toString(36).substring(2, 9)}`),
  problem: z.string().min(5),
  who_has_it: z.string().min(2),
  source_url: z.string().url(),
  quote: z.string().min(5),
  frequency_score: z.number().min(1).max(10).default(5),
  domain: z.string().optional(),
  source_type: z.enum(["LIVE_API", "SAMPLE_SPECIMEN"]).default("LIVE_API"),
  origin: z.enum(["LIVE", "SAMPLE"]).default("LIVE").optional(),
  citation_verified: z.boolean().default(false),
  sample_notice: z.string().optional(),
  scouted_at: z.string().datetime().default(() => new Date().toISOString()),
});

export type PainPoint = z.infer<typeof PainPointSchema>;


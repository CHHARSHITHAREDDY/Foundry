import { z } from "zod";
import { PainPointSchema } from "./pain-point.js";
import { EvidenceSchema } from "./evidence.js";
import { ScorecardSchema } from "./scorecard.js";
import { VerdictSchema } from "./verdict.js";

export const CompetitorSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  pricing: z.string().optional(),
  gap: z.string(),
});

export const FinancialViabilitySchema = z.object({
  tam: z.string(),
  sam: z.string(),
  som: z.string(),
  cagr: z.string(),
  pricingTiers: z.object({
    starter: z.string(),
    pro: z.string(),
    team: z.string(),
  }),
  unitEconomics: z.object({
    estimatedCac: z.string(),
    estimatedLtv: z.string(),
    ltvCacRatio: z.number(),
    paybackMonths: z.number(),
    breakevenCustomers: z.number(),
  }),
  marketTimingJustification: z.string(),
});

export const MvpScopeSchema = z.object({
  screens: z.array(z.string()).min(1),
  coreApis: z.array(z.string()).min(1),
  keyFeatures: z.array(z.string()).min(1),
  estimatedComplexity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
});

export const IdeaStatusSchema = z.enum([
  "SCOUTED",
  "VALIDATING",
  "VALIDATED",
  "APPROVED",
  "REJECTED",
  "BUILDING",
  "DEPLOYED",
]);

export const IdeaBriefSchema = z.object({
  id: z.string(),
  title: z.string().min(3),
  tagline: z.string().min(5),
  problem: z.string().min(10),
  targetCustomer: z.string().min(3),
  whyNow: z.string().min(5),
  archetype: z.string(),
  sourcePainPoint: PainPointSchema.optional(),
  mvpScope: MvpScopeSchema,
  competitors: z.array(CompetitorSchema).default([]),
  scorecard: ScorecardSchema.optional(),
  verdict: VerdictSchema.optional(),
  evidence: z.array(EvidenceSchema).default([]),
  financialModel: FinancialViabilitySchema.optional(),
  status: IdeaStatusSchema.default("SCOUTED"),
  userFeedback: z.string().optional(),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  updatedAt: z.string().datetime().default(() => new Date().toISOString()),
});

export type Competitor = z.infer<typeof CompetitorSchema>;
export type FinancialViability = z.infer<typeof FinancialViabilitySchema>;
export type MvpScope = z.infer<typeof MvpScopeSchema>;
export type IdeaStatus = z.infer<typeof IdeaStatusSchema>;
export type IdeaBrief = z.infer<typeof IdeaBriefSchema>;


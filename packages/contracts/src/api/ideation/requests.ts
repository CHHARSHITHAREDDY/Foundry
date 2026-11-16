import { z } from "zod";

export const SurpriseMeRequestSchema = z.object({
  domainPreference: z.string().optional(),
  targetAudience: z.string().optional(),
  maxCandidates: z.number().int().min(1).max(8).default(5),
});

export const ClarifyIdeaRequestSchema = z.object({
  rawIdea: z.string().min(3),
  answers: z.record(z.string()).optional(),
});

export const ValidateIdeaRequestSchema = z.object({
  ideaId: z.string().optional(),
  title: z.string().min(3),
  problem: z.string().min(5),
  targetCustomer: z.string().min(3),
  proposedSolution: z.string().optional(),
});

export const TweakIdeaRequestSchema = z.object({
  ideaId: z.string(),
  modifications: z.object({
    niche: z.string().optional(),
    pricingModel: z.string().optional(),
    featureAdjustments: z.array(z.string()).optional(),
  }),
});

export const ApproveIdeaRequestSchema = z.object({
  ideaId: z.string(),
  userNotes: z.string().optional(),
});

export type SurpriseMeRequest = z.infer<typeof SurpriseMeRequestSchema>;
export type ClarifyIdeaRequest = z.infer<typeof ClarifyIdeaRequestSchema>;
export type ValidateIdeaRequest = z.infer<typeof ValidateIdeaRequestSchema>;
export type TweakIdeaRequest = z.infer<typeof TweakIdeaRequestSchema>;
export type ApproveIdeaRequest = z.infer<typeof ApproveIdeaRequestSchema>;

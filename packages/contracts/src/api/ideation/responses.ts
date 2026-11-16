import { z } from "zod";
import { IdeaBriefSchema } from "../../idea/idea-brief.js";
import { ClarifierResultSchema } from "../../idea/clarifier.js";
import { PainPointSchema } from "../../idea/pain-point.js";

export const SurpriseMeResponseSchema = z.object({
  selectedIdea: IdeaBriefSchema,
  cachedCandidates: z.array(IdeaBriefSchema),
  scoutedPainPoints: z.array(PainPointSchema),
});

export const ClarifyIdeaResponseSchema = ClarifierResultSchema;

export const ValidateIdeaResponseSchema = IdeaBriefSchema;

export type SurpriseMeResponse = z.infer<typeof SurpriseMeResponseSchema>;
export type ClarifyIdeaResponse = z.infer<typeof ClarifyIdeaResponseSchema>;
export type ValidateIdeaResponse = z.infer<typeof ValidateIdeaResponseSchema>;

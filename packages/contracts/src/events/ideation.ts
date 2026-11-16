import { z } from "zod";
import { IdeaBriefSchema } from "../idea/idea-brief.js";
import { PainPointSchema } from "../idea/pain-point.js";

export const IdeationScoutedEventSchema = z.object({
  painPointsCount: z.number(),
  source: z.string(),
});

export const IdeaGeneratedEventSchema = z.object({
  ideaId: z.string(),
  title: z.string(),
});

export const IdeaApprovedEventSchema = z.object({
  ideaId: z.string(),
  idea: IdeaBriefSchema,
});


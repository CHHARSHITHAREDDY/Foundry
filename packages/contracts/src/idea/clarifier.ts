import { z } from "zod";

export const ClarifierQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  context: z.string().optional(),
  options: z.array(z.string()).optional(),
  targetGap: z.enum(["customer", "problem", "pricing", "scope", "geography"]),
});

export const ClarifierResultSchema = z.object({
  needsClarification: z.boolean(),
  questions: z.array(ClarifierQuestionSchema).max(3),
  clarifiedIdea: z.string().optional(),
});

export type ClarifierQuestion = z.infer<typeof ClarifierQuestionSchema>;
export type ClarifierResult = z.infer<typeof ClarifierResultSchema>;


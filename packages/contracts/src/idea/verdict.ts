import { z } from "zod";

export const VerdictStatusSchema = z.enum(["GO", "GO_WITH_CHANGES", "NO_GO", "INSUFFICIENT_DATA"]);

export const VerdictSchema = z.object({
  status: VerdictStatusSchema,
  summary: z.string().min(10),
  pivot_suggestions: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  suggested_changes: z.array(z.string()).default([]),
});

export type VerdictStatus = z.infer<typeof VerdictStatusSchema>;
export type Verdict = z.infer<typeof VerdictSchema>;



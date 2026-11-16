import { z } from "zod";

export const WorkflowRunStageSchema = z.enum([
  "PENDING",
  "ARCHITECTING",
  "BUILDING",
  "INTEGRATING",
  "QA",
  "REVIEW",
  "DEPLOY",
  "COMPLETED",
  "FAILED",
]);

export const WorkflowStageChangedEventSchema = z.object({
  runId: z.string(),
  ideaId: z.string(),
  previousStage: WorkflowRunStageSchema.optional(),
  currentStage: WorkflowRunStageSchema,
  message: z.string(),
  timestamp: z.string(),
});

export type WorkflowRunStage = z.infer<typeof WorkflowRunStageSchema>;
export type WorkflowStageChangedEvent = z.infer<typeof WorkflowStageChangedEventSchema>;

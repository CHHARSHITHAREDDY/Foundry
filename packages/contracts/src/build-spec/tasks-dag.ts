import { z } from "zod";

export const AgentRoleSchema = z.enum([
  "ARCHITECT",
  "BACKEND",
  "UI",
  "CONTENT",
  "INTEGRATOR",
  "QA",
  "REVIEWER",
  "DEPLOYER",
]);

export const TaskItemSchema = z.object({
  id: z.string(),
  agent: AgentRoleSchema,
  title: z.string(),
  description: z.string(),
  dependencies: z.array(z.string()).default([]),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"]).default("PENDING"),
  outputArtifacts: z.array(z.string()).default([]),
});

export const TaskDagSchema = z.object({
  tasks: z.array(TaskItemSchema),
});

export type AgentRole = z.infer<typeof AgentRoleSchema>;
export type TaskItem = z.infer<typeof TaskItemSchema>;
export type TaskDag = z.infer<typeof TaskDagSchema>;


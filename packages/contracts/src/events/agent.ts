import { z } from "zod";
import { AgentRoleSchema } from "../build-spec/tasks-dag.js";

export const AgentLogEventSchema = z.object({
  runId: z.string(),
  agent: AgentRoleSchema,
  level: z.enum(["info", "warn", "error", "debug"]),
  message: z.string(),
  toolCall: z.object({
    name: z.string(),
    args: z.record(z.any()),
    result: z.any().optional(),
  }).optional(),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
});

export const AgentScreenshotEventSchema = z.object({
  runId: z.string(),
  url: z.string(),
  title: z.string(),
  screenshotBase64: z.string().optional(),
  viewport: z.object({ width: z.number(), height: z.number() }).optional(),
  timestamp: z.string().datetime().default(() => new Date().toISOString()),
});

export type AgentLogEvent = z.infer<typeof AgentLogEventSchema>;
export type AgentScreenshotEvent = z.infer<typeof AgentScreenshotEventSchema>;

import { z } from "zod";

export interface AgentTool<TParams = any, TResult = any> {
  name: string;
  description: string;
  parameters: z.ZodType<TParams>;
  execute: (params: TParams, context?: any) => Promise<TResult>;
}

export function defineTool<TParams, TResult>(tool: AgentTool<TParams, TResult>): AgentTool<TParams, TResult> {
  return tool;
}

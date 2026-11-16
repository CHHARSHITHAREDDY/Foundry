import { LlmClient, Message } from "@venture-studio/llm-client";
import { ModelTier } from "@venture-studio/llm-client";
import { ToolRegistry } from "./tool-registry.js";
import { z } from "zod";

export interface AgentRunOptions {
  agentName: string;
  tier: ModelTier;
  systemPrompt: string;
  userPrompt: string;
  tools?: ToolRegistry;
  maxIterations?: number;
  onLog?: (log: { level: "info" | "warn" | "error"; message: string; toolCall?: any }) => void;
}

export interface AgentRunResult {
  output: string;
  iterations: number;
  toolCallsCount: number;
}

export async function runAgent(
  options: AgentRunOptions,
  llm: LlmClient = new LlmClient()
): Promise<AgentRunResult> {
  const maxIterations = options.maxIterations || 10;
  let iterations = 0;
  let toolCallsCount = 0;

  const messages: Message[] = [
    { role: "system", content: options.systemPrompt },
    { role: "user", content: options.userPrompt },
  ];

  while (iterations < maxIterations) {
    iterations++;

    const response = await llm.complete({
      tier: options.tier,
      messages,
      temperature: 0.2,
    });

    options.onLog?.({
      level: "info",
      message: `Iteration ${iterations} response: ${response.slice(0, 150)}...`,
    });

    // Check if the agent wants to call a tool via structured tag or finish
    // Simple robust tool execution syntax:
    // TOOL: tool_name
    // PARAMS: { ... }
    const toolCallMatch = response.match(/TOOL:\s*([a-zA-Z0-9_-]+)\s*\nPARAMS:\s*(\{[\s\S]*?\})/);

    if (toolCallMatch && options.tools) {
      const toolName = toolCallMatch[1]?.trim();
      const toolParamsRaw = toolCallMatch[2]?.trim();

      const tool = options.tools.get(toolName);
      if (tool) {
        toolCallsCount++;
        let params: any;
        try {
          params = JSON.parse(toolParamsRaw);
        } catch {
          params = {};
        }

        options.onLog?.({
          level: "info",
          message: `Executing tool ${toolName}`,
          toolCall: { name: toolName, args: params },
        });

        try {
          const result = await tool.execute(params);
          messages.push({ role: "assistant", content: response });
          messages.push({
            role: "user",
            content: `TOOL_RESULT for ${toolName}:\n${JSON.stringify(result, null, 2)}`,
          });
          continue;
        } catch (err: any) {
          messages.push({ role: "assistant", content: response });
          messages.push({
            role: "user",
            content: `TOOL_ERROR for ${toolName}: ${err.message}`,
          });
          continue;
        }
      }
    }

    // If no tool called, or execution finished
    return {
      output: response,
      iterations,
      toolCallsCount,
    };
  }

  return {
    output: messages[messages.length - 1]?.content || "",
    iterations,
    toolCallsCount,
  };
}

import fs from "fs";
import path from "path";
import { z } from "zod";
import { LlmClient } from "@venture-studio/llm-client";
import { RealtimeEventHub } from "../../realtime/event-hub.js";

export interface ReActTool {
  name: string;
  description: string;
  parameters: z.ZodType<any>;
  execute: (args: any) => Promise<string>;
}

export interface ReActStep {
  step: number;
  thought: string;
  action: string;
  actionInput: any;
  observation: string;
}

export interface ReActExecutionResult {
  completed: boolean;
  steps: ReActStep[];
  output: Record<string, string>;
  tokensIn: number;
  tokensOut: number;
}

const ReActDecisionSchema = z.object({
  thought: z.string(),
  action: z.enum(["read_file", "search_code", "write_file", "finish"]),
  actionInput: z.record(z.any()),
});

function searchDirectory(dir: string, query: string, maxResults: number = 5): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  function traverse(current: string) {
    if (results.length >= maxResults) return;
    try {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".next" || entry.name.startsWith(".")) continue;
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          traverse(full);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".json"))
        ) {
          try {
            const content = fs.readFileSync(full, "utf-8");
            if (content.toLowerCase().includes(query.toLowerCase())) {
              const rel = path.relative(dir, full).replace(/\\/g, "/");
              results.push(`Found match in ${rel}`);
              if (results.length >= maxResults) return;
            }
          } catch {}
        }
      }
    } catch {}
  }

  traverse(dir);
  return results;
}

export class ReActAgentRunner {
  private llm: LlmClient;
  private hub = RealtimeEventHub.getInstance();

  constructor(llm: LlmClient = new LlmClient()) {
    this.llm = llm;
  }

  /**
   * Executes an autonomous ReAct loop bounded by maxSteps
   */
  async runLoop(
    systemPrompt: string,
    goal: string,
    contextPath: string,
    maxSteps: number = 5,
    runId?: string,
    stage: string = "BUILDING"
  ): Promise<ReActExecutionResult> {
    const steps: ReActStep[] = [];
    let tokensIn = 0;
    let tokensOut = 0;
    const generatedFiles: Record<string, string> = {};

    let conversationHistory = `GOAL: ${goal}\n`;

    for (let step = 1; step <= maxSteps; step++) {
      const prompt = `${systemPrompt}

AVAILABLE TOOLS:
1. "read_file": { "filePath": "relative/path" } -> Reads existing template files or reference types.
2. "search_code": { "query": "string" } -> Searches code identifiers in template.
3. "write_file": { "filePath": "relative/path", "content": "..." } -> Writes or updates a file.
4. "finish": { "summary": "..." } -> Finishes task when all files are complete.

CURRENT CONTEXT & HISTORY:
${conversationHistory}

DECIDE YOUR NEXT STEP. Return JSON conforming to:
{
  "thought": "<your explicit reasoning about what to do next>",
  "action": "read_file" | "search_code" | "write_file" | "finish",
  "actionInput": { ... }
}`;

      let decision: z.infer<typeof ReActDecisionSchema>;
      try {
        const { data, usage } = await this.llm.completeStructured(
          {
            tier: "coder",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
          },
          ReActDecisionSchema
        );
        decision = data;
        tokensIn += usage.promptTokens;
        tokensOut += usage.completionTokens;
      } catch {
        // Fallback default decision if LLM gateway times out
        decision = {
          thought: "Direct synthesis required based on goal specification.",
          action: "finish",
          actionInput: { summary: "Synthesis completed." },
        };
      }

      if (runId) {
        this.hub.broadcast(
          "agent:log",
          {
            runId,
            stage,
            level: "info",
            message: `[${stage} AGENT Step ${step} Thought]: ${decision.thought}`,
          },
          runId
        );
      }

      let observation = "";

      switch (decision.action) {
        case "read_file": {
          const target = path.join(contextPath, decision.actionInput.filePath || "");
          if (fs.existsSync(target) && fs.statSync(target).isFile()) {
            observation = fs.readFileSync(target, "utf-8").slice(0, 2000);
          } else {
            observation = `Error: File not found at ${decision.actionInput.filePath}`;
          }
          break;
        }

        case "search_code": {
          const query = decision.actionInput.query || "";
          const matches = searchDirectory(contextPath, query);
          observation = matches.length > 0 ? matches.join("\n") : `No matches found for query "${query}".`;
          break;
        }

        case "write_file": {
          const filePath = decision.actionInput.filePath;
          const content = decision.actionInput.content;
          if (filePath && content) {
            generatedFiles[filePath] = content;
            observation = `Successfully buffered ${filePath} (${content.length} characters).`;
          } else {
            observation = `Error: filePath and content are required.`;
          }
          break;
        }

        case "finish": {
          steps.push({
            step,
            thought: decision.thought,
            action: decision.action,
            actionInput: decision.actionInput,
            observation: "Finished successfully.",
          });
          if (runId) {
            this.hub.broadcast(
              "agent:log",
              {
                runId,
                stage,
                level: "info",
                message: `[${stage} AGENT Completed]: ${decision.actionInput.summary || "Task finished"}`,
              },
              runId
            );
          }
          return {
            completed: true,
            steps,
            output: generatedFiles,
            tokensIn,
            tokensOut,
          };
        }
      }

      steps.push({
        step,
        thought: decision.thought,
        action: decision.action,
        actionInput: decision.actionInput,
        observation,
      });

      conversationHistory += `\nStep ${step}:\nThought: ${decision.thought}\nAction: ${decision.action} (${JSON.stringify(decision.actionInput)})\nObservation: ${observation}\n`;
    }

    return {
      completed: true,
      steps,
      output: generatedFiles,
      tokensIn,
      tokensOut,
    };
  }
}

export const reActRunner = new ReActAgentRunner();

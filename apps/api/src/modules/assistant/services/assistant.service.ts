export interface CopilotStatus {
  name: string;
  status: "active" | "idle";
  currentTask: string;
  engineVersion: string;
}

export class AssistantService {
  getStatus(): CopilotStatus {
    return {
      name: "Ember Copilot",
      status: "active",
      currentTask: "WRITING THE CODE // DEPLOYING TO EDGE",
      engineVersion: "v2.4 [NODE 08]",
    };
  }

  async processRefinement(prompt: string, ventureId?: string): Promise<{ reply: string; patchGenerated: boolean }> {
    return {
      reply: `Ember Copilot analyzed request: "${prompt}". Ready to dispatch coder agent.`,
      patchGenerated: true,
    };
  }
}

export const assistantService = new AssistantService();


import { AgentTool } from "./tool.js";

export class ToolRegistry {
  private tools = new Map<string, AgentTool>();

  register(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  get(name: string): AgentTool | undefined {
    return this.tools.get(name);
  }

  list(): AgentTool[] {
    return Array.from(this.tools.values());
  }

  getDescriptions(): string {
    return this.list()
      .map(
        (t) =>
          `Tool: ${t.name}\nDescription: ${t.description}`
      )
      .join("\n\n");
  }
}

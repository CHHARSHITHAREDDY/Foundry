import { llmGateway, ModelTier } from "@venture-studio/llm-client";

export class ModelGatewayService {
  getTiers() {
    return [
      { tier: "fast", model: "gemini-2.5-flash", useCase: "Scouting, triage & clarifier" },
      { tier: "reasoner", model: "gemini-2.5-pro", useCase: "Architecture, validation & review" },
      { tier: "coder", model: "claude-3-7-sonnet", useCase: "Fullstack code, schema & tests" },
      { tier: "writer", model: "gemini-2.5-pro", useCase: "Editorial copy, PRD & docs" },
      { tier: "vision", model: "gemini-2.5-flash", useCase: "Playwright UI & screenshot audits" },
    ];
  }

  async generate(tier: ModelTier, systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await llmGateway.complete({
      tier,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return res;
  }
}

export const modelGatewayService = new ModelGatewayService();

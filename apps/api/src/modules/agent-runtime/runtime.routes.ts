import type { FastifyInstance } from "fastify";
import { AgentSwarmExecutor } from "./runner/agent-executor.js";
import { IdeaBriefSchema } from "@venture-studio/contracts";

export async function runtimeRoutes(app: FastifyInstance) {
  const executor = new AgentSwarmExecutor();

  app.post("/api/runtime/build", async (request) => {
    const raw = ((request.body as any)?.idea || request.body || {}) as any;
    const normalized = {
      id: raw.id || `idea_${Date.now()}`,
      title: raw.title || "Venture",
      tagline: raw.tagline || (raw.problem ? raw.problem.slice(0, 60) : "Automated SaaS solution"),
      problem: raw.problem || "Automated workflow challenge",
      targetCustomer: raw.targetCustomer || "Founders and operators",
      whyNow: raw.whyNow || "Growing market demand and automation opportunities",
      archetype: raw.archetype || "Micro-SaaS Tool",
      mvpScope: raw.mvpScope || {
        screens: ["Dashboard", "Settings"],
        coreApis: ["/api/check", "/api/notify"],
        keyFeatures: ["Automation engine", "Webhook alerts"],
        estimatedComplexity: "LOW" as const,
      },
      competitors: raw.competitors || [],
      evidence: raw.evidence || [],
      scorecard: raw.scorecard,
      verdict: raw.verdict,
      status: raw.status || "APPROVED",
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };

    const idea = IdeaBriefSchema.parse(normalized);
    request.log.info({ ideaTitle: idea.title }, "Starting agent swarm build");

    const result = await executor.executeBuild(idea, (stage, message) => {
      request.log.info({ stage }, message);
    });

    return result;
  });
}


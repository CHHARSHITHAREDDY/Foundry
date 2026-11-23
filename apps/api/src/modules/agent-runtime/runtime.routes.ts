import type { FastifyInstance } from "fastify";
import { AgentSwarmExecutor } from "./runner/agent-executor.js";
import { IdeaBriefSchema } from "@venture-studio/contracts";
import { requireAuth, enforceRateLimitAndBudget } from "../auth/guards/auth.guard.js";
import { prismaDatabase } from "../../db/prisma.service.js";

export async function runtimeRoutes(app: FastifyInstance) {
  const executor = new AgentSwarmExecutor();

  app.post("/api/runtime/build", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;

    const budget = enforceRateLimitAndBudget(user, "build", 25, 10);
    if (!budget.allowed) {
      return reply.status(budget.statusCode || 429).send({
        statusCode: budget.statusCode || 429,
        error: "BUDGET_LIMIT_REACHED",
        message: budget.error,
      });
    }

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
      ownerId: user.id,
      status: raw.status || "APPROVED",
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };

    const idea = IdeaBriefSchema.parse(normalized);
    request.log.info({ ideaTitle: idea.title, userId: user.id }, "Starting agent swarm build");

    const result = await executor.executeBuild(
      idea,
      (stage, message) => {
        request.log.info({ stage }, message);
      },
      user.id
    );

    return result;
  });

  // Get durable run status and checkpoints from PostgreSQL
  app.get("/api/runtime/runs/:runId", async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const prisma = prismaDatabase.client;
    if (!prisma) {
      return reply.status(503).send({ error: "DATABASE_NOT_AVAILABLE" });
    }

    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: {
        checkpoints: {
          orderBy: { createdAt: "asc" },
        },
        artifacts: {
          select: { id: true, filePath: true, fileType: true, createdAt: true },
        },
      },
    });

    if (!run) {
      return reply.status(404).send({ error: "RUN_NOT_FOUND", runId });
    }

    return run;
  });

  // List stage checkpoints for a run
  app.get("/api/runtime/runs/:runId/checkpoints", async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const prisma = prismaDatabase.client;
    if (!prisma) {
      return reply.status(503).send({ error: "DATABASE_NOT_AVAILABLE" });
    }

    const checkpoints = await prisma.runStageCheckpoint.findMany({
      where: { runId },
      orderBy: { createdAt: "asc" },
    });

    return { runId, checkpoints, count: checkpoints.length };
  });
}


import type { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
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
    const requestedRunId = (request.body as any)?.runId || (raw as any)?.runId;
    request.log.info({ ideaTitle: idea.title, userId: user.id, runId: requestedRunId }, "Starting agent swarm build");

    const result = await executor.executeBuild(
      idea,
      (stage, message) => {
        request.log.info({ stage }, message);
      },
      user.id,
      requestedRunId
    );

    return result;
  });

  // List all durable runs from PostgreSQL and disk
  app.get("/api/runtime/runs", async (request, reply) => {
    const prisma = prismaDatabase.client;
    const runsMap = new Map<string, any>();

    // 1. Fetch from Postgres if available
    if (prisma) {
      try {
        const dbRuns = await prisma.workflowRun.findMany({
          orderBy: { createdAt: "desc" },
          take: 30,
        });
        for (const r of dbRuns) {
          runsMap.set(r.id, {
            id: r.id,
            status: (r as any).status || r.currentStage || "COMPLETED",
            createdAt: r.createdAt,
            ideaTitle: (r as any).ideaTitle || "Autonomous Venture",
            tagline: (r as any).tagline || "Built by Venture Studio Agent Swarm",
            stagesCompleted: r.completedStages?.length || 8,
          });
        }
      } catch {}
    }

    // 2. Fetch from physical disk directory builds/
    const buildsDir = path.resolve(process.cwd(), "builds");
    if (fs.existsSync(buildsDir)) {
      try {
        const entries = fs.readdirSync(buildsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith("run_")) {
            const runId = entry.name;
            const specPath = path.join(buildsDir, runId, "build-spec.json");
            let title = "Generated SaaS Venture";
            let tagline = "Autonomous full-stack application";
            let createdAt = new Date().toISOString();

            if (fs.existsSync(specPath)) {
              try {
                const spec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
                title = spec.name || spec.title || title;
                tagline = spec.tagline || spec.description || tagline;
              } catch {}
            }

            try {
              const stat = fs.statSync(path.join(buildsDir, runId));
              createdAt = stat.birthtime.toISOString();
            } catch {}

            if (!runsMap.has(runId)) {
              runsMap.set(runId, {
                id: runId,
                status: "COMPLETED",
                createdAt,
                ideaTitle: title,
                tagline,
                stagesCompleted: 8,
              });
            }
          }
        }
      } catch {}
    }

    const allRuns = Array.from(runsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { runs: allRuns, count: allRuns.length };
  });

  // Get durable run status, checkpoints, and files from PostgreSQL or disk
  app.get("/api/runtime/runs/:runId", async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const prisma = prismaDatabase.client;

    let run: any = null;
    if (prisma) {
      try {
        run = await prisma.workflowRun.findUnique({
          where: { id: runId },
          include: {
            checkpoints: {
              orderBy: { createdAt: "asc" },
            },
            artifacts: {
              select: { id: true, filePath: true, fileType: true, content: true, createdAt: true },
            },
          },
        });
      } catch {}
    }

    // Physical disk fallback: check builds/<runId>
    const buildDir = path.resolve(process.cwd(), "builds", runId);
    let diskFiles: Record<string, string> = {};
    let buildSpec: any = null;

    if (fs.existsSync(buildDir)) {
      try {
        const specPath = path.join(buildDir, "build-spec.json");
        if (fs.existsSync(specPath)) {
          buildSpec = JSON.parse(fs.readFileSync(specPath, "utf-8"));
        }
        const candidateFiles = [
          "src/app/page.tsx",
          "src/app/(app)/dashboard/page.tsx",
          "src/db/schema/app.ts",
          "src/app/api/items/route.ts",
          "package.json",
        ];
        for (const rel of candidateFiles) {
          const full = path.join(buildDir, rel);
          if (fs.existsSync(full)) {
            diskFiles[rel] = fs.readFileSync(full, "utf-8");
          }
        }
      } catch {}
    }

    if (!run && !buildSpec && Object.keys(diskFiles).length === 0) {
      return reply.status(404).send({ error: "RUN_NOT_FOUND", runId });
    }

    return {
      ...(run || {
        id: runId,
        status: "COMPLETED",
        checkpoints: [],
        artifacts: [],
      }),
      buildSpec,
      files: diskFiles,
      sandboxPath: fs.existsSync(buildDir) ? buildDir : undefined,
    };
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


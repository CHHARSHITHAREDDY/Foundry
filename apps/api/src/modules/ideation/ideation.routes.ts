import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { TrendScoutService } from "./domain/scout/trend-scout.service.js";
import { IdeaClusterService } from "./domain/cluster/idea-cluster.service.js";
import { IdeaGeneratorService } from "./domain/generator/idea-generator.service.js";
import { ValidatorService } from "./domain/validator/validator.service.js";
import { ClarifierService } from "./domain/clarifier/clarifier.service.js";
import { NoveltyMemoryService } from "./domain/novelty/novelty-memory.service.js";
import { requireAuth, requireRateLimit } from "../auth/guards/auth.guard.js";
import { prismaDatabase } from "../../db/prisma.service.js";
import { RealtimeEventHub, StreamEvent } from "../realtime/event-hub.js";
import { AgentSwarmExecutor } from "../agent-runtime/runner/agent-executor.js";
import { IdeaBrief } from "@venture-studio/contracts";

const StartSurpriseSchema = z.object({
  maxCandidates: z.number().int().min(1).max(12).optional().default(8),
});

const CreateCustomIdeaSchema = z.object({
  promptText: z.string().min(5, "Please describe your idea in at least 5 characters").max(4000),
});

const ClarifyCustomIdeaSchema = z.object({
  answers: z.record(z.string()).default({}),
});

const TweakIdeaSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  tagline: z.string().min(2).max(300).optional(),
  problem: z.string().min(5).max(2000).optional(),
  targetCustomer: z.string().min(2).max(300).optional(),
  whyNow: z.string().max(1000).optional(),
  wedge: z.string().max(1000).optional(),
});

async function getActionCreditCost(action: string, fallback: number): Promise<number> {
  const prisma = await prismaDatabase.ensureReady();
  if (!prisma) return fallback;
  const row = await prisma.pricingConfig.findUnique({ where: { action } });
  return row?.credits ?? fallback;
}

async function persistValidatedIdea(
  prisma: NonNullable<typeof prismaDatabase.client>,
  userId: string,
  validated: Awaited<ReturnType<ValidatorService["validateIdea"]>>,
  batchId?: string
) {
  const sc = validated.honestScorecard;
  const venture = await prisma.venture.create({
    data: {
      title: validated.title,
      tagline: validated.tagline,
      problem: validated.problem,
      targetCustomer: validated.targetCustomer,
      jobToBeDone: (validated as any).jobToBeDone || null,
      whyNow: validated.whyNow,
      wedge: (validated as any).wedge || null,
      archetype: validated.archetype || "monitor",
      mvpScope: validated.mvpScope as any,
      batchId: batchId || null,
      ideaStatus: "CANDIDATE",
      verdict: sc.verdictLabel === "PRELIMINARY" ? "GO_WITH_CHANGES" : "INSUFFICIENT_DATA",
      verdictLabel: sc.verdictLabel,
      totalScore: sc.total,
      scorecardType: sc.scorecardType,
      assessedDimensionsCount: sc.assessedDimensionsCount,
      status: "BUILDING",
      ownerId: userId,
    },
  });

  await prisma.scorecard.create({
    data: {
      ventureId: venture.id,
      demand: sc.demand,
      competition: sc.competition,
      differentiation: sc.differentiation,
      monetization: sc.monetization,
      buildability: sc.buildability,
      total: sc.total,
      scorecardType: sc.scorecardType,
      basis: sc.basis as any,
      sources: sc.sources,
    },
  });

  for (const ev of validated.evidence) {
    await prisma.evidenceCitation.create({
      data: {
        ventureId: venture.id,
        painPointId: ev.id || null,
        source: ev.title || "Live Source",
        url: ev.url || "",
        quote: ev.snippet || "",
        sourceType: "LIVE_API",
        citationVerified: Boolean(ev.verified),
        sourceCreatedAt: ev.gathered_at ? new Date(ev.gathered_at) : null,
      },
    });
  }

  for (const comp of validated.fetchedCompetitors) {
    await prisma.competitorRecord.create({
      data: {
        ventureId: venture.id,
        name: comp.name,
        url: comp.url,
        pricingText: comp.pricingText,
        gap: comp.gap,
        fetchedAt: new Date(comp.fetchedAt),
      },
    });
  }

  return venture;
}

export async function ideationRoutes(app: FastifyInstance) {
  const scout = new TrendScoutService();
  const clusterer = new IdeaClusterService();
  const generator = new IdeaGeneratorService();
  const validator = new ValidatorService();
  const clarifier = new ClarifierService();
  const hub = RealtimeEventHub.getInstance();
  const executor = new AgentSwarmExecutor();

  // 1. POST /api/ideas/surprise -> Creates IdeaJob, reserves credits, runs async SSE pipeline
  app.post("/api/ideas/surprise", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    if (!(await requireRateLimit(request, reply, "ideas:surprise", 15, 60_000))) return;

    const body = StartSurpriseSchema.parse(request.body || {});
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) {
      return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "Database unavailable." });
    }

    const cost = await getActionCreditCost("SURPRISE_SCOUT", 5);
    if (user.credits < cost) {
      return reply.status(402).send({
        statusCode: 402,
        error: "INSUFFICIENT_CREDITS",
        message: `Surprise Me requires ${cost} credits, but your balance is ${user.credits}.`,
      });
    }

    const job = await prisma.ideaJob.create({
      data: { userId: user.id, mode: "SURPRISE", status: "RUNNING" },
    });

    try {
      await prismaDatabase.recordCreditTransaction({
        userId: user.id,
        action: "RESERVE",
        amount: -cost,
        reason: "SURPRISE_ME_SCOUT",
        idempotencyKey: `idea_job:${job.id}`,
        metadata: { jobId: job.id },
      });
      await prismaDatabase.recordAuditLog(user.id, "IDEA_SURPRISE_START", job.id, { cost });
    } catch (err: any) {
      await prisma.ideaJob.update({ where: { id: job.id }, data: { status: "FAILED", error: err.message } });
      return reply.status(402).send({ statusCode: 402, error: "INSUFFICIENT_CREDITS", message: err.message });
    }

    const streamName = `idea_job:${job.id}`;

    // Fire-and-forget async job execution streaming real events
    (async () => {
      const refundOnce = async (reason: string) => {
        try {
          await prismaDatabase.recordCreditTransaction({
            userId: user.id,
            action: "REFUND",
            amount: cost,
            reason,
            idempotencyKey: `refund:idea_job:${job.id}`,
            metadata: { jobId: job.id },
          });
          await hub.broadcast("agent:log", { userId: user.id, creditsRefunded: cost }, `user:${user.id}`, `user:${user.id}`);
        } catch {}
      };

      try {
        const { painPoints, sourcesSummary, windowDaysUsed } = await scout.scoutPainPointsDetailed();
        await hub.broadcast(
          "idea:sources",
          { jobId: job.id, sourcesSummary, windowDaysUsed, totalVerified: painPoints.length },
          job.id,
          streamName
        );

        const currentJob = await prisma.ideaJob.findUnique({ where: { id: job.id } });
        if (currentJob?.status === "CANCELLED") {
          await refundOnce("SURPRISE_CANCELLED_REFUND");
          return;
        }

        if (painPoints.length === 0) {
          await refundOnce("INSUFFICIENT_LIVE_DATA_REFUND");
          await prisma.ideaJob.update({
            where: { id: job.id },
            data: { status: "INSUFFICIENT_LIVE_DATA", sourcesSummary },
          });
          await hub.broadcast(
            "idea:insufficient",
            { jobId: job.id, message: "No fresh signals found, try again.", refunded: cost },
            job.id,
            streamName
          );
          return;
        }

        const signals = await clusterer.extractSignals(painPoints);
        for (const sig of signals.slice(0, 8)) {
          await hub.broadcast(
            "idea:pain_point",
            {
              jobId: job.id,
              id: sig.painPointId,
              source: sig.source,
              url: sig.sourceUrl,
              quote: sig.quote,
              problem: sig.problem,
              createdAt: sig.createdAt,
            },
            job.id,
            streamName
          );
        }

        const clusters = clusterer.clusterAndRank(signals);
        const { candidates, droppedLog } = await generator.generateFromClusters(clusters, user.id, body.maxCandidates);

        for (const dropped of droppedLog) {
          await hub.broadcast("idea:dropped", { jobId: job.id, ...dropped }, job.id, streamName);
        }

        if (candidates.length === 0) {
          await refundOnce("NO_VALID_CANDIDATES_REFUND");
          await prisma.ideaJob.update({
            where: { id: job.id },
            data: { status: "INSUFFICIENT_LIVE_DATA", sourcesSummary, droppedLog: droppedLog as any },
          });
          await hub.broadcast(
            "idea:insufficient",
            { jobId: job.id, message: "No fresh signals found, try again.", refunded: cost },
            job.id,
            streamName
          );
          return;
        }

        const validatedList = await Promise.all(candidates.slice(0, 5).map((c) => validator.validateIdea(c)));
        const savedVentures = [];
        const novelty = NoveltyMemoryService.getInstance();

        for (const v of validatedList) {
          const saved = await persistValidatedIdea(prisma, user.id, v, job.id);
          savedVentures.push(saved);
        }

        const top3 = savedVentures.slice(0, 3);
        for (const t of top3) {
          await novelty.recordShownIdea(user.id, t.title, t.problem, "SHOWN");
        }

        await prisma.ideaJob.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            sourcesSummary,
            droppedLog: droppedLog as any,
            resultIdeaId: savedVentures[0]!.id,
          },
        });

        await hub.broadcast(
          "idea:completed",
          {
            jobId: job.id,
            topCandidates: top3.map((v) => ({
              id: v.id,
              title: v.title,
              tagline: v.tagline,
              archetype: v.archetype,
              verdictLabel: v.verdictLabel,
            })),
          },
          job.id,
          streamName
        );
      } catch (err: any) {
        await refundOnce("SURPRISE_ERROR_REFUND");
        await prisma.ideaJob.update({
          where: { id: job.id },
          data: { status: "FAILED", error: err?.message || "Pipeline error" },
        });
        await hub.broadcast(
          "idea:error",
          { jobId: job.id, message: err?.message || "Pipeline failed", refunded: cost },
          job.id,
          streamName
        );
      }
    })();

    return reply.status(202).send({ jobId: job.id, status: "RUNNING" });
  });

  // 2. GET /api/ideas/jobs/:id -> Poll job state
  app.get("/api/ideas/jobs/:id", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const job = await prisma.ideaJob.findFirst({ where: { id, userId: user.id } });
    if (!job) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Job not found." });

    const topIdeas = await prisma.venture.findMany({
      where: { batchId: job.id, ownerId: user.id },
      orderBy: { createdAt: "asc" },
      take: 3,
    });

    return reply.send({ job, topIdeas });
  });

  // 3. POST /api/ideas/jobs/:id/cancel -> Cancel job
  app.post("/api/ideas/jobs/:id/cancel", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    if (!(await requireRateLimit(request, reply, "ideas:cancel", 20, 60_000))) return;

    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const job = await prisma.ideaJob.findFirst({ where: { id, userId: user.id } });
    if (!job) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Job not found." });

    await prisma.ideaJob.update({ where: { id: job.id }, data: { status: "CANCELLED" } });
    await prismaDatabase.recordAuditLog(user.id, "IDEA_JOB_CANCEL", job.id);
    return reply.send({ cancelled: true });
  });

  // 4. GET /api/ideas/jobs/:id/stream -> SSE with Last-Event-ID replay
  app.get("/api/ideas/jobs/:id/stream", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const job = await prisma.ideaJob.findFirst({ where: { id, userId: user.id } });
    if (!job) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Job not found." });

    const streamName = `idea_job:${id}`;
    const origin = request.headers.origin || "http://localhost:3000";
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", origin);
    reply.raw.setHeader("Access-Control-Allow-Credentials", "true");

    const lastEventId =
      (request.headers["last-event-id"] as string | undefined) ||
      (request.query as any)?.lastEventId;

    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ jobId: id, status: job.status })}\n\n`);

    // Replay existing events from Postgres
    try {
      const missed = await prismaDatabase.getEventsSince(streamName, lastEventId);
      for (const evt of missed) {
        reply.raw.write(`id: ${evt.id}\nevent: ${evt.eventType}\ndata: ${JSON.stringify(evt.payload)}\n\n`);
      }
    } catch {}

    const onEvent = (event: StreamEvent) => {
      if (event.stream !== streamName) return;
      try {
        reply.raw.write(`id: ${event.id || ""}\nevent: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`);
      } catch {}
    };

    hub.on("stream-event", onEvent);
    const interval = setInterval(() => {
      try {
        reply.raw.write(`event: ping\ndata: ${Date.now()}\n\n`);
      } catch {}
    }, 15000);

    request.raw.on("close", () => {
      clearInterval(interval);
      hub.off("stream-event", onEvent);
    });
  });

  // 5. GET /api/ideas/drafts -> Return user's draft ideas (for /new resume link)
  app.get("/api/ideas/drafts", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.send({ drafts: [] });

    const drafts = await prisma.venture.findMany({
      where: { ownerId: user.id, ideaStatus: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });
    return reply.send({ drafts });
  });

  // 6. POST /api/ideas -> Submit own idea & get 0-3 clarifying questions
  app.post("/api/ideas", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    if (!(await requireRateLimit(request, reply, "ideas:create", 20, 60_000))) return;

    const body = CreateCustomIdeaSchema.parse(request.body);
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const clarified = await clarifier.clarify(body.promptText);
    const venture = await prisma.venture.create({
      data: {
        title: body.promptText.slice(0, 60),
        problem: body.promptText,
        targetCustomer: "Target Operators",
        ideaStatus: "DRAFT",
        clarifyQuestions: clarified.questions as any,
        ownerId: user.id,
      },
    });

    await prismaDatabase.recordAuditLog(user.id, "IDEA_CUSTOM_CREATE", venture.id);
    return reply.status(201).send({
      id: venture.id,
      needsClarification: clarified.needsClarification,
      questions: clarified.questions,
    });
  });

  // 7. POST /api/ideas/:id/clarify -> Submit answers and validate custom idea
  app.post("/api/ideas/:id/clarify", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    if (!(await requireRateLimit(request, reply, "ideas:clarify", 20, 60_000))) return;

    const { id } = request.params as { id: string };
    const body = ClarifyCustomIdeaSchema.parse(request.body || {});
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const venture = await prisma.venture.findFirst({ where: { id, ownerId: user.id } });
    if (!venture) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Idea not found." });

    const cost = await getActionCreditCost("IDEA_VALIDATE", 3);
    if (user.credits < cost) {
      return reply.status(402).send({
        statusCode: 402,
        error: "INSUFFICIENT_CREDITS",
        message: `Validation requires ${cost} credits, but your balance is ${user.credits}.`,
      });
    }

    const answerSummary = Object.entries(body.answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("; ");
    const combinedPrompt = answerSummary ? `${venture.problem} (${answerSummary})` : venture.problem;

    await prismaDatabase.recordCreditTransaction({
      userId: user.id,
      action: "RESERVE",
      amount: -cost,
      reason: "IDEA_VALIDATE",
      idempotencyKey: `clarify:${venture.id}`,
    });

    const brief: IdeaBrief = {
      id: venture.id,
      title: venture.title,
      tagline: `Solution for ${combinedPrompt.slice(0, 80)}`,
      problem: combinedPrompt,
      targetCustomer: body.answers.q_customer || venture.targetCustomer || "Operators",
      whyNow: "Increasing automation demand across workflows.",
      archetype: "tracker",
      mvpScope: {
        screens: ["Dashboard", "Detail View", "Settings"],
        coreApis: ["/api/records", "/api/reports"],
        keyFeatures: ["Core workflow tracker", "Automated export"],
        estimatedComplexity: "LOW",
      },
      competitors: [],
      evidence: [],
      status: "VALIDATED",
      createdAt: venture.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validated = await validator.validateIdea(brief);
    const sc = validated.honestScorecard;

    await prisma.venture.update({
      where: { id: venture.id },
      data: {
        problem: combinedPrompt,
        tagline: validated.tagline,
        targetCustomer: validated.targetCustomer,
        ideaStatus: "CANDIDATE",
        verdict: sc.verdictLabel === "PRELIMINARY" ? "GO_WITH_CHANGES" : "INSUFFICIENT_DATA",
        verdictLabel: sc.verdictLabel,
        totalScore: sc.total,
        scorecardType: sc.scorecardType,
        assessedDimensionsCount: sc.assessedDimensionsCount,
      },
    });

    await prisma.scorecard.upsert({
      where: { ventureId: venture.id },
      create: {
        ventureId: venture.id,
        demand: sc.demand,
        competition: sc.competition,
        differentiation: sc.differentiation,
        monetization: sc.monetization,
        buildability: sc.buildability,
        total: sc.total,
        scorecardType: sc.scorecardType,
        basis: sc.basis as any,
        sources: sc.sources,
      },
      update: {
        demand: sc.demand,
        competition: sc.competition,
        differentiation: sc.differentiation,
        monetization: sc.monetization,
        buildability: sc.buildability,
        total: sc.total,
        scorecardType: sc.scorecardType,
        basis: sc.basis as any,
        sources: sc.sources,
      },
    });

    for (const comp of validated.fetchedCompetitors) {
      await prisma.competitorRecord.create({
        data: {
          ventureId: venture.id,
          name: comp.name,
          url: comp.url,
          pricingText: comp.pricingText,
          gap: comp.gap,
          fetchedAt: new Date(comp.fetchedAt),
        },
      });
    }

    await prismaDatabase.recordAuditLog(user.id, "IDEA_CLARIFY_VALIDATED", venture.id);
    return reply.send({ ideaId: venture.id, status: "COMPLETED" });
  });

  // 8. GET /api/ideas/next?after=:id -> Next pre-validated candidate from DB
  app.get("/api/ideas/next", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    const { after } = (request.query as { after?: string }) || {};
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const seenRows = await prisma.userSeenIdea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const seenTitles = new Set(seenRows.map((s) => s.title.toLowerCase()));

    const candidates = await prisma.venture.findMany({
      where: {
        ownerId: user.id,
        ideaStatus: "CANDIDATE",
        ...(after ? { id: { not: after } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const nextCandidate = candidates.find((c) => !seenTitles.has(c.title.toLowerCase())) || candidates[0];
    if (nextCandidate) {
      await NoveltyMemoryService.getInstance().recordShownIdea(user.id, nextCandidate.title, nextCandidate.problem, "SHOWN");
      return reply.send({ id: nextCandidate.id, title: nextCandidate.title, generatedFresh: false });
    }

    // Exhausted: generate a fresh candidate from live sources
    const { painPoints } = await scout.scoutPainPointsDetailed();
    if (painPoints.length === 0) {
      return reply.status(404).send({
        statusCode: 404,
        error: "INSUFFICIENT_LIVE_DATA",
        message: "No fresh signals found, try again.",
      });
    }

    const signals = await clusterer.extractSignals(painPoints);
    const clusters = clusterer.clusterAndRank(signals);
    const { candidates: fresh } = await generator.generateFromClusters(clusters, user.id, 3);
    if (fresh.length === 0) {
      return reply.status(404).send({
        statusCode: 404,
        error: "INSUFFICIENT_LIVE_DATA",
        message: "No fresh signals found, try again.",
      });
    }

    const validated = await validator.validateIdea(fresh[0]!);
    const saved = await persistValidatedIdea(prisma, user.id, validated);
    await NoveltyMemoryService.getInstance().recordShownIdea(user.id, saved.title, saved.problem, "SHOWN");

    return reply.send({ id: saved.id, title: saved.title, generatedFresh: true });
  });

  // 9. GET /api/ideas/:id -> Full Idea Card
  app.get("/api/ideas/:id", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const venture = await prisma.venture.findFirst({
      where: { id, ownerId: user.id },
      include: {
        scorecard: true,
        evidence: true,
        competitors: true,
        runs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!venture) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Idea not found." });

    return reply.send({
      idea: {
        id: venture.id,
        title: venture.title,
        tagline: venture.tagline,
        problem: venture.problem,
        persona: venture.targetCustomer,
        jobToBeDone: venture.jobToBeDone,
        whyNow: venture.whyNow,
        wedge: venture.wedge,
        archetype: venture.archetype,
        mvpScope: venture.mvpScope,
        ideaStatus: venture.ideaStatus,
        verdictLabel: venture.verdictLabel,
        evidence: venture.evidence,
        competitors: venture.competitors,
        scorecard: venture.scorecard,
        latestRunId: venture.runs[0]?.id || null,
        createdAt: venture.createdAt.toISOString(),
      },
    });
  });

  // 10. POST /api/ideas/:id/tweak
  app.post("/api/ideas/:id/tweak", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    if (!(await requireRateLimit(request, reply, "ideas:tweak", 30, 60_000))) return;

    const { id } = request.params as { id: string };
    const body = TweakIdeaSchema.parse(request.body || {});
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const existing = await prisma.venture.findFirst({ where: { id, ownerId: user.id } });
    if (!existing) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Idea not found." });

    const updated = await prisma.venture.update({
      where: { id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.tagline ? { tagline: body.tagline } : {}),
        ...(body.problem ? { problem: body.problem } : {}),
        ...(body.targetCustomer ? { targetCustomer: body.targetCustomer } : {}),
        ...(body.whyNow ? { whyNow: body.whyNow } : {}),
        ...(body.wedge ? { wedge: body.wedge } : {}),
      },
    });

    await prismaDatabase.recordAuditLog(user.id, "IDEA_TWEAK", id);
    return reply.send({ idea: updated });
  });

  // 11. POST /api/ideas/:id/rescore -> Before/after rescore
  app.post("/api/ideas/:id/rescore", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    if (!(await requireRateLimit(request, reply, "ideas:rescore", 20, 60_000))) return;

    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const venture = await prisma.venture.findFirst({
      where: { id, ownerId: user.id },
      include: { scorecard: true, evidence: true },
    });
    if (!venture) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Idea not found." });

    const before = venture.scorecard;
    const brief: IdeaBrief = {
      id: venture.id,
      title: venture.title,
      tagline: venture.tagline || "",
      problem: venture.problem,
      targetCustomer: venture.targetCustomer,
      whyNow: venture.whyNow || "",
      archetype: venture.archetype || "monitor",
      mvpScope: (venture.mvpScope as any) || { screens: ["Dashboard"], coreApis: [], keyFeatures: [], estimatedComplexity: "LOW" },
      competitors: [],
      evidence: venture.evidence.map((e) => ({
        id: e.id,
        type: "forum_complaint" as const,
        url: e.url,
        title: e.source,
        snippet: e.quote,
        verified: e.citationVerified,
        confidence: "high" as const,
        gathered_at: e.createdAt.toISOString(),
      })),
      status: "VALIDATED",
      createdAt: venture.createdAt.toISOString(),
      updatedAt: venture.updatedAt.toISOString(),
    };
    (brief as any).wedge = venture.wedge;

    const rescored = await validator.validateIdea(brief);
    const sc = rescored.honestScorecard;

    const after = await prisma.scorecard.upsert({
      where: { ventureId: venture.id },
      create: {
        ventureId: venture.id,
        demand: sc.demand,
        competition: sc.competition,
        differentiation: sc.differentiation,
        monetization: sc.monetization,
        buildability: sc.buildability,
        total: sc.total,
        scorecardType: sc.scorecardType,
        basis: sc.basis as any,
        sources: sc.sources,
      },
      update: {
        demand: sc.demand,
        competition: sc.competition,
        differentiation: sc.differentiation,
        monetization: sc.monetization,
        buildability: sc.buildability,
        total: sc.total,
        scorecardType: sc.scorecardType,
        basis: sc.basis as any,
        sources: sc.sources,
      },
    });

    await prisma.venture.update({
      where: { id: venture.id },
      data: { totalScore: sc.total, verdictLabel: sc.verdictLabel, assessedDimensionsCount: sc.assessedDimensionsCount },
    });

    await prismaDatabase.recordAuditLog(user.id, "IDEA_RESCORE", id);
    return reply.send({ before, after });
  });

  // 12. GET /api/ideas/:id/evidence
  app.get("/api/ideas/:id/evidence", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const venture = await prisma.venture.findFirst({ where: { id, ownerId: user.id }, include: { evidence: true } });
    if (!venture) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Idea not found." });

    return reply.send({ title: venture.title, evidence: venture.evidence });
  });

  // 13. GET /api/ideas/:id/competitors
  app.get("/api/ideas/:id/competitors", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const venture = await prisma.venture.findFirst({ where: { id, ownerId: user.id }, include: { competitors: true } });
    if (!venture) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Idea not found." });

    return reply.send({ title: venture.title, competitors: venture.competitors });
  });

  // 14. POST /api/ideas/:id/approve -> Idempotent credit reserve + launch 8-agent build swarm!
  app.post("/api/ideas/:id/approve", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    if (!(await requireRateLimit(request, reply, "ideas:approve", 15, 60_000))) return;

    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const venture = await prisma.venture.findFirst({
      where: { id, ownerId: user.id },
      include: { runs: { orderBy: { createdAt: "desc" }, take: 1 }, evidence: true },
    });
    if (!venture) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Idea not found." });

    // Idempotent check: if already approved and has a run, return existing run
    if (venture.ideaStatus === "APPROVED" && venture.runs[0]) {
      return reply.send({ companyId: venture.id, runId: venture.runs[0].id });
    }

    const cost = await getActionCreditCost("BUILD_VENTURE", 25);
    if (user.credits < cost) {
      return reply.status(402).send({
        statusCode: 402,
        error: "INSUFFICIENT_CREDITS",
        message: `Building requires ${cost} credits, but your balance is ${user.credits}.`,
      });
    }

    const runId = `run_${Math.random().toString(36).substring(2, 10)}`;

    try {
      await prismaDatabase.recordCreditTransaction({
        userId: user.id,
        action: "RESERVE",
        amount: -cost,
        reason: "BUILD_VENTURE_RESERVE",
        runId,
        idempotencyKey: `approve:${venture.id}`,
      });
    } catch (err: any) {
      return reply.status(402).send({ statusCode: 402, error: "INSUFFICIENT_CREDITS", message: err.message });
    }

    await prisma.venture.update({
      where: { id: venture.id },
      data: { ideaStatus: "APPROVED", status: "BUILDING" },
    });

    const ideaBrief: IdeaBrief = {
      id: venture.id,
      title: venture.title,
      tagline: venture.tagline || "",
      problem: venture.problem,
      targetCustomer: venture.targetCustomer,
      whyNow: venture.whyNow || "",
      archetype: venture.archetype || "monitor",
      mvpScope: (venture.mvpScope as any) || { screens: ["Dashboard", "Settings"], coreApis: ["/api/items"], keyFeatures: ["Core monitor"], estimatedComplexity: "LOW" },
      competitors: [],
      evidence: venture.evidence.map((e) => ({
        id: e.id,
        type: "forum_complaint" as const,
        url: e.url,
        title: e.source,
        snippet: e.quote,
        verified: e.citationVerified,
        confidence: "high" as const,
        gathered_at: e.createdAt.toISOString(),
      })),
      status: "APPROVED",
      createdAt: venture.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Launch the 8-agent build swarm asynchronously!
    executor.executeBuild(ideaBrief, undefined, user.id, runId).catch((err) => {
      request.log.error({ err, runId }, "Agent swarm build error");
    });

    await prismaDatabase.recordAuditLog(user.id, "IDEA_APPROVE_BUILD", venture.id, { runId, cost });
    return reply.status(202).send({ companyId: venture.id, runId });
  });

  // 15. POST /api/ideas/:id/reject
  app.post("/api/ideas/:id/reject", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;
    if (!(await requireRateLimit(request, reply, "ideas:reject", 30, 60_000))) return;

    const { id } = request.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "DB unavailable" });

    const venture = await prisma.venture.findFirst({ where: { id, ownerId: user.id } });
    if (!venture) return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Idea not found." });

    await prisma.venture.update({
      where: { id },
      data: { ideaStatus: "REJECTED" },
    });
    await NoveltyMemoryService.getInstance().recordShownIdea(user.id, venture.title, venture.problem, "REJECTED");
    await prismaDatabase.recordAuditLog(user.id, "IDEA_REJECT", id);

    return reply.send({ rejected: true, id });
  });
}

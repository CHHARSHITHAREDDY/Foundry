import type { FastifyInstance } from "fastify";
import { TrendScoutService } from "./domain/scout/trend-scout.service.js";
import { IdeaGeneratorService } from "./domain/generator/idea-generator.service.js";
import { ValidatorService } from "./domain/validator/validator.service.js";
import { ClarifierService } from "./domain/clarifier/clarifier.service.js";
import { IdeaCacheService, sharedIdeaCache } from "./domain/cache/idea-cache.service.js";
import { requireAuth, enforceRateLimitAndBudget } from "../auth/guards/auth.guard.js";
import { prismaDatabase } from "../../db/prisma.service.js";
import {
  SurpriseMeRequestSchema,
  ClarifyIdeaRequestSchema,
  ValidateIdeaRequestSchema,
  TweakIdeaRequestSchema,
  ApproveIdeaRequestSchema,
  IdeaBrief,
} from "@venture-studio/contracts";

export async function ideationRoutes(app: FastifyInstance) {
  const scout = new TrendScoutService();
  const generator = new IdeaGeneratorService();
  const validator = new ValidatorService();
  const clarifier = new ClarifierService();
  const cache = sharedIdeaCache;

  // Workflow A: Surprise Me (Authenticated & Rate-Limited to protect Gemini spend)
  app.post("/api/ideas/surprise", async (request, reply) => {
    const user = await requireAuth(request, reply);
    if (!user) return;

    const budget = enforceRateLimitAndBudget(user, "surprise", 5, 25);
    if (!budget.allowed) {
      return reply.status(budget.statusCode || 429).send({
        statusCode: budget.statusCode || 429,
        error: "BUDGET_LIMIT_REACHED",
        message: budget.error,
      });
    }

    console.log(`\n⚡ [SURPRISE ME] Received request from authenticated operator: ${user.email} (Credits remaining: ${user.credits})`);
    const body = SurpriseMeRequestSchema.parse(request.body || {});
    request.log.info({ userId: user.id }, "Starting Workflow A: Surprise Me pipeline");

    console.log("⚡ [SURPRISE ME] 1/3 Scouring live Hacker News & GitHub discussions...");
    const painPoints = await scout.scoutPainPoints();
    console.log(`⚡ [SURPRISE ME] Found ${painPoints.length} pain points.`);

    console.log("⚡ [SURPRISE ME] 2/3 Synthesizing candidate opportunities...");
    const candidates = await generator.generateCandidates(painPoints, body.maxCandidates || 8);
    console.log(`⚡ [SURPRISE ME] Synthesized ${candidates.length} candidates.`);

    console.log("⚡ [SURPRISE ME] 3/3 Enriching candidate dossiers for founder review...");
    const validatedCandidates: IdeaBrief[] = await Promise.all(
      candidates.map((c) => validator.validateIdea(c))
    );

    const primary = validatedCandidates[0];
    if (!primary) {
      throw new Error("Failed to generate any candidate ideas");
    }

    cache.setIdea(primary);
    cache.setCandidates(validatedCandidates);

    // Persist candidates and debit credit ledger in Neon PostgreSQL
    try {
      await Promise.all(
        validatedCandidates.map((c) => prismaDatabase.persistVenture(c, user.id))
      );
      await prismaDatabase.recordCreditTransaction({
        userId: user.id,
        action: "RESERVE",
        amount: -5,
        reason: "SURPRISE_ME_SCOUT",
        metadata: { selectedTitle: primary.title, candidatesCount: validatedCandidates.length },
      });
    } catch (dbErr: any) {
      request.log.warn(`[IDEATION PERSISTENCE] Warning: ${dbErr.message}`);
    }

    console.log(`⚡ [SURPRISE ME] Selected: "${primary.title}". ${validatedCandidates.length} ideas cached and persisted to Postgres for founder.\n`);

    return {
      selectedIdea: primary,
      cachedCandidates: validatedCandidates,
      scoutedPainPoints: painPoints,
    };
  });

  // Workflow B: Clarify
  app.post("/api/ideas/clarify", async (request) => {
    const body = ClarifyIdeaRequestSchema.parse(request.body);
    return clarifier.clarify(body.rawIdea, body.answers);
  });

  // Workflow B: Validate
  app.post("/api/ideas/validate", async (request) => {
    const body = ValidateIdeaRequestSchema.parse(request.body);

    const draftIdea: IdeaBrief = {
      id: body.ideaId || `idea_${Math.random().toString(36).substring(2, 9)}`,
      title: body.title,
      tagline: body.proposedSolution || body.problem.slice(0, 60),
      problem: body.problem,
      targetCustomer: body.targetCustomer,
      whyNow: "Growing demand observed in online developer & founder discussions",
      archetype: "Micro-SaaS Tool",
      mvpScope: {
        screens: ["Landing Page", "Main Dashboard", "Configuration"],
        coreApis: ["/api/action", "/api/records"],
        keyFeatures: ["Core automation workflow", "Real-time status check"],
        estimatedComplexity: "LOW",
      },
      competitors: [],
      evidence: [],
      status: "VALIDATING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validated = await validator.validateIdea(draftIdea);
    cache.setIdea(validated);
    return validated;
  });

  // Next candidate from stream (Another idea button)
  app.get("/api/ideas/next-candidate", async (request, reply) => {
    const { currentId } = request.query as { currentId?: string };
    let next = cache.getNextCandidate(currentId);

    // Dynamic infinite refill: if queue reached end, scout and synthesize fresh candidates on the fly!
    if (!next) {
      request.log.info("Ideation queue exhausted or empty. Dynamically sourcing fresh market candidates...");
      const freshPainPoints = await scout.scoutPainPoints();
      const freshCandidates = await generator.generateCandidates(freshPainPoints, 5);
      if (freshCandidates.length > 0) {
        cache.appendCandidates(freshCandidates);
        next = cache.getNextCandidate(currentId) || freshCandidates[0];
      }
    }

    if (!next) {
      return reply.status(404).send({
        code: "NO_CANDIDATES",
        message: "No candidates available.",
      });
    }

    // Proactive background refill when remaining candidates <= 2
    const currentIdx = cache.getCurrentIndex(next.id);
    const totalQueue = cache.getQueueLength();
    if (totalQueue - currentIdx <= 2) {
      // Background task - do not block response
      scout.scoutPainPoints().then((morePoints) => {
        generator.generateCandidates(morePoints, 4).then((moreCandidates) => {
          cache.appendCandidates(moreCandidates);
        });
      }).catch(() => {});
    }

    if (!next.scorecard) {
      const validated = await validator.validateIdea(next);
      cache.setIdea(validated);
      return validated;
    }

    return next;
  });

  // Tweak idea and fast re-validate
  app.post("/api/ideas/:id/tweak", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = TweakIdeaRequestSchema.parse({ ...(request.body as any), ideaId: id });

    const existing = cache.getIdea(id);
    if (!existing) {
      return reply.status(404).send({ code: "NOT_FOUND", message: "Idea not found in cache" });
    }

    const tweaked: IdeaBrief = {
      ...existing,
      targetCustomer: body.modifications.niche || existing.targetCustomer,
      mvpScope: {
        ...existing.mvpScope,
        keyFeatures: body.modifications.featureAdjustments || existing.mvpScope.keyFeatures,
      },
      updatedAt: new Date().toISOString(),
    };

    const revalidated = await validator.validateIdea(tweaked);
    cache.setIdea(revalidated);
    return revalidated;
  });

  // Approve idea (Approval Gate button)
  app.post("/api/ideas/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = ApproveIdeaRequestSchema.parse({ ...(request.body as any), ideaId: id });

    const existing = cache.getIdea(id);
    if (!existing) {
      return reply.status(404).send({ code: "NOT_FOUND", message: "Idea not found in cache" });
    }

    const approved: IdeaBrief = {
      ...existing,
      status: "APPROVED",
      userFeedback: body.userNotes,
      updatedAt: new Date().toISOString(),
    };

    cache.setIdea(approved);
    return approved;
  });

  // Get idea by ID
  app.get("/api/ideas/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const idea = cache.getIdea(id);
    if (!idea) {
      return reply.status(404).send({ code: "NOT_FOUND", message: "Idea not found" });
    }
    return idea;
  });
}

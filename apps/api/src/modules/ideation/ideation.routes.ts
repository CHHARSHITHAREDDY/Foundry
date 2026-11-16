import type { FastifyInstance } from "fastify";
import { TrendScoutService } from "./domain/scout/trend-scout.service.js";
import { IdeaGeneratorService } from "./domain/generator/idea-generator.service.js";
import { ValidatorService } from "./domain/validator/validator.service.js";
import { ClarifierService } from "./domain/clarifier/clarifier.service.js";
import { IdeaCacheService } from "./domain/cache/idea-cache.service.js";
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
  const cache = new IdeaCacheService();

  // Workflow A: Surprise Me
  app.post("/api/ideas/surprise", async (request) => {
    const body = SurpriseMeRequestSchema.parse(request.body || {});
    request.log.info("Starting Workflow A: Surprise Me pipeline");

    const painPoints = await scout.scoutPainPoints();
    const candidates = await generator.generateCandidates(painPoints, body.maxCandidates || 5);

    const primary = candidates[0];
    if (!primary) {
      throw new Error("Failed to generate any candidate ideas");
    }
    const validatedPrimary = await validator.validateIdea(primary);

    cache.setIdea(validatedPrimary);
    cache.setCandidates([validatedPrimary, ...candidates.slice(1)]);

    return {
      selectedIdea: validatedPrimary,
      cachedCandidates: [validatedPrimary, ...candidates.slice(1)],
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

  // Next candidate from cache (Another idea button)
  app.get("/api/ideas/next-candidate", async (request, reply) => {
    const { currentId } = request.query as { currentId?: string };
    const next = cache.getNextCandidate(currentId);
    if (!next) {
      return reply.status(404).send({
        code: "NO_CANDIDATES",
        message: "No cached candidates found. Run Surprise Me first.",
      });
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

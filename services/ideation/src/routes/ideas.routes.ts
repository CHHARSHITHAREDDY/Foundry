import type { FastifyInstance } from "fastify";
import { ValidatorService } from "../domain/validator/validator.service.js";
import { IdeaCacheService } from "../domain/idea-cache.service.js";
import {
  ValidateIdeaRequestSchema,
  TweakIdeaRequestSchema,
  ApproveIdeaRequestSchema,
  IdeaBrief,
} from "@venture-studio/contracts";

export async function ideasRoutes(
  app: FastifyInstance,
  options: {
    validator: ValidatorService;
    cache: IdeaCacheService;
  }
) {
  const { validator, cache } = options;

  // Validate an idea (Workflow B Validator)
  app.post("/ideas/validate", async (request, reply) => {
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

  // Get next candidate from cache (Another idea button)
  app.get("/ideas/next-candidate", async (request, reply) => {
    const { currentId } = request.query as { currentId?: string };
    const next = cache.getNextCandidate(currentId);
    if (!next) {
      return reply.status(404).send({
        code: "NO_CANDIDATES",
        message: "No cached candidates found. Run Surprise Me first.",
      });
    }

    // Ensure next candidate is validated
    if (!next.scorecard) {
      const validated = await validator.validateIdea(next);
      cache.setIdea(validated);
      return validated;
    }

    return next;
  });

  // Tweak idea and fast re-validate
  app.post("/ideas/:id/tweak", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = TweakIdeaRequestSchema.parse({ ...request.body, ideaId: id });

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
  app.post("/ideas/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = ApproveIdeaRequestSchema.parse({ ...request.body, ideaId: id });

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
  app.get("/ideas/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const idea = cache.getIdea(id);
    if (!idea) {
      return reply.status(404).send({ code: "NOT_FOUND", message: "Idea not found" });
    }
    return idea;
  });
}

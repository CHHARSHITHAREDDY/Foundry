import type { FastifyInstance } from "fastify";
import { TrendScoutService } from "../domain/scout/trend-scout.service.js";
import { IdeaGeneratorService } from "../domain/generator/idea-generator.service.js";
import { ValidatorService } from "../domain/validator/validator.service.js";
import { IdeaCacheService } from "../domain/idea-cache.service.js";
import { SurpriseMeRequestSchema } from "@venture-studio/contracts";

export async function surpriseRoutes(
  app: FastifyInstance,
  options: {
    scout: TrendScoutService;
    generator: IdeaGeneratorService;
    validator: ValidatorService;
    cache: IdeaCacheService;
  }
) {
  const { scout, generator, validator, cache } = options;

  app.post("/ideas/surprise", async (request, reply) => {
    const body = SurpriseMeRequestSchema.parse(request.body || {});
    request.log.info("Starting Workflow A: Surprise Me pipeline");

    // Step 1: Trend Scout (Fast tier)
    const painPoints = await scout.scoutPainPoints();
    request.log.info({ painPointsCount: painPoints.length }, "Scouted real pain points");

    // Step 2: Idea Generator (Reasoner tier)
    const candidates = await generator.generateCandidates(painPoints, body.maxCandidates || 5);
    request.log.info({ candidatesCount: candidates.length }, "Generated candidate ideas");

    // Step 3: Validator (Reasoner tier) validates the top candidates
    const primaryCandidate = candidates[0];
    const validatedPrimary = await validator.validateIdea(primaryCandidate);

    // Cache the validated primary + remaining candidates
    cache.setIdea(validatedPrimary);
    cache.setCandidates([validatedPrimary, ...candidates.slice(1)]);

    // Return Approval Gate payload (Step 4)
    return {
      selectedIdea: validatedPrimary,
      cachedCandidates: [validatedPrimary, ...candidates.slice(1)],
      scoutedPainPoints: painPoints,
    };
  });
}


import type { FastifyInstance } from "fastify";
import { IdeationClient } from "../clients/ideation.client.js";
import {
  SurpriseMeRequestSchema,
  ClarifyIdeaRequestSchema,
  ValidateIdeaRequestSchema,
  TweakIdeaRequestSchema,
  ApproveIdeaRequestSchema,
} from "@venture-studio/contracts";

export async function ideasBffRoutes(app: FastifyInstance, options: { ideation: IdeationClient }) {
  const { ideation } = options;

  // Workflow A: Surprise Me
  app.post("/api/ideas/surprise", async (request, reply) => {
    const body = SurpriseMeRequestSchema.parse(request.body || {});
    return ideation.surpriseMe(body);
  });

  // Workflow B: Clarify
  app.post("/api/ideas/clarify", async (request, reply) => {
    const body = ClarifyIdeaRequestSchema.parse(request.body);
    return ideation.clarify(body);
  });

  // Workflow B: Validate
  app.post("/api/ideas/validate", async (request, reply) => {
    const body = ValidateIdeaRequestSchema.parse(request.body);
    return ideation.validate(body);
  });

  // Next candidate from cache (Another idea button)
  app.get("/api/ideas/next-candidate", async (request, reply) => {
    const { currentId } = request.query as { currentId?: string };
    return ideation.getNextCandidate(currentId);
  });

  // Tweak idea
  app.post("/api/ideas/:id/tweak", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = TweakIdeaRequestSchema.parse({ ...request.body, ideaId: id });
    return ideation.tweak(id, body.modifications);
  });

  // Approve idea
  app.post("/api/ideas/:id/approve", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = ApproveIdeaRequestSchema.parse({ ...request.body, ideaId: id });
    return ideation.approve(id, body.userNotes);
  });

  // Get idea
  app.get("/api/ideas/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    return ideation.getIdea(id);
  });
}


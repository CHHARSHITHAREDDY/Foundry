import type { FastifyInstance } from "fastify";
import { AgentSwarmExecutor } from "../agent-runtime/runner/agent-executor.js";
import { IdeaCacheService } from "../ideation/domain/cache/idea-cache.service.js";
import { IdeaBriefSchema } from "@venture-studio/contracts";
import { z } from "zod";

const TriggerRunSchema = z.object({
  ideaId: z.string().optional(),
  idea: IdeaBriefSchema.optional(),
});

export async function workflowRoutes(app: FastifyInstance) {
  const executor = new AgentSwarmExecutor();
  const cache = new IdeaCacheService();

  app.post("/api/runs", async (request, reply) => {
    const body = TriggerRunSchema.parse(request.body);

    let targetIdea = body.idea;
    if (!targetIdea && body.ideaId) {
      targetIdea = cache.getIdea(body.ideaId);
    }

    if (!targetIdea) {
      return reply.status(404).send({
        code: "IDEA_NOT_FOUND",
        message: "No idea specified or found for the run.",
      });
    }

    const result = await executor.executeBuild(targetIdea, (stage, message) => {
      request.log.info({ stage }, message);
    });

    return result;
  });
}

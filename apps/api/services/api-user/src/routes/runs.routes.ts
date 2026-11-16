import type { FastifyInstance } from "fastify";
import { IdeationClient } from "../clients/ideation.client.js";
import { AgentRuntimeClient } from "../clients/agent-runtime.client.js";
import { z } from "zod";

const StartRunSchema = z.object({
  ideaId: z.string(),
});

export async function runsBffRoutes(
  app: FastifyInstance,
  options: { ideation: IdeationClient; agentRuntime: AgentRuntimeClient }
) {
  const { ideation, agentRuntime } = options;

  app.post("/api/runs", async (request, reply) => {
    const body = StartRunSchema.parse(request.body);
    request.log.info({ ideaId: body.ideaId }, "Triggering autonomous swarm build");

    const idea = await ideation.getIdea(body.ideaId);
    if (!idea) {
      return reply.status(404).send({ code: "IDEA_NOT_FOUND", message: "Specified idea was not found." });
    }

    const buildResult = await agentRuntime.triggerBuild(idea);
    return buildResult;
  });
}


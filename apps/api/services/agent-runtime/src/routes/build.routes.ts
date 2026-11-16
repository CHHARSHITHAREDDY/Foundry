import type { FastifyInstance } from "fastify";
import { AgentSwarmExecutor } from "../runner/agent-executor.js";
import { IdeaBriefSchema } from "@venture-studio/contracts";

export async function buildRoutes(app: FastifyInstance, options: { executor: AgentSwarmExecutor }) {
  const { executor } = options;

  app.post("/build", async (request, reply) => {
    const idea = IdeaBriefSchema.parse(request.body);
    request.log.info({ ideaTitle: idea.title }, "Starting agent swarm build");

    const result = await executor.executeBuild(idea, (stage, message) => {
      request.log.info({ stage }, message);
    });

    return result;
  });
}


import type { FastifyInstance } from "fastify";
import { AgentSwarmExecutor } from "./runner/agent-executor.js";
import { IdeaBriefSchema } from "@venture-studio/contracts";

export async function runtimeRoutes(app: FastifyInstance) {
  const executor = new AgentSwarmExecutor();

  app.post("/api/runtime/build", async (request) => {
    const idea = IdeaBriefSchema.parse(request.body);
    request.log.info({ ideaTitle: idea.title }, "Starting agent swarm build");

    const result = await executor.executeBuild(idea, (stage, message) => {
      request.log.info({ stage }, message);
    });

    return result;
  });
}

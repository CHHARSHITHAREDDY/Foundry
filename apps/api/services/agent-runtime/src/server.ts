import { createServer } from "@venture-studio/service-kit";
import { AgentSwarmExecutor } from "./runner/agent-executor.js";
import { buildRoutes } from "./routes/build.routes.js";

export async function buildAgentRuntimeServer() {
  const server = await createServer({
    serviceName: "agent-runtime",
  });

  const executor = new AgentSwarmExecutor();
  await server.register(buildRoutes, { executor });

  return server;
}


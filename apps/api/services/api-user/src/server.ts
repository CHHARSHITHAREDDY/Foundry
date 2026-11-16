import { createServer } from "@venture-studio/service-kit";
import { IdeationClient } from "./clients/ideation.client.js";
import { AgentRuntimeClient } from "./clients/agent-runtime.client.js";
import { ideasBffRoutes } from "./routes/ideas.routes.js";
import { runsBffRoutes } from "./routes/runs.routes.js";
import { streamBffRoutes } from "./routes/stream.routes.js";

export async function buildApiUserServer() {
  const server = await createServer({
    serviceName: "api-user",
  });

  const ideation = new IdeationClient();
  const agentRuntime = new AgentRuntimeClient();

  await server.register(ideasBffRoutes, { ideation });
  await server.register(runsBffRoutes, { ideation, agentRuntime });
  await server.register(streamBffRoutes);

  return server;
}

import { buildAgentRuntimeServer } from "./server.js";

async function main() {
  const port = Number(process.env.AGENT_RUNTIME_PORT || 3006);
  const host = process.env.HOST || "0.0.0.0";

  const server = await buildAgentRuntimeServer();
  await server.listen({ port, host });
  server.log.info(`Agent Runtime service running at http://${host}:${port}`);
}

main().catch((err) => {
  console.error("Fatal error starting agent-runtime service:", err);
  process.exit(1);
});


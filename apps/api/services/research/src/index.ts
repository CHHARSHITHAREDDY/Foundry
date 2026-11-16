import { buildResearchServer } from "./server.js";

async function main() {
  const port = Number(process.env.RESEARCH_PORT || 3004);
  const host = process.env.HOST || "0.0.0.0";

  const server = await buildResearchServer();
  await server.listen({ port, host });
  server.log.info(`Research service running at http://${host}:${port}`);
}

main().catch((err) => {
  console.error("Fatal error starting research service:", err);
  process.exit(1);
});


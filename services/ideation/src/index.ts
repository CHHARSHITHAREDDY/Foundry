import { buildIdeationServer } from "./server.js";

async function main() {
  const port = Number(process.env.IDEATION_PORT || 3003);
  const host = process.env.HOST || "0.0.0.0";

  const server = await buildIdeationServer();
  await server.listen({ port, host });
  server.log.info(`Ideation service running at http://${host}:${port}`);
}

main().catch((err) => {
  console.error("Fatal error starting ideation service:", err);
  process.exit(1);
});

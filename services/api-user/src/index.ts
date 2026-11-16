import { buildApiUserServer } from "./server.js";

async function main() {
  const port = Number(process.env.API_USER_PORT || 3001);
  const host = process.env.HOST || "0.0.0.0";

  const server = await buildApiUserServer();
  await server.listen({ port, host });
  server.log.info(`API User BFF running at http://${host}:${port}`);
}

main().catch((err) => {
  console.error("Fatal error starting api-user service:", err);
  process.exit(1);
});

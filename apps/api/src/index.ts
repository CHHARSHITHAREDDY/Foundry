import { createApiServer } from "./server.js";
import { getApiEnv } from "./config/env.js";

async function main() {
  const env = getApiEnv();
  const server = await createApiServer();

  try {
    await server.listen({
      port: env.PORT,
      host: env.HOST,
    });
    server.log.info(
      `🚀 Venture Studio Unified Backend running at http://${env.HOST}:${env.PORT}`
    );
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const signal of signals) {
    process.on(signal, async () => {
      server.log.info(`Received ${signal}, shutting down gracefully...`);
      await server.close();
      process.exit(0);
    });
  }
}

main().catch((err) => {
  console.error("Fatal startup error in apps/api:", err);
  process.exit(1);
});


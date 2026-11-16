import { createServer } from "@venture-studio/service-kit";
import { painPointsRoutes } from "./routes/pain-points.routes.js";
import { searchRoutes } from "./routes/search.routes.js";

export async function buildResearchServer() {
  const server = await createServer({
    serviceName: "research",
  });

  await server.register(painPointsRoutes);
  await server.register(searchRoutes);

  return server;
}


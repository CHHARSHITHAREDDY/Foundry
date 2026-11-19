import type { FastifyInstance } from "fastify";
import { TrendScoutService } from "../ideation/domain/scout/trend-scout.service.js";
import { SearchRouter } from "./search/search.router.js";
import { SearchRequestSchema } from "@venture-studio/contracts";

export async function researchRoutes(app: FastifyInstance) {
  const scout = new TrendScoutService();
  const searchRouter = new SearchRouter();

  app.get("/api/research/pain-points", async () => {
    const painPoints = await scout.scoutPainPoints();

    return {
      painPoints,
      sourcesScanned: ["hackernews", "github", "reddit"],
      total: painPoints.length,
    };
  });

  app.post("/api/research/search", async (request) => {
    const body = SearchRequestSchema.parse(request.body);
    const results = await searchRouter.search(body.query, body.limit);
    return { results };
  });
}

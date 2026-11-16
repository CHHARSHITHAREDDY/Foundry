import type { FastifyInstance } from "fastify";
import { SearchRouter } from "../search/search.router.js";
import { SearchRequestSchema } from "@venture-studio/contracts";

export async function searchRoutes(app: FastifyInstance) {
  const router = new SearchRouter();

  app.post("/search", async (request, reply) => {
    const body = SearchRequestSchema.parse(request.body);
    const results = await router.search(body.query, body.limit);
    return { results };
  });
}

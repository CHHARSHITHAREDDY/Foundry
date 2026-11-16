import type { FastifyInstance } from "fastify";
import { ClarifierService } from "../domain/clarifier/clarifier.service.js";
import { ClarifyIdeaRequestSchema } from "@venture-studio/contracts";

export async function clarifyRoutes(
  app: FastifyInstance,
  options: { clarifier: ClarifierService }
) {
  const { clarifier } = options;

  app.post("/ideas/clarify", async (request, reply) => {
    const body = ClarifyIdeaRequestSchema.parse(request.body);
    const result = await clarifier.clarify(body.rawIdea, body.answers);
    return result;
  });
}

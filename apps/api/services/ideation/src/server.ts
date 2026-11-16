import { createServer } from "@venture-studio/service-kit";
import { TrendScoutService } from "./domain/scout/trend-scout.service.js";
import { IdeaGeneratorService } from "./domain/generator/idea-generator.service.js";
import { ValidatorService } from "./domain/validator/validator.service.js";
import { ClarifierService } from "./domain/clarifier/clarifier.service.js";
import { IdeaCacheService } from "./domain/idea-cache.service.js";
import { surpriseRoutes } from "./routes/surprise.routes.js";
import { clarifyRoutes } from "./routes/clarify.routes.js";
import { ideasRoutes } from "./routes/ideas.routes.js";

export async function buildIdeationServer() {
  const server = await createServer({
    serviceName: "ideation",
  });

  const scout = new TrendScoutService();
  const generator = new IdeaGeneratorService();
  const validator = new ValidatorService();
  const clarifier = new ClarifierService();
  const cache = new IdeaCacheService();

  await server.register(surpriseRoutes, { scout, generator, validator, cache });
  await server.register(clarifyRoutes, { clarifier });
  await server.register(ideasRoutes, { validator, cache });

  return server;
}


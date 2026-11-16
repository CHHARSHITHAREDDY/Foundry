import { z } from "zod";
import { BuildMetadataSchema } from "./metadata.js";
import { DesignTokensSchema } from "./design-tokens.js";
import { PageSpecSchema } from "./pages.js";
import { DbSchemaSpecSchema } from "./db-schema.js";
import { OpenApiRefSchema } from "./openapi-ref.js";
import { TaskDagSchema } from "./tasks-dag.js";

export * from "./metadata.js";
export * from "./design-tokens.js";
export * from "./pages.js";
export * from "./db-schema.js";
export * from "./openapi-ref.js";
export * from "./tasks-dag.js";

export const BuildSpecSchema = z.object({
  id: z.string(),
  ideaId: z.string(),
  metadata: BuildMetadataSchema,
  designTokens: DesignTokensSchema,
  pages: z.array(PageSpecSchema),
  database: DbSchemaSpecSchema,
  api: OpenApiRefSchema,
  tasks: TaskDagSchema,
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
});

export type BuildSpec = z.infer<typeof BuildSpecSchema>;


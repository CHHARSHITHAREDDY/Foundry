import { z } from "zod";

export const BuildMetadataSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  tagline: z.string(),
  description: z.string(),
  version: z.string().default("0.1.0"),
  targetAudience: z.string(),
});

export type BuildMetadata = z.infer<typeof BuildMetadataSchema>;

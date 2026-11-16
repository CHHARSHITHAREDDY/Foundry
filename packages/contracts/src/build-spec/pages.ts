import { z } from "zod";

export const PageComponentSpecSchema = z.object({
  name: z.string(),
  type: z.enum(["table", "form", "stats", "chart", "hero", "feature-grid", "dialog", "navbar", "footer"]),
  props: z.record(z.any()).default({}),
  description: z.string(),
});

export const PageSpecSchema = z.object({
  route: z.string(),
  title: z.string(),
  description: z.string(),
  layout: z.enum(["marketing", "dashboard", "auth", "minimal"]).default("dashboard"),
  components: z.array(PageComponentSpecSchema).default([]),
  mockDataRequired: z.boolean().default(true),
});

export type PageComponentSpec = z.infer<typeof PageComponentSpecSchema>;
export type PageSpec = z.infer<typeof PageSpecSchema>;


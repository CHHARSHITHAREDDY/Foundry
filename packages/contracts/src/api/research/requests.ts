import { z } from "zod";
import { PainPointSchema } from "../../idea/pain-point.js";
import { EvidenceSchema } from "../../idea/evidence.js";

export const SearchRequestSchema = z.object({
  query: z.string().min(2),
  limit: z.number().int().min(1).max(20).default(5),
  type: z.enum(["general", "competitor", "pricing", "discussions"]).default("general"),
});

export const FetchPageRequestSchema = z.object({
  url: z.string().url(),
  extractPricing: z.boolean().default(false),
});

export const HarvestPainPointsRequestSchema = z.object({
  sources: z.array(z.enum(["reddit", "hackernews", "producthunt"])).default(["reddit", "hackernews"]),
  keywords: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(50).default(15),
});

export const SearchResponseSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      snippet: z.string(),
      source: z.string().optional(),
    })
  ),
});

export const FetchPageResponseSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  contentMarkdown: z.string(),
  pricingFound: z.array(z.string()).optional(),
});

export const HarvestPainPointsResponseSchema = z.object({
  painPoints: z.array(PainPointSchema),
  sourcesScanned: z.array(z.string()),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type FetchPageRequest = z.infer<typeof FetchPageRequestSchema>;
export type HarvestPainPointsRequest = z.infer<typeof HarvestPainPointsRequestSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type FetchPageResponse = z.infer<typeof FetchPageResponseSchema>;
export type HarvestPainPointsResponse = z.infer<typeof HarvestPainPointsResponseSchema>;

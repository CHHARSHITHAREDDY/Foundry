import { z } from "zod";

export const HttpMethodSchema = z.enum(["get", "post", "put", "patch", "delete"]);

export const ApiEndpointSpecSchema = z.object({
  path: z.string(),
  method: HttpMethodSchema,
  summary: z.string(),
  requestBody: z.record(z.any()).optional(),
  responseBody: z.record(z.any()).optional(),
  authRequired: z.boolean().default(true),
});

export const OpenApiRefSchema = z.object({
  endpoints: z.array(ApiEndpointSpecSchema),
  rawSpec: z.record(z.any()).optional(),
});

export type HttpMethod = z.infer<typeof HttpMethodSchema>;
export type ApiEndpointSpec = z.infer<typeof ApiEndpointSpecSchema>;
export type OpenApiRef = z.infer<typeof OpenApiRefSchema>;

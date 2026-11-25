import { z } from "zod";

export const CompaniesListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

export type CompaniesListQuery = z.infer<typeof CompaniesListQuerySchema>;

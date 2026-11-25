import { z } from "zod";

export const CompanyStatusEnum = z.enum([
  "LIVE",
  "BUILDING",
  "AWAITING_APPROVAL",
  "FAILED",
  "DRAFT",
]);

export const CompanySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  tagline: z.string().nullable(),
  status: CompanyStatusEnum,
  subdomain: z.string().nullable(),
  latestRunId: z.string().nullable(),
  latestRunStage: z.string().nullable(),
  lastActivityAt: z.string(),
  demo: z.boolean(),
  createdAt: z.string(),
});

export const CompaniesListResponseSchema = z.object({
  companies: z.array(CompanySummarySchema),
  nextCursor: z.string().nullable(),
  total: z.number().int(),
});

export const CompanyDetailResponseSchema = z.object({
  company: CompanySummarySchema.extend({
    problem: z.string(),
    targetCustomer: z.string(),
    verdict: z.string(),
    totalScore: z.number().nullable(),
  }),
});

export const DashboardSummaryResponseSchema = z.object({
  companiesLive: z.number().int(),
  companiesTotal: z.number().int(),
  tasksDoneThisWeek: z.number().int(),
  creditsUsed: z.number().int(),
  creditsBalance: z.number().int(),
  visitors7d: z.number().int().nullable(),
  pendingApprovals: z.number().int(),
  lowCredits: z.boolean(),
  attentionItems: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["APPROVAL", "LOW_CREDITS", "FAILED_RUN"]),
      title: z.string(),
      description: z.string(),
      href: z.string(),
    })
  ),
});

export type CompanyStatus = z.infer<typeof CompanyStatusEnum>;
export type CompanySummary = z.infer<typeof CompanySummarySchema>;
export type CompaniesListResponse = z.infer<typeof CompaniesListResponseSchema>;
export type CompanyDetailResponse = z.infer<typeof CompanyDetailResponseSchema>;
export type DashboardSummaryResponse = z.infer<typeof DashboardSummaryResponseSchema>;

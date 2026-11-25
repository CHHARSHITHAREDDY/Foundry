import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CompaniesListQuerySchema, CompanyStatus } from "@venture-studio/contracts";
import { prismaDatabase } from "../../db/prisma.service.js";
import { requireAuth, requireRateLimit } from "../auth/guards/auth.guard.js";

function deriveCompanyStatus(ventureStatus: string, latestStage?: string | null): CompanyStatus {
  if (latestStage === "FAILED" || ventureStatus === "FAILED") return "FAILED";
  if (latestStage === "COMPLETED" && (ventureStatus === "LIVE" || ventureStatus === "SIMULATED")) return "LIVE";
  if (latestStage === "REVIEW" || latestStage === "DEPLOY") return "AWAITING_APPROVAL";
  if (
    latestStage === "PENDING" ||
    latestStage === "ARCHITECTING" ||
    latestStage === "BUILDING" ||
    latestStage === "INTEGRATING" ||
    latestStage === "QA"
  ) {
    return "BUILDING";
  }
  if (ventureStatus === "LIVE") return "LIVE";
  return "DRAFT";
}

export const companiesRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;

    const query = CompaniesListQuerySchema.parse(req.query || {});
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) {
      return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "Database unavailable." });
    }

    const where: any = { ownerId: user.id };
    if (query.search && query.search.trim()) {
      where.OR = [
        { title: { contains: query.search.trim(), mode: "insensitive" } },
        { tagline: { contains: query.search.trim(), mode: "insensitive" } },
      ];
    }

    const total = await prisma.venture.count({ where });
    const rows = await prisma.venture.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: query.limit + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      include: {
        runs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const hasMore = rows.length > query.limit;
    const sliced = hasMore ? rows.slice(0, query.limit) : rows;
    const nextCursor = hasMore ? sliced[sliced.length - 1]!.id : null;

    const companies = sliced.map((v) => {
      const latestRun = v.runs[0] || null;
      const slug = (v.title || "venture").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return {
        id: v.id,
        name: v.title,
        slug,
        tagline: v.tagline,
        status: deriveCompanyStatus(v.status, latestRun?.currentStage),
        subdomain: v.subdomain,
        latestRunId: latestRun?.id || null,
        latestRunStage: latestRun?.currentStage || null,
        lastActivityAt: (latestRun?.updatedAt || v.updatedAt).toISOString(),
        demo: v.demo,
        createdAt: v.createdAt.toISOString(),
      };
    });

    return reply.send({ companies, nextCursor, total });
  });

  app.get("/:id", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;

    const { id } = req.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) {
      return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "Database unavailable." });
    }

    // Strict ownership check: return 404 on foreign or missing IDs
    const v = await prisma.venture.findFirst({
      where: { id, ownerId: user.id },
      include: {
        runs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!v) {
      return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Company not found." });
    }

    const latestRun = v.runs[0] || null;
    const slug = (v.title || "venture").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    return reply.send({
      company: {
        id: v.id,
        name: v.title,
        slug,
        tagline: v.tagline,
        status: deriveCompanyStatus(v.status, latestRun?.currentStage),
        subdomain: v.subdomain,
        latestRunId: latestRun?.id || null,
        latestRunStage: latestRun?.currentStage || null,
        lastActivityAt: (latestRun?.updatedAt || v.updatedAt).toISOString(),
        demo: v.demo,
        createdAt: v.createdAt.toISOString(),
        problem: v.problem,
        targetCustomer: v.targetCustomer,
        verdict: v.verdict,
        totalScore: v.totalScore,
      },
    });
  });

  app.delete("/:id", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;
    if (!(await requireRateLimit(req, reply, "companies:delete", 20, 60_000))) return;

    const { id } = req.params as { id: string };
    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) {
      return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "Database unavailable." });
    }

    const existing = await prisma.venture.findFirst({ where: { id, ownerId: user.id } });
    if (!existing) {
      return reply.status(404).send({ statusCode: 404, error: "NOT_FOUND", message: "Company not found." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.venture.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          actor: user.id,
          action: "COMPANY_DELETE",
          target: id,
          metadata: { title: existing.title },
        },
      });
    });

    return reply.send({ deleted: true, id });
  });
};

export const dashboardRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/api/dashboard/summary", async (req, reply) => {
    const user = await requireAuth(req, reply);
    if (!user) return;

    const prisma = await prismaDatabase.ensureReady();
    if (!prisma) {
      return reply.status(503).send({ statusCode: 503, error: "DB_UNAVAILABLE", message: "Database unavailable." });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [ventures, completedRunsThisWeek, ledgerDebitAgg, userRow] = await Promise.all([
      prisma.venture.findMany({
        where: { ownerId: user.id },
        include: { runs: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
      prisma.workflowRun.count({
        where: {
          ownerId: user.id,
          currentStage: "COMPLETED",
          updatedAt: { gte: weekAgo },
        },
      }),
      prisma.creditLedger.aggregate({
        where: { userId: user.id, amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.user.findUnique({ where: { id: user.id }, select: { credits: true } }),
    ]);

    let companiesLive = 0;
    let pendingApprovals = 0;
    const attentionItems: Array<{
      id: string;
      type: "APPROVAL" | "LOW_CREDITS" | "FAILED_RUN";
      title: string;
      description: string;
      href: string;
    }> = [];

    for (const v of ventures) {
      const latestRun = v.runs[0] || null;
      const derived = deriveCompanyStatus(v.status, latestRun?.currentStage);
      if (derived === "LIVE") companiesLive++;
      if (derived === "AWAITING_APPROVAL") {
        pendingApprovals++;
        attentionItems.push({
          id: `approval-${v.id}`,
          type: "APPROVAL",
          title: `Approval needed: ${v.title}`,
          description: "Build is awaiting founder review before final release.",
          href: `/companies/${v.id}/build`,
        });
      } else if (derived === "FAILED") {
        attentionItems.push({
          id: `failed-${v.id}`,
          type: "FAILED_RUN",
          title: `Build failed: ${v.title}`,
          description: "Latest autonomous run failed. Inspect gates and retry.",
          href: `/companies/${v.id}/build`,
        });
      }
    }

    const creditsBalance = userRow?.credits ?? 0;
    const lowCredits = creditsBalance < 10;
    if (lowCredits) {
      attentionItems.push({
        id: "low-credits",
        type: "LOW_CREDITS",
        title: "Credit balance low",
        description: `Only ${creditsBalance} credits remaining. Top up to run new builds.`,
        href: "/billing",
      });
    }

    const creditsUsed = Math.abs(ledgerDebitAgg._sum.amount ?? 0);

    return reply.send({
      companiesLive,
      companiesTotal: ventures.length,
      tasksDoneThisWeek: completedRunsThisWeek,
      creditsUsed,
      creditsBalance,
      visitors7d: null, // Null when no real analytics ingest exists (never fake 0!)
      pendingApprovals,
      lowCredits,
      attentionItems,
    });
  });
};

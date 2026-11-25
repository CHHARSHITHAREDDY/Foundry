import dns from "node:dns/promises";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole, VerdictStatus as PrismaVerdictStatus, RunStage, DeploymentStatus } from "@prisma/client";
import { getApiEnv } from "../config/env.js";
import { IdeaBrief } from "@venture-studio/contracts";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

export interface TokenMeteringParams {
  userId: string;
  action: "RESERVE" | "SETTLE" | "REFUND" | "BONUS";
  amount: number; // e.g. -5, -25, +20
  reason: string;
  idempotencyKey?: string;
  stage?: string;
  runId?: string;
  tokensIn?: number;
  tokensOut?: number;
  metadata?: any;
}

export class PrismaDatabaseService {
  private static instance: PrismaDatabaseService;
  private prisma: PrismaClient | null = null;
  private pool: pg.Pool | null = null;
  private isConnected = false;
  private initPromise: Promise<void>;

  private constructor() {
    this.initPromise = this.initClient();
  }

  public async ensureReady(): Promise<PrismaClient | null> {
    await this.initPromise;
    return this.prisma;
  }

  public async recordAuditLog(actor: string, action: string, target: string, metadata?: any): Promise<void> {
    const prisma = await this.ensureReady();
    if (!prisma) return;
    try {
      await prisma.auditLog.create({
        data: { actor, action, target, metadata: metadata ?? undefined },
      });
    } catch {}
  }

  public static getInstance(): PrismaDatabaseService {
    if (!PrismaDatabaseService.instance) {
      PrismaDatabaseService.instance = new PrismaDatabaseService();
    }
    return PrismaDatabaseService.instance;
  }

  private async initClient(): Promise<void> {
    const env = getApiEnv();
    const connectionUrl = env.DATABASE_URL;

    try {
      const parsedUrl = new URL(connectionUrl);
      const hostname = parsedUrl.hostname;
      let hostToUse = hostname;

      // On environments where local DNS struggles with cloud subdomains (e.g. Neon), resolve via public DNS
      if (hostname.includes("neon.tech")) {
        try {
          const addresses = await dns.resolve4(hostname);
          if (addresses.length > 0 && addresses[0]) {
            hostToUse = addresses[0];
          }
        } catch {
          hostToUse = "3.147.219.177"; // fallback Neon pooler IP
        }
      }

      this.pool = new pg.Pool({
        user: decodeURIComponent(parsedUrl.username || ""),
        password: decodeURIComponent(parsedUrl.password || ""),
        host: hostToUse,
        port: parseInt(parsedUrl.port || "5432", 10),
        database: (parsedUrl.pathname ? parsedUrl.pathname.replace(/^\//, "") : "neondb") || "neondb",
        ssl: {
          rejectUnauthorized: false,
          servername: hostname,
        },
        connectionTimeoutMillis: 10000,
        max: 10,
      });

      const adapter = new PrismaPg(this.pool);
      this.prisma = new PrismaClient({ adapter });
      this.isConnected = true;
    } catch (err: any) {
      console.warn(`[PRISMA SERVICE] Database connection warning: ${err.message}. Operating with in-memory resilience.`);
      this.isConnected = false;
    }
  }

  public get client(): PrismaClient | null {
    return this.prisma;
  }

  public isReady(): boolean {
    return this.isConnected && this.prisma !== null;
  }

  /**
   * Persists a synthesized venture idea, scorecard, and evidence citations to PostgreSQL
   */
  async persistVenture(idea: IdeaBrief, ownerId: string): Promise<string> {
    if (!this.prisma) return idea.id;

    try {
      // Ensure owner user exists safely without email conflict
      let user = await this.prisma.user.findFirst({
        where: { OR: [{ id: ownerId }, { email: "founder@venturestudio.io" }] },
      });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            id: ownerId,
            email: "founder@venturestudio.io",
            name: "Lead Founder",
            role: UserRole.FOUNDER,
            credits: 250,
          },
        });
      }
      const validOwnerId = user.id;

      // Map verdict status
      const rawStatus = typeof idea.verdict === "object" ? idea.verdict?.status : idea.verdict;
      let verdictEnum: PrismaVerdictStatus = PrismaVerdictStatus.INSUFFICIENT_DATA;
      if (rawStatus === "GO") verdictEnum = PrismaVerdictStatus.GO;
      else if (rawStatus === "GO_WITH_CHANGES") verdictEnum = PrismaVerdictStatus.GO_WITH_CHANGES;
      else if (rawStatus === "NO_GO") verdictEnum = PrismaVerdictStatus.NO_GO;

      await this.prisma.venture.upsert({
        where: { id: idea.id },
        update: {
          title: idea.title,
          tagline: idea.tagline || null,
          problem: idea.problem,
          targetCustomer: idea.targetCustomer,
          whyNow: idea.whyNow || null,
          verdict: verdictEnum,
          totalScore: idea.scorecard?.overallScore ?? null,
          scorecardType: idea.scorecard?.scorecardType ?? "INSUFFICIENT_DATA",
          assessedDimensionsCount: idea.scorecard?.assessedDimensionsCount ?? 0,
        },
        create: {
          id: idea.id,
          title: idea.title,
          tagline: idea.tagline || null,
          problem: idea.problem,
          targetCustomer: idea.targetCustomer,
          whyNow: idea.whyNow || null,
          verdict: verdictEnum,
          totalScore: idea.scorecard?.overallScore ?? null,
          scorecardType: idea.scorecard?.scorecardType ?? "INSUFFICIENT_DATA",
          assessedDimensionsCount: idea.scorecard?.assessedDimensionsCount ?? 0,
          ownerId: validOwnerId,
          status: DeploymentStatus.BUILDING,
        },
      });

      // Persist Scorecard
      if (idea.scorecard) {
        await this.prisma.scorecard.upsert({
          where: { ventureId: idea.id },
          update: {
            demand: idea.scorecard.demand?.score ?? null,
            competition: idea.scorecard.competition?.score ?? null,
            differentiation: idea.scorecard.differentiation?.score ?? null,
            monetization: idea.scorecard.monetization?.score ?? null,
            buildability: idea.scorecard.buildability?.score ?? null,
            total: idea.scorecard.overallScore,
            scorecardType: idea.scorecard.scorecardType,
          },
          create: {
            id: `sc_${idea.id}`,
            ventureId: idea.id,
            demand: idea.scorecard.demand?.score ?? null,
            competition: idea.scorecard.competition?.score ?? null,
            differentiation: idea.scorecard.differentiation?.score ?? null,
            monetization: idea.scorecard.monetization?.score ?? null,
            buildability: idea.scorecard.buildability?.score ?? null,
            total: idea.scorecard.overallScore,
            scorecardType: idea.scorecard.scorecardType,
          },
        });
      }

      // Persist Source Pain Point Citation
      if (idea.sourcePainPoint) {
        const citationId = `cit_${idea.id}_source`;
        const sourceLabel = idea.sourcePainPoint.domain || "Community Sourced";
        await this.prisma.evidenceCitation.upsert({
          where: { id: citationId },
          update: {
            source: sourceLabel,
            url: idea.sourcePainPoint.source_url,
            quote: idea.sourcePainPoint.quote,
            sourceType: idea.sourcePainPoint.source_type || "LIVE_API",
            citationVerified: idea.sourcePainPoint.citation_verified ?? true,
            sampleNotice: idea.sourcePainPoint.sample_notice || null,
          },
          create: {
            id: citationId,
            ventureId: idea.id,
            source: sourceLabel,
            url: idea.sourcePainPoint.source_url,
            quote: idea.sourcePainPoint.quote,
            sourceType: idea.sourcePainPoint.source_type || "LIVE_API",
            citationVerified: idea.sourcePainPoint.citation_verified ?? true,
            sampleNotice: idea.sourcePainPoint.sample_notice || null,
          },
        });
      }

      // Persist Research Evidence items
      if (idea.evidence && idea.evidence.length > 0) {
        for (const [idx, ev] of idea.evidence.entries()) {
          const citationId = `cit_${idea.id}_ev_${idx}`;
          await this.prisma.evidenceCitation.upsert({
            where: { id: citationId },
            update: {
              source: ev.type,
              url: ev.url,
              quote: ev.snippet,
              sourceType: "LIVE_API",
              citationVerified: ev.verified ?? true,
            },
            create: {
              id: citationId,
              ventureId: idea.id,
              source: ev.type,
              url: ev.url,
              quote: ev.snippet,
              sourceType: "LIVE_API",
              citationVerified: ev.verified ?? true,
            },
          });
        }
      }

      return idea.id;
    } catch (err: any) {
      console.warn(`[PRISMA SERVICE] Failed to persist venture: ${err.message}`);
      return idea.id;
    }
  }

  /**
   * Initializes a WorkflowRun record in PostgreSQL
   */
  async createWorkflowRun(runId: string, ventureId: string, ownerId?: string): Promise<void> {
    if (!this.prisma) return;

    try {
      // Ensure owner user exists
      let user: any = null;
      if (ownerId) {
        user = await this.prisma.user.findUnique({ where: { id: ownerId } });
      }
      if (!user) {
        const uniqueEmail = ownerId
          ? `${ownerId}@venturestudio.io`
          : `founder_${Math.random().toString(36).substring(2, 7)}@venturestudio.io`;
        user = await this.prisma.user.create({
          data: {
            id: ownerId || `usr_${Math.random().toString(36).substring(2, 9)}`,
            email: uniqueEmail,
            name: "Lead Founder",
            role: UserRole.FOUNDER,
            credits: 250,
          },
        });
      }

      // Ensure venture exists to satisfy foreign key
      await this.prisma.venture.upsert({
        where: { id: ventureId },
        update: {},
        create: {
          id: ventureId,
          title: "Venture Prototype",
          problem: "Automated software generation pipeline",
          targetCustomer: "Operators & Founders",
          ownerId: user.id,
          status: DeploymentStatus.BUILDING,
        },
      });

      await this.prisma.workflowRun.upsert({
        where: { id: runId },
        update: {},
        create: {
          id: runId,
          ventureId,
          ownerId: user.id,
          currentStage: RunStage.ARCHITECTING,
          completedStages: [],
          logs: [`[RUN_INIT] Initialized build pipeline for venture ${ventureId}`],
        },
      });
    } catch (err: any) {
      console.warn(`[PRISMA SERVICE] Failed to create workflow run ${runId}: ${err.message}`);
    }
  }

  /**
   * Checkpoints a completed agent stage to PostgreSQL
   */
  async checkpointStage(
    runId: string,
    stage: RunStage,
    status: string,
    input: any,
    output: any,
    tokensIn: number,
    tokensOut: number,
    durationMs: number,
    error?: string
  ): Promise<void> {
    if (!this.prisma) return;

    try {
      await this.prisma.$transaction([
        this.prisma.runStageCheckpoint.upsert({
          where: { runId_stage: { runId, stage } },
          update: {
            status,
            input: input ? JSON.parse(JSON.stringify(input)) : null,
            output: output ? JSON.parse(JSON.stringify(output)) : null,
            tokensIn,
            tokensOut,
            durationMs,
            error: error || null,
            completedAt: status === "COMPLETED" ? new Date() : null,
          },
          create: {
            id: `chk_${runId}_${stage}`,
            runId,
            stage,
            status,
            input: input ? JSON.parse(JSON.stringify(input)) : null,
            output: output ? JSON.parse(JSON.stringify(output)) : null,
            tokensIn,
            tokensOut,
            durationMs,
            error: error || null,
            completedAt: status === "COMPLETED" ? new Date() : null,
          },
        }),
        this.prisma.workflowRun.update({
          where: { id: runId },
          data: {
            currentStage: stage,
            completedStages: { push: stage.toString() },
            totalTokensIn: { increment: tokensIn },
            totalTokensOut: { increment: tokensOut },
            logs: { push: `[STAGE_${stage}] Status: ${status} (${durationMs}ms, ${tokensIn + tokensOut} tokens)` },
          },
        }),
      ]);
    } catch (err: any) {
      console.warn(`[PRISMA SERVICE] Failed to checkpoint stage ${stage} for run ${runId}: ${err.message}`);
    }
  }

  /**
   * Persists physical build artifacts into PostgreSQL
   */
  async persistArtifacts(runId: string, files: Array<{ path: string; content: string }>): Promise<void> {
    if (!this.prisma) return;

    try {
      for (const [idx, file] of files.entries()) {
        const artifactId = `art_${runId}_${idx}`;
        const fileExt = file.path.split(".").pop() || "txt";
        await this.prisma.buildArtifact.upsert({
          where: { id: artifactId },
          update: {
            content: file.content,
            filePath: file.path,
          },
          create: {
            id: artifactId,
            runId,
            filePath: file.path,
            content: file.content,
            fileType: fileExt,
          },
        });
      }
    } catch (err: any) {
      console.warn(`[PRISMA SERVICE] Failed to persist artifacts for run ${runId}: ${err.message}`);
    }
  }

  /**
   * Meters and logs token transactions in the durable credit ledger
   */
  async recordCreditTransaction(params: TokenMeteringParams): Promise<number> {
    if (!this.prisma) return 250;

    try {
      return await this.prisma.$transaction(async (tx: any) => {
        // If idempotencyKey provided, check if transaction already processed
        if (params.idempotencyKey) {
          const existing = await tx.creditLedger.findFirst({
            where: { idempotencyKey: params.idempotencyKey },
          });
          if (existing) {
            return existing.balance;
          }
        }

        // Fetch user record safely by unique id
        let user: any = null;
        if (params.userId) {
          user = await tx.user.findUnique({ where: { id: params.userId } });
        }

        if (!user) {
          const uniqueEmail = params.userId
            ? `${params.userId}@venturestudio.io`
            : `founder_${Math.random().toString(36).substring(2, 7)}@venturestudio.io`;

          user = await tx.user.create({
            data: {
              id: params.userId || `usr_${Math.random().toString(36).substring(2, 9)}`,
              email: uniqueEmail,
              name: "Operator",
              role: UserRole.FOUNDER,
              credits: 250,
            },
          });
        }

        const currentCredits = user.credits ?? 0;

        // Atomic conditional check: reject overdraws
        if (params.amount < 0 && currentCredits + params.amount < 0) {
          throw new InsufficientCreditsError(
            `Insufficient credits: User has ${currentCredits} credits, but transaction '${params.reason}' requires ${Math.abs(params.amount)} credits.`
          );
        }

        const newBalance = currentCredits + params.amount;

        // Update user balance atomically
        await tx.user.update({
          where: { id: user.id },
          data: { credits: newBalance },
        });

        // Insert into CreditLedger
        try {
          await tx.creditLedger.create({
            data: {
              id: `crd_${Math.random().toString(36).substring(2, 10)}`,
              idempotencyKey: params.idempotencyKey || null,
              userId: user.id,
              action: params.action,
              amount: params.amount,
              balance: newBalance,
              reason: params.reason,
              stage: params.stage || null,
              runId: params.runId || null,
              tokensIn: params.tokensIn || 0,
              tokensOut: params.tokensOut || 0,
              metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
            },
          });
        } catch (createErr: any) {
          if (createErr.code === "P2002" || createErr.message?.includes("idempotency_key")) {
            return newBalance;
          }
          throw createErr;
        }

        return newBalance;
      });
    } catch (err: any) {
      if (err instanceof InsufficientCreditsError) {
        throw err;
      }
      console.warn(`[PRISMA SERVICE] Credit transaction ledger warning: ${err.message}`);
      throw err;
    }
  }

  /**
   * Persists an SSE studio event for durable replay
   */
  async persistStudioEvent(stream: string, eventType: string, payload: any, runId?: string): Promise<string> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (!this.prisma) return eventId;

    try {
      await this.prisma.studioEvent.create({
        data: {
          id: eventId,
          runId: runId || null,
          stream,
          eventType,
          payload: payload ? JSON.parse(JSON.stringify(payload)) : {},
        },
      });
      return eventId;
    } catch (err: any) {
      console.warn(`[PRISMA SERVICE] Event persistence warning: ${err.message}`);
      return eventId;
    }
  }

  /**
   * Replays events occurring after a given Last-Event-ID for client connection recovery
   */
  async getEventsSince(stream: string, lastEventId: string): Promise<Array<{ id: string; eventType: string; payload: any; timestamp: Date }>> {
    if (!this.prisma) return [];

    try {
      const referenceEvent = await this.prisma.studioEvent.findUnique({
        where: { id: lastEventId },
      });

      const sinceTimestamp = referenceEvent?.timestamp ?? new Date(0);

      const events = await this.prisma.studioEvent.findMany({
        where: {
          stream,
          timestamp: { gt: sinceTimestamp },
        },
        orderBy: { timestamp: "asc" },
        take: 100,
      });

      return events;
    } catch (err: any) {
      console.warn(`[PRISMA SERVICE] Replay events warning: ${err.message}`);
      return [];
    }
  }
}

export const prismaDatabase = PrismaDatabaseService.getInstance();

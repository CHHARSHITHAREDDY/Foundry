import { RunStage } from "@prisma/client";
import { prismaDatabase } from "../../../db/prisma.service.js";
import { RealtimeEventHub } from "../../realtime/event-hub.js";

export interface StageJobData {
  runId: string;
  stage: RunStage;
  input: any;
  ownerId?: string;
}

export interface StageExecutionResult {
  stage: RunStage;
  status: "COMPLETED" | "FAILED" | "NOT_RUN" | "SIMULATED";
  output: any;
  tokensIn: number;
  tokensOut: number;
  durationMs: number;
  error?: string;
}

export class StageQueueService {
  private static instance: StageQueueService;
  private hub = RealtimeEventHub.getInstance();

  public static getInstance(): StageQueueService {
    if (!StageQueueService.instance) {
      StageQueueService.instance = new StageQueueService();
    }
    return StageQueueService.instance;
  }

  /**
   * Initializes a run in the database and reserves initial credits in the credit ledger
   */
  async initializeRun(runId: string, ventureId: string, ownerId: string = "usr_founder_001"): Promise<void> {
    // 1. Create WorkflowRun in PostgreSQL
    await prismaDatabase.createWorkflowRun(runId, ventureId, ownerId);

    // 2. Reserve build credits in CreditLedger
    await prismaDatabase.recordCreditTransaction({
      userId: ownerId,
      action: "RESERVE",
      amount: -25,
      reason: "SWARM_BUILD_RESERVE",
      runId,
      idempotencyKey: `${runId}:RESERVE`,
    });

    this.hub.broadcast("stage:change", { runId, stage: "PENDING", message: "Build run initialized and registered" }, runId);
  }

  /**
   * Executes a stage with timing, token metering, and durable PostgreSQL checkpointing
   */
  async executeAndCheckpointStage<TInput, TOutput>(
    runId: string,
    stage: RunStage,
    input: TInput,
    runner: (input: TInput) => Promise<{ output: TOutput; tokensIn?: number; tokensOut?: number }>
  ): Promise<TOutput> {
    const startTime = Date.now();
    this.hub.broadcast("stage:change", { runId, stage: stage.toString(), message: `Executing stage: ${stage}` }, runId);

    try {
      const result = await runner(input);
      const durationMs = Date.now() - startTime;
      const tokensIn = result.tokensIn ?? 0;
      const tokensOut = result.tokensOut ?? 0;

      // Checkpoint stage to Neon PostgreSQL
      await prismaDatabase.checkpointStage(
        runId,
        stage,
        "COMPLETED",
        input,
        result.output,
        tokensIn,
        tokensOut,
        durationMs
      );

      this.hub.broadcast("stage:change", {
        runId,
        stage: stage.toString(),
        status: "COMPLETED",
        durationMs,
        tokensTotal: tokensIn + tokensOut,
      }, runId);

      return result.output;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      await prismaDatabase.checkpointStage(
        runId,
        stage,
        "FAILED",
        input,
        null,
        0,
        0,
        durationMs,
        err.message
      );

      this.hub.broadcast("stage:change", {
        runId,
        stage: stage.toString(),
        status: "FAILED",
        error: err.message,
      }, runId);

      throw err;
    }
  }

  /**
   * Finalizes the run, persists generated artifacts, and settles token costs in ledger
   */
  async finalizeRun(
    runId: string,
    ownerId: string,
    files: Array<{ path: string; content: string }>,
    success: boolean
  ): Promise<void> {
    if (success) {
      // Persist artifacts
      await prismaDatabase.persistArtifacts(runId, files);

      // Settle transaction in credit ledger
      await prismaDatabase.recordCreditTransaction({
        userId: ownerId,
        action: "SETTLE",
        amount: 0,
        reason: "SWARM_BUILD_SETTLE_COMPLETED",
        runId,
        idempotencyKey: `${runId}:SETTLE`,
        metadata: { filesCount: files.length, status: "SUCCESS" },
      });

      this.hub.broadcast("build:complete", { runId, status: "SUCCESS", filesCount: files.length }, runId);
    } else {
      // Refund credits on failure with idempotency
      await prismaDatabase.recordCreditTransaction({
        userId: ownerId,
        action: "REFUND",
        amount: 25,
        reason: "SWARM_BUILD_FAILED_REFUND",
        runId,
        idempotencyKey: `${runId}:REFUND`,
      });

      this.hub.broadcast("build:complete", { runId, status: "FAILED" }, runId);
    }
  }

  /**
   * Checks database for previous checkpoints to support resuming interrupted builds
   */
  async getRunCheckpoints(runId: string): Promise<Record<string, any>> {
    const prisma = prismaDatabase.client;
    if (!prisma) return {};

    try {
      const checkpoints = await prisma.runStageCheckpoint.findMany({
        where: { runId },
      });

      const map: Record<string, any> = {};
      for (const chk of checkpoints) {
        map[chk.stage] = chk;
      }
      return map;
    } catch {
      return {};
    }
  }
}

export const stageQueue = StageQueueService.getInstance();

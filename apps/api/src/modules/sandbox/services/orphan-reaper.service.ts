import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { prismaDatabase } from "../../../db/prisma.service.js";
import { stageQueue } from "../../agent-runtime/queue/stage-queue.service.js";
import { buildRunner } from "./build-runner.service.js";

export class OrphanReaperService {
  private static instance: OrphanReaperService;
  private intervalTimer: NodeJS.Timeout | null = null;

  public static getInstance(): OrphanReaperService {
    if (!OrphanReaperService.instance) {
      OrphanReaperService.instance = new OrphanReaperService();
    }
    return OrphanReaperService.instance;
  }

  /**
   * Starts the orphan reaper cron running every 10 minutes
   */
  public startCron(): void {
    if (this.intervalTimer) return;
    // Run initial cleanup on startup
    this.reapOrphans().catch(() => {});

    // Run every 10 minutes
    this.intervalTimer = setInterval(() => {
      this.reapOrphans().catch(() => {});
    }, 10 * 60 * 1000);
  }

  public stopCron(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  /**
   * Reaps containers older than 30 minutes, stale sandboxes, and uncompleted database runs
   */
  public async reapOrphans(): Promise<{
    containersReaped: number;
    sandboxesReaped: number;
    runsRefunded: number;
  }> {
    let containersReaped = 0;
    let sandboxesReaped = 0;
    let runsRefunded = 0;
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    // 1. Containers older than 30 minutes
    const containerBin = buildRunner.getContainerBin();
    if (containerBin) {
      try {
        const psOut = execSync(
          `${containerBin} ps -a --filter "label=foundry.build=1" --format "{{.ID}}\t{{.CreatedAt}}"`,
          { encoding: "utf-8" }
        );
        const lines = psOut.trim().split("\n").filter(Boolean);
        for (const line of lines) {
          const [id, ...rest] = line.split("\t");
          const createdStr = rest.join(" ");
          const createdTime = Date.parse(createdStr);
          if (id && (!isNaN(createdTime) && createdTime < thirtyMinutesAgo)) {
            try {
              execSync(`${containerBin} rm -f ${id}`, { stdio: "ignore" });
              containersReaped++;
            } catch {}
          }
        }
      } catch {}
    }

    // 2. Sandboxes in builds/ older than 30 minutes
    const buildsDir = path.resolve(process.cwd(), "builds");
    if (fs.existsSync(buildsDir)) {
      try {
        const entries = fs.readdirSync(buildsDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith("run_")) {
            const entryPath = path.join(buildsDir, entry.name);
            try {
              const stat = fs.statSync(entryPath);
              if (stat.mtimeMs < thirtyMinutesAgo) {
                fs.rmSync(entryPath, { recursive: true, force: true });
                sandboxesReaped++;
              }
            } catch {}
          }
        }
      } catch {}
    }

    // 3. Database orphaned runs: uncompleted runs with no update in > 30 minutes
    const prisma = prismaDatabase.client;
    if (prisma) {
      try {
        const staleDate = new Date(thirtyMinutesAgo);
        const orphanedRuns = await prisma.runStageCheckpoint.findMany({
          where: {
            status: "RUNNING",
            updatedAt: { lt: staleDate },
          },
        });

        for (const orphan of orphanedRuns) {
          try {
            await stageQueue.finalizeRun(orphan.runId, "usr_founder_001", [], false);
            runsRefunded++;
          } catch {}
        }
      } catch {}
    }

    return { containersReaped, sandboxesReaped, runsRefunded };
  }
}

export const orphanReaper = OrphanReaperService.getInstance();

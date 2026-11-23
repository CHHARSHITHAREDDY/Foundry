import path from "path";
import { IdeaBrief, BuildSpec } from "@venture-studio/contracts";
import { ArchitectStage } from "../stages/architect.stage.js";
import { BackendStage } from "../stages/backend.stage.js";
import { UiStage } from "../stages/ui.stage.js";
import { IntegratorStage, ReviewerStage, DeployerStage } from "../stages/integrator.stage.js";
import { QaStage, QaReport } from "../stages/qa.stage.js";
import { RealtimeEventHub } from "../../realtime/event-hub.js";
import { sandboxService, SandboxExecutionResult } from "../../sandbox/services/sandbox.service.js";
import { stageQueue } from "../queue/stage-queue.service.js";
import { RunStage } from "@prisma/client";

export interface SwarmBuildResult {
  runId: string;
  buildSpec: BuildSpec;
  generatedFiles: Record<string, string>;
  sandboxResult: SandboxExecutionResult;
  integratorResult: {
    typeCheckStatus: "NOT_RUN" | "PASSED" | "FAILED";
    typeCheckProof: null | string;
    message: string;
    repairAttempts?: number;
  };
  qaReport: QaReport;
  reviewerAudit: {
    approved: boolean;
    securityScore: number;
    auditStatus: "STATIC_HEURISTIC_REGEX" | "LLM_SEMANTIC_AUDIT";
    auditFindings: string[];
    notice: string;
  };
  deployment: {
    liveUrl: null | string;
    simulatedUrl: string;
    deploymentId: string;
    status: string;
    notice: string;
  };
  completedStages: string[];
}

export class AgentSwarmExecutor {
  private architect = new ArchitectStage();
  private backend = new BackendStage();
  private ui = new UiStage();
  private integrator = new IntegratorStage();
  private qa = new QaStage();
  private reviewer = new ReviewerStage();
  private deployer = new DeployerStage();
  private sandbox = sandboxService;
  private hub = RealtimeEventHub.getInstance();

  async executeBuild(
    idea: IdeaBrief,
    onProgress?: (stage: string, message: string) => void,
    ownerId: string = "usr_founder_001"
  ): Promise<SwarmBuildResult> {
    const runId = `run_${Math.random().toString(36).substring(2, 9)}`;
    const completedStages: string[] = [];

    // Initialize run in PostgreSQL and reserve credits
    await stageQueue.initializeRun(runId, idea.id, ownerId);

    const notify = (stage: string, message: string) => {
      onProgress?.(stage, message);
      this.hub.broadcast("stage:change", { runId, stage, message }, runId);
      this.hub.broadcast("agent:log", { runId, stage, level: "info", message }, runId);
    };

    try {
      // Stage 1: Architect (Reasoner tier)
      notify("ARCHITECTING", "Architect is generating master Build Spec & OpenAPI contract...");
      const buildSpec = await stageQueue.executeAndCheckpointStage(
        runId,
        RunStage.ARCHITECTING,
        idea,
        async (input) => {
          const archResult = await this.architect.execute(input);
          return {
            output: archResult.spec,
            tokensIn: archResult.usage?.promptTokens || 0,
            tokensOut: archResult.usage?.completionTokens || 0,
          };
        }
      );
      completedStages.push("ARCHITECTING");

      // Stage 2: Parallel execution (Backend + UI)
      notify("BUILDING", "Backend and UI agents are coding concurrently from the Build Spec...");
      const templateDir = path.resolve(process.cwd(), "packages/templates/nextjs-saas");
      const { beResult, uiResult } = await stageQueue.executeAndCheckpointStage(
        runId,
        RunStage.BUILDING,
        buildSpec,
        async (spec) => {
          const [be, ui] = await Promise.all([
            this.backend.execute(spec, templateDir, runId),
            this.ui.execute(spec, templateDir, runId),
          ]);
          return {
            output: { beResult: be, uiResult: ui },
            tokensIn: (be.usage?.promptTokens || 0) + (ui.usage?.promptTokens || 0),
            tokensOut: (be.usage?.completionTokens || 0) + (ui.usage?.completionTokens || 0),
          };
        }
      );
      completedStages.push("BUILDING");

      // Stage 2.5: Physical Sandbox Hydration from Golden Template
      notify("SANDBOX", `Hydrating physical venture repository at builds/${runId} from nextjs-saas template...`);
      const mergedDraft = { ...beResult.files, ...uiResult.files };
      const sandboxResult = await this.sandbox.hydrateSandbox(runId, mergedDraft, buildSpec);
      this.hub.broadcast("agent:log", {
        runId,
        stage: "SANDBOX",
        level: "info",
        message: `Hydrated ${sandboxResult.filesWritten} files to disk in ${sandboxResult.durationMs}ms at ${sandboxResult.sandboxPath}`,
      }, runId);

      // Stage 3: Integrator with Real Typecheck & Autonomous Repair Loop
      notify("INTEGRATING", "Integrator is running tsc --noEmit and autonomous repair loop...");
      const intResult = await stageQueue.executeAndCheckpointStage(
        runId,
        RunStage.INTEGRATING,
        { beFiles: beResult.files, uiFiles: uiResult.files },
        async (files) => {
          const res = await this.integrator.execute(
            files.beFiles,
            files.uiFiles,
            sandboxResult.sandboxPath,
            runId
          );
          return {
            output: res,
            tokensIn: res.usage?.promptTokens || 0,
            tokensOut: res.usage?.completionTokens || 0,
          };
        }
      );
      completedStages.push("INTEGRATING");

      // Stage 4: QA (Vision + Automated Playwright User Journeys)
      notify("QA", "Executing automated Playwright user journeys against Next.js route table...");
      const qaReport = await stageQueue.executeAndCheckpointStage(
        runId,
        RunStage.QA,
        sandboxResult.sandboxPath,
        async (sbPath) => {
          const report = await this.qa.execute(sbPath);
          return { output: report, tokensIn: 0, tokensOut: 0 };
        }
      );
      completedStages.push("QA");

      // Stage 5: Reviewer (OWASP Regex Security + LLM Semantic Audit)
      notify("REVIEW", "Reviewer is conducting OWASP security audit and deep LLM semantic diff review...");
      const reviewResult = await stageQueue.executeAndCheckpointStage(
        runId,
        RunStage.REVIEW,
        { buildSpec, mergedFiles: intResult.mergedFiles },
        async (data) => {
          const audit = await this.reviewer.execute(data.buildSpec, data.mergedFiles);
          return {
            output: audit,
            tokensIn: audit.usage?.promptTokens || 0,
            tokensOut: audit.usage?.completionTokens || 0,
          };
        }
      );
      completedStages.push("REVIEW");

      // Stage 6: Deployer
      notify("DEPLOY", "Registering verified preview route...");
      const deployment = await stageQueue.executeAndCheckpointStage(
        runId,
        RunStage.DEPLOY,
        buildSpec,
        async (spec) => {
          const dep = await this.deployer.execute(spec);
          return { output: dep, tokensIn: 0, tokensOut: 0 };
        }
      );
      completedStages.push("DEPLOY");

      // Finalize run: save artifacts in PostgreSQL and settle ledger
      const fileArtifacts = Object.entries(intResult.mergedFiles).map(([p, content]) => ({
        path: p,
        content,
      }));
      await stageQueue.finalizeRun(runId, ownerId, fileArtifacts, true);

      this.hub.broadcast("build:complete", {
        runId,
        simulatedUrl: deployment.simulatedUrl,
        filesWritten: sandboxResult.filesWritten,
        sandboxPath: sandboxResult.sandboxPath,
      }, runId);

      return {
        runId,
        buildSpec,
        generatedFiles: intResult.mergedFiles,
        sandboxResult,
        integratorResult: intResult,
        qaReport,
        reviewerAudit: reviewResult,
        deployment,
        completedStages,
      };
    } catch (err: any) {
      // In case of error, refund remaining credits
      await stageQueue.finalizeRun(runId, ownerId, [], false);
      throw err;
    }
  }
}

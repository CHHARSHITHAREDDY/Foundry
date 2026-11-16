import { IdeaBrief, BuildSpec } from "@venture-studio/contracts";
import { ArchitectStage } from "../stages/architect.stage.js";
import { BackendStage } from "../stages/backend.stage.js";
import { UiStage } from "../stages/ui.stage.js";
import { IntegratorStage, ReviewerStage, DeployerStage } from "../stages/integrator.stage.js";
import { QaStage, QaReport } from "../stages/qa.stage.js";

export interface SwarmBuildResult {
  runId: string;
  buildSpec: BuildSpec;
  generatedFiles: Record<string, string>;
  qaReport: QaReport;
  reviewerAudit: { approved: boolean; securityScore: number; auditFindings: string[] };
  deployment: { liveUrl: string; deploymentId: string; status: string };
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

  async executeBuild(
    idea: IdeaBrief,
    onProgress?: (stage: string, message: string) => void
  ): Promise<SwarmBuildResult> {
    const runId = `run_${Math.random().toString(36).substring(2, 9)}`;
    const completedStages: string[] = [];

    // Stage 1: Architect (Reasoner tier)
    onProgress?.("ARCHITECTING", "Architect is generating master Build Spec & OpenAPI contract...");
    const buildSpec = await this.architect.execute(idea);
    completedStages.push("ARCHITECTING");

    // Stage 2: Parallel execution (Backend + UI)
    onProgress?.("BUILDING", "Backend and UI agents are coding concurrently from the Build Spec...");
    const [beResult, uiResult] = await Promise.all([
      this.backend.execute(buildSpec),
      this.ui.execute(buildSpec),
    ]);
    completedStages.push("BUILDING");

    // Stage 3: Integrator
    onProgress?.("INTEGRATING", "Integrator is merging codebases, wiring endpoints, and running typecheck...");
    const intResult = await this.integrator.execute(beResult.files, uiResult.files);
    completedStages.push("INTEGRATING");

    // Stage 4: QA (Vision + Playwright)
    onProgress?.("QA", "QA agent is driving headless Playwright journeys & checking visual layout...");
    const qaReport = await this.qa.execute();
    completedStages.push("QA");

    // Stage 5: Reviewer (Security & Spec check)
    onProgress?.("REVIEW", "Reviewer is auditing git diff for security vulnerabilities & spec coverage...");
    const reviewResult = await this.reviewer.execute(buildSpec, intResult.mergedFiles);
    completedStages.push("REVIEW");

    // Stage 6: Deployer
    onProgress?.("DEPLOY", "Deployer is building production bundle & allocating live subdomain...");
    const deployment = await this.deployer.execute(buildSpec);
    completedStages.push("DEPLOY");

    return {
      runId,
      buildSpec,
      generatedFiles: intResult.mergedFiles,
      qaReport,
      reviewerAudit: reviewResult,
      deployment,
      completedStages,
    };
  }
}


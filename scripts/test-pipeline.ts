import { TrendScoutService } from "../services/ideation/src/domain/scout/trend-scout.service.js";
import { IdeaGeneratorService } from "../services/ideation/src/domain/generator/idea-generator.service.js";
import { ValidatorService } from "../services/ideation/src/domain/validator/validator.service.js";
import { ClarifierService } from "../services/ideation/src/domain/clarifier/clarifier.service.js";
import { AgentSwarmExecutor } from "../services/agent-runtime/src/runner/agent-executor.js";

async function runVerification() {
  console.log("================================================================================");
  console.log("🚀 STARTING VENTURE STUDIO END-TO-END PIPELINE VERIFICATION");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------------
  // 1. WORKFLOW A: "Surprise Me"
  // ---------------------------------------------------------------------------------
  console.log("🔹 STEP 1: Running Trend Scout (Live pain point sourcing)...");
  const scout = new TrendScoutService();
  const painPoints = await scout.scoutPainPoints();
  console.log(`✅ Scouted ${painPoints.length} grounded pain points:`);
  for (const p of painPoints.slice(0, 3)) {
    console.log(`   - [${p.domain}] "${p.problem.slice(0, 70)}..."`);
    console.log(`     Evidence URL: ${p.source_url}`);
    console.log(`     Quote: "${p.quote.slice(0, 80)}..."`);
  }

  console.log("\n🔹 STEP 2: Running Idea Generator (Reasoner tier with bounded constraints)...");
  const generator = new IdeaGeneratorService();
  const candidates = await generator.generateCandidates(painPoints, 3);
  console.log(`✅ Generated ${candidates.length} bounded SaaS product candidates:`);
  for (const c of candidates) {
    console.log(`   - [${c.archetype}] ${c.title}: "${c.tagline}"`);
  }

  console.log("\n🔹 STEP 3: Running Deep Evidence-Grounded Validator on Candidate #1...");
  const validator = new ValidatorService();
  const topCandidate = candidates[0];
  const validated = await validator.validateIdea(topCandidate);

  console.log("✅ Validation Scorecard & Verdict:");
  console.log(`   - Overall Score: ${validated.scorecard?.overallScore}/5`);
  console.log(`   - Demand: ${validated.scorecard?.demand.score}/5 (${validated.scorecard?.demand.reason})`);
  console.log(`   - Competition: ${validated.scorecard?.competition.score}/5 (${validated.scorecard?.competition.reason})`);
  console.log(`   - Differentiation: ${validated.scorecard?.differentiation.score}/5 (${validated.scorecard?.differentiation.reason})`);
  console.log(`   - Monetization: ${validated.scorecard?.monetization.score}/5 (${validated.scorecard?.monetization.reason})`);
  console.log(`   - Buildability: ${validated.scorecard?.buildability.score}/5 (${validated.scorecard?.buildability.reason})`);
  console.log(`   - Verdict: ${validated.verdict?.status}`);
  console.log(`   - Summary: ${validated.verdict?.summary}`);
  console.log(`   - Suggestions/Pivots:`, validated.verdict?.pivot_suggestions);

  // ---------------------------------------------------------------------------------
  // 2. WORKFLOW B: User Idea Input + Clarifier
  // ---------------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🔹 WORKFLOW B: Testing User-Provided Raw Idea + Clarifier...");
  const clarifier = new ClarifierService();
  const rawVagueIdea = "A tool for creators to get paid";
  const clarifyResult = await clarifier.clarify(rawVagueIdea);
  console.log(`✅ Clarifier response for "${rawVagueIdea}":`);
  console.log(`   Needs Clarification: ${clarifyResult.needsClarification}`);
  if (clarifyResult.questions.length > 0) {
    console.log("   Clarifier Questions (Max 3):");
    clarifyResult.questions.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.question} [Options: ${q.options?.join(", ")}]`);
    });
  }

  // ---------------------------------------------------------------------------------
  // 3. THE 8-AGENT CODING SWARM
  // ---------------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🔹 STEP 4: Simulating User Approval Gate -> Launching 8-Agent Coding Swarm...");
  const executor = new AgentSwarmExecutor();

  const buildResult = await executor.executeBuild(validated, (stage, msg) => {
    console.log(`   [Agent Stage: ${stage}] ${msg}`);
  });

  console.log("\n🎉 SWARM BUILD COMPLETED SUCCESSFULLY!");
  console.log(`   Run ID: ${buildResult.runId}`);
  console.log(`   Build Spec ID: ${buildResult.buildSpec.id}`);
  console.log(`   Pages Defined: ${buildResult.buildSpec.pages.map((p) => p.route).join(", ")}`);
  console.log(`   Database Tables: ${buildResult.buildSpec.database.tables.map((t) => t.name).join(", ")}`);
  console.log(`   Generated Files: ${Object.keys(buildResult.generatedFiles).join(", ")}`);
  console.log(`   QA Playwright Status: ${buildResult.qaReport.passed ? "PASSED (0 errors)" : "FAILED"}`);
  console.log(`   QA User Journeys Tested: ${buildResult.qaReport.userJourneysTested.length}`);
  console.log(`   Reviewer Security Audit Score: ${buildResult.reviewerAudit.securityScore}/100`);
  console.log(`   Live Deployed URL: ${buildResult.deployment.liveUrl} (Status: ${buildResult.deployment.status})`);
  console.log("================================================================================\n");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

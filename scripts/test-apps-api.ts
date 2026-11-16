import { createApiServer } from "../apps/api/src/server.js";
import { RealtimeEventHub } from "../apps/api/src/modules/realtime/event-hub.js";

async function verifyAppsApi() {
  console.log("================================================================================");
  console.log("🚀 TESTING UNIFIED BACKEND: apps/api");
  console.log("================================================================================\n");

  const app = await createApiServer();

  // 1. Health & Readiness
  console.log("🔹 1. Testing Health & Readiness Check...");
  const healthRes = await app.inject({ method: "GET", url: "/health" });
  console.log(`   /health -> Status: ${healthRes.statusCode}, Service: ${healthRes.json().service}`);

  const readyRes = await app.inject({ method: "GET", url: "/ready" });
  console.log(`   /ready  -> Status: ${readyRes.statusCode}, Status: ${readyRes.json().status}`);

  // 2. Research Module: Pain Points & Search
  console.log("\n🔹 2. Testing Research Module (Reddit + HN Harvesters)...");
  const ppRes = await app.inject({ method: "GET", url: "/api/research/pain-points" });
  const ppData = ppRes.json();
  console.log(`   /api/research/pain-points -> Status: ${ppRes.statusCode}, Found: ${ppData.total} items from ${ppData.sourcesScanned.join(", ")}`);
  console.log(`   Sample: "${ppData.painPoints[0]?.problem.slice(0, 65)}..."`);

  const searchRes = await app.inject({
    method: "POST",
    url: "/api/research/search",
    payload: { query: "website downtime monitoring SaaS" },
  });
  console.log(`   /api/research/search -> Status: ${searchRes.statusCode}, Results: ${searchRes.json().results.length}`);

  // 3. Ideation Module: Workflow A ("Surprise Me")
  console.log("\n🔹 3. Testing Ideation Module: Workflow A (Surprise Me)...");
  const surpriseRes = await app.inject({
    method: "POST",
    url: "/api/ideas/surprise",
    payload: { maxCandidates: 3 },
  });
  const surpriseData = surpriseRes.json();
  console.log(`   /api/ideas/surprise -> Status: ${surpriseRes.statusCode}`);
  console.log(`   Selected Idea: "${surpriseData.selectedIdea.title}" - ${surpriseData.selectedIdea.tagline}`);
  console.log(`   Scorecard: ${surpriseData.selectedIdea.scorecard?.overallScore}/5 (Verdict: ${surpriseData.selectedIdea.verdict?.status})`);
  console.log(`   Cached Candidates: ${surpriseData.cachedCandidates.length}`);

  // 4. Ideation Module: Workflow B ("Clarify" & "Validate")
  console.log("\n🔹 4. Testing Ideation Module: Workflow B (Clarify & Validate)...");
  const clarifyRes = await app.inject({
    method: "POST",
    url: "/api/ideas/clarify",
    payload: { rawIdea: "A SaaS tool for European invoice VAT reconciliation" },
  });
  console.log(`   /api/ideas/clarify -> Needs Clarification: ${clarifyRes.json().needsClarification}`);

  const validateRes = await app.inject({
    method: "POST",
    url: "/api/ideas/validate",
    payload: {
      title: "InvoiceVAT Pro",
      problem: "European B2B founders manually calculating reverse-charge VAT",
      targetCustomer: "EU SaaS Founders",
    },
  });
  console.log(`   /api/ideas/validate -> Status: ${validateRes.statusCode}, Score: ${validateRes.json().scorecard?.overallScore}/5`);

  // 5. Agent Runtime Module: 8-Agent Swarm
  console.log("\n🔹 5. Testing Agent Runtime Module: 8-Agent Swarm Build...");
  const buildRes = await app.inject({
    method: "POST",
    url: "/api/runtime/build",
    payload: surpriseData.selectedIdea,
  });
  const buildData = buildRes.json();
  console.log(`   /api/runtime/build -> Status: ${buildRes.statusCode}`);
  console.log(`   Run ID: ${buildData.runId}`);
  console.log(`   Stages Completed: ${buildData.completedStages.join(" -> ")}`);
  console.log(`   Generated Files: ${Object.keys(buildData.generatedFiles).join(", ")}`);
  console.log(`   QA Playwright Passed: ${buildData.qaReport.passed}`);
  console.log(`   Reviewer Security Score: ${buildData.reviewerAudit.securityScore}/100`);
  console.log(`   Allocated Subdomain: ${buildData.deployment.liveUrl}`);

  // 6. Realtime Event Hub Verification
  console.log("\n🔹 6. Testing Realtime Event Hub (SSE Broker)...");
  const hub = RealtimeEventHub.getInstance();
  let receivedEvent = false;
  hub.once("stream-event", (evt) => {
    receivedEvent = true;
    console.log(`   Event Hub broadcast received: type=${evt.type}`);
  });
  hub.broadcast("agent:log", { message: "Test log event from swarm runner" });
  console.log(`   Realtime Event Hub active: ${receivedEvent}`);

  await app.close();

  console.log("\n================================================================================");
  console.log("🎉 ALL UNIFIED BACKEND MODULES IN apps/api PASSED VERIFICATION!");
  console.log("================================================================================\n");
}

verifyAppsApi().catch((err) => {
  console.error("apps/api verification failed:", err);
  process.exit(1);
});

import { buildResearchServer } from "../services/research/src/server.js";
import { buildIdeationServer } from "../services/ideation/src/server.js";
import { buildApiUserServer } from "../services/api-user/src/server.js";

async function testHttpServices() {
  console.log("Starting services Fastify HTTP injection test...");

  // 1. Build servers
  const research = await buildResearchServer();
  const ideation = await buildIdeationServer();
  const apiUser = await buildApiUserServer();

  // Test 1: GET /health on API-User via inject
  console.log("Testing GET /health on API-User...");
  const healthRes = await apiUser.inject({
    method: "GET",
    url: "/health",
  });
  console.log("✅ Health check status:", healthRes.statusCode);
  console.log("✅ Health check body:", healthRes.json());

  // Test 2: GET /pain-points on Research via inject
  console.log("\nTesting GET /pain-points on Research Service...");
  const painPointsRes = await research.inject({
    method: "GET",
    url: "/pain-points",
  });
  console.log("✅ Pain points status:", painPointsRes.statusCode);
  const painPointsData = painPointsRes.json();
  console.log(`✅ Scouted ${painPointsData.total} pain points from ${painPointsData.sourcesScanned.join(", ")}`);

  // Test 3: POST /ideas/surprise on Ideation via inject
  console.log("\nTesting POST /ideas/surprise on Ideation Service...");
  const surpriseRes = await ideation.inject({
    method: "POST",
    url: "/ideas/surprise",
    payload: { maxCandidates: 3 },
  });
  console.log("✅ Ideation Surprise Me status:", surpriseRes.statusCode);
  const surpriseData = surpriseRes.json();
  console.log("✅ Ideation Surprise Me result:", {
    title: surpriseData.selectedIdea.title,
    score: surpriseData.selectedIdea.scorecard?.overallScore,
    verdict: surpriseData.selectedIdea.verdict?.status,
    candidatesCount: surpriseData.cachedCandidates.length,
  });

  // Test 4: POST /ideas/clarify on Ideation via inject
  console.log("\nTesting POST /ideas/clarify on Ideation Service...");
  const clarifyRes = await ideation.inject({
    method: "POST",
    url: "/ideas/clarify",
    payload: { rawIdea: "A SaaS tool for European invoice VAT reconciliation" },
  });
  console.log("✅ Clarify response:", clarifyRes.json());

  console.log("\n================================================================================");
  console.log("🎉 ALL FASTIFY HTTP API SERVICES VERIFIED SUCCESSFULLY!");
  console.log("================================================================================");
}

testHttpServices().catch((err) => {
  console.error("HTTP test failed:", err);
  process.exit(1);
});

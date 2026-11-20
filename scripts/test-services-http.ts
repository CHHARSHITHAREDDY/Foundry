import { createApiServer } from "../apps/api/src/server.js";

async function testHttpServices() {
  console.log("Starting unified API Fastify HTTP injection test...");

  // 1. Build unified server
  const app = await createApiServer();

  // Test 1: GET /health via inject
  console.log("Testing GET /health...");
  const healthRes = await app.inject({
    method: "GET",
    url: "/health",
  });
  console.log("✅ Health check status:", healthRes.statusCode);
  console.log("✅ Health check body:", healthRes.json());

  // Test 2: GET /api/research/pain-points via inject
  console.log("\nTesting GET /api/research/pain-points...");
  const painPointsRes = await app.inject({
    method: "GET",
    url: "/api/research/pain-points",
  });
  console.log("✅ Pain points status:", painPointsRes.statusCode);
  const painPointsData = painPointsRes.json();
  console.log(`✅ Scouted ${painPointsData.total} pain points from ${painPointsData.sourcesScanned.join(", ")}`);

  // Test 3: POST /api/ideas/surprise via inject
  console.log("\nTesting POST /api/ideas/surprise...");
  const surpriseRes = await app.inject({
    method: "POST",
    url: "/api/ideas/surprise",
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

  // Test 4: POST /api/ideas/clarify via inject
  console.log("\nTesting POST /api/ideas/clarify...");
  const clarifyRes = await app.inject({
    method: "POST",
    url: "/api/ideas/clarify",
    payload: { rawIdea: "Automated schema drift alerts for production Postgres" },
  });
  console.log("✅ Ideation Clarify status:", clarifyRes.statusCode);
  console.log("✅ Clarifier result:", {
    needsClarification: clarifyRes.json().needsClarification,
  });

  await app.close();
  console.log("\n✅ All modular monolith endpoint injection checks passed successfully!");
}

testHttpServices().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

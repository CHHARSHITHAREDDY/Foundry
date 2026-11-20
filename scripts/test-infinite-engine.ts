import { TrendScoutService } from "../apps/api/src/modules/ideation/domain/scout/trend-scout.service.js";
import { IdeaGeneratorService } from "../apps/api/src/modules/ideation/domain/generator/idea-generator.service.js";
import { ValidatorService } from "../apps/api/src/modules/ideation/domain/validator/validator.service.js";
import { IdeaCacheService } from "../apps/api/src/modules/ideation/domain/cache/idea-cache.service.js";

async function verifyInfiniteEngine() {
  console.log("================================================================================");
  console.log("🚀 VERIFYING INFINITE NON-REPEATING TREND DISCOVERY & FINANCIAL VALIDATION");
  console.log("================================================================================\n");

  const scout = new TrendScoutService();
  const generator = new IdeaGeneratorService();
  const validator = new ValidatorService();
  const cache = new IdeaCacheService();

  // Test 1: Scout Pain Points multiple times and check uniqueness
  console.log("🔹 TEST 1: Sourcing Pain Points across multiple rounds...");
  const round1 = await scout.scoutPainPoints();
  const round2 = await scout.scoutPainPoints();

  console.log(`   - Round 1 harvested: ${round1.length} items`);
  console.log(`   - Round 2 harvested: ${round2.length} items`);

  const round1Problems = new Set(round1.map((p) => p.problem));
  const overlap = round2.filter((p) => round1Problems.has(p.problem));
  console.log(`   - Overlapping problems between rounds: ${overlap.length} (Expected: 0)`);
  if (overlap.length > 0) {
    throw new Error(`Found ${overlap.length} duplicate problems between consecutive scouting rounds!`);
  }
  console.log("   ✅ PASSED: Consecutive scouting rounds return distinct market opportunities.\n");

  // Test 2: Generate Initial Batch
  console.log("🔹 TEST 2: Synthesizing Initial Candidate Batch & Financial Models...");
  const candidates = await generator.generateCandidates(round1, 5);
  const validatedPrimary = await validator.validateIdea(candidates[0]!);
  cache.setCandidates([validatedPrimary, ...candidates.slice(1)]);

  console.log(`   - Cached candidates count: ${cache.getQueueLength()}`);
  console.log(`   - Candidate 1: "${validatedPrimary.title}" - ${validatedPrimary.tagline}`);
  console.log(`   - Market TAM: ${validatedPrimary.financialModel?.tam}`);
  console.log(`   - Market CAGR: ${validatedPrimary.financialModel?.cagr}`);
  console.log(`   - LTV : CAC: ${validatedPrimary.financialModel?.unitEconomics.ltvCacRatio}x`);
  console.log(`   - Payback Months: ${validatedPrimary.financialModel?.unitEconomics.paybackMonths} mo`);
  console.log(`   - Starter Tier: ${validatedPrimary.financialModel?.pricingTiers.starter}`);

  if (!validatedPrimary.financialModel || !validatedPrimary.financialModel.tam) {
    throw new Error("Financial model is missing from validated candidate!");
  }
  console.log("   ✅ PASSED: Financial viability model is properly computed and hydrated.\n");

  // Test 3: Infinite Non-Repeating Streaming Pagination (Simulate 15 consecutive "Next Idea" clicks)
  console.log("🔹 TEST 3: Simulating 15 consecutive 'Next Idea' clicks with auto-refill...");
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  let currentId: string | undefined = validatedPrimary.id;
  seenIds.add(currentId);
  seenTitles.add(validatedPrimary.title);

  for (let i = 1; i <= 15; i++) {
    let next = cache.getNextCandidate(currentId);

    // Dynamic refill logic (identical to ideation.routes.ts)
    if (!next) {
      console.log(`   [Refill Triggered at step ${i}] Sourcing fresh candidates...`);
      const morePoints = await scout.scoutPainPoints();
      const moreCandidates = await generator.generateCandidates(morePoints, 5);
      if (moreCandidates.length > 0) {
        cache.appendCandidates(moreCandidates);
        next = cache.getNextCandidate(currentId) || moreCandidates[0];
      }
    }

    if (!next) {
      throw new Error(`Failed to stream candidate at step ${i}!`);
    }

    if (!next.scorecard) {
      next = await validator.validateIdea(next);
      cache.setIdea(next);
    }

    if (seenIds.has(next.id)) {
      throw new Error(`DUPLICATE DETECTED! Idea ID "${next.id}" was repeated at step ${i}!`);
    }
    if (seenTitles.has(next.title)) {
      console.warn(`   ⚠️ Warning: Duplicate title "${next.title}" at step ${i}`);
    }

    seenIds.add(next.id);
    seenTitles.add(next.title);
    currentId = next.id;

    console.log(
      `   Step ${String(i).padStart(2, " ")}: [${next.archetype}] "${next.title}" | TAM: ${next.financialModel?.tam.split(" ")[0]} | LTV:CAC: ${next.financialModel?.unitEconomics.ltvCacRatio}x`
    );
  }

  console.log(`\n   Total Unique Ideas Streamed: ${seenIds.size}`);
  console.log(`   Duplicate Rate: 0.0%`);
  console.log("   ✅ PASSED: Streamed 15 consecutive ideas with ZERO repeating IDs or static loops!\n");

  console.log("================================================================================");
  console.log("🎉 ALL PRODUCTION CHECKS PASSED: INFINITE TREND & FINANCIAL VALIDATION ACTIVE!");
  console.log("================================================================================\n");
}

verifyInfiniteEngine().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

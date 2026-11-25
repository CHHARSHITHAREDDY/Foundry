import fs from "fs";
import path from "path";
import { TrendScoutService } from "../apps/api/src/modules/ideation/domain/scout/trend-scout.service.js";
import { IdeaGeneratorService } from "../apps/api/src/modules/ideation/domain/generator/idea-generator.service.js";
import { ValidatorService } from "../apps/api/src/modules/ideation/domain/validator/validator.service.js";
import { NoveltyMemoryService } from "../apps/api/src/modules/ideation/domain/novelty/novelty-memory.service.js";
import { prismaDatabase } from "../apps/api/src/db/prisma.service.js";

const BANNED_BOILERPLATE = [
  "zero-friction",
  "eliminating manual errors",
  "automated solution for",
  "seamless",
  "supercharge",
];

const NOUN_SUFFIX_REGEX = /^[A-Z][a-z]+(Flow|Pulse|Sync|Stack|Ops|Forge|Hub|Base|Pilot|Loop|Lens|Kit|Desk|Mind|Craft|Guard)$/;

interface CheckResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];
function record(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  console.log(`[${passed ? "PASS" : "FAIL"}] ${name} — ${details}`);
}

async function main() {
  console.log("=== PHASE B ENGINE VERIFICATION SUITE ===");
  const prisma = await prismaDatabase.ensureReady();
  if (!prisma) {
    throw new Error("Prisma database is required for Phase B tests.");
  }

  // 1. No static seed pool imports in ideation module
  const ideationDir = path.resolve(process.cwd(), "apps/api/src/modules/ideation");
  const tsFiles: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".ts")) tsFiles.push(full);
    }
  }
  walk(ideationDir);
  const forbiddenHits: string[] = [];
  for (const file of tsFiles) {
    const content = fs.readFileSync(file, "utf-8");
    if (/seed-pool|STATIC_IDEAS|MOCK_IDEAS|PAIN_POINT_POOL|FALLBACK_IDEAS/i.test(content)) {
      forbiddenHits.push(path.relative(process.cwd(), file));
    }
  }
  record(
    "1. No static seed pool imports in ideation module",
    forbiddenHits.length === 0,
    forbiddenHits.length === 0 ? `Scanned ${tsFiles.length} files, 0 static pools` : `Found in: ${forbiddenHits.join(", ")}`
  );

  // 2. Live date window & origin=LIVE
  const scout = new TrendScoutService();
  const detailed = await scout.scoutPainPointsDetailed(7);
  const allLive = detailed.painPoints.every((p) => p.origin === "LIVE" && Boolean(p.source_url?.startsWith("http")));
  record(
    "2. Live date window & origin=LIVE",
    detailed.painPoints.length > 0 && allLive,
    `Fetched ${detailed.painPoints.length} live pain points (windowDaysUsed=${detailed.windowDaysUsed}, allLive=${allLive})`
  );

  // 3. Network-blocked INSUFFICIENT_LIVE_DATA + single refund
  const testUser = await prisma.user.create({
    data: {
      email: `phaseb_test_${Date.now()}@foundry.test`,
      name: "Phase B Test User",
      passwordHash: "test_hash",
      emailVerifiedAt: new Date(),
      credits: 20,
    },
  });

  const origFetch = globalThis.fetch;
  let blockedCount = 0;
  try {
    globalThis.fetch = (async () => {
      throw new Error("Simulated network outage (ECONNREFUSED)");
    }) as typeof fetch;
    const blockedScout = await scout.scoutPainPointsDetailed(7);
    blockedCount = blockedScout.painPoints.length;
  } finally {
    globalThis.fetch = origFetch;
  }

  // Reserve & idempotent single refund via prismaDatabase.recordCreditTransaction
  const jobId = `test_job_${Date.now()}`;
  await prismaDatabase.recordCreditTransaction({
    userId: testUser.id,
    action: "SPEND",
    amount: -5,
    reason: "SURPRISE_SCOUT",
    idempotencyKey: `spend:idea_job:${jobId}`,
  });
  await prismaDatabase.recordCreditTransaction({
    userId: testUser.id,
    action: "REFUND",
    amount: 5,
    reason: "INSUFFICIENT_LIVE_DATA_REFUND",
    idempotencyKey: `refund:idea_job:${jobId}`,
  });
  let secondRefundRejected = false;
  try {
    await prismaDatabase.recordCreditTransaction({
      userId: testUser.id,
      action: "REFUND",
      amount: 5,
      reason: "INSUFFICIENT_LIVE_DATA_REFUND",
      idempotencyKey: `refund:idea_job:${jobId}`,
    });
  } catch {
    secondRefundRejected = true;
  }
  const userAfter = await prisma.user.findUnique({ where: { id: testUser.id }, select: { credits: true } });
  const ledgerRows = await prisma.creditLedger.count({ where: { userId: testUser.id, action: "REFUND" } });
  record(
    "3. Network-blocked INSUFFICIENT_LIVE_DATA + single idempotent refund",
    blockedCount === 0 && ledgerRows === 1 && userAfter?.credits === 20,
    `blockedPainPoints=${blockedCount}, refundRows=${ledgerRows}, duplicateRejected=${secondRefundRejected}, finalCredits=${userAfter?.credits}`
  );

  // 4 & 5 & 6. Generate across batches: boilerplate ban, <Noun><Suffix> cap, diversity, <30% overlap
  const generator = new IdeaGeneratorService();
  const novelty = new NoveltyMemoryService();
  const generatedIdeas: any[] = [];
  const batchTitleSets: Set<string>[] = [];

  for (let b = 0; b < 3; b++) {
    const res = await generator.generateFromPainPoints(detailed.painPoints.slice(b * 8, b * 8 + 12), {
      userId: testUser.id,
      maxCandidates: 5,
    });
    const batchTitles = new Set<string>();
    for (const idea of res.candidates) {
      generatedIdeas.push(idea);
      batchTitles.add(idea.title.toLowerCase());
      await novelty.recordShownIdea(testUser.id, idea.title, idea.problem);
    }
    batchTitleSets.push(batchTitles);
  }

  const boilerplateViolations = generatedIdeas.filter((idea) => {
    const text = `${idea.title} ${idea.tagline} ${idea.problem}`.toLowerCase();
    return BANNED_BOILERPLATE.some((bp) => text.includes(bp));
  });

  const suffixMatches = generatedIdeas.filter((idea) => NOUN_SUFFIX_REGEX.test(idea.title.replace(/\s+/g, "")));
  const distinctArchetypes = new Set(generatedIdeas.map((i) => i.archetype).filter(Boolean));
  const distinctTitles = new Set(generatedIdeas.map((i) => i.title.toLowerCase()));

  let maxOverlap = 0;
  for (let i = 1; i < batchTitleSets.length; i++) {
    const prev = batchTitleSets[i - 1];
    const curr = batchTitleSets[i];
    const intersection = [...curr].filter((t) => prev.has(t)).length;
    const ratio = curr.size > 0 ? intersection / curr.size : 0;
    if (ratio > maxOverlap) maxOverlap = ratio;
  }

  record(
    "4. Boilerplate ban & Noun+Suffix cap",
    generatedIdeas.length >= 6 && boilerplateViolations.length === 0 && suffixMatches.length <= Math.ceil(generatedIdeas.length * 0.25),
    `generated=${generatedIdeas.length}, boilerplateHits=${boilerplateViolations.length}, suffixHits=${suffixMatches.length}`
  );

  record(
    "5. Diversity & <30% consecutive batch overlap",
    distinctArchetypes.size >= 3 && distinctTitles.size >= Math.ceil(generatedIdeas.length * 0.8) && maxOverlap < 0.3,
    `archetypes=${distinctArchetypes.size}, uniqueTitles=${distinctTitles.size}/${generatedIdeas.length}, maxOverlap=${(maxOverlap * 100).toFixed(1)}%`
  );

  // 7. Re-fetched citation & competitor validation
  const validator = new ValidatorService();
  const sampleIdea = generatedIdeas[0];
  const validation = await validator.validate(sampleIdea, detailed.painPoints.slice(0, 3));
  const hasRealCitationUrls = validation.evidence.every((e: any) => (e.url || e.source_url || "").startsWith("http"));
  record(
    "6. Re-fetched citation & truthful scorecard validation",
    hasRealCitationUrls && Boolean(validation.scorecard?.basis) && Boolean(validation.verdictLabel),
    `evidence=${validation.evidence.length}, competitors=${validation.competitors.length}, verdict=${validation.verdictLabel}, basis=${validation.scorecard?.basis}`
  );

  // Cleanup test user
  await prisma.creditLedger.deleteMany({ where: { userId: testUser.id } });
  await prisma.userSeenIdea.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });

  const failed = results.filter((r) => !r.passed);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Phase B test suite crashed:", err);
  process.exit(1);
});

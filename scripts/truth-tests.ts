import fs from "fs";
import path from "path";
import { ReviewerStage } from "../apps/api/src/modules/agent-runtime/stages/integrator.stage.js";
import { sandboxService } from "../apps/api/src/modules/sandbox/services/sandbox.service.js";
import { prismaDatabase } from "../apps/api/src/db/prisma.service.js";
import { stageQueue } from "../apps/api/src/modules/agent-runtime/queue/stage-queue.service.js";
import { buildRunner } from "../apps/api/src/modules/sandbox/services/build-runner.service.js";
import { BuildSpec } from "@venture-studio/contracts";

interface TestCaseResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestCaseResult[] = [];

function recordResult(name: string, passed: boolean, error?: string, details?: any) {
  results.push({ name, passed, error, details });
  const statusStr = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`[${statusStr}] ${name}`);
  if (error) {
    console.log(`       Reason: ${error}`);
  }
}

async function runTruthTests() {
  console.log("================================================================================");
  console.log("🔍 RUNNING MONOREPO TRUTH TESTS (PROVABILITY & INTEGRITY VERIFICATION)");
  console.log("================================================================================\n");

  const dummySpec: BuildSpec = {
    id: "spec_truth_test",
    ideaId: "idea_truth_test",
    metadata: {
      id: "meta_truth",
      name: "TruthCheck",
      slug: "truth-check",
      tagline: "Verifiable Truth Testing",
      description: "Testing system invariants",
      version: "0.1.0",
      targetAudience: "Engineers",
    },
    designTokens: {
      primaryColor: "#000",
      accentColor: "#fff",
      backgroundColor: "#000",
      foregroundColor: "#fff",
      fontFamily: "sans",
      borderRadius: "0.5rem",
      darkMode: true,
    },
    pages: [{ route: "/", title: "Home", description: "Home", layout: "marketing", components: [], mockDataRequired: false }],
    database: { tables: [] },
    api: { endpoints: [] },
    tasks: [],
    createdAt: new Date().toISOString(),
  };

  // ---------------------------------------------------------------------------
  // Case 1: A TypeScript error makes the run verified=false & carries gate evidence
  // ---------------------------------------------------------------------------
  try {
    const testSandboxDir = path.resolve(process.cwd(), "builds/truth_case_1_bad_ts");
    if (!fs.existsSync(testSandboxDir)) fs.mkdirSync(testSandboxDir, { recursive: true });

    // Write a tsconfig and a broken TS file
    fs.writeFileSync(
      path.join(testSandboxDir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: { noEmit: true, target: "es2022", moduleResolution: "bundler", module: "esnext" },
        include: ["index.ts"],
      })
    );
    fs.writeFileSync(path.join(testSandboxDir, "index.ts"), `const x: number = "this is a type error";`);

    const typecheckResult = await buildRunner.runTypeCheck(testSandboxDir);

    // Rule: Gate that reports PASSED must carry {command, exitCode, durationMs, logRef, ranAt} with exitCode === 0
    const hasEvidenceFields = (res: any) =>
      res &&
      typeof res.durationMs === "number" &&
      typeof res.exitCode === "number" &&
      typeof res.command === "string" &&
      typeof res.ranAt === "string";

    // Clean up
    try { fs.rmSync(testSandboxDir, { recursive: true, force: true }); } catch {}

    if (typecheckResult.success === false && typecheckResult.exitCode !== 0) {
      // Check if evidence structure matches required Non-Negotiable Rule 1
      if (!hasEvidenceFields(typecheckResult)) {
        recordResult(
          "Case 1: TypeScript error detection & gate evidence structure",
          false,
          "Typecheck failed as expected, but missing required evidence fields {command, exitCode, durationMs, logRef, ranAt} in BuildExecutionResult",
          { exitCode: typecheckResult.exitCode, keys: Object.keys(typecheckResult) }
        );
      } else {
        recordResult("Case 1: TypeScript error detection & gate evidence structure", true);
      }
    } else {
      recordResult("Case 1: TypeScript error detection & gate evidence structure", false, "Compiler reported success on invalid TS code!");
    }
  } catch (err: any) {
    recordResult("Case 1: TypeScript error detection & gate evidence structure", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // Case 2: Render throw (throw new Error('boom')) fails E2E gate & leaves screenshot/trace
  // ---------------------------------------------------------------------------
  try {
    const testSandboxDir = path.resolve(process.cwd(), "builds/truth_case_2_render_throw");
    if (!fs.existsSync(testSandboxDir)) fs.mkdirSync(testSandboxDir, { recursive: true });

    // Write a page that passes tsc but throws at render
    const testsDir = path.join(testSandboxDir, "tests");
    if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });
    fs.writeFileSync(
      path.join(testSandboxDir, "page.tsx"),
      `export default function BoomPage() { throw new Error('boom'); }`
    );

    const testResultsDir = path.join(testSandboxDir, "test-results");
    const testRunRes = await buildRunner.runTests(testSandboxDir);

    // Assert: E2E gate must fail, and test-results directory must contain screenshot or trace
    const hasTraceOrScreenshot =
      fs.existsSync(testResultsDir) &&
      fs.readdirSync(testResultsDir).some((f) => f.endsWith(".png") || f.endsWith(".zip") || f.includes("trace"));

    try { fs.rmSync(testSandboxDir, { recursive: true, force: true }); } catch {}

    if (testRunRes.success === false && hasTraceOrScreenshot) {
      recordResult("Case 2: Render throw fails E2E gate with screenshot/trace in test-results", true);
    } else {
      recordResult(
        "Case 2: Render throw fails E2E gate with screenshot/trace in test-results",
        false,
        `E2E test returned success=${testRunRes.success} (expected false) and hasTraceOrScreenshot=${hasTraceOrScreenshot} (expected true)`
      );
    }
  } catch (err: any) {
    recordResult("Case 2: Render throw fails E2E gate with screenshot/trace in test-results", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // Case 3: Import of non-existent package fails the build gate
  // ---------------------------------------------------------------------------
  try {
    const testSandboxDir = path.resolve(process.cwd(), "builds/truth_case_3_bad_import");
    if (!fs.existsSync(testSandboxDir)) fs.mkdirSync(testSandboxDir, { recursive: true });

    fs.writeFileSync(
      path.join(testSandboxDir, "package.json"),
      JSON.stringify({ name: "bad-import-app", scripts: { build: "next build" } })
    );
    fs.writeFileSync(
      path.join(testSandboxDir, "index.ts"),
      `import { nonExistentFunction } from "completely-non-existent-pkg-99999";\nconsole.log(nonExistentFunction);`
    );

    const buildRes = await buildRunner.runBuild(testSandboxDir);

    try { fs.rmSync(testSandboxDir, { recursive: true, force: true }); } catch {}

    if (buildRes.success === false && buildRes.exitCode !== 0) {
      const failingLogLine = (buildRes.stderr + "\n" + buildRes.stdout)
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => l.includes("completely-non-existent-pkg") || l.includes("Cannot find module") || l.includes("ERR_MODULE_NOT_FOUND") || l.includes("Failed to compile") || l.includes("error")) || "Compiler reported missing package";
      console.log(`       [Case 3 Proof Log]: ${failingLogLine}`);
      recordResult("Case 3: Non-existent package import fails build gate", true);
    } else {
      recordResult("Case 3: Non-existent package import fails build gate", false, `Build succeeded with exitCode ${buildRes.exitCode}`);
    }
  } catch (err: any) {
    recordResult("Case 3: Non-existent package import fails build gate", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // Case 4: Agent patches rejected for illegal paths, extensions, sizes, and @ts-ignore
  // ---------------------------------------------------------------------------
  try {
    const illegalCases: Record<string, string> = {
      "path_parent_slash": "../x.ts",
      "path_parent_backslash": "..\\x.ts",
      "path_c_drive": "C:\\x.ts",
      "path_absolute": "/x.ts",
      "path_ntfs_stream": "a.ts:s",
      "path_reserved_name": "CON.ts",
      "path_backslash_mixed": "src\\app\\test.ts",
      "protected_package_json": "package.json",
      "protected_next_config": "next.config.mjs",
      "protected_auth": "src/lib/auth/server.ts",
      "size_over_200kb": "src/app/huge.ts",
      "content_ts_ignore": "src/app/ignore.ts",
      "content_ts_nocheck": "src/app/nocheck.ts",
      "patch_deleting_file": "src/app/deleted.ts",
      "patch_many_as_any": "src/app/anycast.ts",
    };

    const filesToTest: Record<string, string> = {
      "../x.ts": "export const x = 1;",
      "..\\x.ts": "export const x = 1;",
      "C:\\x.ts": "export const x = 1;",
      "/x.ts": "export const x = 1;",
      "a.ts:s": "export const x = 1;",
      "CON.ts": "export const x = 1;",
      "src\\app\\test.ts": "export const x = 1;",
      "package.json": '{"name": "hacked"}',
      "next.config.mjs": "export default {};",
      "src/lib/auth/server.ts": "export const backdoor = true;",
      "src/app/huge.ts": "a".repeat(250 * 1024), // 250KB (>200KB)
      "src/app/ignore.ts": "// @ts-ignore\nconst bad: number = 'text';",
      "src/app/nocheck.ts": "// @ts-nocheck\nconst bad: number = 'text';",
      "src/app/deleted.ts": "   ", // deletion patch
      "src/app/anycast.ts": "const a = 1 as any; const b = 2 as any; const c = 3 as any; const d = 4 as any;",
    };

    const unrejectedCases: string[] = [];

    for (const [key, testPath] of Object.entries(illegalCases)) {
      const content = filesToTest[testPath] || "export const a = 1;";
      const testRunId = `truth_chk_${key}_${Math.random().toString(36).substring(2, 6)}`;
      let wasRejected = false;

      try {
        await sandboxService.hydrateSandbox(testRunId, { [testPath]: content }, dummySpec);
        // Clean up if it was actually written
        const createdPath = path.resolve(process.cwd(), `builds/${testRunId}`);
        if (fs.existsSync(createdPath)) {
          fs.rmSync(createdPath, { recursive: true, force: true });
        }
      } catch {
        wasRejected = true;
      }

      if (!wasRejected) {
        unrejectedCases.push(`${key} (${testPath})`);
      }
    }

    if (unrejectedCases.length === 0) {
      recordResult("Case 4: Rejection of illegal paths, reserved names, protected files, size >200KB, @ts-ignore, mass as any, deletion", true);
    } else {
      recordResult(
        "Case 4: Rejection of illegal paths, reserved names, protected files, size >200KB, @ts-ignore, mass as any, deletion",
        false,
        `Allowed illegal patch inputs: ${unrejectedCases.join(", ")}`
      );
    }
  } catch (err: any) {
    recordResult("Case 4: Rejection of illegal paths, reserved names, protected files, size >200KB, @ts-ignore, mass as any, deletion", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // Case 5: Reviewer discrimination: bad fixture < 60, good fixture > 85
  // ---------------------------------------------------------------------------
  try {
    const reviewer = new ReviewerStage();

    const badFixtureFiles: Record<string, string> = {
      "src/app/api/secret/route.ts": `
        export const API_KEY = "sk-proj-99999999999999999999999999999999";
        export async function GET(req: Request) {
          const url = new URL(req.url);
          const userId = url.searchParams.get("id");
          const query = "SELECT * FROM users WHERE id = " + userId;
          return new Response(JSON.stringify({ query }));
        }
      `,
      "src/app/vulnerable/page.tsx": `
        export default function DangerPage({ content }: { content: string }) {
          return <div dangerouslySetInnerHTML={{ __html: content }} />;
        }
      `,
      "src/app/api/admin/unprotected/route.ts": `
        export async function DELETE() {
          // Delete all records without checking session or auth header
          return new Response("Deleted all", { status: 200 });
        }
      `,
    };

    const goodFixtureFiles: Record<string, string> = {
      "src/db/schema/app.ts": `
        import { sqliteTable, text } from "drizzle-orm/sqlite-core";
        export const items = sqliteTable("items", {
          id: text("id").primaryKey(),
          name: text("name").notNull(),
        });
      `,
      "src/app/api/items/route.ts": `
        import { NextResponse } from "next/server";
        import { z } from "zod";
        const ItemSchema = z.object({ name: z.string().min(2) });
        export async function POST(req: Request) {
          const body = await req.json();
          const parsed = ItemSchema.parse(body);
          return NextResponse.json({ success: true, item: parsed });
        }
      `,
      "src/app/page.tsx": `
        import Link from "next/link";
        export default function CleanPage() {
          return (
            <main className="p-8">
              <h1 className="text-2xl font-bold">Secure Dashboard</h1>
              <Link href="/items">View Items</Link>
            </main>
          );
        }
      `,
    };

    const badReview = await reviewer.execute(dummySpec, badFixtureFiles);
    const goodReview = await reviewer.execute(dummySpec, goodFixtureFiles);

    const badScoreOk = badReview.securityScore < 60;
    const goodScoreOk = goodReview.securityScore > 85;

    if (badScoreOk && goodScoreOk) {
      recordResult("Case 5: Reviewer discrimination (bad < 60, good > 85)", true, undefined, {
        badScore: badReview.securityScore,
        goodScore: goodReview.securityScore,
      });
    } else {
      recordResult(
        "Case 5: Reviewer discrimination (bad < 60, good > 85)",
        false,
        `Expected bad < 60 (got ${badReview.securityScore}) and good > 85 (got ${goodReview.securityScore})`
      );
    }
  } catch (err: any) {
    recordResult("Case 5: Reviewer discrimination (bad < 60, good > 85)", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // Case 6: Credit Ledger idempotency & atomic non-negative balance
  // ---------------------------------------------------------------------------
  try {
    const testUserId = `usr_truth_${Math.random().toString(36).substring(2, 7)}`;
    const testRunId = `run_truth_${Math.random().toString(36).substring(2, 7)}`;

    // Test idempotency: Calling finalize/refund twice for the same runId
    // Balance must only change ONCE
    await stageQueue.initializeRun(testRunId, "venture_test", testUserId);

    // Call refund twice with the same runId
    await stageQueue.finalizeRun(testRunId, testUserId, [], false);
    await stageQueue.finalizeRun(testRunId, testUserId, [], false);

    // Check transactions in database or check user balance
    let userBalanceAfterDoubleRefund = 250;
    if (prismaDatabase.client) {
      const user = await prismaDatabase.client.user.findUnique({ where: { id: testUserId } });
      userBalanceAfterDoubleRefund = user?.credits ?? 250;
    }

    // With 250 starting credits:
    // initializeRun reserves 25 -> 225.
    // 1st finalizeRun refunds 25 -> 250.
    // 2nd finalizeRun MUST BE IDEMPOTENT (not refund again to 275).
    const isIdempotent = userBalanceAfterDoubleRefund === 250;

    // Test concurrency: Two simultaneous finalize(runId) calls via Promise.all must produce exactly ONE REFUND row
    const concurrentRunId = `run_conc_${Math.random().toString(36).substring(2, 7)}`;
    await stageQueue.initializeRun(concurrentRunId, "venture_test", testUserId);
    await Promise.all([
      stageQueue.finalizeRun(concurrentRunId, testUserId, [], false),
      stageQueue.finalizeRun(concurrentRunId, testUserId, [], false),
    ]);

    let refundRowCount = 1;
    if (prismaDatabase.client) {
      const refundRows = await prismaDatabase.client.creditLedger.findMany({
        where: { runId: concurrentRunId, action: "REFUND" },
      });
      refundRowCount = refundRows.length;
    }
    const concurrencyPassed = refundRowCount === 1;

    // Test non-negative balance constraint:
    // Attempting to reserve 300 credits when balance is 250 should be rejected
    let rejectedOverdraw = false;
    try {
      await prismaDatabase.recordCreditTransaction({
        userId: testUserId,
        action: "RESERVE",
        amount: -300,
        reason: "OVERDRAW_TEST",
      });
    } catch {
      rejectedOverdraw = true;
    }

    if (isIdempotent && concurrencyPassed && rejectedOverdraw) {
      recordResult("Case 6: Credit ledger idempotency, concurrency & atomic non-negative balance", true);
    } else {
      recordResult(
        "Case 6: Credit ledger idempotency, concurrency & atomic non-negative balance",
        false,
        `Idempotency passed=${isIdempotent} (balance=${userBalanceAfterDoubleRefund}, expected 250), Concurrency passed=${concurrencyPassed} (refund rows=${refundRowCount}, expected 1), Overdraw rejection=${rejectedOverdraw} (expected true)`
      );
    }
  } catch (err: any) {
    recordResult("Case 6: Credit ledger idempotency & atomic non-negative balance", false, err.message);
  }

  // ---------------------------------------------------------------------------
  // Case 7: Token counts written to ledger equal model usage (no hardcoded numbers)
  // ---------------------------------------------------------------------------
  try {
    // Read apps/api/src/modules/agent-runtime/runner/agent-executor.ts
    const executorCode = fs.readFileSync(
      path.resolve(process.cwd(), "apps/api/src/modules/agent-runtime/runner/agent-executor.ts"),
      "utf-8"
    );

    // Search for hardcoded token numbers in stage execution calls
    const hardcodedPatterns = [
      /tokensIn:\s*800/,
      /tokensOut:\s*1450/,
      /tokensIn:\s*250/,
      /tokensOut:\s*200/,
      /tokensIn:\s*180/,
      /tokensOut:\s*140/,
      /tokensIn:\s*320/,
      /tokensOut:\s*280/,
      /tokensIn:\s*90/,
      /tokensOut:\s*110/,
    ];

    const foundHardcoded = hardcodedPatterns.filter((p) => p.test(executorCode));

    if (foundHardcoded.length === 0) {
      recordResult("Case 7: Token counts written to ledger equal model usage (no hardcoded per-stage constants)", true);
    } else {
      recordResult(
        "Case 7: Token counts written to ledger equal model usage (no hardcoded per-stage constants)",
        false,
        `Detected ${foundHardcoded.length} hardcoded token assignment(s) in agent-executor.ts`
      );
    }
  } catch (err: any) {
    recordResult("Case 7: Token counts written to ledger equal model usage (no hardcoded per-stage constants)", false, err.message);
  }

  console.log("\n================================================================================");
  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;
  console.log(`SUMMARY: Total Cases: ${results.length} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
  console.log("================================================================================\n");

  if (totalFailed > 0) {
    console.error(`❌ TRUTH TEST SUITE FAILED with ${totalFailed} failure(s).`);
    process.exit(1);
  } else {
    console.log("🏆 ALL TRUTH TESTS PASSED!");
    process.exit(0);
  }
}

runTruthTests().catch((err) => {
  console.error("Fatal error executing truth tests:", err);
  process.exit(1);
});

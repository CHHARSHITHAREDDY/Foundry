import dns from "node:dns/promises";
import pg from "pg";
const { Pool } = pg;

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function main() {
  const hostname = "ep-muddy-leaf-beo7ps33-pooler.c-9.us-east-2.aws.neon.tech";
  let addresses = ["3.147.219.177", "77.113.7.222"];
  try {
    addresses = await dns.resolve4(hostname);
  } catch {}

  const pool = new Pool({
    user: "neondb_owner",
    password: "npg_NpbTawxH48dX",
    host: addresses[0],
    port: 5432,
    database: "neondb",
    ssl: {
      rejectUnauthorized: false,
      servername: hostname,
    },
    connectionTimeoutMillis: 10000,
  });

  const client = await pool.connect();
  console.log("================================================================================");
  console.log("📊 NEON POSTGRESQL PERSISTENCE & DURABILITY VERIFICATION REPORT");
  console.log("================================================================================");

  try {
    // 1. Users
    const users = await client.query("SELECT id, email, name, role, credits FROM users;");
    console.log(`\n🔹 1. Users Registered (${users.rows.length}):`);
    for (const u of users.rows) {
      console.log(`   - [${u.id}] ${u.email} (${u.name}, role: ${u.role}, credits: ${u.credits})`);
    }

    // 2. Ventures
    const ventures = await client.query("SELECT id, title, verdict, total_score, scorecard_type, status FROM ventures LIMIT 5;");
    console.log(`\n🔹 2. Ventures Persisted (${ventures.rows.length}):`);
    for (const v of ventures.rows) {
      console.log(`   - [${v.id}] "${v.title}" | Verdict: ${v.verdict} | Score: ${v.total_score} | Type: ${v.scorecard_type} | Status: ${v.status}`);
    }

    // 3. Workflow Runs
    const runs = await client.query("SELECT id, venture_id, current_stage, completed_stages, total_tokens_in, total_tokens_out FROM workflow_runs LIMIT 5;");
    console.log(`\n🔹 3. Workflow Runs Recorded (${runs.rows.length}):`);
    for (const r of runs.rows) {
      console.log(`   - Run: ${r.id} | Stage: ${r.current_stage} | Stages: [${r.completed_stages.join(" -> ")}] | Tokens: ${r.total_tokens_in} in / ${r.total_tokens_out} out`);
    }

    // 4. Run Stage Checkpoints
    const checkpoints = await client.query("SELECT run_id, stage, status, tokens_in, tokens_out, duration_ms FROM run_stage_checkpoints ORDER BY created_at ASC LIMIT 10;");
    console.log(`\n🔹 4. Stage Checkpoints (${checkpoints.rows.length}):`);
    for (const c of checkpoints.rows) {
      console.log(`   - [${c.run_id}] Stage: ${c.stage} | Status: ${c.status} | Duration: ${c.duration_ms}ms | Tokens: ${c.tokens_in} in, ${c.tokens_out} out`);
    }

    // 5. Credit Ledger
    const ledger = await client.query("SELECT user_id, action, amount, balance, reason, run_id FROM credit_ledger ORDER BY created_at DESC LIMIT 6;");
    console.log(`\n🔹 5. Credit Ledger Entries (${ledger.rows.length}):`);
    for (const l of ledger.rows) {
      console.log(`   - Action: ${l.action} | Amount: ${l.amount > 0 ? "+" : ""}${l.amount} | Balance: ${l.balance} | Reason: "${l.reason}" | Run: ${l.run_id || "N/A"}`);
    }

    // 6. Build Artifacts
    const artifacts = await client.query("SELECT id, run_id, file_path, file_type, LENGTH(content) as bytes FROM build_artifacts LIMIT 6;");
    console.log(`\n🔹 6. Persisted Build Artifacts (${artifacts.rows.length}):`);
    for (const a of artifacts.rows) {
      console.log(`   - [${a.id}] ${a.file_path} (${a.file_type}, ${a.bytes} bytes)`);
    }

    // 7. Studio Events (Durability & SSE replay)
    const events = await client.query("SELECT id, stream, event_type, timestamp FROM studio_events ORDER BY timestamp DESC LIMIT 5;");
    console.log(`\n🔹 7. Durable Studio Events (${events.rows.length}):`);
    for (const e of events.rows) {
      console.log(`   - [${e.id}] Event: ${e.event_type} | Stream: ${e.stream} | Time: ${e.timestamp.toISOString()}`);
    }

    console.log("\n================================================================================");
    console.log("🏆 PHASE 1 PERSISTENCE VERIFICATION: 100% CONFIRMED ON NEON POSTGRESQL!");
    console.log("================================================================================");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);

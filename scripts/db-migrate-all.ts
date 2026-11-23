import dns from "node:dns/promises";
import pg from "pg";
const { Pool } = pg;

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const ENUM_STATEMENTS = [
  `DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('FOUNDER', 'ADMIN', 'MEMBER');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    CREATE TYPE "VerdictStatus" AS ENUM ('GO', 'GO_WITH_CHANGES', 'NO_GO', 'INSUFFICIENT_DATA');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    CREATE TYPE "RunStage" AS ENUM ('PENDING', 'ARCHITECTING', 'BUILDING', 'INTEGRATING', 'QA', 'REVIEW', 'DEPLOY', 'COMPLETED', 'FAILED');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,

  `DO $$ BEGIN
    CREATE TYPE "DeploymentStatus" AS ENUM ('BUILDING', 'LIVE', 'SIMULATED', 'FAILED', 'ARCHIVED');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
];

const DROP_STATEMENTS = [
  `DROP TABLE IF EXISTS audit_logs CASCADE;`,
  `DROP TABLE IF EXISTS notifications CASCADE;`,
  `DROP TABLE IF EXISTS payment_accounts CASCADE;`,
  `DROP TABLE IF EXISTS studio_events CASCADE;`,
  `DROP TABLE IF EXISTS build_artifacts CASCADE;`,
  `DROP TABLE IF EXISTS run_stage_checkpoints CASCADE;`,
  `DROP TABLE IF EXISTS workflow_runs CASCADE;`,
  `DROP TABLE IF EXISTS credit_ledger CASCADE;`,
  `DROP TABLE IF EXISTS evidence_citations CASCADE;`,
  `DROP TABLE IF EXISTS scorecards CASCADE;`,
  `DROP TABLE IF EXISTS ventures CASCADE;`,
  `DROP TABLE IF EXISTS users CASCADE;`,
];

const DDL_STATEMENTS = [
  // 1. Users
  `CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role "UserRole" NOT NULL DEFAULT 'FOUNDER',
    credits INT NOT NULL DEFAULT 250,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 2. Ventures
  `CREATE TABLE ventures (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    problem TEXT NOT NULL,
    target_customer VARCHAR(255) NOT NULL,
    why_now TEXT,
    verdict "VerdictStatus" NOT NULL DEFAULT 'INSUFFICIENT_DATA',
    total_score DOUBLE PRECISION,
    scorecard_type VARCHAR(64) NOT NULL DEFAULT 'INSUFFICIENT_DATA',
    assessed_dimensions_count INT NOT NULL DEFAULT 0,
    subdomain VARCHAR(255) UNIQUE,
    status "DeploymentStatus" NOT NULL DEFAULT 'BUILDING',
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 3. Scorecards
  `CREATE TABLE scorecards (
    id VARCHAR(64) PRIMARY KEY,
    venture_id VARCHAR(64) UNIQUE NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    demand DOUBLE PRECISION,
    competition DOUBLE PRECISION,
    differentiation DOUBLE PRECISION,
    monetization DOUBLE PRECISION,
    buildability DOUBLE PRECISION,
    total DOUBLE PRECISION,
    scorecard_type VARCHAR(64) NOT NULL DEFAULT 'INSUFFICIENT_DATA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 4. Evidence Citations
  `CREATE TABLE evidence_citations (
    id VARCHAR(64) PRIMARY KEY,
    venture_id VARCHAR(64) NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    quote TEXT NOT NULL,
    source_type VARCHAR(64) NOT NULL DEFAULT 'LIVE_API',
    citation_verified BOOLEAN NOT NULL DEFAULT TRUE,
    sample_notice TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 5. Credit Ledger
  `CREATE TABLE IF NOT EXISTS credit_ledger (
    id VARCHAR(64) PRIMARY KEY,
    idempotency_key VARCHAR(128) UNIQUE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(32) NOT NULL,
    amount INT NOT NULL,
    balance INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    stage VARCHAR(64),
    run_id VARCHAR(64),
    tokens_in INT NOT NULL DEFAULT 0,
    tokens_out INT NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `ALTER TABLE credit_ledger ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_idempotency ON credit_ledger(idempotency_key);`,
  `CREATE INDEX IF NOT EXISTS idx_credit_ledger_user ON credit_ledger(user_id, created_at);`,

  // 6. Workflow Runs
  `CREATE TABLE workflow_runs (
    id VARCHAR(64) PRIMARY KEY,
    venture_id VARCHAR(64) NOT NULL REFERENCES ventures(id) ON DELETE CASCADE,
    owner_id VARCHAR(64),
    current_stage "RunStage" NOT NULL DEFAULT 'PENDING',
    completed_stages TEXT[] NOT NULL DEFAULT '{}',
    logs TEXT[] NOT NULL DEFAULT '{}',
    total_tokens_in INT NOT NULL DEFAULT 0,
    total_tokens_out INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 7. Run Stage Checkpoints
  `CREATE TABLE run_stage_checkpoints (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
    stage "RunStage" NOT NULL,
    status VARCHAR(32) NOT NULL,
    input JSONB,
    output JSONB,
    tokens_in INT NOT NULL DEFAULT 0,
    tokens_out INT NOT NULL DEFAULT 0,
    duration_ms INT NOT NULL DEFAULT 0,
    error TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_run_stage UNIQUE (run_id, stage)
  );`,

  // 8. Build Artifacts
  `CREATE TABLE build_artifacts (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    content TEXT NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 9. Studio Events
  `CREATE TABLE studio_events (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64),
    stream VARCHAR(64) NOT NULL DEFAULT 'sse:studio',
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE INDEX idx_studio_events_stream ON studio_events(stream, timestamp);`,

  // 10. Payment Accounts
  `CREATE TABLE payment_accounts (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
    charges_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 11. Notifications
  `CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 12. Audit Logs
  `CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
];

export async function runMigrations(): Promise<void> {
  const hostname = "ep-muddy-leaf-beo7ps33-pooler.c-9.us-east-2.aws.neon.tech";
  console.log(`[DB MIGRATE] Resolving host ${hostname}...`);
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
  console.log(`[DB MIGRATE] Connected to PostgreSQL. Applying enums and schema DDL...`);

  try {
    await client.query("BEGIN;");
    for (const stmt of ENUM_STATEMENTS) {
      await client.query(stmt);
    }
    for (const stmt of DROP_STATEMENTS) {
      await client.query(stmt);
    }
    for (const ddl of DDL_STATEMENTS) {
      await client.query(ddl);
    }
    await client.query("COMMIT;");
    console.log(`[DB MIGRATE] ✅ Successfully applied all schema migrations and enums to Neon PostgreSQL!`);

    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log(`[DB MIGRATE] Verified public tables:`, tableRes.rows.map((r: any) => r.table_name));
  } catch (err: any) {
    await client.query("ROLLBACK;");
    console.error(`[DB MIGRATE] ❌ Migration failed:`, err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes("db-migrate-all")) {
  runMigrations().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

import dns from "node:dns/promises";
import pg from "pg";
const { Pool } = pg;

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function migrateIdempotency() {
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
  console.log(`[DB MIGRATE] Connected to PostgreSQL. Adding idempotency_key to credit_ledger...`);

  try {
    await client.query("BEGIN;");
    await client.query(`ALTER TABLE credit_ledger ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_ledger_idempotency ON credit_ledger(idempotency_key);`);
    await client.query("COMMIT;");
    console.log(`[DB MIGRATE] ✅ Successfully added idempotency_key with unique constraint to credit_ledger!`);
  } catch (err: any) {
    await client.query("ROLLBACK;");
    console.error(`[DB MIGRATE] ❌ Migration failed:`, err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateIdempotency().catch((err) => {
  console.error(err);
  process.exit(1);
});

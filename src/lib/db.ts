import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function ensureTable() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id UUID PRIMARY KEY,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      answers JSONB NOT NULL
    );
  `);
}

export async function getAllResponses() {
  await ensureTable();
  const p = getPool();
  const res = await p.query(
    "SELECT id, submitted_at, answers FROM survey_responses ORDER BY submitted_at DESC"
  );
  return res.rows.map((r) => ({
    id: r.id,
    submittedAt: (r.submitted_at instanceof Date ? r.submitted_at : new Date(r.submitted_at)).toISOString(),
    answers: r.answers,
  }));
}

export async function insertResponse(answers: unknown) {
  await ensureTable();
  const p = getPool();
  const id = crypto.randomUUID();
  await p.query(
    "INSERT INTO survey_responses (id, submitted_at, answers) VALUES ($1, NOW(), $2)",
    [id, answers]
  );
  return id;
}

export async function deleteAllResponses() {
  await ensureTable();
  const p = getPool();
  await p.query("DELETE FROM survey_responses");
}

export async function ensureAuthTables() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await p.query("ALTER TABLE admin_credentials ALTER COLUMN id SET DEFAULT gen_random_uuid()");
  await p.query(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );
  `);
}

export async function getAdminPasswordHash(): Promise<string | null> {
  await ensureAuthTables();
  const p = getPool();
  const res = await p.query("SELECT password_hash FROM admin_credentials ORDER BY created_at DESC LIMIT 1");
  return res.rows[0]?.password_hash ?? null;
}

export async function setAdminPasswordHash(hash: string) {
  await ensureAuthTables();
  const p = getPool();
  await p.query("DELETE FROM admin_credentials");
  const id = crypto.randomUUID();
  await p.query("INSERT INTO admin_credentials (id, password_hash) VALUES ($1, $2)", [id, hash]);
}

export async function createSession(days = 7): Promise<string> {
  await ensureAuthTables();
  const p = getPool();
  const token = crypto.randomUUID() + crypto.randomUUID();
  await p.query(
    "INSERT INTO admin_sessions (token, expires_at) VALUES ($1, NOW() + ($2 || ' days')::interval)",
    [token, String(days)]
  );
  return token;
}

export async function validateSession(token: string): Promise<boolean> {
  await ensureAuthTables();
  const p = getPool();
  const res = await p.query(
    "SELECT 1 FROM admin_sessions WHERE token = $1 AND expires_at > NOW()",
    [token]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function deleteSession(token: string) {
  await ensureAuthTables();
  const p = getPool();
  await p.query("DELETE FROM admin_sessions WHERE token = $1", [token]);
}

export async function deleteOtherSessions(keepToken: string) {
  await ensureAuthTables();
  const p = getPool();
  await p.query("DELETE FROM admin_sessions WHERE token <> $1", [keepToken]);
}

export async function deleteAllSessions() {
  await ensureAuthTables();
  const p = getPool();
  await p.query("DELETE FROM admin_sessions");
}

import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;
const password = process.env.ADMIN_PASSWORD;

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
if (!password || password.length < 6) {
  console.error("ADMIN_PASSWORD must be at least 6 characters");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query("DELETE FROM admin_credentials");
  const hash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  await pool.query("INSERT INTO admin_credentials (id, password_hash) VALUES ($1, $2)", [id, hash]);
  console.log("Admin password seeded successfully.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
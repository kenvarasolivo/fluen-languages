import fs from "node:fs/promises";
import pg from "pg";
import { supabaseEnv } from "./supabase-env.mjs";

const env = supabaseEnv();
const cleanup = process.argv.includes("--cleanup-legacy");
let connection;
async function query(sql) {
  if (env.SUPABASE_DB_URL) {
    connection ??= new pg.Client({ connectionString: env.SUPABASE_DB_URL });
    if (!connection._connected) await connection.connect();
    return await connection.query(sql);
  }
  if (env.SUPABASE_ACCESS_TOKEN && env.NEXT_PUBLIC_SUPABASE_URL) {
    const project = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
    const response = await fetch(`https://api.supabase.com/v1/projects/${project}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    });
    if (!response.ok) throw new Error(`Supabase management query failed (HTTP ${response.status}).`);
    return await response.json();
  }
  throw new Error("Add SUPABASE_DB_URL or SUPABASE_ACCESS_TOKEN to .env.local, or run the SQL files in Supabase SQL Editor. The anon and service-role API keys cannot execute schema migrations.");
}

try {
  // Backup must succeed before cleanup is allowed.
  if (cleanup) await import("./supabase-backup.mjs");
  await query(await fs.readFile("supabase/migrations/202610070001_fluen.sql", "utf8"));
  console.log("Fluen tables and per-user access policies applied.");
  if (cleanup) {
    await query(await fs.readFile("supabase/cleanup-legacy.sql", "utf8"));
    console.log("Legacy app tables removed. Existing Auth accounts and Storage preserved.");
  }
} catch (error) {
  // Avoid driver errors that may include a connection string or password.
  console.error(error instanceof Error && !env.SUPABASE_DB_URL ? error.message : "Database setup failed. Check the connection and database permissions.");
  process.exitCode = 1;
} finally { if (connection) await connection.end(); }

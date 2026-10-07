import fs from "node:fs/promises";
import { supabaseEnv } from "./supabase-env.mjs";

const env = supabaseEnv();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Backup requires the Supabase URL and service-role key in .env.local.");
const headers = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` };
const tables = ["review_logs", "words", "chat_messages", "user_media_progress", "user_words", "profiles", "immerse_texts", "deck_cards", "user_languages", "media_items", "media_cues", "chat_sessions", "decks"];
const backup = {};
for (const table of tables) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    // Deterministic ordering protects pagination from arbitrary query plans.
    const order = table === "deck_cards" ? "deck_id,user_word_id" : table === "user_media_progress" ? "user_id,media_id" : table === "user_languages" ? "user_id,language" : "id";
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*&order=${order}&limit=1000&offset=${offset}`, { headers });
    if (response.status === 404) break; // Supports rerunning after cleanup.
    if (!response.ok) throw new Error(`Backup failed for ${table} (HTTP ${response.status}); no cleanup performed.`);
    const page = await response.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  backup[table] = rows;
  console.log(`Backed up ${table}: ${rows.length} rows`);
}
await fs.mkdir(".local-backups", { recursive: true });
const filename = `.local-backups/supabase-legacy-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
await fs.writeFile(filename, JSON.stringify({ project: env.NEXT_PUBLIC_SUPABASE_URL, createdAt: new Date().toISOString(), tables: backup }, null, 2));
console.log(`Legacy row backup saved to ${filename}. This does not include Auth, Storage, or schema.`);

// One-off diagnostic: find dictionary rows where the lemma itself
// starts with an article, which doubles up with the gender column
// in the UI ("der der Vorteil"). Read-only.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);

const { data, error } = await supabase
  .from("words")
  .select("id, lemma, gender, pos, cefr_level")
  .or("lemma.ilike.der %,lemma.ilike.die %,lemma.ilike.das %");

if (error) {
  console.error("query failed:", error.message);
  process.exit(1);
}

console.log(`rows with article inside lemma: ${data.length}`);
for (const w of data) {
  console.log(`  [${w.pos}] gender=${w.gender ?? "null"}  lemma="${w.lemma}"  (${w.cefr_level ?? "-"})`);
}

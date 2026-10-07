import fs from "node:fs";

// Never print credentials. Shell environment takes precedence over local files.
export function supabaseEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_][A-Z_0-9]*)\s*=\s*(.*?)\s*$/);
      if (match && env[match[1]] === undefined) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  return env;
}

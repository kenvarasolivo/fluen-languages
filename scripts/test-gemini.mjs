import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const ai = new GoogleGenAI({});
try {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Say 'ok' and nothing else.",
  });
  console.log("SUCCESS:", res.text);
} catch (err) {
  console.error("FAILED:", err?.message ?? err);
}

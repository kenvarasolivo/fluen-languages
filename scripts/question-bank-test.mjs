import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Load the pure TypeScript bank with the project's existing compiler, without
// requiring an additional test runner or an API key.
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
async function compile(path, replacements = {}) {
  let source = ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  for (const [from, to] of Object.entries(replacements)) source = source.replaceAll(`"${from}"`, JSON.stringify(to));
  return moduleUrl(source);
}
const practiceUrl = await compile("../lib/practice.ts");
const chineseUrl = await compile("../lib/chinese-bank.ts", { "./practice": practiceUrl });
const bankUrl = await compile("../lib/question-bank.ts", { "./practice": practiceUrl, "./chinese-bank": chineseUrl });
const { levels, topics, starter } = await import(practiceUrl);
const { getExercisePool, pickExercise, normalizeAnswer } = await import(bankUrl);
let total = 0;
for (const level of levels) {
  for (const topic of topics) {
    for (const format of ["single", "connected"]) {
      const settings = { level, topic, format };
      const pool = getExercisePool(settings);
      assert.equal(pool.length, format === "single" ? 4 : 12);
      assert.equal(new Set(pool.map((item) => item.english)).size, pool.length);
      for (const item of pool) {
        assert.ok(item.english && item.german && item.hint && item.vocabulary.length);
        assert.ok(item.vocabulary.every((word) => word.german && word.english));
        if (format === "connected") assert.match(item.german, /, und /);
      }
      const history = [];
      for (let i = 0; i < pool.length; i++) {
        const selected = pickExercise(settings, history);
        assert.ok(!history.includes(selected.english), `${level}/${topic}/${format} repeated early`);
        history.push(selected.english);
      }
      assert.equal(pickExercise(settings, history).english, history[0]);
      const next = pickExercise(settings, [...history, history[0]]);
      assert.equal(next.english, history[1]);
      total += pool.length;
    }
  }
}
assert.equal(total, 576);
assert.ok(getExercisePool({ level: "A1", topic: topics[0], format: "single" })
  .some((item) => item.english === starter.english && item.german === starter.german));
assert.equal(normalizeAnswer("  Ich   trinke einen Kaffee! "), normalizeAnswer("Ich trinke einen Kaffee."));
assert.notEqual(normalizeAnswer("Ich hatte Zeit."), normalizeAnswer("Ich hätte Zeit."));
for (const answer of ["ni hao", "NÍ HÀO!", "ni3 hao3", "nihao", "nǐ hǎo".normalize("NFD")]) {
  assert.equal(normalizeAnswer(answer, "chinese"), normalizeAnswer("Nǐ hǎo.", "chinese"));
}
for (const answer of ["lu", "lv", "lu:", "lü", "lǜ", "lv4"]) {
  assert.equal(normalizeAnswer(answer, "chinese"), normalizeAnswer("lǚ", "chinese"));
}
assert.notEqual(normalizeAnswer("wo he cha", "chinese"), normalizeAnswer("wo bu he cha", "chinese"));
let chineseTotal = 0;
for (const level of levels) for (const topic of topics) for (const format of ["single", "connected"]) {
  const settings = { language: "chinese", level, topic, format };
  const pool = getExercisePool(settings);
  assert.equal(pool.length, 2);
  assert.equal(new Set(pool.map((item) => item.english)).size, pool.length);
  const history = [];
  for (const item of pool) {
    assert.ok(item.english && item.german && item.hint && item.vocabulary.length);
    assert.ok(!/\p{Script=Han}/u.test(JSON.stringify(item)));
    assert.ok(item.vocabulary.every((word) => word.language === "chinese"));
    const selected = pickExercise(settings, history);
    assert.ok(!history.includes(selected.english));
    history.push(selected.english);
  }
  assert.equal(pickExercise(settings, history).english, history[0]);
  chineseTotal += pool.length;
}
assert.equal(chineseTotal, 144);
console.log("PASS: 576 complete exercises, all 72 settings combinations, no early repeats, pool cycling and answer normalization");

// The AI constructor throws if reached. This proves questions and exact checks
// do not call the provider, while alternative answers retain the AI path.
const providerUrl = moduleUrl(`
  export const Type = { ARRAY: "array", OBJECT: "object", STRING: "string", BOOLEAN: "boolean" };
  export const ThinkingLevel = { MINIMAL: "minimal" };
  export class GoogleGenAI { constructor() { throw new Error("Unexpected AI call"); } }
`);
const nextUrl = moduleUrl("export const NextResponse = { json: (data, options) => Response.json(data, options) };");
const routeUrl = await compile("../app/api/practice/route.ts", {
  "@/lib/practice": practiceUrl,
  "@/lib/question-bank": bankUrl,
  "@google/genai": providerUrl,
  "next/server": nextUrl,
});
const { POST } = await import(routeUrl);
delete process.env.GEMINI_API_KEY;
delete process.env.GOOGLE_API_KEY;
async function call(action, settings, data = {}) {
  return POST(new Request("http://localhost/api/practice", {
    method: "POST", body: JSON.stringify({ action, settings, ...data }),
  }));
}
for (const level of levels) {
  for (const topic of topics) {
    for (const format of ["single", "connected"]) {
      const settings = { level, topic, format };
      const response = await call("sentence", settings);
      assert.equal(response.status, 200);
      const item = await response.json();
      const check = await call("check", settings, { english: item.english, answer: item.german });
      assert.equal(check.status, 200);
      assert.equal((await check.json()).correct, true);
    }
  }
}
const settings = { level: "A1", topic: topics[0], format: "single" };
for (const level of levels) for (const topic of topics) for (const format of ["single", "connected"]) {
  const chineseSettings = { language: "chinese", level, topic, format };
  const response = await call("sentence", chineseSettings);
  assert.equal(response.status, 200);
  const item = await response.json();
  const answer = item.german.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const check = await call("check", chineseSettings, { english: item.english, answer });
  assert.equal(check.status, 200);
  const feedback = await check.json();
  assert.equal(feedback.correct, true);
  assert.deepEqual(feedback.corrections, []);
  assert.ok(feedback.vocabulary.every((word) => word.language === "chinese"));
}
assert.equal((await call("sentence", { ...settings, language: "klingon" })).status, 400);
assert.equal((await call("sentence", { ...settings, level: "D1" })).status, 400);
assert.equal((await call("check", settings, { english: starter.english, answer: "" })).status, 400);
assert.equal((await call("check", settings, { english: starter.english, answer: "Jeden Morgen trinke ich einen Kaffee." })).status, 503);
process.env.GEMINI_API_KEY = "test-only";
assert.equal((await call("sentence", settings)).status, 200);
assert.equal((await call("check", settings, { english: starter.english, answer: starter.german })).status, 200);
console.log("PASS: German and 144 Chinese exercises; tone-free Chinese checks work without AI; alternatives use the AI path; invalid input rejected");

// Capture the provider request to verify the rules also reach alternative
// translation checking and conversation, rather than only exact matches.
const aiStubUrl = moduleUrl(`
  export const Type = { ARRAY: "array", OBJECT: "object", STRING: "string", BOOLEAN: "boolean" };
  export const ThinkingLevel = { MINIMAL: "minimal" };
  export class GoogleGenAI {
    models = { generateContent: async (request) => {
      globalThis.fluenTestRequest = request;
      return { text: JSON.stringify(globalThis.fluenTestResult) };
    } };
  }
`);
const aiRouteUrl = await compile("../app/api/practice/route.ts", {
  "@/lib/practice": practiceUrl,
  "@/lib/question-bank": bankUrl,
  "@google/genai": aiStubUrl,
  "next/server": nextUrl,
});
const { POST: aiPOST } = await import(aiRouteUrl);
const chineseSettings = { ...settings, language: "chinese" };
const mockFeedback = {
  correct: true, corrected: "Wǒ zǎoshang měitiān hē chá.", explanation: "Good work!",
  corrections: [], vocabulary: [{ german: "chá", english: "tea" }],
};
globalThis.fluenTestResult = mockFeedback;
const alternativeCheck = await aiPOST(new Request("http://localhost/api/practice", {
  method: "POST", body: JSON.stringify({ action: "check", settings: chineseSettings,
    english: "I drink tea every morning.", answer: "wo zaoshang meitian he cha" }),
}));
assert.equal(alternativeCheck.status, 200);
assert.equal((await alternativeCheck.json()).vocabulary[0].language, "chinese");
assert.match(globalThis.fluenTestRequest.config.systemInstruction, /NEVER penalize missing or incorrect tones/);
assert.match(globalThis.fluenTestRequest.config.systemInstruction, /Never output Chinese characters/);
assert.match(globalThis.fluenTestRequest.contents, /ignoring all tone differences/);
globalThis.fluenTestResult = {
  reply: "Nǐ hǎo! Nǐ xǐhuan hē chá ma?", translation: "Hello! Do you like drinking tea?",
  feedback: mockFeedback, vocabulary: [{ german: "chá", english: "tea" }],
};
const chatResponse = await aiPOST(new Request("http://localhost/api/practice", {
  method: "POST", body: JSON.stringify({ action: "chat", settings: chineseSettings,
    messages: [{ role: "user", text: "wo xihuan he cha" }] }),
}));
assert.equal(chatResponse.status, 200);
assert.equal((await chatResponse.json()).feedback.vocabulary[0].language, "chinese");
assert.match(globalThis.fluenTestRequest.contents, /regardless of tone marks or tone numbers/);
globalThis.fluenTestResult.reply = "你好";
const characterResponse = await aiPOST(new Request("http://localhost/api/practice", {
  method: "POST", body: JSON.stringify({ action: "chat", settings: chineseSettings, messages: [] }),
}));
assert.equal(characterResponse.status, 502);
delete globalThis.fluenTestRequest;
delete globalThis.fluenTestResult;
console.log("PASS: AI checks and chat receive pinyin-only, tone-insensitive rules; character output is rejected");

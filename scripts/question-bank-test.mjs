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
const connectedUrl = await compile("../lib/connected-bank.ts", { "./practice": practiceUrl });
const extraUrl = await compile("../lib/extra-sentences.ts", { "./practice": practiceUrl });
const chineseUrl = await compile("../lib/chinese-bank.ts", { "./practice": practiceUrl, "./connected-bank": connectedUrl, "./extra-sentences": extraUrl });
const bankUrl = await compile("../lib/question-bank.ts", { "./practice": practiceUrl, "./chinese-bank": chineseUrl, "./connected-bank": connectedUrl, "./extra-sentences": extraUrl });
const { levels, topics, starter } = await import(practiceUrl);
const { getExercisePool, pickExercise, normalizeAnswer, localAnswerFeedback } = await import(bankUrl);
const progressUrl = await compile("../lib/writing-progress.ts", { "./practice": practiceUrl, "./question-bank": bankUrl });
const { exerciseProgressKey, groupProgress, readWritingProgress, progressStorageKey } = await import(progressUrl);
const progressSettings = { language: "german", level: "A1", topic: topics[0], format: "single" };
const progressPool = getExercisePool(progressSettings);
const completed = new Set();
assert.deepEqual(groupProgress(completed, "german", progressSettings), { correct: 0, total: progressPool.length, percent: 0 });
completed.add(exerciseProgressKey(progressSettings, progressPool[0]));
completed.add(exerciseProgressKey(progressSettings, progressPool[0]));
assert.equal(groupProgress(completed, "german", progressSettings).correct, 1, "Repeated correct answers count once");
assert.equal(groupProgress(completed, "german", { level: "A1" }).correct, 1);
assert.equal(groupProgress(completed, "german", { topic: topics[0] }).correct, 1);
assert.equal(groupProgress(completed, "german", { format: "single" }).correct, 1);
assert.equal(groupProgress(completed, "german", { format: "connected" }).correct, 0);
assert.equal(groupProgress(completed, "chinese", { level: "A1" }).correct, 0);
for (const item of progressPool) completed.add(exerciseProgressKey(progressSettings, item));
assert.equal(groupProgress(completed, "german", progressSettings).percent, 100);
assert.ok(groupProgress(completed, "german", { level: "A1" }).percent < 100);
const historyAtCompletion = progressPool.map(item => item.english);
assert.equal(pickExercise(progressSettings, historyAtCompletion).english, progressPool[0].english,
  "Completed sentences remain available for review");
for (const level of levels) for (const topic of topics) for (const format of ["single", "connected"]) {
  const settings = { language: "german", level, topic, format };
  for (const exercise of getExercisePool(settings)) completed.add(exerciseProgressKey(settings, exercise));
}
for (const level of levels) assert.equal(groupProgress(completed, "german", { level }).percent, 100);
for (const topic of topics) assert.equal(groupProgress(completed, "german", { topic }).percent, 100);
for (const format of ["single", "connected"]) assert.equal(groupProgress(completed, "german", { format }).percent, 100);
globalThis.localStorage = { getItem: key => key === progressStorageKey ? JSON.stringify([...completed]) : null };
assert.deepEqual(readWritingProgress(), completed, "Progress survives reloading storage");
globalThis.localStorage = { getItem: () => "invalid JSON" };
assert.equal(readWritingProgress().size, 0);
globalThis.localStorage = { getItem: () => JSON.stringify([null, 2, "valid"]) };
assert.deepEqual([...readWritingProgress()], ["valid"]);
globalThis.localStorage = { getItem: () => { throw new Error("Storage unavailable"); } };
assert.equal(readWritingProgress().size, 0);
delete globalThis.localStorage;
console.log("PASS: unique correct answers, independent groups and languages, 100% completion, review selection and persistent progress");
function assertEveryWord(item) {
  const words = item.german.match(/[\p{L}\p{M}]+(?:[-'’][\p{L}\p{M}]+)*/gu) ?? [];
  assert.deepEqual(item.vocabulary.map((word) => word.german), words,
    `Missing sentence words: ${item.german}`);
  assert.ok(item.vocabulary.every((word) => word.english.trim()));
}
assertEveryWord(starter);
assert.deepEqual(starter.vocabulary.map((word) => word.english),
  ["I", "drink", "every", "morning", "a", "coffee"]);
let total = 0;
for (const level of levels) {
  for (const topic of topics) {
    for (const format of ["single", "connected"]) {
      const settings = { level, topic, format };
      const pool = getExercisePool(settings);
      assert.equal(pool.length, format === "single" ? 5 : 4);
      if (format === "connected") assert.deepEqual(pool.map(item => item.connector.english), ["and", "but", "because", "although"]);
      assert.equal(new Set(pool.map((item) => item.english)).size, pool.length);
      for (const item of pool) {
        assertEveryWord(item);
        assert.ok(item.english && item.german && item.hint && item.vocabulary.length);
        assert.ok(item.vocabulary.every((word) => word.german && word.english));
        if (format === "connected") {
          assert.ok(item.english.includes(`, ${item.connector.english} `));
          assert.ok(item.german.includes(`, ${item.connector.target} `));
          assert.equal(item.hint, item.german.replace(/[\p{L}\p{M}]+(?:[-'’][\p{L}\p{M}]+)*/gu, word => [...word].map((letter, index) => index ? "_".repeat(letter.length) : letter).join("")));
        }
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
assert.equal(total, 324);
assert.ok(getExercisePool({ level: "A1", topic: topics[0], format: "single" })
  .some((item) => item.english === starter.english && item.german === starter.german));
const flexibleSchedule = getExercisePool({ level: "B2", topic: topics[0], format: "single" })
  .find(item => item.german === "Ein flexibler Zeitplan erleichtert es, Arbeit und Familie zu vereinbaren.");
assert.deepEqual(flexibleSchedule.vocabulary.map(word => [word.german, word.english]), [
  ["Ein", "a"], ["flexibler", "flexible"], ["Zeitplan", "schedule"],
  ["erleichtert", "makes easier"], ["es", "it"], ["Arbeit", "work"],
  ["und", "and"], ["Familie", "family"], ["zu", "to"], ["vereinbaren", "reconcile"],
]);
assert.equal(normalizeAnswer("  Ich   trinke einen Kaffee! "), normalizeAnswer("Ich trinke einen Kaffee."));
assert.equal(normalizeAnswer("Ich möchte Grüße aus Köln."), normalizeAnswer("Ich moechte Gruesse aus Koeln."));
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
  assert.equal(pool.length, format === "single" ? 3 : 4);
  if (format === "connected") assert.deepEqual(pool.map(item => item.connector.english), ["and", "but", "because", "although"]);
  assert.equal(new Set(pool.map((item) => item.english)).size, pool.length);
  const history = [];
  for (const item of pool) {
    assertEveryWord(item);
    if (format === "connected") {
      assert.ok(item.english.includes(`, ${item.connector.english} `));
      assert.ok(item.vocabulary.some(word => word.german.toLowerCase() === item.connector.target));
    }
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
assert.equal(chineseTotal, 252);
const germanConnected = getExercisePool({ level: "A1", topic: topics[0], format: "connected" });
assert.equal(germanConnected[2].german, "Ich trinke jeden Morgen einen Kaffee, weil ich müde bin.");
assert.equal(germanConnected[3].german, "Ich trinke jeden Morgen einen Kaffee, obwohl ich Tee lieber mag.");
assert.ok(getExercisePool({ level: "B1", topic: topics[2], format: "connected" })[2].german.endsWith(
  ", weil ich Geld sparen möchte."));
assert.ok(getExercisePool({ level: "B2", topic: topics[1], format: "connected" })[2].german.endsWith(
  ", weil die Preise kurz danach gestiegen sind."));
assert.ok(getExercisePool({ level: "C1", topic: topics[3], format: "connected" })[2].german.endsWith(
  ", weil die verfügbaren Studien einander widersprechen."));
const chineseConnected = getExercisePool({ language: "chinese", level: "A1", topic: topics[0], format: "connected" });
assert.equal(chineseConnected[3].german, "Suīrán wǒ gèng xǐhuan kāfēi, dànshì wǒ měitiān zǎoshang hē chá.");
// The same two ideas with different conjunctions must resolve to the intended
// reference answer, and dropping the conjunction cannot pass the local check.
for (const language of ["german", "chinese"]) {
  const pool = getExercisePool({ language, level: "A1", topic: topics[0], format: "connected" });
  assert.notEqual(pool[1].english, pool[3].english);
  for (const exercise of pool) {
    assert.equal(localAnswerFeedback(exercise, exercise.german, language)?.correct, true);
    assert.equal(localAnswerFeedback(exercise,
      exercise.german.replace(new RegExp(exercise.connector.target, "i"), ""), language), null);
  }
}
console.log("PASS: 324 German and 252 Chinese exercises, four connector meanings per connected pool, complete word meanings and no early repeats");

// The AI constructor throws if reached. This proves questions and exact checks
// do not call the provider. Alternatives require explicit AI opt-in.
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
      for (const exercise of getExercisePool(settings)) {
        const check = await call("check", settings, { english: exercise.english, answer: exercise.german });
        assert.equal(check.status, 200);
        assert.equal((await check.json()).correct, true);
      }
    }
  }
}
const settings = { level: "A1", topic: topics[0], format: "single" };
for (const level of levels) for (const topic of topics) for (const format of ["single", "connected"]) {
  const chineseSettings = { language: "chinese", level, topic, format };
  const response = await call("sentence", chineseSettings);
  assert.equal(response.status, 200);
  const item = await response.json();
  for (const exercise of getExercisePool(chineseSettings)) {
    const answer = exercise.german.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const check = await call("check", chineseSettings, { english: exercise.english, answer });
    assert.equal(check.status, 200);
    const feedback = await check.json();
    assert.equal(feedback.correct, true);
    assert.equal(feedback.corrected, exercise.german, "Show the tone-marked model, even for unmarked input");
    assertEveryWord({ german: feedback.corrected, vocabulary: feedback.vocabulary });
    assert.deepEqual(feedback.corrections, []);
    assert.ok(feedback.vocabulary.every((word) => word.language === "chinese"));
  }
}
assert.equal((await call("sentence", { ...settings, language: "klingon" })).status, 400);
assert.equal((await call("sentence", { ...settings, level: "D1" })).status, 400);
assert.equal((await call("check", settings, { english: starter.english, answer: "" })).status, 400);
for (const answer of ["Jeden Morgen trinke ich einen Kaffee.", "Ich trinke ein Kaffee."]) {
  const local = await call("check", settings, { english: starter.english, answer });
  assert.equal(local.status, 200);
  assert.deepEqual(await local.json(), { needsAI: true }, "Uncertain answers must not be marked wrong");
}
assert.equal((await call("check", settings, { english: starter.english, answer: "Jeden Morgen trinke ich einen Kaffee.", useAI: true })).status, 503);
process.env.GEMINI_API_KEY = "test-only";
assert.equal((await call("sentence", settings)).status, 200);
assert.equal((await call("check", settings, { english: starter.english, answer: starter.german })).status, 200);
assert.equal((await call("check", settings, { english: starter.english, answer: starter.german, useAI: true })).status, 200);
for (const language of ["german", "chinese"]) {
  const reverseSettings = { ...settings, language };
  for (const format of ["single", "connected"]) {
    const selectedSettings = { ...reverseSettings, format };
    const exercise = getExercisePool(selectedSettings)[0];
    const response = await call("check", selectedSettings, {
      english: exercise.english, answer: exercise.english.toUpperCase(), direction: "english",
    });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.correct, true);
    assert.equal(result.corrected, exercise.english);
    assert.deepEqual(result.vocabulary, exercise.vocabulary);
    assert.equal(localAnswerFeedback(exercise, exercise.german, language, "english"), null);
    assert.equal((await call("check", selectedSettings, {
      english: exercise.english, answer: "An alternative translation", direction: "english",
    })).status, 200);
  }
}
assert.equal((await call("check", settings, {
  english: starter.english, answer: starter.english, direction: "invalid",
})).status, 400);
assert.equal((await call("check", settings, {
  english: "Unknown sentence", answer: "English answer", direction: "english",
})).status, 400);
for (const language of ["german", "chinese"]) {
  for (const useAI of [undefined, false, "true", 1]) {
    const local = await call("check", { ...settings, language }, { english: starter.english, answer: "Unknown wording", useAI });
    assert.deepEqual(await local.json(), { needsAI: true });
  }
}
console.log("PASS: German and Chinese checks work without AI; tone-free Chinese preserves tone-marked models; alternatives require explicit AI opt-in; invalid input rejected");

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
for (const language of ["german", "chinese"]) {
  const reverseSettings = { ...settings, language };
  const exercise = getExercisePool(reverseSettings)[0];
  globalThis.fluenTestResult = {
    correct: true, corrected: "An alternative English translation.",
    explanation: "You understood the meaning.", corrections: [], vocabulary: [],
  };
  const response = await aiPOST(new Request("http://localhost/api/practice", {
    method: "POST", body: JSON.stringify({ action: "check", settings: reverseSettings,
      english: exercise.english, answer: "An alternative English translation.", direction: "english", useAI: true }),
  }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.corrected, "An alternative English translation.");
  assert.deepEqual(result.vocabulary, exercise.vocabulary);
  assert.match(globalThis.fluenTestRequest.contents, /beginner's English translation/);
  assert.ok(globalThis.fluenTestRequest.contents.includes(JSON.stringify(exercise.german)));
  assert.match(globalThis.fluenTestRequest.config.systemInstruction, /corrected answers and correction replacements must be English/);
}
console.log("PASS: English answers work for both languages and formats; reverse AI checks use the bank source and preserve source vocabulary");
const chineseSettings = { ...settings, language: "chinese" };
const mockFeedback = {
  correct: true, corrected: "Wǒ zǎoshang měitiān hē chá.", explanation: "Good work!",
  corrections: [], vocabulary: [{ german: "chá", english: "tea" }],
};
globalThis.fluenTestResult = mockFeedback;
const alternativeCheck = await aiPOST(new Request("http://localhost/api/practice", {
  method: "POST", body: JSON.stringify({ action: "check", settings: chineseSettings,
    english: "I drink tea every morning.", answer: "wo zaoshang meitian he cha", useAI: true }),
}));
assert.equal(alternativeCheck.status, 200);
assert.equal((await alternativeCheck.json()).vocabulary[0].language, "chinese");
assert.match(globalThis.fluenTestRequest.config.systemInstruction, /NEVER penalize missing or incorrect tones/);
assert.match(globalThis.fluenTestRequest.config.systemInstruction, /Always write the correct tone marks/);
assert.match(globalThis.fluenTestRequest.config.systemInstruction, /EVEN when correct=true/);
assert.match(globalThis.fluenTestRequest.config.systemInstruction, /Wǒ xiǎng hē chá/);
assert.match(globalThis.fluenTestRequest.contents, /every word of the corrected answer/);
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
assert.match(globalThis.fluenTestRequest.contents, /every word of your reply/);
assert.match(globalThis.fluenTestRequest.contents, /every word of feedback.corrected/);
// The server derives the required relationship from its own exercise bank.
// A wrong "and" answer to a "because" task must reach AI instead of passing
// the exact-answer shortcut, and the evaluator receives the specific meaning.
for (const language of ["german", "chinese"]) {
  const connectedSettings = { ...settings, language, format: "connected" };
  const exercise = getExercisePool(connectedSettings).find(item => item.connector.english === "because");
  const wrongAnswer = exercise.german.replace(exercise.connector.target, language === "german" ? "und" : "érqiě");
  globalThis.fluenTestResult = { ...mockFeedback, correct: false, corrected: exercise.german };
  const response = await aiPOST(new Request("http://localhost/api/practice", {
    method: "POST", body: JSON.stringify({ action: "check", settings: connectedSettings,
      english: exercise.english, answer: wrongAnswer, useAI: true }),
  }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).correct, false);
  assert.match(globalThis.fluenTestRequest.contents, /the meaning "because"/);
  assert.match(globalThis.fluenTestRequest.contents, /do not accept a different relationship/);
}
globalThis.fluenTestResult = {
  reply: "你好", translation: "Hello", feedback: null, vocabulary: [],
};
const characterResponse = await aiPOST(new Request("http://localhost/api/practice", {
  method: "POST", body: JSON.stringify({ action: "chat", settings: chineseSettings, messages: [] }),
}));
assert.equal(characterResponse.status, 502);
delete globalThis.fluenTestRequest;
delete globalThis.fluenTestResult;
console.log("PASS: AI checks and chat receive pinyin-only, tone-insensitive rules; character output is rejected");

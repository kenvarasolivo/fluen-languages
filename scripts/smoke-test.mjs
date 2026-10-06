import assert from "node:assert/strict";
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
const settings = { level: "A1", topic: "Everyday life", format: "single" };
async function call(action, data) {
  const response = await fetch(`${origin}/api/practice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, settings, ...data }),
    signal: AbortSignal.timeout(60000),
  });
  const body = await response.json();
  assert.equal(
    response.status,
    200,
    body.error || `Unexpected ${response.status}`,
  );
  return body;
}
const incorrect = await call("check", {
  useAI: true,
  english: "I drink a coffee every morning.",
  answer: "Ich trinke ein Kaffee jeden Morgen.",
});
assert.equal(incorrect.correct, false);
assert.ok(incorrect.corrections.length > 0);
assert.match(incorrect.corrected, /einen Kaffee/);
console.log("PASS: incorrect article receives specific correction");
const alternative = await call("check", {
  useAI: true,
  english: "I drink a coffee every morning.",
  answer: "Jeden Morgen trinke ich einen Kaffee.",
});
assert.equal(alternative.correct, true);
console.log("PASS: valid alternative word order accepted");
const sentence = await call("sentence", {
  settings: { level: "C2", topic: "Ideas & opinions", format: "connected" },
  previous: [],
});
assert.ok(
  sentence.english &&
    sentence.german &&
    sentence.hint &&
    sentence.vocabulary.length,
);
console.log("PASS: preloaded C2 connector exercise selected");
const greeting = await call("chat", { messages: [] });
assert.ok(greeting.reply && greeting.translation);
assert.equal(greeting.feedback, null);
const reply = await call("chat", {
  messages: [
    { role: "assistant", text: greeting.reply },
    { role: "user", text: "Heute ich trinke Kaffee." },
  ],
});
assert.ok(reply.reply && reply.translation);
assert.equal(reply.feedback.correct, false);
assert.ok(reply.feedback.corrections.length);
console.log("PASS: conversation starts and corrects learner grammar");
const invalid = await fetch(`${origin}/api/practice`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "sentence",
    settings: { ...settings, level: "D1" },
  }),
});
assert.equal(invalid.status, 400);
console.log("PASS: invalid settings rejected");

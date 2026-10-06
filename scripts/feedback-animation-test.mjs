import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
// Lucide's CJS bundle is classified as ESM by this Node version. Evaluate
// that bundle as CommonJS here, as Next's bundler does for the application.
const icons = { exports: {} };
new Function(
  "module",
  "exports",
  "require",
  await readFile(require.resolve("lucide-react"), "utf8"),
)(icons, icons.exports, require);
const testRequire = (name) =>
  name === "lucide-react" ? icons.exports : require(name);
async function load(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  const exports = {};
  new Function("exports", "require", compiled)(exports, testRequire);
  return exports;
}

const { ChallengeResult } = await load("../components/challenge-result.tsx");
const win = renderToStaticMarkup(
  React.createElement(ChallengeResult, { correct: true }),
);
const loss = renderToStaticMarkup(
  React.createElement(ChallengeResult, { correct: false }),
);
assert.match(win, /YES! YOU SAID IT/);
assert.ok(!/XP|streak|score|ROUND LOST/.test(win));
assert.match(win, /win-confetti/);
assert.match(win, /role="status"/);
assert.match(win, /aria-live="polite"/);
assert.match(loss, /A LITTLE ADJUSTMENT/);
assert.match(loss, /retry this sentence/);
assert.ok(!loss.includes("win-confetti") && !loss.includes("+20 XP"));
const css = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
assert.match(css, /prefers-reduced-motion: reduce/);
assert.match(css, /animation: none !important/);
console.log(
  "PASS: accessible feedback announcements and correctness celebration without scores, reduced-motion support",
);

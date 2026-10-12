import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const origin = "https://fluen.test";
const handlers = new Map();
const stores = new Map([["fluen-offline-old", new Map()], ["other-app", new Map()]]);
const keyFor = (request) => typeof request === "string" ? request : new URL(request.url).pathname;
let network = async () => new Response("online");
let claimed = false;
const caches = {
  keys: async () => [...stores.keys()],
  delete: async (key) => stores.delete(key),
  open: async (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return {
      addAll: async (urls) => {
        for (const url of urls) {
          // Ensure every precached file actually exists.
          const bytes = await readFile(new URL(`../public${url}`, import.meta.url));
          store.set(url, new Response(bytes));
        }
      },
      match: async (request) => store.get(keyFor(request))?.clone(),
    };
  },
};
vm.runInNewContext(await readFile(new URL("../public/sw.js", import.meta.url), "utf8"), {
  URL, Response, caches, fetch: (request) => network(request),
  self: {
    location: { origin },
    clients: { claim: async () => { claimed = true; } },
    addEventListener: (name, handler) => handlers.set(name, handler),
  },
});
async function lifecycle(name) {
  let pending;
  handlers.get(name)({ waitUntil: (promise) => { pending = promise; } });
  await pending;
}
function request(path, options = {}) {
  let response;
  handlers.get("fetch")({
    request: { url: new URL(path, origin).href, method: "GET", mode: "cors", ...options },
    respondWith: (promise) => { response = promise; },
  });
  return response;
}

await lifecycle("install");
await lifecycle("activate");
assert.ok(claimed);
assert.ok(!stores.has("fluen-offline-old"));
assert.ok(stores.has("other-app"));
assert.equal(await (await request("/write", { mode: "navigate" })).text(), "online");
network = async () => { throw new Error("Offline"); };
assert.match(await (await request("/write", { mode: "navigate" })).text(), /A little connection break/);
assert.equal((await request("/icons/icon-192.png")).status, 200);
for (const [url, options] of [
  ["/api/practice", {}], ["/api/practice", { method: "POST" }],
  ["https://account.example.test/auth", {}], ["/login?_rsc=123", {}],
  ["/write?_rsc=123", {}], ["/_next/static/chunk.js", {}],
]) assert.equal(request(url, options), undefined, `Must not intercept ${url}`);
assert.ok(!stores.get("fluen-offline-v1").has("/write"));
assert.ok(!stores.get("fluen-offline-v1").has("/login"));
console.log("PASS: offline fallback, icons, cache cleanup, and network-only account/API/RSC traffic");

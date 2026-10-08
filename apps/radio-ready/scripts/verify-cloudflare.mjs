import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const base = "http://localhost:8787";
const server = spawn(
  process.execPath,
  [
    "node_modules/@opennextjs/cloudflare/dist/cli/index.js",
    "preview",
    "--port",
    "8787",
    "--ip",
    "127.0.0.1",
  ],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  },
);
let logs = "";
server.stdout.on("data", (d) => (logs += d));
server.stderr.on("data", (d) => (logs += d));
try {
  let ready = false;
  for (let i = 0; i < 240; i++) {
    if (server.exitCode !== null) throw Error("Worker exited: " + logs);
    try {
      if ((await fetch(`${base}/api/config`)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  if (!ready) throw Error("Worker failed to start: " + logs);
  assert.deepEqual(await (await fetch(`${base}/api/config`)).json(), {
    accounts: false,
    audience: "public-fictional",
  });
  const items = (await (await fetch(`${base}/api/content`)).json()).items;
  assert.equal(items.length, 53);
  assert.ok(items.every((i) => i.classification === "fictional"));
  assert.equal((await fetch(`${base}/api/sessions`)).status, 503);
  for (const route of ["/", "/practice", "/case-study"]) {
    const res = await fetch(base + route);
    assert.equal(res.status, 200, route);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  }
  const child = spawn(process.execPath, ["scripts/browser-check.mjs"], {
    stdio: "inherit",
    env: { ...process.env, TEST_BASE_URL: base, PUBLIC_DEMO: "1" },
  });
  const code = await new Promise((r) => child.on("exit", r));
  if (code !== 0) throw Error("Worker browser verification failed: " + logs);
  console.log(
    "Workers runtime: all public routes, fictional content, fail-closed accounts and browser flows passed.",
  );
} finally {
  server.kill("SIGTERM");
}

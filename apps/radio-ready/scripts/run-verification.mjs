import { spawn } from "node:child_process";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1"],
  { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, PORT: "3000" } },
);
let logs = "";
server.stdout.on("data", (d) => (logs += d));
server.stderr.on("data", (d) => (logs += d));
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch("http://localhost:3000/api/config")).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!ready) throw new Error("Server did not start: " + logs);
  if (!process.argv.includes("--browser-only")) {
    const child = spawn(
      process.execPath,
      [
        "--import",
        "tsx",
        "--test",
        "tests/api.test.ts",
        "tests/engine.test.ts",
      ],
      {
        stdio: "inherit",
        env: { ...process.env, TEST_BASE_URL: "http://localhost:3000" },
      },
    );
    const code = await new Promise((r) => child.on("exit", r));
    if (code) throw new Error("Verification failed. Server logs: " + logs);
  }
  if (
    process.env.RUN_BROWSER === "1" ||
    process.argv.includes("--browser-only")
  ) {
    const b = spawn(process.execPath, ["scripts/browser-check.mjs"], {
      stdio: "inherit",
      env: process.env,
    });
    const bc = await new Promise((r) => b.on("exit", r));
    if (bc) throw new Error("Browser checks failed. " + logs);
  }
} finally {
  server.kill("SIGTERM");
}

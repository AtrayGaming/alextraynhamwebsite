import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Practice, Item } from "../lib/types";
const base = process.env.TEST_BASE_URL;
const accounts = base
  ? JSON.parse(readFileSync(".data/test-accounts.json", "utf8"))
  : {};
async function req(
  path: string,
  body?: unknown,
  cookie = "",
  method = body === undefined ? "GET" : "POST",
  origin = base,
) {
  const r = await fetch(`${base}/api/${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { r, data: await r.json() };
}
async function login(who: string) {
  const { r, data } = await req("auth/sign-in/email", accounts[who]);
  assert.equal(r.status, 200, JSON.stringify(data));
  return r.headers
    .getSetCookie()
    .map((v) => v.split(";")[0])
    .join("; ");
}
test(
  "real backend: authentication, isolation, persistence, review and concurrency",
  { skip: !base },
  async () => {
    const [admin, reviewer, learner, other, trainer] = await Promise.all(
      ["adminA", "adminB", "learner", "other", "trainer"].map(login),
    );
    assert.equal(
      (
        await req("auth/sign-up/email", {
          email: "blocked@example.test",
          name: "Blocked",
          password: "A-long-password-123",
        })
      ).r.status,
      404,
    );
    assert.equal((await req("sessions")).r.status, 401);
    assert.equal(
      (await req("content/manage", undefined, learner)).r.status,
      403,
    );
    assert.equal(
      (await req("sessions", { mode: "trainer", category: "All" }, learner)).r
        .status,
      403,
    );
    assert.equal(
      (
        await req(
          "sessions",
          { mode: "match", category: "All" },
          learner,
          "POST",
          "https://untrusted.example",
        )
      ).r.status,
      403,
    );
    const created = await req(
      "sessions",
      { mode: "match", category: "Creative studio" },
      learner,
    );
    assert.equal(created.r.status, 201, JSON.stringify(created.data));
    let s = created.data.session as Practice;
    assert.equal(s.queue.length, 9);
    assert.equal(
      (
        await req(
          `sessions/${s.id}`,
          { action: "answer", revision: 0, answer: "x" },
          other,
        )
      ).r.status,
      404,
    );
    const old = s;
    const current = s.items.find((x) => x.id === s.queue[0])!;
    const answer = await req(
      `sessions/${s.id}`,
      { action: "answer", revision: s.revision, answer: current.meaning },
      learner,
    );
    assert.equal(answer.r.status, 200);
    s = answer.data.session;
    assert.equal(s.attempts[0].correct, true);
    assert.equal(
      (
        await req(
          `sessions/${s.id}`,
          { action: "answer", revision: old.revision, answer: current.meaning },
          learner,
        )
      ).r.status,
      409,
    );
    const reloaded = await req("sessions", undefined, learner);
    assert.equal(
      reloaded.data.sessions.find((x: Practice) => x.id === s.id).queue.length,
      8,
    );
    const stats = await req("analytics", undefined, trainer);
    assert.equal(stats.r.status, 200);
    assert.equal(stats.data.suppressed, true);
    assert.ok(!stats.data.users);
    const item: Item = {
      ...s.items[0],
      id: `test-${Date.now()}`,
      revision: 1,
      cue: "DEMO-TEST",
      meaning: "Fictional craft",
    };
    const saved = await req(
      "content/manage",
      { item, fictionalConfirmed: true },
      admin,
    );
    assert.equal(saved.r.status, 201, JSON.stringify(saved.data));
    assert.equal(
      (await req("content")).data.items.some((x: Item) => x.id === item.id),
      false,
    );
    assert.equal(
      (
        await req(
          "content/workflow",
          { id: item.id, revision: 1, action: "publish" },
          reviewer,
        )
      ).r.status,
      409,
    );
    assert.equal(
      (
        await req(
          "content/workflow",
          { id: item.id, revision: 1, action: "submit" },
          admin,
        )
      ).r.status,
      200,
    );
    assert.equal(
      (
        await req(
          "content/workflow",
          { id: item.id, revision: 1, action: "publish" },
          admin,
        )
      ).r.status,
      403,
    );
    assert.equal(
      (
        await req(
          "content/workflow",
          { id: item.id, revision: 1, action: "publish" },
          reviewer,
        )
      ).r.status,
      200,
    );
    assert.equal(
      (await req("content")).data.items.find((x: Item) => x.id === item.id)
        .meaning,
      "Fictional craft",
    );
    assert.equal(
      (
        await req(
          "content/workflow",
          { id: item.id, revision: 1, action: "retire" },
          reviewer,
        )
      ).r.status,
      200,
    );
    assert.equal(
      (await req("content")).data.items.some((x: Item) => x.id === item.id),
      false,
    );
    assert.equal((await req("progress", {}, learner, "DELETE")).r.status, 200);
    assert.equal(
      (await req("sessions", undefined, learner)).data.sessions.length,
      0,
    );
    const ts = await req(
      "sessions",
      { mode: "trainer", category: "Gallery" },
      trainer,
    );
    assert.equal(ts.r.status, 201);
    const scored = await req(
      `sessions/${ts.data.session.id}`,
      { revision: 0, action: "score", team: 0, delta: 1 },
      trainer,
    );
    assert.equal(scored.data.session.teams[0].score, 1);
    assert.equal((await req("auth/sign-out", {}, learner)).r.status, 200);
    assert.equal((await req("sessions", undefined, learner)).r.status, 401);
  },
);

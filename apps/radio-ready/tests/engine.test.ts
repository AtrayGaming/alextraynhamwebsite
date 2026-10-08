import { test } from "node:test";
import assert from "node:assert/strict";
import { allDemoItems, demoItems, scenarioItems } from "../lib/demo-content";
import {
  startPractice,
  answerPractice,
  currentItem,
  shuffle,
  metrics,
} from "../lib/engine";
test("fictional catalog is complete with unique valid answers", () => {
  assert.equal(demoItems.length, 45);
  assert.equal(scenarioItems.length, 8);
  assert.equal(new Set(allDemoItems.map((x) => x.id)).size, 53);
  for (const i of allDemoItems) {
    assert.equal(i.classification, "fictional");
    if (i.choices) assert.ok(i.choices.includes(i.meaning));
  }
});
test("finite practice retries missed concept then completes without mutation", () => {
  const original = startPractice(demoItems.slice(0, 2), "match", "All");
  let s = original;
  const missed = currentItem(s)!;
  s = answerPractice(s, "incorrect").session;
  assert.equal(s.queue.at(-1), missed.id);
  assert.equal(s.attempts.length, 1);
  assert.equal(original.attempts.length, 0);
  while (s.queue.length) s = answerPractice(s, currentItem(s)!.meaning).session;
  assert.equal(s.status, "completed");
  assert.equal(s.cleared.length, 2);
  assert.equal(s.attempts.length, 3);
  assert.equal(metrics([s]).accuracy, 67);
  assert.throws(() => answerPractice(s, "again"));
});
test("category is respected even for a one-card set; skip cleared and review only", () => {
  const one = [demoItems[0]];
  assert.equal(startPractice(one, "match", one[0].category).queue.length, 1);
  assert.equal(
    startPractice(one, "match", "All", [one[0].id]).status,
    "completed",
  );
  assert.equal(
    startPractice(one, "match", "All", [one[0].id], true).queue.length,
    1,
  );
  assert.equal(startPractice(one, "match", "Other").queue.length, 0);
});
test("scenario sessions contain only scenario items and complete", () => {
  let s = startPractice(allDemoItems, "scenario", "All");
  assert.equal(s.queue.length, 8);
  assert.ok(s.items.every((i) => i.kind === "scenario"));
  while (s.queue.length) s = answerPractice(s, currentItem(s)!.meaning).session;
  assert.equal(s.status, "completed");
});
test("shuffle keeps each element and does not mutate source", () => {
  const a = [1, 2, 3, 4];
  const b = shuffle(a, () => 0);
  assert.deepEqual([...b].sort(), a);
  assert.deepEqual(a, [1, 2, 3, 4]);
  assert.notDeepEqual(a, b);
});

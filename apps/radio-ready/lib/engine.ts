import type { Item, Mode, Practice } from "./types";
export function shuffle<T>(input: T[], random = Math.random): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function startPractice(
  items: Item[],
  mode: Mode,
  category: string,
  cleared: string[] = [],
  reviewOnly = false,
): Practice {
  const selected = items.filter(
    (x) =>
      (mode === "scenario" ? x.kind === "scenario" : x.kind === "term") &&
      (category === "All" || x.category === category),
  );
  const queue = shuffle(
    selected
      .filter((x) =>
        reviewOnly ? cleared.includes(x.id) : !cleared.includes(x.id),
      )
      .map((x) => x.id),
  );
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    mode,
    category,
    items: selected,
    queue,
    cleared: [],
    attempts: [],
    status: queue.length ? "active" : "completed",
    revision: 0,
    startedAt: now,
    updatedAt: now,
    teams: [
      { name: "Team A", score: 0 },
      { name: "Team B", score: 0 },
    ],
  };
}
export function currentItem(s: Practice) {
  return s.items.find((x) => x.id === s.queue[0]);
}
export function answerPractice(s: Practice, answer: string) {
  const item = currentItem(s);
  if (!item || s.status !== "active")
    throw new Error("Session already complete");
  const correct = answer === item.meaning;
  const queue = s.queue.slice(1);
  if (!correct) queue.push(item.id);
  const next: Practice = {
    ...s,
    queue,
    cleared: correct ? [...s.cleared, item.id] : s.cleared,
    attempts: [
      ...s.attempts,
      {
        itemId: item.id,
        revision: item.revision,
        correct,
        at: new Date().toISOString(),
      },
    ],
    status: queue.length ? "active" : "completed",
    revision: s.revision + 1,
    updatedAt: new Date().toISOString(),
  };
  return { session: next, feedback: { item, answer, correct } };
}
export function choicesFor(item: Item, items: Item[]) {
  return item.choices
    ? shuffle(item.choices)
    : shuffle([
        item.meaning,
        ...shuffle(
          items
            .filter(
              (x) =>
                x.id !== item.id &&
                x.kind === item.kind &&
                x.meaning !== item.meaning,
            )
            .map((x) => x.meaning),
        ).slice(0, 3),
      ]);
}
export function metrics(sessions: Practice[]) {
  const attempts = sessions.flatMap((s) => s.attempts);
  const missed: Record<string, number> = {};
  for (const a of attempts)
    if (!a.correct) missed[a.itemId] = (missed[a.itemId] || 0) + 1;
  return {
    sessions: sessions.length,
    completed: sessions.filter((s) => s.status === "completed").length,
    attempts: attempts.length,
    accuracy: attempts.length
      ? Math.round(
          (attempts.filter((x) => x.correct).length / attempts.length) * 100,
        )
      : null,
    missed,
  };
}

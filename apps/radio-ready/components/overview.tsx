"use client";
import { Zap, Target, ChevronRight, RotateCcw } from "lucide-react";
import { modes } from "./modes";
import type { Item, Practice, Mode, Viewer } from "@/lib/types";
type Props = {
  items: Item[];
  user: Viewer | null;
  busy: boolean;
  active: Practice | undefined;
  cleared: string[];
  missed: string[];
  stats: { completed: number };
  categories: string[];
  category: string;
  setCategory: (v: string) => void;
  start: (mode: Mode, review?: boolean, all?: boolean) => Promise<void>;
  go: (v: "progress") => void;
  resume: (s: Practice) => void;
};
export function Overview({
  items,
  user,
  busy,
  active,
  cleared,
  missed,
  stats,
  categories,
  category,
  setCategory,
  start,
  go,
  resume,
}: Props) {
  const missedTerms = missed.filter((id) =>
    items.some((i) => i.id === id && i.kind === "term"),
  );
  const missedScenarios = missed.filter((id) =>
    items.some((i) => i.id === id && i.kind === "scenario"),
  );
  return (
    <>
      <div className="overview-grid">
        <section className="practice-hero">
          <div className="hero-topline">
            <span className="micro">YOUR NEXT SESSION</span>
            <Zap size={22} />
          </div>
          <h2>
            One set.
            <br />A clear finish.
          </h2>
          <p>
            Match a label to its meaning. Revisit the ones you miss. Finish with
            a set you know better.
          </p>
          <div className="hero-bottom">
            <button
              className="button white"
              disabled={busy || !items.length}
              onClick={() => (active ? resume(active) : start("match"))}
            >
              {active ? "Resume your session" : "Start Quick Match"}
              <ChevronRight size={18} />
            </button>
            <span>
              {active
                ? `${active.queue.length} concepts remaining`
                : `${items.filter((x) => x.kind === "term").length} fictional concepts`}
            </span>
          </div>
          <div className="signal-art" aria-hidden="true">
            {[25, 48, 70, 42, 100, 65, 35, 80, 55, 28].map((n, i) => (
              <i key={i} style={{ height: `${n}%` }} />
            ))}
          </div>
        </section>
        <aside className="progress-summary">
          <div className="section-label">
            YOUR PRACTICE <Target size={18} />
          </div>
          <div
            className="progress-ring"
            style={
              {
                "--progress": `${(cleared.filter((id) => items.find((x) => x.id === id)?.kind === "term").length / (items.filter((x) => x.kind === "term").length || 1)) * 100}%`,
              } as React.CSSProperties
            }
          >
            <div>
              <strong>
                {
                  cleared.filter(
                    (id) => items.find((x) => x.id === id)?.kind === "term",
                  ).length
                }
                <small>
                  {" "}
                  / {items.filter((x) => x.kind === "term").length}
                </small>
              </strong>
              <span>concepts cleared</span>
            </div>
          </div>
          <div className="summary-row">
            <span>Completed practice sessions</span>
            <strong>{stats.completed}</strong>
          </div>
          <button className="text-button" onClick={() => go("progress")}>
            View your progress <ChevronRight size={16} />
          </button>
        </aside>
      </div>
      <div className="section-heading">
        <h2>Find your way to practice</h2>
        <span>Choose a format that fits</span>
      </div>
      <div className="mode-grid">
        {modes
          .filter((m) => m.id !== "trainer" || !user || user.role !== "trainee")
          .map((m, i) => (
            <button
              className="mode-card"
              key={m.id}
              disabled={busy || !items.length}
              onClick={() => start(m.id)}
            >
              <div className="mode-card-top">
                <span className={`mode-icon ${m.color}`}>
                  <m.icon size={23} />
                </span>
                <span className="mode-number">0{i + 1}</span>
              </div>
              <h3>{m.name}</h3>
              <p>{m.description}</p>
              <span className="mode-card-bottom">
                {m.id === "learn"
                  ? "Flashcards"
                  : m.id === "match"
                    ? "Recall practice"
                    : m.id === "scenario"
                      ? "Everyday choices"
                      : "Group learning"}
                <ChevronRight size={18} />
              </span>
            </button>
          ))}
      </div>
      <section className="review-strip">
        <span className="mode-icon lime">
          <RotateCcw />
        </span>
        <div>
          <h3>
            {missed.length
              ? "Give the tricky ones another look."
              : "Your review list starts here."}
          </h3>
          <p>
            {missed.length
              ? `${missed.length} concepts have appeared in missed answers. Review them at your own pace.`
              : "Your missed concepts will appear here after you practice."}
          </p>
        </div>
        {missedTerms.length > 0 && (
          <button
            className="button secondary"
            onClick={() => start("match", true)}
          >
            Review missed concepts
          </button>
        )}
        {missedScenarios.length > 0 && (
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => start("scenario", true)}
          >
            Review missed scenarios
          </button>
        )}
      </section>
      <div className="category-control">
        <label htmlFor="category">Focus your next session</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
    </>
  );
}

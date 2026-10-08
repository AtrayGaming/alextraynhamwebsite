"use client";
import { useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import {
  Radio,
  LayoutDashboard,
  Layers3,
  Zap,
  MessagesSquare,
  Users,
  ChartNoAxesCombined,
  BookOpen,
  Settings2,
  LogIn,
  LogOut,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Maximize2,
  Target,
  Pause,
  Plus,
  Minus,
  X,
  ArrowUpRight,
} from "lucide-react";
import type { Item, Practice, Mode, Viewer, Feedback } from "@/lib/types";
import {
  startPractice,
  answerPractice,
  currentItem,
  choicesFor,
  metrics,
} from "@/lib/engine";
import { api } from "@/lib/api";
import { ContentManager } from "./content-manager";
import { modes } from "./modes";
import { PracticeView } from "./practice-view";
import { Overview } from "./overview";
type View =
  | "overview"
  | "practice"
  | "progress"
  | "reference"
  | "login"
  | "manage"
  | "analytics";
const STORAGE = "radio-ready-public-v2";
export function Workspace() {
  const [view, setView] = useState<View>("overview"),
    [items, setItems] = useState<Item[]>([]),
    [user, setUser] = useState<Viewer | null>(null),
    [accounts, setAccounts] = useState(false),
    [sessions, setSessions] = useState<Practice[]>([]),
    [session, setSession] = useState<Practice | null>(null),
    [category, setCategory] = useState("All"),
    [mode, setMode] = useState<Mode>("match"),
    [feedback, setFeedback] = useState<Feedback | null>(null),
    [flipped, setFlipped] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null),
    [focusMode, setFocusMode] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    (async () => {
      try {
        const [c, who, content] = await Promise.all([
          api<{ accounts: boolean }>("config"),
          api<{ user: Viewer | null }>("me"),
          api<{ items: Item[] }>("content"),
        ]);
        setAccounts(c.accounts);
        setUser(who.user);
        setItems(content.items);
        if (who.user) {
          const data = await api<{ sessions: Practice[] }>("sessions");
          setSessions(data.sessions);
        } else {
          try {
            const saved = JSON.parse(localStorage.getItem(STORAGE) || "[]");
            if (Array.isArray(saved))
              setSessions(
                saved
                  .filter(
                    (x) =>
                      x &&
                      typeof x.id === "string" &&
                      Array.isArray(x.items) &&
                      Array.isArray(x.attempts) &&
                      Array.isArray(x.queue) &&
                      Array.isArray(x.teams) &&
                      Array.isArray(x.cleared) &&
                      typeof x.startedAt === "string" &&
                      x.items.every(
                        (i: Item) => i.classification === "fictional",
                      ),
                  )
                  .slice(0, 200),
              );
          } catch {
            setError(
              "Saved guest progress could not be read. You can start a new session.",
            );
          }
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  useEffect(() => {
    if (!loading) heading.current?.focus();
  }, [view, loading]);
  const stats = useMemo(
    () =>
      metrics(sessions.filter((x) => ["match", "scenario"].includes(x.mode))),
    [sessions],
  );
  const categories = [
    "All",
    ...new Set(items.filter((x) => x.kind === "term").map((x) => x.category)),
  ];
  const cleared = [
    ...new Set(
      sessions.flatMap((s) =>
        s.attempts
          .filter(
            (a) =>
              a.correct &&
              items.some((i) => i.id === a.itemId && i.revision === a.revision),
          )
          .map((a) => a.itemId),
      ),
    ),
  ];
  const missed = Object.keys(stats.missed);
  const active = sessions.find(
    (x) => x.status === "active" && x.mode === "match",
  );
  const go = (next: View) => {
    setError("");
    setView(next);
    setFocusMode(false);
  };
  const persist = (s: Practice) => {
    setSession(s);
    setSessions((prev) => {
      const next = [s, ...prev.filter((x) => x.id !== s.id)].slice(0, 200);
      if (!user) {
        try {
          localStorage.setItem(STORAGE, JSON.stringify(next));
        } catch {
          setError(
            "Browser storage is unavailable. This session will not survive a refresh.",
          );
        }
      }
      return next;
    });
  };
  async function start(nextMode: Mode = mode, review = false, all = false) {
    setBusy(true);
    setError("");
    try {
      const cat = nextMode === "scenario" ? "All" : category;
      let s: Practice;
      if (user) {
        const r = await api<{ session: Practice }>("sessions", {
          mode: nextMode,
          category: cat,
          ...(review
            ? { reviewIds: missed }
            : !all && nextMode === "match"
              ? { skipIds: cleared }
              : {}),
        });
        s = r.session;
      } else
        s = startPractice(
          items,
          nextMode,
          cat,
          review ? missed : !all && nextMode === "match" ? cleared : [],
          review,
        );
      setMode(nextMode);
      persist(s);
      setFeedback(null);
      setFlipped(false);
      go("practice");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function act(
    action: "answer" | "review" | "score",
    answer?: string,
    team?: number,
    delta?: number,
  ) {
    if (!session || busy) return;
    setBusy(true);
    setError("");
    try {
      let s: Practice, fb: Feedback | undefined;
      if (user) {
        const r = await api<{ session: Practice; feedback?: Feedback }>(
          `sessions/${session.id}`,
          { action, revision: session.revision, answer, team, delta },
        );
        s = r.session;
        fb = r.feedback;
      } else if (action === "answer") {
        const r = answerPractice(session, answer!);
        s = r.session;
        fb = r.feedback;
      } else if (action === "review") {
        s = {
          ...session,
          queue: session.queue.slice(1),
          cleared: [...session.cleared, session.queue[0]],
          status: session.queue.length === 1 ? "completed" : "active",
          revision: session.revision + 1,
          updatedAt: new Date().toISOString(),
        };
      } else {
        s = {
          ...session,
          teams: session.teams.map((t, i) =>
            i === team ? { ...t, score: Math.max(0, t.score + delta!) } : t,
          ),
          revision: session.revision + 1,
          updatedAt: new Date().toISOString(),
        };
      }
      persist(s);
      if (fb) setFeedback(fb);
      if (action === "review") setFlipped(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("auth/sign-in/email", {
        email: form.get("email"),
        password: form.get("password"),
      });
      window.location.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (!window.confirm("Delete your practice history? This cannot be undone."))
      return;
    setBusy(true);
    try {
      if (user) await api("progress", {}, "DELETE");
      else localStorage.removeItem(STORAGE);
      setSessions([]);
      setSession(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function openAnalytics() {
    go("analytics");
    setAnalytics(null);
    try {
      setAnalytics(await api("analytics"));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className={`workspace ${focusMode ? "presentation" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-icon">
            <Radio size={23} />
          </span>
          <span>
            radio ready<small>PRACTICE STUDIO</small>
          </span>
        </Link>
        <p className="nav-label">YOUR WORKSPACE</p>
        <nav aria-label="Workspace">
          <button
            className={view === "overview" ? "active" : ""}
            onClick={() => go("overview")}
          >
            <LayoutDashboard />
            Overview
          </button>
          <button
            className={view === "progress" ? "active" : ""}
            onClick={() => go("progress")}
          >
            <ChartNoAxesCombined />
            Your progress
          </button>
          <button
            className={view === "reference" ? "active" : ""}
            onClick={() => go("reference")}
          >
            <BookOpen />
            Field notes
          </button>
        </nav>
        <p className="nav-label">PRACTICE MODES</p>
        <nav aria-label="Practice modes">
          {modes
            .filter(
              (m) => m.id !== "trainer" || !user || user.role !== "trainee",
            )
            .map((m) => (
              <button
                key={m.id}
                className={view === "practice" && mode === m.id ? "active" : ""}
                onClick={() => start(m.id)}
                disabled={busy || loading}
              >
                <m.icon />
                {m.name}
              </button>
            ))}
        </nav>
        {user && user.role !== "trainee" && (
          <>
            <p className="nav-label">FACILITATION</p>
            <nav aria-label="Facilitation">
              <button onClick={() => go("manage")}>
                <Settings2 />
                Content library
              </button>
              <button onClick={openAnalytics}>
                <ChartNoAxesCombined />
                Learning trends
              </button>
            </nav>
          </>
        )}
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="micro">FICTIONAL DEMO</span>
            <p>A space to explore the product. No real operational content.</p>
          </div>
          <Link href="/case-study">
            Behind the build <ArrowUpRight size={15} />
          </Link>
          <a href="https://alextraynham.com">
            Alex Traynham <ArrowUpRight size={15} />
          </a>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-top">
          <span>
            <span className="small-symbol">R / R</span> Learning workspace
          </span>
          <div>
            <span className="save-label">
              {user ? "Account progress" : "Saved on this device"}
            </span>
            <button
              className="account-button"
              onClick={async () => {
                if (user) {
                  try {
                    await api("auth/sign-out", {});
                    window.location.reload();
                  } catch (e) {
                    setError((e as Error).message);
                  }
                } else go("login");
              }}
            >
              {user ? <LogOut size={17} /> : <LogIn size={17} />}
              <span>{user ? user.name : "Sign in"}</span>
            </button>
          </div>
        </header>
        <main id="main" className="workspace-main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {view === "practice"
                  ? modes.find((x) => x.id === mode)?.name
                  : "RADIO READY / FICTIONAL FESTIVAL EDITION"}
              </p>
              <h1 tabIndex={-1} ref={heading}>
                {view === "overview"
                  ? "Your practice studio."
                  : view === "practice"
                    ? mode === "learn"
                      ? "Get to know the set."
                      : mode === "match"
                        ? "Make the connection."
                        : mode === "scenario"
                          ? "Think it through."
                          : "Bring the room together."
                    : view === "progress"
                      ? "Your practice, at a glance."
                      : view === "reference"
                        ? "Find a familiar idea."
                        : view === "login"
                          ? "Welcome back."
                          : view === "manage"
                            ? "Shape the next session."
                            : "See where practice helps."}
              </h1>
            </div>
            {view === "practice" && (
              <button
                className="button secondary small"
                onClick={() => go("overview")}
              >
                <Pause size={16} />
                Finish later
              </button>
            )}
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}
              <button aria-label="Dismiss message" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {loading ? (
            <p role="status" className="empty">
              Loading your workspace…
            </p>
          ) : (
            <>
              {view === "overview" && (
                <Overview
                  {...{
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
                  }}
                  resume={(s) => {
                    persist(s);
                    setMode(s.mode);
                    setFeedback(null);
                    setFlipped(false);
                    go("practice");
                  }}
                />
              )}
              {view === "practice" && session && (
                <PracticeView
                  {...{
                    session,
                    mode,
                    items,
                    feedback,
                    flipped,
                    setFlipped,
                    busy,
                    focusMode,
                    setFocusMode,
                    start,
                    act,
                    go,
                    user,
                  }}
                  onContinue={() => {
                    setFeedback(null);
                    heading.current?.focus();
                  }}
                />
              )}
              {view === "progress" && (
                <>
                  <div className="stat-grid">
                    {[
                      ["Practice sessions", stats.sessions],
                      ["Completed", stats.completed],
                      [
                        "Answer accuracy",
                        stats.accuracy === null ? "—" : `${stats.accuracy}%`,
                      ],
                      ["Attempts", stats.attempts],
                    ].map(([label, value]) => (
                      <article key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </article>
                    ))}
                  </div>
                  <p className="fine">
                    Scored practice only. Flashcard reviews and
                    facilitator-entered team points are excluded.
                  </p>
                  <h2 className="section-heading">Recent sessions</h2>
                  {sessions.length ? (
                    <div className="session-list">
                      {sessions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            persist(s);
                            setMode(s.mode);
                            setFeedback(null);
                            setFlipped(false);
                            go("practice");
                          }}
                        >
                          <span className="mode-icon violet">
                            <Layers3 size={20} />
                          </span>
                          <span>
                            <strong>
                              {modes.find((m) => m.id === s.mode)?.name}
                            </strong>
                            <small>
                              {s.category} ·{" "}
                              {new Date(s.startedAt).toLocaleDateString()}
                            </small>
                          </span>
                          <span className="session-status">
                            {s.status === "completed"
                              ? "Completed"
                              : `${s.queue.length} remaining`}
                          </span>
                          <ChevronRight size={18} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="empty">
                      Your practice history will appear after your first
                      session.
                    </p>
                  )}
                  <h2 className="section-heading">By topic</h2>
                  <div className="topic-list">
                    {categories
                      .filter((x) => x !== "All")
                      .map((cat) => {
                        const ids = items
                          .filter((i) => i.category === cat)
                          .map((i) => i.id);
                        const attempts = sessions
                          .flatMap((s) => s.attempts)
                          .filter((a) => ids.includes(a.itemId));
                        return (
                          <div key={cat}>
                            <span>{cat}</span>
                            <span>
                              {attempts.length
                                ? `${Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100)}% across ${attempts.length} attempts`
                                : "No attempts yet"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  <button
                    className="text-button danger"
                    disabled={busy || !sessions.length}
                    onClick={reset}
                  >
                    Delete my practice history
                  </button>
                </>
              )}
              {view === "reference" && (
                <>
                  <label className="search-label">
                    Search the fictional field notes
                    <input
                      type="search"
                      placeholder="Try “paper”, “music”, or “garden”"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                  <div className="reference-grid">
                    {items
                      .filter(
                        (x) =>
                          x.kind === "term" &&
                          `${x.cue} ${x.meaning} ${x.category}`
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                      )
                      .map((x) => (
                        <article key={x.id}>
                          <span className="micro">{x.category}</span>
                          <h2>{x.cue}</h2>
                          <p>{x.meaning}</p>
                        </article>
                      ))}
                  </div>
                  {!items.some((x) =>
                    `${x.cue} ${x.meaning} ${x.category}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  ) && <p className="empty">No matching concepts.</p>}
                </>
              )}
              {view === "login" && (
                <section className="login-panel">
                  {accounts ? (
                    <>
                      <p>
                        Sign in with an administrator-provisioned account to
                        save sessions across devices.
                      </p>
                      <form onSubmit={signIn}>
                        <label>
                          Email
                          <input
                            required
                            name="email"
                            type="email"
                            autoComplete="username"
                          />
                        </label>
                        <label>
                          Password
                          <input
                            required
                            name="password"
                            type="password"
                            autoComplete="current-password"
                          />
                        </label>
                        <button disabled={busy} className="button primary">
                          {busy ? "Signing in…" : "Sign in"}
                        </button>
                      </form>
                      <p className="fine">
                        Need access or a password reset? Contact the
                        administrator who provided your account.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2>Guest practice is ready.</h2>
                      <p>
                        Account services are not connected on this deployment
                        yet. You can use every public demo mode, with progress
                        saved in this browser.
                      </p>
                      <button
                        className="button primary"
                        onClick={() => go("overview")}
                      >
                        Continue as a guest
                      </button>
                    </>
                  )}
                  <p className="fine">
                    This public deployment contains fictional content only. It
                    is separate from any company-approved training environment.
                  </p>
                </section>
              )}
              {view === "manage" && user && user.role !== "trainee" && (
                <ContentManager
                  role={user.role}
                  onPublished={async () =>
                    setItems((await api<{ items: Item[] }>("content")).items)
                  }
                />
              )}
              {view === "analytics" && (
                <section className="analytics-panel">
                  <p className="fine">
                    Up to 2,000 most recently updated recall and scenario
                    sessions. Practice results do not certify competence.
                  </p>
                  {!analytics && !error ? (
                    <p role="status">Loading actual session records…</p>
                  ) : analytics?.suppressed ? (
                    <p className="empty">{String(analytics.message)}</p>
                  ) : (
                    analytics && (
                      <>
                        <div className="stat-grid">
                          {[
                            "sessions",
                            "completed",
                            "attempts",
                            "accuracy",
                          ].map((key) => (
                            <article key={key}>
                              <span>{key}</span>
                              <strong>
                                {String(analytics[key] ?? "—")}
                                {key === "accuracy" && analytics[key] !== null
                                  ? "%"
                                  : ""}
                              </strong>
                            </article>
                          ))}
                        </div>
                        <h2>Frequently missed concepts</h2>
                        <div className="topic-list">
                          {Object.entries(
                            analytics.missed as Record<string, number>,
                          )
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                            .map(([id, n]) => (
                              <div key={id}>
                                <span>
                                  {items.find((i) => i.id === id)?.cue ||
                                    "Retired concept"}
                                </span>
                                <span>{n} missed attempts</span>
                              </div>
                            ))}
                        </div>
                        <h2>Practice over time</h2>
                        <div className="topic-list">
                          {Object.entries(
                            analytics.byDay as Record<
                              string,
                              { sessions: number; accuracy: number | null }
                            >,
                          ).map(([day, n]) => (
                            <div key={day}>
                              <span>{day}</span>
                              <span>
                                {n.sessions} sessions · {n.accuracy ?? "—"}%
                                accuracy
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  )}
                  <p className="fine">
                    Aggregate practice data only. No learner identities or
                    individual training records are shown. Results include up to
                    the records retained by the administrator.
                  </p>
                </section>
              )}
            </>
          )}
          <footer className="workspace-footer">
            <span>Built for thoughtful practice.</span>
            <span>Fictional content · Not an operational reference</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

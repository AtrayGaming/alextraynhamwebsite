"use client";
import { useMemo } from "react";
import {
  Maximize2,
  Check,
  RotateCcw,
  ChevronRight,
  Volume2,
  Minus,
  Plus,
} from "lucide-react";
import type { Item, Practice, Mode, Feedback } from "@/lib/types";
import { currentItem, choicesFor, metrics } from "@/lib/engine";
type Props = {
  session: Practice;
  mode: Mode;
  items: Item[];
  feedback: Feedback | null;
  flipped: boolean;
  setFlipped: (v: boolean) => void;
  busy: boolean;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
  start: (mode: Mode, review?: boolean, all?: boolean) => Promise<void>;
  act: (
    action: "answer" | "review" | "score",
    answer?: string,
    team?: number,
    delta?: number,
  ) => Promise<void>;
  go: (view: "overview") => void;
  onContinue: () => void;
  user: unknown;
};
export function PracticeView({
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
  onContinue,
  user,
}: Props) {
  const question = feedback?.item || currentItem(session);
  const choices = useMemo(
    () => (question ? choicesFor(question, items) : []),
    [question, items],
  );
  const percent = Math.round(
    (session.cleared.length /
      (session.cleared.length + session.queue.length || 1)) *
      100,
  );
  return (
    <>
      <div className="session-toolbar">
        <span>
          {session.category === "All" ? "Full set" : session.category}
        </span>
        <span>{session.queue.length} remaining</span>
        {mode === "trainer" && (
          <button
            className="text-button"
            onClick={() => setFocusMode(!focusMode)}
          >
            <Maximize2 size={17} />
            {focusMode ? "Exit presentation" : "Presentation view"}
          </button>
        )}
      </div>
      <div
        className="session-track"
        role="progressbar"
        aria-label="Session completion"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      {session.status === "completed" && !feedback ? (
        <section className="completion">
          <span className="completion-mark">
            <Check size={38} />
          </span>
          <p className="eyebrow">
            {session.cleared.length ? "SESSION COMPLETE" : "YOU’RE CAUGHT UP"}
          </p>
          <h2>
            {session.cleared.length
              ? "That’s a good place to finish."
              : "This set is already clear."}
          </h2>
          <p>
            {session.cleared.length
              ? `${session.cleared.length} concepts ${["learn", "trainer"].includes(mode) ? "reviewed" : "cleared"} in this session.`
              : "Practice the full set again whenever you want a refresher."}
          </p>
          {session.attempts.length > 0 && (
            <div className="completion-stats">
              <span>
                <strong>{session.attempts.length}</strong>attempts
              </span>
              <span>
                <strong>{metrics([session]).accuracy}%</strong>answer accuracy
              </span>
            </div>
          )}
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => start(mode, false, true)}
            >
              Practice the full set
            </button>
            <button className="button secondary" onClick={() => go("overview")}>
              Back to overview
            </button>
          </div>
          <p className="fine">
            Practice completion is not a competency assessment.
          </p>
        </section>
      ) : (
        question && (
          <div className="learning-layout">
            <section className="learning-main">
              {mode === "learn" || mode === "trainer" ? (
                <>
                  <button
                    className={`flashcard ${flipped ? "revealed" : ""}`}
                    aria-label={flipped ? "Hide meaning" : "Reveal meaning"}
                    onClick={() => setFlipped(!flipped)}
                  >
                    <span className="card-meta">
                      <span>{question.category}</span>
                      <Volume2 size={20} aria-hidden="true" />
                    </span>
                    <span className="micro">
                      {flipped ? "THE CONNECTION" : "THE LABEL"}
                    </span>
                    <strong>{flipped ? question.meaning : question.cue}</strong>
                    <span className="flashcard-footer">
                      {flipped
                        ? question.explanation
                        : "Select the card to reveal its meaning."}
                    </span>
                  </button>
                  <div className="flashcard-actions">
                    <button
                      className="button secondary"
                      onClick={() => setFlipped(!flipped)}
                    >
                      <RotateCcw size={17} />
                      {flipped ? "Show label" : "Reveal meaning"}
                    </button>
                    <button
                      className="button primary"
                      disabled={busy || !flipped}
                      onClick={() => act("review")}
                    >
                      Reviewed · next
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="question-card">
                    <div className="card-meta">
                      <span>{question.category}</span>
                      <span>
                        {mode === "scenario" ? "SCENARIO" : "QUICK MATCH"}
                      </span>
                    </div>
                    <h2>
                      {mode === "scenario" ? question.scenario : question.cue}
                    </h2>
                    {mode === "match" && (
                      <p>Which activity does this fictional label represent?</p>
                    )}
                  </div>
                  <div className="choices" aria-label="Answer choices">
                    {choices.map((choice, i) => (
                      <button
                        key={choice}
                        disabled={!!feedback || busy}
                        onClick={() => act("answer", choice)}
                        className={`choice ${feedback ? (choice === question.meaning ? "correct" : choice === feedback.answer ? "incorrect" : "") : ""}`}
                      >
                        <span className="choice-letter">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {choice}
                        {feedback && choice === question.meaning && (
                          <Check size={20} />
                        )}
                      </button>
                    ))}
                  </div>
                  {feedback && (
                    <div
                      className={`feedback ${feedback.correct ? "success" : "retry"}`}
                      role="status"
                    >
                      <strong>
                        {feedback.correct
                          ? "That’s the connection."
                          : "Keep this one in the mix."}
                      </strong>
                      <p>{question.explanation}</p>
                      {!feedback.correct && (
                        <p>It will return later in this session.</p>
                      )}
                      <button
                        className="button dark"
                        onClick={() => {
                          onContinue();
                        }}
                      >
                        {session.status === "completed"
                          ? "See your session result"
                          : "Next question"}
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
            <aside className="session-aside">
              <p className="eyebrow">SESSION NOTES</p>
              <h3>
                {mode === "trainer"
                  ? "Give everyone a turn."
                  : mode === "learn"
                    ? "Try it before you flip."
                    : "A clear finish line."}
              </h3>
              <p>
                {mode === "trainer"
                  ? "Invite an answer, reveal the meaning, and award a point. Scores are facilitator-entered."
                  : mode === "learn"
                    ? "Say the meaning to yourself, then reveal the other side. Reviewing a card does not count as a scored answer."
                    : "Correct answers clear a concept from the queue. Missed answers return for another try."}
              </p>
              <div className="session-mini">
                <strong>{session.cleared.length}</strong>
                <span>
                  concepts{" "}
                  {["learn", "trainer"].includes(mode) ? "reviewed" : "cleared"}
                </span>
              </div>
              {mode === "trainer" && (
                <div className="team-scores">
                  {session.teams.map((team, i) => (
                    <div key={team.name}>
                      <span>{team.name}</span>
                      <strong>{team.score}</strong>
                      <div>
                        <button
                          aria-label={`Subtract point from ${team.name}`}
                          disabled={busy || team.score === 0}
                          onClick={() => act("score", undefined, i, -1)}
                        >
                          <Minus size={16} />
                        </button>
                        <button
                          aria-label={`Add point to ${team.name}`}
                          disabled={busy}
                          onClick={() => act("score", undefined, i, 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="fine">
                {user
                  ? "Saved to your account."
                  : "Guest progress stays in this browser."}
              </p>
            </aside>
          </div>
        )
      )}
    </>
  );
}

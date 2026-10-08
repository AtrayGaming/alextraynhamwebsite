"use client";
import { useEffect, useState, type FormEvent } from "react";
import type { Item, Role } from "@/lib/types";
import { api } from "@/lib/api";
type Version = {
  id: string;
  revision: number;
  payload: Item;
  status: string;
  author_id: string;
};
export function ContentManager({
  role,
  onPublished,
}: {
  role: Role;
  onPublished: () => Promise<void>;
}) {
  const [versions, setVersions] = useState<Version[]>([]),
    [draft, setDraft] = useState<Item | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false);
  async function load() {
    try {
      setVersions(
        (await api<{ versions: Version[] }>("content/manage")).versions,
      );
      setLoaded(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function workflow(v: Version, action: string) {
    setBusy(true);
    setError("");
    try {
      await api("content/workflow", { id: v.id, revision: v.revision, action });
      setMessage(
        `Version ${v.revision} ${action === "submit" ? "submitted for review" : action === "publish" ? "published" : "retired"}.`,
      );
      await load();
      await onPublished();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("content/manage", { item: draft, fictionalConfirmed: true });
      setDraft(null);
      setMessage("Draft saved. Submit it for a separate publishing review.");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const update = (key: keyof Item, value: unknown) =>
    setDraft(draft ? { ...draft, [key]: value } : null);
  return (
    <section>
      <p className="notice">
        Public fictional content only. New revisions begin as drafts. A
        different administrator must publish reviewed content.
      </p>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <button
        className="button primary"
        onClick={() =>
          setDraft({
            id: `custom-${crypto.randomUUID()}`,
            revision: 1,
            category: "Creative studio",
            cue: "",
            meaning: "",
            explanation: "",
            scenario: "",
            kind: "term",
            classification: "fictional",
          })
        }
      >
        Create a concept
      </button>
      {draft && (
        <form className="editor-form" onSubmit={save}>
          <h2>
            {draft.revision === 1
              ? "New concept"
              : `New revision ${draft.revision}`}
          </h2>
          <label>
            Format
            <select
              value={draft.kind}
              onChange={(e) => update("kind", e.target.value)}
            >
              <option value="term">Flashcard concept</option>
              <option value="scenario">Scenario</option>
            </select>
          </label>
          {(
            ["category", "cue", "meaning", "scenario", "explanation"] as const
          ).map((key) => (
            <label key={key}>
              {key === "cue"
                ? "Label / title"
                : key === "meaning"
                  ? "Correct answer"
                  : key}
              <textarea
                required
                value={draft[key]}
                maxLength={
                  key === "scenario"
                    ? 1500
                    : key === "explanation"
                      ? 1000
                      : key === "meaning"
                        ? 250
                        : key === "category"
                          ? 60
                          : 100
                }
                onChange={(e) => update(key, e.target.value)}
              />
            </label>
          ))}
          {draft.kind === "scenario" && (
            <label>
              Answer options, one per line
              <textarea
                required
                value={draft.choices?.join("\n") || ""}
                onChange={(e) => update("choices", e.target.value.split("\n"))}
              />
            </label>
          )}
          <label className="checkbox-label">
            <input type="checkbox" required />I confirm this is invented content
            with no internal procedures, identities, or confidential details.
          </label>
          <div className="button-row">
            <button className="button primary" disabled={busy}>
              Save draft
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setDraft(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="content-versions">
        {!loaded && !error ? (
          <p role="status">Loading content versions…</p>
        ) : (
          versions.map((v) => (
            <article key={`${v.id}-${v.revision}`}>
              <div>
                <span className="micro">
                  {v.status} · VERSION {v.revision}
                </span>
                <h3>{v.payload.cue}</h3>
                <p>{v.payload.meaning}</p>
              </div>
              <div className="button-row">
                <button
                  className="button secondary small"
                  onClick={() =>
                    setDraft({
                      ...v.payload,
                      revision:
                        Math.max(
                          ...versions
                            .filter((x) => x.id === v.id)
                            .map((x) => x.revision),
                        ) + 1,
                    })
                  }
                >
                  Edit as new revision
                </button>
                {v.status === "draft" && (
                  <button
                    disabled={busy}
                    className="button secondary small"
                    onClick={() => workflow(v, "submit")}
                  >
                    Submit for review
                  </button>
                )}
                {role === "admin" && v.status === "review" && (
                  <button
                    disabled={busy}
                    className="button primary small"
                    onClick={() => workflow(v, "publish")}
                  >
                    Publish
                  </button>
                )}
                {role === "admin" && v.status === "published" && (
                  <button
                    disabled={busy}
                    className="button secondary small"
                    onClick={() => workflow(v, "retire")}
                  >
                    Retire
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

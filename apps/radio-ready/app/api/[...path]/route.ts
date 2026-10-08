import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getClient, configured } from "@/server/db";
import {
  viewer,
  sameOrigin,
  jsonBody,
  failure,
  HttpError,
} from "@/server/guards";
import { allDemoItems } from "@/lib/demo-content";
import { answerPractice, startPractice, metrics } from "@/lib/engine";
import type { Item, Practice } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const itemSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,80}$/),
    revision: z.number().int().positive(),
    category: z.string().min(1).max(60),
    cue: z.string().min(1).max(100),
    meaning: z.string().min(1).max(250),
    explanation: z.string().min(1).max(1000),
    scenario: z.string().min(1).max(1500),
    choices: z.array(z.string().min(1).max(250)).min(2).max(6).optional(),
    kind: z.enum(["term", "scenario"]),
    classification: z.literal("fictional"),
  })
  .refine(
    (x) =>
      x.kind !== "scenario" ||
      (x.choices?.includes(x.meaning) &&
        new Set(x.choices).size === x.choices.length),
    "Scenario answer must be one of the unique choices.",
  );
const reply = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
async function published(): Promise<Item[]> {
  if (!configured()) return allDemoItems;
  const r = await getClient().execute(
    "SELECT payload FROM content WHERE status='published' ORDER BY id",
  );
  return r.rows
    .map((x) => JSON.parse(String(x.payload)) as Item)
    .filter((x) => x.classification === "fictional");
}
async function handle(req: Request) {
  try {
    const path = new URL(req.url).pathname.replace("/api/", "");
    if (req.method === "GET") {
      if (path === "config")
        return reply({ accounts: configured(), audience: "public-fictional" });
      if (path === "content") return reply({ items: await published() });
      if (path === "me") {
        if (!configured()) return reply({ user: null });
        try {
          return reply({ user: await viewer(req) });
        } catch (e) {
          if (e instanceof HttpError && e.status === 401)
            return reply({ user: null });
          throw e;
        }
      }
      const actor = await viewer(req);
      if (path === "sessions") {
        const r = await getClient().execute({
          sql: "SELECT payload FROM practice WHERE user_id=? ORDER BY updated_at DESC LIMIT 200",
          args: [actor.id],
        });
        return reply({
          sessions: r.rows.map((x) => JSON.parse(String(x.payload))),
        });
      }
      if (path === "content/manage") {
        await viewer(req, ["trainer", "admin"]);
        const r = await getClient().execute(
          "SELECT * FROM content ORDER BY updated_at DESC",
        );
        return reply({
          versions: r.rows.map((x) => ({
            ...x,
            payload: JSON.parse(String(x.payload)),
          })),
        });
      }
      if (path === "analytics") {
        await viewer(req, ["trainer", "admin"]);
        const r = await getClient().execute(
          "SELECT user_id,payload FROM practice WHERE json_extract(payload, '$.mode') IN ('match','scenario') ORDER BY updated_at DESC LIMIT 2000",
        );
        const rows = r.rows.filter((x) =>
          ["match", "scenario"].includes(
            (JSON.parse(String(x.payload)) as Practice).mode,
          ),
        );
        const users = new Set(rows.map((x) => x.user_id)).size;
        if (users < 5)
          return reply({
            suppressed: true,
            minimum: 5,
            message:
              "Aggregate trends appear after five distinct learners have practiced.",
          });
        const sessions = rows.map(
          (x) => JSON.parse(String(x.payload)) as Practice,
        );
        const result = metrics(sessions);
        const byCategory = Object.fromEntries(
          [...new Set(sessions.map((x) => x.category))].map((category) => [
            category,
            metrics(sessions.filter((x) => x.category === category)),
          ]),
        );
        const byDay = Object.fromEntries(
          [...new Set(sessions.map((x) => x.startedAt.slice(0, 10)))]
            .sort()
            .map((day) => [
              day,
              metrics(sessions.filter((x) => x.startedAt.startsWith(day))),
            ]),
        );
        return reply({ suppressed: false, ...result, byCategory, byDay });
      }
      throw new HttpError(404, "Not found");
    }
    sameOrigin(req);
    const actor = await viewer(req);
    const data = await jsonBody(req);
    const db = getClient();
    if (path === "sessions" && req.method === "POST") {
      const b = z
        .object({
          mode: z.enum(["learn", "match", "scenario", "trainer"]),
          category: z.string().max(60),
          reviewIds: z.array(z.string().max(80)).max(100).optional(),
          skipIds: z.array(z.string().max(80)).max(100).optional(),
        })
        .parse(data);
      if (b.mode === "trainer" && !["trainer", "admin"].includes(actor.role))
        throw new HttpError(403, "Trainer access required.");
      const items = await published();
      const s = startPractice(
        items,
        b.mode,
        b.category,
        b.reviewIds || b.skipIds || [],
        !!b.reviewIds,
      );
      await db.execute({
        sql: "INSERT INTO practice(id,user_id,payload,revision,updated_at) VALUES(?,?,?,?,?)",
        args: [s.id, actor.id, JSON.stringify(s), s.revision, s.updatedAt],
      });
      return reply({ session: s }, 201);
    }
    if (path.startsWith("sessions/") && req.method === "POST") {
      const id = path.split("/")[1];
      const b = z
        .object({
          revision: z.number().int().nonnegative(),
          action: z.enum(["answer", "review", "score"]),
          answer: z.string().max(250).optional(),
          team: z.number().int().min(0).max(1).optional(),
          delta: z.number().int().min(-1).max(1).optional(),
        })
        .parse(data);
      const tx = await db.transaction("write");
      try {
        const r = await tx.execute({
          sql: "SELECT payload,revision FROM practice WHERE id=? AND user_id=?",
          args: [id, actor.id],
        });
        if (!r.rows[0]) throw new HttpError(404, "Session not found");
        if (Number(r.rows[0].revision) !== b.revision)
          throw new HttpError(
            409,
            "This session changed in another tab. Reload to resume it.",
          );
        let s = JSON.parse(String(r.rows[0].payload)) as Practice;
        let feedback;
        if (b.action === "answer") {
          if (!["match", "scenario"].includes(s.mode) || b.answer === undefined)
            throw new HttpError(400, "Invalid session action");
          const result = answerPractice(s, b.answer);
          s = result.session;
          feedback = result.feedback;
        } else if (b.action === "review") {
          if (!["learn", "trainer"].includes(s.mode) || !s.queue.length)
            throw new HttpError(400, "Invalid review action");
          s = {
            ...s,
            cleared: [...s.cleared, s.queue[0]],
            queue: s.queue.slice(1),
            revision: s.revision + 1,
            updatedAt: new Date().toISOString(),
            status: s.queue.length === 1 ? "completed" : "active",
          };
        } else {
          if (
            s.mode !== "trainer" ||
            !["trainer", "admin"].includes(actor.role) ||
            b.team === undefined ||
            b.delta === undefined
          )
            throw new HttpError(403, "Trainer scoring unavailable");
          s = {
            ...s,
            teams: s.teams.map((t, i) =>
              i === b.team
                ? { ...t, score: Math.max(0, t.score + b.delta!) }
                : t,
            ),
            revision: s.revision + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        await tx.execute({
          sql: "UPDATE practice SET payload=?,revision=?,updated_at=? WHERE id=? AND user_id=?",
          args: [JSON.stringify(s), s.revision, s.updatedAt, id, actor.id],
        });
        await tx.commit();
        return reply({ session: s, feedback });
      } catch (e) {
        await tx.rollback();
        throw e;
      } finally {
        tx.close();
      }
    }
    if (path === "content/manage" && req.method === "POST") {
      await viewer(req, ["trainer", "admin"]);
      const b = z
        .object({ item: itemSchema, fictionalConfirmed: z.literal(true) })
        .parse(data);
      const tx = await db.transaction("write");
      try {
        const current = await tx.execute({
          sql: "SELECT MAX(revision) as latest FROM content WHERE id=?",
          args: [b.item.id],
        });
        const rev = Number(current.rows[0]?.latest || 0) + 1;
        if (b.item.revision !== rev)
          throw new HttpError(
            409,
            "A newer content revision exists. Refresh before saving.",
          );
        await tx.execute({
          sql: "INSERT INTO content(id,revision,payload,status,author_id,updated_at) VALUES(?,?,?,'draft',?,?)",
          args: [
            b.item.id,
            rev,
            JSON.stringify(b.item),
            actor.id,
            new Date().toISOString(),
          ],
        });
        await tx.commit();
        return reply({ saved: true, revision: rev }, 201);
      } catch (e) {
        await tx.rollback();
        throw e;
      } finally {
        tx.close();
      }
    }
    if (path === "content/workflow" && req.method === "POST") {
      await viewer(req, ["trainer", "admin"]);
      const b = z
        .object({
          id: z.string(),
          revision: z.number().int(),
          action: z.enum(["submit", "publish", "retire"]),
        })
        .parse(data);
      if (b.action !== "submit" && actor.role !== "admin")
        throw new HttpError(403, "Administrator access required.");
      const tx = await db.transaction("write");
      try {
        const r = await tx.execute({
          sql: "SELECT * FROM content WHERE id=? AND revision=?",
          args: [b.id, b.revision],
        });
        const row = r.rows[0];
        if (!row) throw new HttpError(404, "Version not found");
        if (
          (b.action === "submit" && row.status !== "draft") ||
          (b.action === "publish" && row.status !== "review") ||
          (b.action === "retire" && row.status !== "published")
        )
          throw new HttpError(
            409,
            "This version has changed. Refresh the page.",
          );
        if (b.action === "publish" && row.author_id === actor.id)
          throw new HttpError(
            403,
            "A different administrator must review and publish your draft.",
          );
        if (b.action === "publish")
          await tx.execute({
            sql: "UPDATE content SET status='retired' WHERE id=? AND status='published'",
            args: [b.id],
          });
        await tx.execute({
          sql: "UPDATE content SET status=?,reviewer_id=?,updated_at=? WHERE id=? AND revision=?",
          args: [
            b.action === "submit"
              ? "review"
              : b.action === "publish"
                ? "published"
                : "retired",
            b.action === "publish" ? actor.id : null,
            new Date().toISOString(),
            b.id,
            b.revision,
          ],
        });
        await tx.execute({
          sql: "INSERT INTO audit VALUES(?,?,?,?,?)",
          args: [
            randomUUID(),
            actor.id,
            b.action,
            `${b.id}:${b.revision}`,
            new Date().toISOString(),
          ],
        });
        await tx.commit();
        return reply({ saved: true });
      } catch (e) {
        await tx.rollback();
        throw e;
      } finally {
        tx.close();
      }
    }
    if (path === "progress" && req.method === "DELETE") {
      await db.execute({
        sql: "DELETE FROM practice WHERE user_id=?",
        args: [actor.id],
      });
      return reply({ deleted: true });
    }
    throw new HttpError(404, "Not found");
  } catch (e) {
    return failure(e);
  }
}
export const GET = handle;
export const POST = handle;
export const DELETE = handle;

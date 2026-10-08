import { getAuth } from "./auth";
import { getClient, configured } from "./db";
import type { Role, Viewer } from "@/lib/types";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function viewer(
  request: Request,
  roles?: Role[],
): Promise<Viewer> {
  if (!configured())
    throw new HttpError(
      503,
      "Account services are not configured on this deployment. Guest practice is available.",
    );
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) throw new HttpError(401, "Sign in to continue.");
  const r = await getClient().execute({
    sql: "SELECT role FROM access_role WHERE user_id=?",
    args: [session.user.id],
  });
  if (!r.rows[0])
    throw new HttpError(403, "This account does not have access.");
  const role = r.rows[0].role as Role;
  if (roles && !roles.includes(role))
    throw new HttpError(403, "This action requires a different role.");
  return { id: session.user.id, name: session.user.name, role };
}
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== process.env.APP_ORIGIN)
    throw new HttpError(403, "Request origin rejected.");
}
export async function jsonBody(request: Request) {
  const raw = await request.text();
  if (raw.length > 32000) throw new HttpError(413, "Request too large.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof Error && error.name === "ZodError")
    return Response.json(
      { error: "Check the submitted fields." },
      { status: 400 },
    );
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "Unknown",
  );
  return Response.json(
    { error: "Unable to complete this request. Try again." },
    { status: 500 },
  );
}

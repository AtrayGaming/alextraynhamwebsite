import { getAuth } from "@/server/auth";
import { configured } from "@/server/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(req: Request) {
  if (!configured())
    return Response.json(
      { error: "Account services are not configured." },
      { status: 503 },
    );
  const path = new URL(req.url).pathname.replace("/api/auth/", "");
  // Accounts are provisioned by an administrator. No public registration or password-reset endpoint.
  if (
    !["sign-in/email", "sign-out", "get-session", "change-password"].includes(
      path,
    )
  )
    return Response.json({ error: "Not found" }, { status: 404 });
  return getAuth().handler(req);
}
export const GET = handle;
export const POST = handle;

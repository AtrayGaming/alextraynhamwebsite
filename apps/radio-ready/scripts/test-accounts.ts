import { getAuth } from "../server/auth";
import { getClient } from "../server/db";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
if (!process.env.DATABASE_URL?.startsWith("file:"))
  throw new Error("Test accounts are local-only.");
const accounts: Record<string, { email: string; password: string }> = {};
for (const [label, role] of [
  ["adminA", "admin"],
  ["adminB", "admin"],
  ["trainer", "trainer"],
  ["learner", "trainee"],
  ["other", "trainee"],
]) {
  const email = `${label}-${Date.now()}@example.test`,
    password = randomBytes(24).toString("base64url");
  const r = await getAuth().api.signUpEmail({
    body: { email, password, name: label },
  });
  await getClient().execute({
    sql: "INSERT INTO access_role(user_id,role) VALUES(?,?)",
    args: [r.user.id, role],
  });
  accounts[label] = { email, password };
}
writeFileSync(".data/test-accounts.json", JSON.stringify(accounts), {
  mode: 0o600,
});
console.log("Isolated local test identities provisioned.");
getClient().close();

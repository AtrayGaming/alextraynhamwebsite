import { getAuth } from "../server/auth";
import { getClient } from "../server/db";
const {
  ACCOUNT_EMAIL: email,
  ACCOUNT_PASSWORD: password,
  ACCOUNT_ROLE: role = "trainee",
  ACCOUNT_NAME: name = "Learner",
} = process.env;
if (!email || !password || !["trainee", "trainer", "admin"].includes(role))
  throw new Error(
    "Set ACCOUNT_EMAIL, ACCOUNT_PASSWORD and ACCOUNT_ROLE through a secure environment.",
  );
const created = await getAuth().api.signUpEmail({
  body: { email, password, name },
});
await getClient().execute({
  sql: "INSERT INTO access_role(user_id,role) VALUES(?,?)",
  args: [created.user.id, role],
});
console.log(`Created ${role} account. Credentials were not logged.`);
getClient().close();

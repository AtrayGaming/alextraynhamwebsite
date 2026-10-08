import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
let client: Client | undefined;
export function configured() {
  return !!(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_SECRET &&
    process.env.APP_ORIGIN
  );
}
export function getClient() {
  if (!process.env.DATABASE_URL) throw new Error("Database not configured");
  if (
    process.env.VERCEL &&
    !/^(libsql|https):\/\//.test(process.env.DATABASE_URL)
  )
    throw new Error("A remote database is required on Vercel");
  return (client ??= createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  }));
}
export function getDb() {
  return drizzle(getClient(), { schema });
}

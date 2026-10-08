import { mkdirSync } from "node:fs";
import { getClient } from "../server/db";
import { allDemoItems } from "../lib/demo-content";
mkdirSync(".data", { recursive: true });
const db = getClient();
await db.executeMultiple(`
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,emailVerified INTEGER NOT NULL DEFAULT 0,image TEXT,createdAt INTEGER NOT NULL,updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY,expiresAt INTEGER NOT NULL,token TEXT NOT NULL UNIQUE,createdAt INTEGER NOT NULL,updatedAt INTEGER NOT NULL,ipAddress TEXT,userAgent TEXT,userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE);
CREATE INDEX IF NOT EXISTS session_user ON session(userId);
CREATE TABLE IF NOT EXISTS account (id TEXT PRIMARY KEY,accountId TEXT NOT NULL,providerId TEXT NOT NULL,userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,accessToken TEXT,refreshToken TEXT,idToken TEXT,accessTokenExpiresAt INTEGER,refreshTokenExpiresAt INTEGER,scope TEXT,password TEXT,createdAt INTEGER NOT NULL,updatedAt INTEGER NOT NULL,UNIQUE(providerId,accountId));
CREATE TABLE IF NOT EXISTS verification (id TEXT PRIMARY KEY,identifier TEXT NOT NULL,value TEXT NOT NULL,expiresAt INTEGER NOT NULL,createdAt INTEGER NOT NULL,updatedAt INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS rateLimit (id TEXT PRIMARY KEY,key TEXT NOT NULL UNIQUE,count INTEGER NOT NULL,lastRequest INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS access_role(user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,role TEXT NOT NULL CHECK(role IN ('trainee','trainer','admin')));
CREATE TABLE IF NOT EXISTS content(id TEXT NOT NULL,revision INTEGER NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('draft','review','published','retired')),author_id TEXT NOT NULL,reviewer_id TEXT,updated_at TEXT NOT NULL,PRIMARY KEY(id,revision));
CREATE UNIQUE INDEX IF NOT EXISTS published_content ON content(id) WHERE status='published';
CREATE TABLE IF NOT EXISTS practice(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,payload TEXT NOT NULL,revision INTEGER NOT NULL,updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS practice_user ON practice(user_id,updated_at);
CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,actor_id TEXT NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL,at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS schema_version(version INTEGER PRIMARY KEY,applied_at TEXT NOT NULL);
INSERT OR IGNORE INTO schema_version VALUES(1,datetime('now'));
`);
for (const item of allDemoItems)
  await db.execute({
    sql: "INSERT OR IGNORE INTO content(id,revision,payload,status,author_id,reviewer_id,updated_at) VALUES(?,?,?,'published','seed','seed',?)",
    args: [
      item.id,
      item.revision,
      JSON.stringify(item),
      new Date().toISOString(),
    ],
  });
console.log("Schema v1 ready; fictional content seeded.");
db.close();

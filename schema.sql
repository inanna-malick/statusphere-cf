CREATE TABLE IF NOT EXISTS "status" ("uri" varchar primary key, "authorDid" varchar not null, "status" varchar not null, "createdAt" varchar not null, "indexedAt" varchar not null);
CREATE TABLE IF NOT EXISTS "auth_session" ("key" varchar primary key, "session" varchar not null);
CREATE TABLE IF NOT EXISTS "auth_state" ("key" varchar primary key, "state" varchar not null);
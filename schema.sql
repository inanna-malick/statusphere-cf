CREATE TABLE IF NOT EXISTS "status" ("authorDid" varchar not null, "rkey" varchar not null, "status" varchar not null, "createdAt" varchar not null, "indexed_us" bigint not null, PRIMARY KEY (authorDid, rkey)
);
CREATE TABLE IF NOT EXISTS "auth_session" ("key" varchar primary key, "session" varchar not null);
CREATE TABLE IF NOT EXISTS "auth_state" ("key" varchar primary key, "state" varchar not null);
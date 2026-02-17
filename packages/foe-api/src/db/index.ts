import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const sqlite = new Database("sqlite.db");
sqlite.exec("PRAGMA journal_mode = WAL;"); // Enable Write-Ahead Logging for better concurrency
sqlite.exec("PRAGMA busy_timeout = 5000;"); // Wait up to 5s if DB is locked

export const db = drizzle(sqlite, { schema });

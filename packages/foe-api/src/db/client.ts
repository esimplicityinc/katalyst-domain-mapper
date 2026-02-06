import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.js";

export type DrizzleDB = ReturnType<typeof createDatabase>;

export function createDatabase(url: string) {
  const sqlite = new Database(url, { create: true });

  // Enable WAL mode for better concurrent read performance
  sqlite.exec("PRAGMA journal_mode = WAL");
  sqlite.exec("PRAGMA foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  return db;
}

import type { Config } from "drizzle-kit";

export default {
  schema: "./api/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "./data/foe.db",
  },
} satisfies Config;

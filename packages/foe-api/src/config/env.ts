export interface AppConfig {
  /** Port to listen on */
  port: number;

  /** Host to bind to */
  host: string;

  /** SQLite database file path */
  databaseUrl: string;

  /** Docker image name for the scanner */
  scannerImage: string;

  /** Anthropic API key — passed to scanner containers */
  anthropicApiKey: string | undefined;

  /** Background scan polling interval in milliseconds */
  scanPollIntervalMs: number;

  /** Log level */
  logLevel: "debug" | "info" | "warn" | "error";
}

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    host: process.env.HOST ?? "0.0.0.0",
    databaseUrl: process.env.DATABASE_URL ?? "./data/foe.db",
    scannerImage: process.env.SCANNER_IMAGE ?? "foe-scanner",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    scanPollIntervalMs: Number(process.env.SCAN_POLL_INTERVAL_MS ?? 5000),
    logLevel: (process.env.LOG_LEVEL as AppConfig["logLevel"]) ?? "info",
  };
}

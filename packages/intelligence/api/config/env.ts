/** Supported LLM providers for the scanner */
export type LlmProvider = "anthropic" | "openrouter" | "bedrock";

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

  /** OpenRouter API key — alternative provider for scanner */
  openrouterApiKey: string | undefined;

  /** AWS Bedrock bearer token — alternative provider for scanner */
  awsBedrockToken: string | undefined;

  /** AWS Region for Bedrock */
  awsRegion: string | undefined;

  /** Background scan polling interval in milliseconds */
  scanPollIntervalMs: number;

  /** Log level */
  logLevel: "debug" | "info" | "warn" | "error";
}

/** Detect which LLM provider a key belongs to based on its prefix */
export function detectProvider(key: string): LlmProvider {
  if (key.startsWith("sk-or-")) return "openrouter";
  return "anthropic";
}

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3001),
    host: process.env.HOST ?? "0.0.0.0",
    databaseUrl: process.env.DATABASE_URL ?? "./data/foe.db",
    scannerImage: process.env.SCANNER_IMAGE ?? "foe-scanner",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    awsBedrockToken: process.env.AWS_BEARER_TOKEN_BEDROCK,
    awsRegion: process.env.AWS_REGION ?? "us-east-1",
    scanPollIntervalMs: Number(process.env.SCAN_POLL_INTERVAL_MS ?? 5000),
    logLevel: (process.env.LOG_LEVEL as AppConfig["logLevel"]) ?? "info",
  };
}

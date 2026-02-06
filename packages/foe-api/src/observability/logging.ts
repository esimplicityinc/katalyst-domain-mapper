import type { Logger } from "../ports/Logger.js";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class StructuredLogger implements Logger {
  private minLevel: number;

  constructor(
    private meta: Record<string, unknown> = {},
    level: LogLevel = "info"
  ) {
    this.minLevel = LOG_LEVELS[level];
  }

  debug(message: string, extra?: Record<string, unknown>): void {
    this.log("debug", message, extra);
  }

  info(message: string, extra?: Record<string, unknown>): void {
    this.log("info", message, extra);
  }

  warn(message: string, extra?: Record<string, unknown>): void {
    this.log("warn", message, extra);
  }

  error(message: string, extra?: Record<string, unknown>): void {
    this.log("error", message, extra);
  }

  child(meta: Record<string, unknown>): Logger {
    return new StructuredLogger(
      { ...this.meta, ...meta },
      Object.entries(LOG_LEVELS).find(
        ([, v]) => v === this.minLevel
      )?.[0] as LogLevel ?? "info"
    );
  }

  private log(level: LogLevel, message: string, extra?: Record<string, unknown>): void {
    if (LOG_LEVELS[level] < this.minLevel) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.meta,
      ...extra,
    };

    const output = JSON.stringify(entry);

    if (level === "error") {
      process.stderr.write(output + "\n");
    } else {
      process.stdout.write(output + "\n");
    }
  }
}

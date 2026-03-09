import type {
  ScanOrchestrator,
  ScanContext,
  ScanOrchestrationResult,
} from "../../ports/ScanOrchestrator.js";
import type { Logger } from "../../ports/Logger.js";
import type { LlmProvider } from "../../config/env.js";

/**
 * OpenCode scan orchestrator — delegates to the Docker-based scanner container.
 *
 * This adapter wraps the existing Docker→OpenCode CLI pipeline:
 *   Docker container → entrypoint.sh → `opencode run --agent foe-scanner-container`
 *   → AI orchestrator dispatches 5 subagents → JSON report on stdout.
 *
 * The DockerScanRunner logic (spawn, NDJSON parsing, JSON extraction) is inlined
 * here rather than delegated, so DockerScanRunner.ts can be deprecated.
 */
export class OpenCodeScanOrchestrator implements ScanOrchestrator {
  readonly runtime = "opencode" as const;

  constructor(
    private image: string,
    private getLlmApiKey: () =>
      | { key: string; provider: LlmProvider }
      | undefined,
    private logger: Logger,
  ) {}

  /**
   * Extract a balanced JSON object from a string starting at the first '{'.
   */
  private extractBalancedJson(text: string): string | null {
    const start = text.indexOf("{");
    if (start < 0) return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }
    return null;
  }

  async run(context: ScanContext): Promise<ScanOrchestrationResult> {
    const startTime = Date.now();
    const llm = this.getLlmApiKey();

    if (!llm) {
      return {
        success: false,
        report: null,
        error:
          "No LLM API key configured (ANTHROPIC_API_KEY, OPENROUTER_API_KEY, or AWS_BEARER_TOKEN_BEDROCK). Cannot run scanner.",
        metadata: {
          runtime: "opencode",
          durationMs: Date.now() - startTime,
          agentsUsed: [],
        },
      };
    }

    // Build docker run arguments based on provider
    const args = ["run", "--rm", "-v", `${context.repositoryPath}:/repo`];

    if (llm.provider === "bedrock") {
      args.push(
        "-e",
        `AWS_BEARER_TOKEN_BEDROCK=${llm.key}`,
        "-e",
        `AWS_REGION=${process.env.AWS_REGION ?? "us-east-1"}`,
        "-e",
        "LLM_PROVIDER=bedrock",
      );
    } else if (llm.provider === "openrouter") {
      args.push(
        "-e",
        `OPENROUTER_API_KEY=${llm.key}`,
        "-e",
        "LLM_PROVIDER=openrouter",
      );
    } else {
      args.push(
        "-e",
        `ANTHROPIC_API_KEY=${llm.key}`,
        "-e",
        "LLM_PROVIDER=anthropic",
      );
    }

    args.push(this.image);

    this.logger.info("Starting scanner container (OpenCode runtime)", {
      image: this.image,
      repositoryPath: context.repositoryPath,
      provider: llm.provider,
    });

    try {
      const proc = Bun.spawn(["docker", ...args], {
        stdout: "pipe",
        stderr: "pipe",
      });

      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (stderr) {
        this.logger.debug("Scanner stderr output", {
          stderr: stderr.slice(0, 2000),
        });
      }

      if (exitCode !== 0) {
        this.logger.error("Scanner exited with error", {
          exitCode,
          stderr: stderr.slice(0, 2000),
        });
        return {
          success: false,
          report: null,
          error: `Scanner exited with code ${exitCode}: ${stderr.slice(0, 500)}`,
          metadata: {
            runtime: "opencode",
            durationMs: Date.now() - startTime,
            agentsUsed: ["foe-scanner-container"],
          },
        };
      }

      // Parse report from stdout
      const trimmed = stdout.trim();
      if (!trimmed) {
        return {
          success: false,
          report: null,
          error: "Scanner produced no output",
          metadata: {
            runtime: "opencode",
            durationMs: Date.now() - startTime,
            agentsUsed: ["foe-scanner-container"],
          },
        };
      }

      // Strategy 1: direct JSON object
      try {
        const report = JSON.parse(trimmed);
        if (report && !report.type && report.dimensions) {
          this.logger.info("Scanner completed successfully (direct JSON)");
          return {
            success: true,
            report,
            metadata: {
              runtime: "opencode",
              durationMs: Date.now() - startTime,
              agentsUsed: this.extractAgentsUsed(report),
            },
          };
        }
      } catch {
        // Not a single JSON object
      }

      // Strategy 2: NDJSON event stream from `opencode run --format json`
      const lines = trimmed.split("\n");
      let allText = "";

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === "text" && event.part?.text) {
            allText += event.part.text;
          }
        } catch {
          // Skip non-JSON lines
        }
      }

      if (allText) {
        this.logger.debug("Extracted text from event stream", {
          textLength: allText.length,
        });

        const jsonMatch = allText.match(/\{[\s\S]*"dimensions"[\s\S]*\}/);
        if (jsonMatch) {
          const candidate = this.extractBalancedJson(jsonMatch[0]);
          if (candidate) {
            try {
              const report = JSON.parse(candidate);
              this.logger.info(
                "Scanner completed successfully (extracted from event stream)",
              );
              return {
                success: true,
                report,
                metadata: {
                  runtime: "opencode",
                  durationMs: Date.now() - startTime,
                  agentsUsed: this.extractAgentsUsed(report),
                },
              };
            } catch {
              this.logger.warn("Found JSON-like block but failed to parse");
            }
          }
        }

        // Fallback: first-{ to last-} on allText
        const jsonStart = allText.indexOf("{");
        const jsonEnd = allText.lastIndexOf("}");
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          try {
            const report = JSON.parse(allText.slice(jsonStart, jsonEnd + 1));
            this.logger.info(
              "Scanner completed successfully (extracted JSON from text)",
            );
            return {
              success: true,
              report,
              metadata: {
                runtime: "opencode",
                durationMs: Date.now() - startTime,
                agentsUsed: this.extractAgentsUsed(report),
              },
            };
          } catch {
            // Fall through
          }
        }
      }

      // Strategy 3: Legacy fallback on raw stdout
      const jsonStart = trimmed.indexOf("{");
      const jsonEnd = trimmed.lastIndexOf("}");
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          const report = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
          this.logger.info(
            "Scanner completed successfully (legacy JSON extraction)",
          );
          return {
            success: true,
            report,
            metadata: {
              runtime: "opencode",
              durationMs: Date.now() - startTime,
              agentsUsed: this.extractAgentsUsed(report),
            },
          };
        } catch {
          // Fall through
        }
      }

      this.logger.error("Could not extract valid JSON from scanner output", {
        outputLength: trimmed.length,
        textLength: allText.length,
        firstChars: trimmed.slice(0, 200),
      });
      return {
        success: false,
        report: null,
        error: "Scanner output is not valid JSON",
        metadata: {
          runtime: "opencode",
          durationMs: Date.now() - startTime,
          agentsUsed: ["foe-scanner-container"],
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error("Failed to run scanner container", { error: message });
      return {
        success: false,
        report: null,
        error: `Failed to run Docker container: ${message}`,
        metadata: {
          runtime: "opencode",
          durationMs: Date.now() - startTime,
          agentsUsed: [],
        },
      };
    }
  }

  /** Extract agents used from the report's methodology section */
  private extractAgentsUsed(report: unknown): string[] {
    try {
      const r = report as Record<string, unknown>;
      const methodology = r.methodology as Record<string, unknown> | undefined;
      if (methodology?.agentsUsed && Array.isArray(methodology.agentsUsed)) {
        return methodology.agentsUsed as string[];
      }
    } catch {
      // ignore
    }
    return [
      "foe-scanner-container",
      "foe-scanner-ci",
      "foe-scanner-tests",
      "foe-scanner-arch",
      "foe-scanner-domain",
      "foe-scanner-docs",
    ];
  }
}

import type { ScanRunner, ScanResult } from "../../ports/ScanRunner.js";
import type { Logger } from "../../ports/Logger.js";
import type { LlmProvider } from "../../config/env.js";

export class DockerScanRunner implements ScanRunner {
  constructor(
    private image: string,
    private getLlmApiKey: () =>
      | { key: string; provider: LlmProvider }
      | undefined,
    private logger: Logger,
  ) {}

  /**
   * Extract a balanced JSON object from a string starting at the first '{'.
   * Handles nested braces properly.
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

  async run(repositoryPath: string): Promise<ScanResult> {
    const llm = this.getLlmApiKey();
    if (!llm) {
      return {
        success: false,
        report: null,
        error:
          "No LLM API key configured (ANTHROPIC_API_KEY, OPENROUTER_API_KEY, or AWS_BEARER_TOKEN_BEDROCK). Cannot run scanner.",
      };
    }

    // Build docker run arguments based on provider
    const args = [
      "run",
      "--rm",
      "-v",
      `${repositoryPath}:/repo`,
    ];

    // Add environment variables based on provider
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

    this.logger.info("Starting scanner container", {
      image: this.image,
      repositoryPath,
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
        };
      }

      // Parse report from stdout.
      // `opencode run --format json` outputs NDJSON (one JSON event per line).
      // The final FOE report is embedded in the last "text" event's part.text field.
      const trimmed = stdout.trim();
      if (!trimmed) {
        return {
          success: false,
          report: null,
          error: "Scanner produced no output",
        };
      }

      // Strategy 1: If the whole output is a single JSON object (direct output)
      try {
        const report = JSON.parse(trimmed);
        if (report && !report.type && report.dimensions) {
          this.logger.info("Scanner completed successfully (direct JSON)");
          return { success: true, report };
        }
      } catch {
        // Not a single JSON object — expected for NDJSON event stream
      }

      // Strategy 2: Parse NDJSON event stream from `opencode run --format json`
      // Collect all text parts and extract JSON from the final agent message
      const lines = trimmed.split("\n");
      let allText = "";

      for (const line of lines) {
        try {
          const event = JSON.parse(line);
          if (event.type === "text" && event.part?.text) {
            allText += event.part.text;
          }
        } catch {
          // Skip non-JSON lines (stderr leakage, etc.)
        }
      }

      if (allText) {
        this.logger.debug("Extracted text from event stream", {
          textLength: allText.length,
        });

        // The agent's final text should contain a JSON report block
        // Look for the outermost JSON object in the accumulated text
        const jsonMatch = allText.match(/\{[\s\S]*"dimensions"[\s\S]*\}/);
        if (jsonMatch) {
          // Find the balanced braces
          const candidate = this.extractBalancedJson(jsonMatch[0]);
          if (candidate) {
            try {
              const report = JSON.parse(candidate);
              this.logger.info(
                "Scanner completed successfully (extracted from event stream)",
              );
              return { success: true, report };
            } catch {
              this.logger.warn("Found JSON-like block but failed to parse");
            }
          }
        }

        // Fallback: try the simple first-{ to last-} extraction on allText
        const jsonStart = allText.indexOf("{");
        const jsonEnd = allText.lastIndexOf("}");
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          try {
            const report = JSON.parse(allText.slice(jsonStart, jsonEnd + 1));
            this.logger.info(
              "Scanner completed successfully (extracted JSON from text)",
            );
            return { success: true, report };
          } catch {
            // Fall through
          }
        }
      }

      // Strategy 3: Legacy fallback — try first-{ to last-} on raw stdout
      const jsonStart = trimmed.indexOf("{");
      const jsonEnd = trimmed.lastIndexOf("}");
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        try {
          const report = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
          this.logger.info(
            "Scanner completed successfully (legacy JSON extraction)",
          );
          return { success: true, report };
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
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error("Failed to run scanner container", { error: message });
      return {
        success: false,
        report: null,
        error: `Failed to run Docker container: ${message}`,
      };
    }
  }
}

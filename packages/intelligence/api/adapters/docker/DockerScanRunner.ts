import type { ScanRunner, ScanResult } from "../../ports/ScanRunner.js";
import type { Logger } from "../../ports/Logger.js";

export class DockerScanRunner implements ScanRunner {
  constructor(
    private image: string,
    private getApiKey: () => string | undefined,
    private logger: Logger,
  ) {}

  async run(repositoryPath: string): Promise<ScanResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        success: false,
        report: null,
        error: "ANTHROPIC_API_KEY is not configured. Cannot run scanner.",
      };
    }

    const args = [
      "run",
      "--rm",
      "-v",
      `${repositoryPath}:/repo`,
      "-e",
      `ANTHROPIC_API_KEY=${apiKey}`,
      this.image,
    ];

    this.logger.info("Starting scanner container", {
      image: this.image,
      repositoryPath,
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

      // Parse JSON from stdout
      const trimmed = stdout.trim();
      if (!trimmed) {
        return {
          success: false,
          report: null,
          error: "Scanner produced no output",
        };
      }

      try {
        const report = JSON.parse(trimmed);
        this.logger.info("Scanner completed successfully");
        return { success: true, report };
      } catch {
        // Sometimes the scanner outputs non-JSON before the actual JSON
        // Try to find the JSON object in the output
        const jsonStart = trimmed.indexOf("{");
        const jsonEnd = trimmed.lastIndexOf("}");
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          try {
            const report = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
            this.logger.info(
              "Scanner completed successfully (extracted JSON from output)",
            );
            return { success: true, report };
          } catch {
            return {
              success: false,
              report: null,
              error: "Scanner output is not valid JSON",
            };
          }
        }
        return {
          success: false,
          report: null,
          error: "Scanner output is not valid JSON",
        };
      }
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

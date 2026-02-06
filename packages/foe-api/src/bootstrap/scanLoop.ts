import type { ScanJobRepository } from "../ports/ScanJobRepository.js";
import type { ScanRunner } from "../ports/ScanRunner.js";
import type { ReportRepository } from "../ports/ReportRepository.js";
import type { Logger } from "../ports/Logger.js";
import { normalizeReport } from "../domain/report/normalize.js";

/**
 * Background loop that picks up queued scan jobs and runs them.
 * Returns a cleanup function to stop the loop.
 */
export function startScanLoop(deps: {
  scanJobRepo: ScanJobRepository;
  scanRunner: ScanRunner;
  reportRepo: ReportRepository;
  logger: Logger;
  pollIntervalMs: number;
}): () => void {
  const { scanJobRepo, scanRunner, reportRepo, logger, pollIntervalMs } = deps;
  let running = true;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  async function tick() {
    if (!running) return;

    try {
      // Find the next queued job
      const queued = await scanJobRepo.list("queued");
      const job = queued[0];

      if (job) {
        logger.info("Processing scan job", { jobId: job.id, repoPath: job.repositoryPath });

        // Mark as running
        await scanJobRepo.update(job.id, {
          status: "running",
          startedAt: new Date().toISOString(),
        });

        // Run the scanner
        const result = await scanRunner.run(job.repositoryPath);

        if (result.success && result.report) {
          try {
            // Normalize and save the report
            const normalized = normalizeReport(result.report);
            const reportId = await reportRepo.save(normalized, result.report);

            await scanJobRepo.update(job.id, {
              status: "completed",
              scanId: reportId,
              completedAt: new Date().toISOString(),
            });

            logger.info("Scan job completed", {
              jobId: job.id,
              reportId,
              overallScore: normalized.overallScore,
            });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            await scanJobRepo.update(job.id, {
              status: "failed",
              errorMessage: `Report normalization failed: ${message}`,
              completedAt: new Date().toISOString(),
            });
            logger.error("Scan produced invalid report", { jobId: job.id, error: message });
          }
        } else {
          await scanJobRepo.update(job.id, {
            status: "failed",
            errorMessage: result.error ?? "Unknown scanner error",
            completedAt: new Date().toISOString(),
          });
          logger.error("Scan job failed", { jobId: job.id, error: result.error });
        }
      }
    } catch (err) {
      logger.error("Scan loop error", {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // Schedule next tick
    if (running) {
      timeout = setTimeout(tick, pollIntervalMs);
    }
  }

  // Start the loop
  timeout = setTimeout(tick, pollIntervalMs);
  logger.info("Scan loop started", { pollIntervalMs });

  // Return cleanup function
  return () => {
    running = false;
    if (timeout) clearTimeout(timeout);
    logger.info("Scan loop stopped");
  };
}

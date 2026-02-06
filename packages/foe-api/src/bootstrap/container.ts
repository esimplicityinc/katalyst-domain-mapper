import { sql } from "drizzle-orm";
import type { AppConfig } from "../config/env.js";
import type { Logger } from "../ports/Logger.js";
import type { ReportRepository } from "../ports/ReportRepository.js";
import type { ScanJobRepository } from "../ports/ScanJobRepository.js";
import type { ScanRunner } from "../ports/ScanRunner.js";
import { StructuredLogger } from "../observability/logging.js";
import { createDatabase, type DrizzleDB } from "../db/client.js";
import { ReportRepositorySQLite } from "../adapters/sqlite/ReportRepositorySQLite.js";
import { ScanJobRepositorySQLite } from "../adapters/sqlite/ScanJobRepositorySQLite.js";
import { DockerScanRunner } from "../adapters/docker/DockerScanRunner.js";
import { IngestReport } from "../usecases/report/IngestReport.js";
import { GetReport } from "../usecases/report/GetReport.js";
import { ListReports } from "../usecases/report/ListReports.js";
import { CompareReports } from "../usecases/report/CompareReports.js";
import { TriggerScan } from "../usecases/scan/TriggerScan.js";
import { GetScanStatus } from "../usecases/scan/GetScanStatus.js";

export interface Container {
  config: AppConfig;
  logger: Logger;
  db: DrizzleDB;
  reportRepo: ReportRepository;
  scanJobRepo: ScanJobRepository;
  scanRunner: ScanRunner;
  ingestReport: IngestReport;
  getReport: GetReport;
  listReports: ListReports;
  compareReports: CompareReports;
  triggerScan: TriggerScan;
  getScanStatus: GetScanStatus;
  healthCheck: () => boolean;
  shutdown: () => void;
  getAnthropicApiKey: () => string | undefined;
  setAnthropicApiKey: (key: string) => void;
}

export function createContainer(config: AppConfig): Container {
  const logger = new StructuredLogger({}, config.logLevel);

  // Database
  const db = createDatabase(config.databaseUrl);

  // Mutable API key — can be set at runtime via the config endpoint
  let anthropicApiKey = config.anthropicApiKey;

  const getAnthropicApiKey = () => anthropicApiKey;
  const setAnthropicApiKey = (key: string) => {
    anthropicApiKey = key;
    logger.info("Anthropic API key updated at runtime");
  };

  // Repositories (adapters)
  const reportRepo = new ReportRepositorySQLite(db);
  const scanJobRepo = new ScanJobRepositorySQLite(db);

  // Scan runner
  const scanRunner = new DockerScanRunner(
    config.scannerImage,
    getAnthropicApiKey,
    logger.child({ component: "scan-runner" })
  );

  // Use cases
  const ingestReport = new IngestReport(reportRepo, logger.child({ usecase: "ingest-report" }));
  const getReport = new GetReport(reportRepo);
  const listReports = new ListReports(reportRepo);
  const compareReports = new CompareReports(reportRepo);
  const triggerScan = new TriggerScan(scanJobRepo, logger.child({ usecase: "trigger-scan" }));
  const getScanStatus = new GetScanStatus(scanJobRepo);

  // Health check
  const healthCheck = (): boolean => {
    try {
      db.run(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  };

  // Shutdown
  const shutdown = () => {
    logger.info("Shutting down");
    // better-sqlite3 is synchronous, no need to await
  };

  return {
    config,
    logger,
    db,
    reportRepo,
    scanJobRepo,
    scanRunner,
    ingestReport,
    getReport,
    listReports,
    compareReports,
    triggerScan,
    getScanStatus,
    healthCheck,
    shutdown,
    getAnthropicApiKey,
    setAnthropicApiKey,
  };
}

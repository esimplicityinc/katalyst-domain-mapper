import { sql } from "drizzle-orm";
import type { AppConfig } from "../config/env.js";
import { detectProvider, type LlmProvider } from "../config/env.js";
import type { Logger } from "../ports/Logger.js";
import type { ReportRepository } from "../ports/ReportRepository.js";
import type { ScanJobRepository } from "../ports/ScanJobRepository.js";
import type { ScanRunner } from "../ports/ScanRunner.js";
import type { GovernanceRepository } from "../ports/GovernanceRepository.js";
import type { TaxonomyRepository } from "../ports/TaxonomyRepository.js";
import { StructuredLogger } from "../observability/logging.js";
import { createDatabase, type DrizzleDB } from "../db/client.js";
import { ReportRepositorySQLite } from "../adapters/sqlite/ReportRepositorySQLite.js";
import { ScanJobRepositorySQLite } from "../adapters/sqlite/ScanJobRepositorySQLite.js";
import { GovernanceRepositorySQLite } from "../adapters/sqlite/GovernanceRepositorySQLite.js";
import { TaxonomyRepositorySQLite } from "../adapters/sqlite/TaxonomyRepositorySQLite.js";
import { DockerScanRunner } from "../adapters/docker/DockerScanRunner.js";
import { IngestReport } from "../usecases/report/IngestReport.js";
import { GetReport } from "../usecases/report/GetReport.js";
import { ListReports } from "../usecases/report/ListReports.js";
import { CompareReports } from "../usecases/report/CompareReports.js";
import { TriggerScan } from "../usecases/scan/TriggerScan.js";
import { GetScanStatus } from "../usecases/scan/GetScanStatus.js";
import { IngestGovernanceSnapshot } from "../usecases/governance/IngestGovernanceSnapshot.js";
import { QueryGovernanceState } from "../usecases/governance/QueryGovernanceState.js";
import { GetCapabilityCoverage } from "../usecases/governance/GetCapabilityCoverage.js";
import { GetGovernanceTrend } from "../usecases/governance/GetGovernanceTrend.js";
import { ValidateTransition } from "../usecases/governance/ValidateTransition.js";
import { IngestTaxonomySnapshot } from "../usecases/taxonomy/IngestTaxonomySnapshot.js";
import { QueryTaxonomyState } from "../usecases/taxonomy/QueryTaxonomyState.js";
import type { DomainModelRepository } from "../ports/DomainModelRepository.js";
import { DomainModelRepositorySQLite } from "../adapters/sqlite/DomainModelRepositorySQLite.js";
import { CreateDomainModel } from "../usecases/domain-model/CreateDomainModel.js";
import { GetDomainModel } from "../usecases/domain-model/GetDomainModel.js";
import { ListDomainModels } from "../usecases/domain-model/ListDomainModels.js";
import { DeleteDomainModel } from "../usecases/domain-model/DeleteDomainModel.js";
import { ManageBoundedContexts } from "../usecases/domain-model/ManageBoundedContexts.js";
import { ManageArtifacts } from "../usecases/domain-model/ManageArtifacts.js";
import { ManageGlossary } from "../usecases/domain-model/ManageGlossary.js";
import { ManageWorkflows } from "../usecases/domain-model/ManageWorkflows.js";

export interface Container {
  config: AppConfig;
  logger: Logger;
  db: DrizzleDB;
  reportRepo: ReportRepository;
  scanJobRepo: ScanJobRepository;
  scanRunner: ScanRunner;
  governanceRepo: GovernanceRepository;
  taxonomyRepo: TaxonomyRepository;
  ingestReport: IngestReport;
  getReport: GetReport;
  listReports: ListReports;
  compareReports: CompareReports;
  triggerScan: TriggerScan;
  getScanStatus: GetScanStatus;
  ingestGovernanceSnapshot: IngestGovernanceSnapshot;
  queryGovernanceState: QueryGovernanceState;
  getCapabilityCoverage: GetCapabilityCoverage;
  getGovernanceTrend: GetGovernanceTrend;
  validateTransition: ValidateTransition;
  ingestTaxonomySnapshot: IngestTaxonomySnapshot;
  queryTaxonomyState: QueryTaxonomyState;
  domainModelRepo: DomainModelRepository;
  createDomainModel: CreateDomainModel;
  getDomainModel: GetDomainModel;
  listDomainModels: ListDomainModels;
  deleteDomainModel: DeleteDomainModel;
  manageBoundedContexts: ManageBoundedContexts;
  manageArtifacts: ManageArtifacts;
  manageGlossary: ManageGlossary;
  manageWorkflows: ManageWorkflows;
  healthCheck: () => boolean;
  shutdown: () => void;
  getAnthropicApiKey: () => string | undefined;
  setAnthropicApiKey: (key: string) => void;
  getOpenrouterApiKey: () => string | undefined;
  setOpenrouterApiKey: (key: string) => void;
  /** Returns the active LLM API key (prefers OpenRouter if set, falls back to Anthropic) */
  getLlmApiKey: () => { key: string; provider: LlmProvider } | undefined;
  /** Auto-detect provider and set the appropriate key */
  setLlmApiKey: (key: string) => void;
}

export function createContainer(config: AppConfig): Container {
  const logger = new StructuredLogger({}, config.logLevel);

  // Database
  const db = createDatabase(config.databaseUrl);

  // Mutable API keys — can be set at runtime via the config endpoint
  let anthropicApiKey = config.anthropicApiKey;
  let openrouterApiKey = config.openrouterApiKey;

  const getAnthropicApiKey = () => anthropicApiKey;
  const setAnthropicApiKey = (key: string) => {
    anthropicApiKey = key;
    logger.info("Anthropic API key updated at runtime");
  };

  const getOpenrouterApiKey = () => openrouterApiKey;
  const setOpenrouterApiKey = (key: string) => {
    openrouterApiKey = key;
    logger.info("OpenRouter API key updated at runtime");
  };

  /** Returns whichever LLM key is active (prefers OpenRouter if set) */
  const getLlmApiKey = ():
    | { key: string; provider: LlmProvider }
    | undefined => {
    if (openrouterApiKey) return { key: openrouterApiKey, provider: "openrouter" };
    if (anthropicApiKey) return { key: anthropicApiKey, provider: "anthropic" };
    return undefined;
  };

  /** Auto-detect provider from key prefix and store in the right slot */
  const setLlmApiKey = (key: string) => {
    const provider = detectProvider(key);
    if (provider === "openrouter") {
      openrouterApiKey = key;
      logger.info("OpenRouter API key set via auto-detect");
    } else {
      anthropicApiKey = key;
      logger.info("Anthropic API key set via auto-detect");
    }
  };

  // Repositories (adapters)
  const reportRepo = new ReportRepositorySQLite(db);
  const scanJobRepo = new ScanJobRepositorySQLite(db);
  const governanceRepo = new GovernanceRepositorySQLite(db);
  const taxonomyRepo = new TaxonomyRepositorySQLite(db);

  // Scan runner — uses whichever LLM key is active
  const scanRunner = new DockerScanRunner(
    config.scannerImage,
    getLlmApiKey,
    logger.child({ component: "scan-runner" }),
  );

  // Use cases
  const ingestReport = new IngestReport(
    reportRepo,
    logger.child({ usecase: "ingest-report" }),
  );
  const getReport = new GetReport(reportRepo);
  const listReports = new ListReports(reportRepo);
  const compareReports = new CompareReports(reportRepo);
  const triggerScan = new TriggerScan(
    scanJobRepo,
    logger.child({ usecase: "trigger-scan" }),
  );
  const getScanStatus = new GetScanStatus(scanJobRepo);
  const ingestGovernanceSnapshot = new IngestGovernanceSnapshot(
    governanceRepo,
    logger.child({ usecase: "ingest-governance" }),
  );
  const queryGovernanceState = new QueryGovernanceState(governanceRepo);
  const getCapabilityCoverage = new GetCapabilityCoverage(governanceRepo);
  const getGovernanceTrend = new GetGovernanceTrend(governanceRepo);
  const validateTransitionUseCase = new ValidateTransition();
  const ingestTaxonomySnapshot = new IngestTaxonomySnapshot(
    taxonomyRepo,
    logger.child({ usecase: "ingest-taxonomy" }),
  );
  const queryTaxonomyState = new QueryTaxonomyState(taxonomyRepo);

  // Domain Model repository + use cases
  const domainModelRepo = new DomainModelRepositorySQLite(db);
  const createDomainModel = new CreateDomainModel(domainModelRepo);
  const getDomainModel = new GetDomainModel(domainModelRepo);
  const listDomainModels = new ListDomainModels(domainModelRepo);
  const deleteDomainModel = new DeleteDomainModel(domainModelRepo);
  const manageBoundedContexts = new ManageBoundedContexts(domainModelRepo);
  const manageArtifacts = new ManageArtifacts(domainModelRepo);
  const manageGlossary = new ManageGlossary(domainModelRepo);
  const manageWorkflows = new ManageWorkflows(domainModelRepo);

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
    governanceRepo,
    taxonomyRepo,
    ingestReport,
    getReport,
    listReports,
    compareReports,
    triggerScan,
    getScanStatus,
    ingestGovernanceSnapshot,
    queryGovernanceState,
    getCapabilityCoverage,
    getGovernanceTrend,
    validateTransition: validateTransitionUseCase,
    ingestTaxonomySnapshot,
    queryTaxonomyState,
    domainModelRepo,
    createDomainModel,
    getDomainModel,
    listDomainModels,
    deleteDomainModel,
    manageBoundedContexts,
    manageArtifacts,
    manageGlossary,
    manageWorkflows,
    healthCheck,
    shutdown,
    getAnthropicApiKey,
    setAnthropicApiKey,
    getOpenrouterApiKey,
    setOpenrouterApiKey,
    getLlmApiKey,
    setLlmApiKey,
  };
}

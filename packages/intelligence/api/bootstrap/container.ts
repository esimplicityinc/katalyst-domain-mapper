import { sql } from "drizzle-orm";
import type { AppConfig } from "../config/env.js";
import { detectProvider, type LlmProvider } from "../config/env.js";
import type { Logger } from "../ports/Logger.js";
import type { ReportRepository } from "../ports/ReportRepository.js";
import type { ScanJobRepository } from "../ports/ScanJobRepository.js";
import type { ScanRunner } from "../ports/ScanRunner.js";
import type { ScanOrchestrator } from "../ports/ScanOrchestrator.js";
import type { ChatOrchestrator } from "../ports/ChatOrchestrator.js";
import type { TaxonomyRepository } from "../ports/TaxonomyRepository.js";
import { StructuredLogger } from "../observability/logging.js";
import { createDatabase, type DrizzleDB } from "../db/client.js";
import { ReportRepositorySQLite } from "../adapters/sqlite/ReportRepositorySQLite.js";
import { ScanJobRepositorySQLite } from "../adapters/sqlite/ScanJobRepositorySQLite.js";
import { TaxonomyRepositorySQLite } from "../adapters/sqlite/TaxonomyRepositorySQLite.js";
import { DockerScanRunner } from "../adapters/docker/DockerScanRunner.js";
import {
  createScanOrchestrator,
  createChatOrchestrator,
} from "./orchestratorFactory.js";
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
import { CreateDomainModel } from "../usecases/domain-model/CreateDomainModel.js";
import { UpdateDomainModel } from "../usecases/domain-model/UpdateDomainModel.js";
import { GetDomainModel } from "../usecases/domain-model/GetDomainModel.js";
import { ListDomainModels } from "../usecases/domain-model/ListDomainModels.js";
import { DeleteDomainModel } from "../usecases/domain-model/DeleteDomainModel.js";
import { ManageBoundedContexts } from "../usecases/domain-model/ManageBoundedContexts.js";
import { ManageArtifacts } from "../usecases/domain-model/ManageArtifacts.js";
import { ManageGlossary } from "../usecases/domain-model/ManageGlossary.js";
import { ManageWorkflows } from "../usecases/domain-model/ManageWorkflows.js";
import { LintLandscape } from "../usecases/lint/LintLandscape.js";
import { ManagePracticeAreas } from "../usecases/taxonomy/ManagePracticeAreas.js";
import { ManageCompetencies } from "../usecases/taxonomy/ManageCompetencies.js";
import { ManageAdoptions } from "../usecases/taxonomy/ManageAdoptions.js";
import { ContributionUseCase } from "../usecases/contribution/ContributionUseCase.js";
import { ContributionRepositorySQLite } from "../adapters/sqlite/ContributionRepositorySQLite.js";
import { TypeRouter } from "../usecases/contribution/TypeRouter.js";
import type { ContributionRepository } from "../ports/ContributionRepository.js";
import type { FeatureFlags } from "../ports/FeatureFlags.js";
import { OpenFeatureAdapter } from "../adapters/openfeature/OpenFeatureAdapter.js";
import { initServerFlags } from "@foe/feature-flags/server";

export interface Container {
  config: AppConfig;
  logger: Logger;
  db: DrizzleDB;
  featureFlags: FeatureFlags;
  reportRepo: ReportRepository;
  scanJobRepo: ScanJobRepository;
  /** @deprecated Use scanOrchestrator instead. Kept for backward compatibility. */
  scanRunner: ScanRunner;
  /** Feature-flag-driven scan orchestrator (OpenCode or LangGraph) */
  scanOrchestrator: ScanOrchestrator;
  /** Feature-flag-driven chat orchestrator (OpenCode or LangGraph) */
  chatOrchestrator: ChatOrchestrator;
  governanceRepo: TaxonomyRepository;
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
  domainModelRepo: TaxonomyRepository;
  createDomainModel: CreateDomainModel;
  updateDomainModel: UpdateDomainModel;
  getDomainModel: GetDomainModel;
  listDomainModels: ListDomainModels;
  deleteDomainModel: DeleteDomainModel;
  manageBoundedContexts: ManageBoundedContexts;
  manageArtifacts: ManageArtifacts;
  manageGlossary: ManageGlossary;
  manageWorkflows: ManageWorkflows;
  lintLandscape: LintLandscape;
  managePracticeAreas: ManagePracticeAreas;
  manageCompetencies: ManageCompetencies;
  manageAdoptions: ManageAdoptions;
  contributionRepo: ContributionRepository;
  contributionUseCase: ContributionUseCase;
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

export async function createContainer(config: AppConfig): Promise<Container> {
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

  /** Returns whichever LLM key is active (prefers Bedrock > OpenRouter > Anthropic) */
  const getLlmApiKey = ():
    | { key: string; provider: LlmProvider }
    | undefined => {
    if (config.awsBedrockToken) return { key: config.awsBedrockToken, provider: "bedrock" };
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
  const taxonomyRepo = new TaxonomyRepositorySQLite(db);

  // Scan runner — uses whichever LLM key is active
  // @deprecated: kept for backward compatibility; prefer scanOrchestrator
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
    taxonomyRepo,
    logger.child({ usecase: "ingest-governance" }),
  );
  const queryGovernanceState = new QueryGovernanceState(taxonomyRepo);
  const getCapabilityCoverage = new GetCapabilityCoverage(taxonomyRepo);
  const getGovernanceTrend = new GetGovernanceTrend(taxonomyRepo);
  const validateTransitionUseCase = new ValidateTransition();
  const ingestTaxonomySnapshot = new IngestTaxonomySnapshot(
    taxonomyRepo,
    logger.child({ usecase: "ingest-taxonomy" }),
  );
  const queryTaxonomyState = new QueryTaxonomyState(taxonomyRepo);

  // Domain Model use cases (all use unified taxonomyRepo)
  const createDomainModel = new CreateDomainModel(taxonomyRepo);
  const updateDomainModel = new UpdateDomainModel(taxonomyRepo);
  const getDomainModel = new GetDomainModel(taxonomyRepo);
  const listDomainModels = new ListDomainModels(taxonomyRepo);
  const deleteDomainModel = new DeleteDomainModel(taxonomyRepo);
  const manageBoundedContexts = new ManageBoundedContexts(taxonomyRepo);
  const manageArtifacts = new ManageArtifacts(taxonomyRepo);
  const manageGlossary = new ManageGlossary(taxonomyRepo);
  const manageWorkflows = new ManageWorkflows(taxonomyRepo);
  const lintLandscape = new LintLandscape(taxonomyRepo as never);

  // Practice Area / Competency / Adoption use cases
  const managePracticeAreas = new ManagePracticeAreas(taxonomyRepo);
  const manageCompetencies = new ManageCompetencies(taxonomyRepo);
  const manageAdoptions = new ManageAdoptions(taxonomyRepo);

  // Contribution lifecycle
  const contributionRepo = new ContributionRepositorySQLite(db);
  const contributionUseCase = new ContributionUseCase(contributionRepo);
  const typeRouter = new TypeRouter(taxonomyRepo);
  contributionUseCase.setTypeRouter(typeRouter);

  // Feature flags — initialize OpenFeature and create adapter
  const openFeatureClient = await initServerFlags();
  const featureFlags: FeatureFlags = new OpenFeatureAdapter(openFeatureClient);

  // Orchestrators — feature-flag-driven runtime selection (OpenCode or LangGraph)
  const opencodeUrl = `http://127.0.0.1:${process.env.OPENCODE_PORT ?? 4096}`;
  const scanOrchestrator = await createScanOrchestrator({
    featureFlags,
    config,
    logger,
    getLlmApiKey,
  });
  const chatOrchestrator = await createChatOrchestrator({
    featureFlags,
    config,
    logger,
    getLlmApiKey,
    opencodeUrl,
  });

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
    featureFlags,
    reportRepo,
    scanJobRepo,
    scanRunner,
    scanOrchestrator,
    chatOrchestrator,
    governanceRepo: taxonomyRepo,
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
    domainModelRepo: taxonomyRepo,
    createDomainModel,
    updateDomainModel,
    getDomainModel,
    listDomainModels,
    deleteDomainModel,
    manageBoundedContexts,
    manageArtifacts,
    manageGlossary,
    manageWorkflows,
    lintLandscape,
    managePracticeAreas,
    manageCompetencies,
    manageAdoptions,
    contributionRepo,
    contributionUseCase,
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

import {
  pgSchema,
  text,
  integer,
  doublePrecision,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// All tables live in the "katalyst" schema (owned by the Databricks SP)
export const katalystSchema = pgSchema("katalyst");

// ── Repositories ──────────────────────────────────────────────────────────────

export const repositories = katalystSchema.table("repositories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  isMonorepo: boolean("is_monorepo").default(false),
  createdAt: text("created_at").notNull(),
  lastScannedAt: text("last_scanned_at"),
});

// ── Scans ─────────────────────────────────────────────────────────────────────

export const scans = katalystSchema.table("scans", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id),
  overallScore: doublePrecision("overall_score").notNull(),
  maturityLevel: text("maturity_level").notNull(),
  assessmentMode: text("assessment_mode").notNull(),
  executiveSummary: text("executive_summary").notNull(),
  scanDate: text("scan_date").notNull(),
  scanDuration: integer("scan_duration").notNull(),
  scannerVersion: text("scanner_version").notNull(),
  rawReport: jsonb("raw_report").$type<Record<string, unknown>>().notNull(),
  createdAt: text("created_at").notNull(),
});

// ── Dimensions ────────────────────────────────────────────────────────────────

export const dimensions = katalystSchema.table("dimensions", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  score: doublePrecision("score").notNull(),
  max: integer("max").notNull().default(100),
  confidence: text("confidence").notNull(),
  color: text("color").notNull(),
});

// ── SubScores ─────────────────────────────────────────────────────────────────

export const subscores = katalystSchema.table("subscores", {
  id: text("id").primaryKey(),
  dimensionId: text("dimension_id")
    .notNull()
    .references(() => dimensions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  score: doublePrecision("score").notNull(),
  max: integer("max").notNull().default(25),
  confidence: text("confidence").notNull(),
  evidence: jsonb("evidence").$type<string[]>().default([]),
  gaps: jsonb("gaps").$type<string[]>().default([]),
});

// ── Findings ──────────────────────────────────────────────────────────────────

export const findings = katalystSchema.table("findings", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  area: text("area").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  evidence: text("evidence").notNull(),
  impact: text("impact").notNull(),
  recommendation: text("recommendation").notNull(),
  location: text("location"),
  methods: jsonb("methods").$type<unknown[]>().default([]),
});

// ── Strengths ─────────────────────────────────────────────────────────────────

export const strengths = katalystSchema.table("strengths", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  area: text("area").notNull(),
  evidence: text("evidence").notNull(),
  caveat: text("caveat"),
});

// ── Recommendations ───────────────────────────────────────────────────────────

export const recommendations = katalystSchema.table("recommendations", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  priority: text("priority").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  impact: text("impact").notNull(),
  methods: jsonb("methods").$type<unknown[]>().default([]),
  learningPath: text("learning_path"),
});

// ── Triangle Diagnosis ────────────────────────────────────────────────────────

export const triangleDiagnoses = katalystSchema.table("triangle_diagnoses", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  cycleHealth: text("cycle_health").notNull(),
  pattern: text("pattern").notNull(),
  weakestPrinciple: text("weakest_principle").notNull(),
  intervention: text("intervention").notNull(),
  thresholds: jsonb("thresholds").$type<{
    understanding: number;
    feedback: number;
    confidence: number;
  }>(),
});

// ── Methodology ───────────────────────────────────────────────────────────────

export const methodologies = katalystSchema.table("methodologies", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  filesAnalyzed: integer("files_analyzed").notNull(),
  testFilesAnalyzed: integer("test_files_analyzed").notNull(),
  adrsAnalyzed: integer("adrs_analyzed").notNull(),
  coverageReportFound: boolean("coverage_report_found"),
  confidenceNotes: jsonb("confidence_notes").$type<string[]>().default([]),
});

// ── Domain Models ─────────────────────────────────────────────────────────────

export const domainModels = katalystSchema.table("domain_models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const boundedContexts = katalystSchema.table("bounded_contexts", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id")
    .notNull()
    .references(() => domainModels.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  responsibility: text("responsibility").notNull(),
  sourceDirectory: text("source_directory"),
  teamOwnership: text("team_ownership"),
  ownerTeam: text("owner_team"),
  status: text("status").notNull().default("draft"),
  subdomainType: text("subdomain_type"),
  contextType: text("context_type").notNull().default("internal"),
  taxonomyNode: text("taxonomy_node"),
  relationships: jsonb("relationships").$type<unknown[]>().default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const aggregates = katalystSchema.table("aggregates", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id")
    .notNull()
    .references(() => domainModels.id, { onDelete: "cascade" }),
  contextId: text("context_id")
    .notNull()
    .references(() => boundedContexts.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  rootEntity: text("root_entity").notNull(),
  entities: jsonb("entities").$type<string[]>().default([]),
  valueObjects: jsonb("value_objects").$type<string[]>().default([]),
  events: jsonb("events").$type<string[]>().default([]),
  commands: jsonb("commands").$type<string[]>().default([]),
  invariants: jsonb("invariants").$type<unknown[]>().default([]),
  sourceFile: text("source_file"),
  status: text("status").notNull().default("draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const valueObjects = katalystSchema.table("value_objects", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id")
    .notNull()
    .references(() => domainModels.id, { onDelete: "cascade" }),
  contextId: text("context_id")
    .notNull()
    .references(() => boundedContexts.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  properties: jsonb("properties").$type<unknown[]>().default([]),
  validationRules: jsonb("validation_rules").$type<string[]>().default([]),
  immutable: boolean("immutable").default(true),
  sourceFile: text("source_file"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const domainEvents = katalystSchema.table("domain_events", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id")
    .notNull()
    .references(() => domainModels.id, { onDelete: "cascade" }),
  contextId: text("context_id")
    .notNull()
    .references(() => boundedContexts.id, { onDelete: "cascade" }),
  aggregateId: text("aggregate_id").references(() => aggregates.id, {
    onDelete: "set null",
  }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  payload: jsonb("payload").$type<unknown[]>().default([]),
  consumedBy: jsonb("consumed_by").$type<string[]>().default([]),
  triggers: jsonb("triggers").$type<string[]>().default([]),
  sideEffects: jsonb("side_effects").$type<string[]>().default([]),
  sourceFile: text("source_file"),
  sourceCapabilityId: text("source_capability_id"),
  targetCapabilityIds: jsonb("target_capability_ids")
    .$type<string[]>()
    .default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const glossaryTerms = katalystSchema.table("glossary_terms", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id")
    .notNull()
    .references(() => domainModels.id, { onDelete: "cascade" }),
  contextId: text("context_id").references(() => boundedContexts.id, {
    onDelete: "set null",
  }),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  aliases: jsonb("aliases").$type<string[]>().default([]),
  examples: jsonb("examples").$type<string[]>().default([]),
  relatedTerms: jsonb("related_terms").$type<string[]>().default([]),
  source: text("source"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const domainWorkflows = katalystSchema.table("domain_workflows", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id")
    .notNull()
    .references(() => domainModels.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contextIds: jsonb("context_ids").$type<string[]>().default([]),
  states: jsonb("states").$type<unknown[]>().default([]),
  transitions: jsonb("transitions").$type<unknown[]>().default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── Chat ──────────────────────────────────────────────────────────────────────

export const chatSessions = katalystSchema.table("chat_sessions", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id").references(() => domainModels.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const chatMessages = katalystSchema.table("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

// ── Scan Jobs ─────────────────────────────────────────────────────────────────

export const scanJobs = katalystSchema.table("scan_jobs", {
  id: text("id").primaryKey(),
  repositoryPath: text("repository_path").notNull(),
  repositoryName: text("repository_name"),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  scanId: text("scan_id").references(() => scans.id),
  createdAt: text("created_at").notNull(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});

// ── Governance ────────────────────────────────────────────────────────────────

export const governanceSnapshots = katalystSchema.table(
  "governance_snapshots",
  {
    id: text("id").primaryKey(),
    project: text("project").notNull(),
    version: text("version").notNull(),
    generated: text("generated").notNull(),
    rawIndex: jsonb("raw_index")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: text("created_at").notNull(),
  },
);

export const governanceCapabilities = katalystSchema.table(
  "governance_capabilities",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => governanceSnapshots.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: text("status").notNull(),
    roadCount: integer("road_count").notNull().default(0),
    storyCount: integer("story_count").notNull().default(0),
    taxonomyNode: text("taxonomy_node"),
    capabilityId: text("capability_id"),
    description: text("description"),
    category: text("category"),
    parentCapability: text("parent_capability"),
    dependsOn: jsonb("depends_on").$type<string[]>().default([]),
  },
);

export const governanceRoadItems = katalystSchema.table(
  "governance_road_items",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => governanceSnapshots.id, { onDelete: "cascade" }),
    roadId: text("road_id").notNull(),
    title: text("title").notNull(),
    status: text("status").notNull(),
    phase: integer("phase").notNull().default(0),
    priority: text("priority").notNull().default("medium"),
    taxonomyNode: text("taxonomy_node"),
  },
);

export const governanceContexts = katalystSchema.table(
  "governance_contexts",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => governanceSnapshots.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    aggregateCount: integer("aggregate_count").notNull().default(0),
    eventCount: integer("event_count").notNull().default(0),
  },
);

export const governanceUserTypes = katalystSchema.table(
  "governance_user_types",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => governanceSnapshots.id, { onDelete: "cascade" }),
    userTypeId: text("user_type_id").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull().default("draft"),
    archetype: text("archetype").notNull().default("consumer"),
    description: text("description"),
    goals: jsonb("goals").$type<string[]>().default([]),
    painPoints: jsonb("pain_points").$type<string[]>().default([]),
    behaviors: jsonb("behaviors").$type<string[]>().default([]),
    typicalCapabilities: jsonb("typical_capabilities")
      .$type<string[]>()
      .default([]),
    technicalProfile: jsonb("technical_profile").$type<{
      skillLevel?: string;
      integrationType?: string;
      frequency?: string;
    } | null>(),
    relatedStories: jsonb("related_stories").$type<string[]>().default([]),
    relatedUserTypes: jsonb("related_user_types")
      .$type<string[]>()
      .default([]),
    storyCount: integer("story_count").notNull().default(0),
    capabilityCount: integer("capability_count").notNull().default(0),
  },
);

export const governanceUserStories = katalystSchema.table(
  "governance_user_stories",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => governanceSnapshots.id, { onDelete: "cascade" }),
    storyId: text("story_id").notNull(),
    title: text("title").notNull(),
    userType: text("user_type").notNull(),
    status: text("status").notNull().default("draft"),
    capabilities: jsonb("capabilities").$type<string[]>().default([]),
    useCases: jsonb("use_cases").$type<string[]>().default([]),
    acceptanceCriteria: jsonb("acceptance_criteria")
      .$type<string[]>()
      .default([]),
    taxonomyNode: text("taxonomy_node"),
  },
);

// ── Taxonomy ──────────────────────────────────────────────────────────────────

export const taxonomySnapshots = katalystSchema.table("taxonomy_snapshots", {
  id: text("id").primaryKey(),
  project: text("project").notNull(),
  version: text("version").notNull(),
  generated: text("generated").notNull(),
  rawSnapshot: jsonb("raw_snapshot")
    .$type<Record<string, unknown>>()
    .notNull(),
  nodeCount: integer("node_count").notNull(),
  environmentCount: integer("environment_count").notNull(),
  createdAt: text("created_at").notNull(),
});

export const taxonomyNodes = katalystSchema.table("taxonomy_nodes", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nodeType: text("node_type").notNull(),
  fqtn: text("fqtn").notNull(),
  description: text("description"),
  parentNode: text("parent_node"),
  owners: jsonb("owners").$type<string[]>().default([]),
  environments: jsonb("environments").$type<string[]>().default([]),
  labels: jsonb("labels").$type<Record<string, string>>().default({}),
  dependsOn: jsonb("depends_on").$type<string[]>().default([]),
});

export const taxonomyEnvironments = katalystSchema.table(
  "taxonomy_environments",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    parentEnvironment: text("parent_environment"),
    promotionTargets: jsonb("promotion_targets")
      .$type<string[]>()
      .default([]),
    templateReplacements: jsonb("template_replacements")
      .$type<Record<string, string>>()
      .default({}),
  },
);

export const taxonomyLayerTypes = katalystSchema.table(
  "taxonomy_layer_types",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    defaultLayerDir: text("default_layer_dir"),
  },
);

export const taxonomyCapabilities = katalystSchema.table(
  "taxonomy_capabilities",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    categories: jsonb("categories").$type<string[]>().default([]),
    dependsOn: jsonb("depends_on").$type<string[]>().default([]),
    parentCapability: text("parent_capability"),
    tag: text("tag"),
  },
);

export const taxonomyCapabilityRels = katalystSchema.table(
  "taxonomy_capability_rels",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    node: text("node").notNull(),
    relationshipType: text("relationship_type").notNull(),
    capabilities: jsonb("capabilities").$type<string[]>().default([]),
  },
);

export const taxonomyActions = katalystSchema.table("taxonomy_actions", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  actionType: text("action_type").notNull(),
  layerType: text("layer_type"),
  tags: jsonb("tags").$type<string[]>().default([]),
});

export const taxonomyStages = katalystSchema.table("taxonomy_stages", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  dependsOn: jsonb("depends_on").$type<string[]>().default([]),
});

export const taxonomyTools = katalystSchema.table("taxonomy_tools", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  actions: jsonb("actions").$type<string[]>().default([]),
});

export const taxonomyTeams = katalystSchema.table("taxonomy_teams", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  teamType: text("team_type").notNull(),
  description: text("description"),
  focusArea: text("focus_area"),
  communicationChannels: jsonb("communication_channels")
    .$type<string[]>()
    .default([]),
  ownedNodes: jsonb("owned_nodes").$type<string[]>().default([]),
});

export const taxonomyPersons = katalystSchema.table("taxonomy_persons", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  role: text("role"),
  avatarUrl: text("avatar_url"),
});

export const taxonomyTeamMemberships = katalystSchema.table(
  "taxonomy_team_memberships",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
    teamName: text("team_name").notNull(),
    personName: text("person_name").notNull(),
    role: text("role").notNull(),
  },
);

export const taxonomyLayerHealths = katalystSchema.table(
  "taxonomy_layer_healths",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
    layerNode: text("layer_node").notNull(),
    understandabilityScore: doublePrecision("understandability_score").notNull(),
    understandabilityStatus: text("understandability_status").notNull(),
    understandabilityMetrics: jsonb("understandability_metrics")
      .$type<{
        lintErrorCount: number;
        lintWarningCount: number;
        formattingViolationCount: number;
        documentationCoveragePercent: number | null;
      }>()
      .notNull(),
    understandabilityNfrIds: jsonb("understandability_nfr_ids")
      .$type<string[]>()
      .default([]),
    understandabilityAdrIds: jsonb("understandability_adr_ids")
      .$type<string[]>()
      .default([]),
    functionalityScore: doublePrecision("functionality_score").notNull(),
    functionalityStatus: text("functionality_status").notNull(),
    functionalityMetrics: jsonb("functionality_metrics")
      .$type<{
        unitTestsPassed: number;
        unitTestsFailed: number;
        unitTestsSkipped: number;
        integrationTestsPassed: number;
        integrationTestsFailed: number;
        integrationTestsSkipped: number;
        codeCoveragePercent: number | null;
      }>()
      .notNull(),
    functionalityNfrIds: jsonb("functionality_nfr_ids")
      .$type<string[]>()
      .default([]),
    functionalityAdrIds: jsonb("functionality_adr_ids")
      .$type<string[]>()
      .default([]),
    complianceScore: doublePrecision("compliance_score").notNull(),
    complianceStatus: text("compliance_status").notNull(),
    complianceMetrics: jsonb("compliance_metrics")
      .$type<{
        vulnerabilityCritical: number;
        vulnerabilityHigh: number;
        vulnerabilityMedium: number;
        vulnerabilityLow: number;
        licenseIssueCount: number;
        dependencyAuditIssueCount: number;
      }>()
      .notNull(),
    complianceNfrIds: jsonb("compliance_nfr_ids")
      .$type<string[]>()
      .default([]),
    complianceAdrIds: jsonb("compliance_adr_ids")
      .$type<string[]>()
      .default([]),
    overallScore: doublePrecision("overall_score").notNull(),
    overallStatus: text("overall_status").notNull(),
  },
);

// ── Contributions ─────────────────────────────────────────────────────────────

export const contributionItems = katalystSchema.table("contribution_items", {
  id: text("id").primaryKey(),
  itemType: text("item_type").notNull(),
  itemId: text("item_id").notNull(),
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("draft"),
  supersedes: text("supersedes"),
  supersededBy: text("superseded_by"),
  submittedBy: text("submitted_by"),
  submittedAt: text("submitted_at"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  reviewFeedback: text("review_feedback"),
  itemData: jsonb("item_data").$type<Record<string, unknown>>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const contributionAuditLog = katalystSchema.table(
  "contribution_audit_log",
  {
    id: text("id").primaryKey(),
    contribId: text("contrib_id")
      .notNull()
      .references(() => contributionItems.id),
    action: text("action").notNull(),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    actor: text("actor"),
    feedback: text("feedback"),
    timestamp: text("timestamp").notNull(),
  },
);

export const contributionVersions = katalystSchema.table(
  "contribution_versions",
  {
    id: text("id").primaryKey(),
    contribId: text("contrib_id")
      .notNull()
      .references(() => contributionItems.id),
    version: integer("version").notNull(),
    itemData: jsonb("item_data")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: text("created_at").notNull(),
  },
);

// ── Practice Areas & Adoption ─────────────────────────────────────────────────

export const practiceAreas = katalystSchema.table("practice_areas", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  labels: text("labels").notNull().default("{}"),
  owners: text("owners").notNull().default("[]"),
  dependsOn: text("depends_on").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  contribution: text("contribution").notNull().default("{}"),
  title: text("title").notNull(),
  canonical: boolean("canonical").notNull().default(false),
  pillars: text("pillars").notNull().default("[]"),
  competencies: text("competencies_list").notNull().default("[]"),
  methods: text("methods").notNull().default("[]"),
  tools: text("tools_list").notNull().default("[]"),
});

export const competencies = katalystSchema.table("competencies", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  labels: text("labels").notNull().default("{}"),
  owners: text("owners").notNull().default("[]"),
  dependsOn: text("depends_on").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  contribution: text("contribution").notNull().default("{}"),
  title: text("title").notNull(),
  practiceAreaId: text("practice_area_id").notNull(),
  competencyType: text("competency_type").notNull(),
  skills: text("skills").notNull().default("[]"),
  levelDefinitions: text("level_definitions").notNull().default("[]"),
  dependencies: text("dependencies").notNull().default("[]"),
});

export const teamAdoptions = katalystSchema.table("team_adoptions", {
  id: text("id").primaryKey(),
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  labels: text("labels").notNull().default("{}"),
  owners: text("owners").notNull().default("[]"),
  dependsOn: text("depends_on").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  contribution: text("contribution").notNull().default("{}"),
  teamName: text("team_name").notNull(),
  practiceAreaId: text("practice_area_id").notNull(),
  adoptionLevel: text("adoption_level").notNull(),
  adoptedAt: text("adopted_at").notNull(),
  lastAssessedAt: text("last_assessed_at"),
  assessedBy: text("assessed_by"),
  competencyProgress: text("competency_progress").notNull().default("[]"),
  scanEvidence: text("scan_evidence").notNull().default("[]"),
  notes: text("notes"),
});

export const individualAdoptions = katalystSchema.table(
  "individual_adoptions",
  {
    id: text("id").primaryKey(),
    snapshotId: text("snapshot_id")
      .notNull()
      .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    labels: text("labels").notNull().default("{}"),
    owners: text("owners").notNull().default("[]"),
    dependsOn: text("depends_on").notNull().default("[]"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    contribution: text("contribution").notNull().default("{}"),
    personName: text("person_name").notNull(),
    practiceAreaId: text("practice_area_id").notNull(),
    role: text("role").notNull(),
    competencyProgress: text("competency_progress").notNull().default("[]"),
    skillAssessments: text("skill_assessments").notNull().default("[]"),
    notes: text("notes"),
  },
);

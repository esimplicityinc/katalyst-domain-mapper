import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ── Repositories ──────────────────────────────────────────────────────────────

export const repositories = sqliteTable("repositories", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  url: text("url"),
  techStack: text("tech_stack", { mode: "json" }).$type<string[]>().default([]),
  isMonorepo: integer("is_monorepo", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull(), // ISO 8601
  lastScannedAt: text("last_scanned_at"),
});

// ── Scans (one per report ingestion) ──────────────────────────────────────────

export const scans = sqliteTable("scans", {
  id: text("id").primaryKey(), // UUID — same as report.id
  repositoryId: text("repository_id")
    .notNull()
    .references(() => repositories.id),
  overallScore: real("overall_score").notNull(),
  maturityLevel: text("maturity_level").notNull(), // Hypothesized | Emerging | Practicing | Optimized
  assessmentMode: text("assessment_mode").notNull(), // standard | critical
  executiveSummary: text("executive_summary").notNull(),
  scanDate: text("scan_date").notNull(), // ISO 8601
  scanDuration: integer("scan_duration").notNull(), // milliseconds
  scannerVersion: text("scanner_version").notNull(),
  rawReport: text("raw_report", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  createdAt: text("created_at").notNull(),
});

// ── Dimensions (3 per scan: feedback, understanding, confidence) ──────────────

export const dimensions = sqliteTable("dimensions", {
  id: text("id").primaryKey(), // UUID
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Feedback | Understanding | Confidence
  score: real("score").notNull(),
  max: integer("max").notNull().default(100),
  confidence: text("confidence").notNull(), // high | medium | low
  color: text("color").notNull(),
});

// ── SubScores (4 per dimension) ───────────────────────────────────────────────

export const subscores = sqliteTable("subscores", {
  id: text("id").primaryKey(), // UUID
  dimensionId: text("dimension_id")
    .notNull()
    .references(() => dimensions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  score: real("score").notNull(),
  max: integer("max").notNull().default(25),
  confidence: text("confidence").notNull(),
  evidence: text("evidence", { mode: "json" }).$type<string[]>().default([]),
  gaps: text("gaps", { mode: "json" }).$type<string[]>().default([]),
});

// ── Findings (gaps + critical failures) ───────────────────────────────────────

export const findings = sqliteTable("findings", {
  id: text("id").primaryKey(), // from report finding.id
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(), // 'gap' | 'critical_failure'
  area: text("area").notNull(),
  severity: text("severity").notNull(), // critical | high | medium | low
  title: text("title").notNull(),
  evidence: text("evidence").notNull(),
  impact: text("impact").notNull(),
  recommendation: text("recommendation").notNull(),
  location: text("location"),
  methods: text("methods", { mode: "json" }).$type<unknown[]>().default([]),
});

// ── Strengths ─────────────────────────────────────────────────────────────────

export const strengths = sqliteTable("strengths", {
  id: text("id").primaryKey(), // from report strength.id
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  area: text("area").notNull(),
  evidence: text("evidence").notNull(),
  caveat: text("caveat"),
});

// ── Recommendations ───────────────────────────────────────────────────────────

export const recommendations = sqliteTable("recommendations", {
  id: text("id").primaryKey(), // from report recommendation.id
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  priority: text("priority").notNull(), // immediate | short-term | medium-term
  title: text("title").notNull(),
  description: text("description").notNull(),
  impact: text("impact").notNull(), // high | medium | low
  methods: text("methods", { mode: "json" }).$type<unknown[]>().default([]),
  learningPath: text("learning_path"),
});

// ── Triangle Diagnosis (1 per scan) ───────────────────────────────────────────

export const triangleDiagnoses = sqliteTable("triangle_diagnoses", {
  id: text("id").primaryKey(), // UUID
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  cycleHealth: text("cycle_health").notNull(), // virtuous | at-risk | vicious
  pattern: text("pattern").notNull(),
  weakestPrinciple: text("weakest_principle").notNull(), // feedback | understanding | confidence
  intervention: text("intervention").notNull(),
  thresholds: text("thresholds", { mode: "json" }).$type<{
    understanding: number;
    feedback: number;
    confidence: number;
  }>(),
});

// ── Methodology (1 per scan) ──────────────────────────────────────────────────

export const methodologies = sqliteTable("methodologies", {
  id: text("id").primaryKey(), // UUID
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  filesAnalyzed: integer("files_analyzed").notNull(),
  testFilesAnalyzed: integer("test_files_analyzed").notNull(),
  adrsAnalyzed: integer("adrs_analyzed").notNull(),
  coverageReportFound: integer("coverage_report_found", { mode: "boolean" }),
  confidenceNotes: text("confidence_notes", { mode: "json" })
    .$type<string[]>()
    .default([]),
});

// ── Domain Models (DDD workspace) ─────────────────────────────────────────────

export const domainModels = sqliteTable("domain_models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const boundedContexts = sqliteTable("bounded_contexts", {
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
  status: text("status").notNull().default("draft"),
  subdomainType: text("subdomain_type"), // 'core' | 'supporting' | 'generic' | null
  contextType: text("context_type").notNull().default("internal"), // 'internal' | 'external-system' | 'human-process' | 'unknown'
  taxonomyNode: text("taxonomy_node"), // Optional FK to taxonomy node name
  relationships: text("relationships", { mode: "json" })
    .$type<unknown[]>()
    .default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const aggregates = sqliteTable("aggregates", {
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
  entities: text("entities", { mode: "json" }).$type<string[]>().default([]),
  valueObjects: text("value_objects", { mode: "json" })
    .$type<string[]>()
    .default([]),
  events: text("events", { mode: "json" }).$type<string[]>().default([]),
  commands: text("commands", { mode: "json" }).$type<string[]>().default([]),
  invariants: text("invariants", { mode: "json" })
    .$type<unknown[]>()
    .default([]),
  sourceFile: text("source_file"),
  status: text("status").notNull().default("draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const valueObjects = sqliteTable("value_objects", {
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
  properties: text("properties", { mode: "json" })
    .$type<unknown[]>()
    .default([]),
  validationRules: text("validation_rules", { mode: "json" })
    .$type<string[]>()
    .default([]),
  immutable: integer("immutable", { mode: "boolean" }).default(true),
  sourceFile: text("source_file"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const domainEvents = sqliteTable("domain_events", {
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
  payload: text("payload", { mode: "json" }).$type<unknown[]>().default([]),
  consumedBy: text("consumed_by", { mode: "json" })
    .$type<string[]>()
    .default([]),
  triggers: text("triggers", { mode: "json" }).$type<string[]>().default([]),
  sideEffects: text("side_effects", { mode: "json" })
    .$type<string[]>()
    .default([]),
  sourceFile: text("source_file"),
  sourceCapabilityId: text("source_capability_id"),
  targetCapabilityIds: text("target_capability_ids", { mode: "json" })
    .$type<string[]>()
    .default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const glossaryTerms = sqliteTable("glossary_terms", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id")
    .notNull()
    .references(() => domainModels.id, { onDelete: "cascade" }),
  contextId: text("context_id").references(() => boundedContexts.id, {
    onDelete: "set null",
  }),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  aliases: text("aliases", { mode: "json" }).$type<string[]>().default([]),
  examples: text("examples", { mode: "json" }).$type<string[]>().default([]),
  relatedTerms: text("related_terms", { mode: "json" })
    .$type<string[]>()
    .default([]),
  source: text("source"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── Domain Workflows (state machine / lifecycle views) ─────────────────────────

export const domainWorkflows = sqliteTable("domain_workflows", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id")
    .notNull()
    .references(() => domainModels.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contextIds: text("context_ids", { mode: "json" })
    .$type<string[]>()
    .default([]), // Bounded context IDs this workflow spans
  states: text("states", { mode: "json" }).$type<unknown[]>().default([]),
  transitions: text("transitions", { mode: "json" })
    .$type<unknown[]>()
    .default([]),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ── Chat Messages (DDD conversation history) ──────────────────────────────────

export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey(),
  domainModelId: text("domain_model_id").references(() => domainModels.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

// ── Scan Jobs (async scan tracking) ───────────────────────────────────────────

export const scanJobs = sqliteTable("scan_jobs", {
  id: text("id").primaryKey(), // UUID
  repositoryPath: text("repository_path").notNull(),
  repositoryName: text("repository_name"),
  status: text("status").notNull(), // queued | running | completed | failed
  errorMessage: text("error_message"),
  scanId: text("scan_id").references(() => scans.id), // nullable — set on completion
  createdAt: text("created_at").notNull(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
});

// ── Governance Snapshots ────────────────────────────────────────────────────

export const governanceSnapshots = sqliteTable("governance_snapshots", {
  id: text("id").primaryKey(),
  project: text("project").notNull(),
  version: text("version").notNull(),
  generated: text("generated").notNull(),
  rawIndex: text("raw_index", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  createdAt: text("created_at").notNull(),
});

export const governanceCapabilities = sqliteTable("governance_capabilities", {
  id: text("id").primaryKey(), // CAP-XXX
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => governanceSnapshots.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").notNull(),
  roadCount: integer("road_count").notNull().default(0),
  storyCount: integer("story_count").notNull().default(0),
  taxonomyNode: text("taxonomy_node"), // optional FK to taxonomy node name
});

export const governanceRoadItems = sqliteTable("governance_road_items", {
  id: text("id").primaryKey(), // composite: snapshotId + ROAD-XXX
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => governanceSnapshots.id, { onDelete: "cascade" }),
  roadId: text("road_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  phase: integer("phase").notNull().default(0),
  priority: text("priority").notNull().default("medium"),
  taxonomyNode: text("taxonomy_node"), // optional FK to taxonomy node name
});

export const governanceContexts = sqliteTable("governance_contexts", {
  id: text("id").primaryKey(), // composite: snapshotId + slug
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => governanceSnapshots.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  aggregateCount: integer("aggregate_count").notNull().default(0),
  eventCount: integer("event_count").notNull().default(0),
});

// ── Taxonomy Snapshots ─────────────────────────────────────────────────────

export const taxonomySnapshots = sqliteTable("taxonomy_snapshots", {
  id: text("id").primaryKey(), // UUID
  project: text("project").notNull(),
  version: text("version").notNull(),
  generated: text("generated").notNull(),
  rawSnapshot: text("raw_snapshot", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  nodeCount: integer("node_count").notNull(),
  environmentCount: integer("environment_count").notNull(),
  createdAt: text("created_at").notNull(),
});

export const taxonomyNodes = sqliteTable("taxonomy_nodes", {
  id: text("id").primaryKey(), // composite: snapshotId:name
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nodeType: text("node_type").notNull(), // system | subsystem | stack | layer | user | org_unit
  fqtn: text("fqtn").notNull(), // fully qualified taxonomy name
  description: text("description"),
  parentNode: text("parent_node"),
  owners: text("owners", { mode: "json" }).$type<string[]>().default([]),
  environments: text("environments", { mode: "json" })
    .$type<string[]>()
    .default([]),
  labels: text("labels", { mode: "json" })
    .$type<Record<string, string>>()
    .default({}),
  dependsOn: text("depends_on", { mode: "json" })
    .$type<string[]>()
    .default([]),
});

export const taxonomyEnvironments = sqliteTable("taxonomy_environments", {
  id: text("id").primaryKey(), // composite: snapshotId:name
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  parentEnvironment: text("parent_environment"),
  promotionTargets: text("promotion_targets", { mode: "json" })
    .$type<string[]>()
    .default([]),
  templateReplacements: text("template_replacements", { mode: "json" })
    .$type<Record<string, string>>()
    .default({}),
});

export const taxonomyLayerTypes = sqliteTable("taxonomy_layer_types", {
  id: text("id").primaryKey(), // composite: snapshotId:name
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  defaultLayerDir: text("default_layer_dir"),
});

export const taxonomyCapabilities = sqliteTable("taxonomy_capabilities", {
  id: text("id").primaryKey(), // composite: snapshotId:name
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categories: text("categories", { mode: "json" })
    .$type<string[]>()
    .default([]),
  dependsOn: text("depends_on", { mode: "json" })
    .$type<string[]>()
    .default([]),
  // Hierarchy: slug of the parent capability (null = root capability at system level)
  parentCapability: text("parent_capability"),
  // Optional display tag retained for traceability (e.g. "CAP-005")
  tag: text("tag"),
});

export const taxonomyCapabilityRels = sqliteTable("taxonomy_capability_rels", {
  id: text("id").primaryKey(), // composite: snapshotId:name
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  node: text("node").notNull(), // taxonomy node name
  relationshipType: text("relationship_type").notNull(), // supports | depends-on | implements | enables
  capabilities: text("capabilities", { mode: "json" })
    .$type<string[]>()
    .default([]),
});

export const taxonomyActions = sqliteTable("taxonomy_actions", {
  id: text("id").primaryKey(), // composite: snapshotId:name
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  actionType: text("action_type").notNull(), // shell | http | workflow
  layerType: text("layer_type"), // nullable FK to layer type name
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
});

export const taxonomyStages = sqliteTable("taxonomy_stages", {
  id: text("id").primaryKey(), // composite: snapshotId:name
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  dependsOn: text("depends_on", { mode: "json" })
    .$type<string[]>()
    .default([]),
});

export const taxonomyTools = sqliteTable("taxonomy_tools", {
  id: text("id").primaryKey(), // composite: snapshotId:name
  snapshotId: text("snapshot_id")
    .notNull()
    .references(() => taxonomySnapshots.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  actions: text("actions", { mode: "json" }).$type<string[]>().default([]),
});

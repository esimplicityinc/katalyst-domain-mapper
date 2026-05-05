/**
 * Initialize the Lakebase schema and tables.
 * Called once at server startup. Uses IF NOT EXISTS so it's idempotent.
 */
export async function initializeSchema(
  query: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>,
) {
  console.log("[db] Initializing Lakebase schema...");

  // Create the schema first — the SP must own it
  await query(`CREATE SCHEMA IF NOT EXISTS katalyst`);

  // Helper: run DDL in sequence
  const run = (sql: string) => query(sql);

  // ── Core tables (no FK dependencies) ────────────────────────────────────

  await run(`CREATE TABLE IF NOT EXISTS katalyst.repositories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    is_monorepo BOOLEAN DEFAULT false,
    created_at TEXT NOT NULL,
    last_scanned_at TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.domain_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.governance_snapshots (
    id TEXT PRIMARY KEY,
    project TEXT NOT NULL,
    version TEXT NOT NULL,
    generated TEXT NOT NULL,
    raw_index JSONB NOT NULL,
    created_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_snapshots (
    id TEXT PRIMARY KEY,
    project TEXT NOT NULL,
    version TEXT NOT NULL,
    generated TEXT NOT NULL,
    raw_snapshot JSONB NOT NULL,
    node_count INTEGER NOT NULL,
    environment_count INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`);

  // ── Scans + children ──────────────────────────────────────────────────

  await run(`CREATE TABLE IF NOT EXISTS katalyst.scans (
    id TEXT PRIMARY KEY,
    repository_id TEXT NOT NULL REFERENCES katalyst.repositories(id),
    overall_score DOUBLE PRECISION NOT NULL,
    maturity_level TEXT NOT NULL,
    assessment_mode TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    scan_date TEXT NOT NULL,
    scan_duration INTEGER NOT NULL,
    scanner_version TEXT NOT NULL,
    raw_report JSONB NOT NULL,
    created_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.dimensions (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL REFERENCES katalyst.scans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    max INTEGER NOT NULL DEFAULT 100,
    confidence TEXT NOT NULL,
    color TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.subscores (
    id TEXT PRIMARY KEY,
    dimension_id TEXT NOT NULL REFERENCES katalyst.dimensions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    max INTEGER NOT NULL DEFAULT 25,
    confidence TEXT NOT NULL,
    evidence JSONB DEFAULT '[]'::jsonb,
    gaps JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.findings (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL REFERENCES katalyst.scans(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    area TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    evidence TEXT NOT NULL,
    impact TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    location TEXT,
    methods JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.strengths (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL REFERENCES katalyst.scans(id) ON DELETE CASCADE,
    area TEXT NOT NULL,
    evidence TEXT NOT NULL,
    caveat TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.recommendations (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL REFERENCES katalyst.scans(id) ON DELETE CASCADE,
    priority TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact TEXT NOT NULL,
    methods JSONB DEFAULT '[]'::jsonb,
    learning_path TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.triangle_diagnoses (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL REFERENCES katalyst.scans(id) ON DELETE CASCADE,
    cycle_health TEXT NOT NULL,
    pattern TEXT NOT NULL,
    weakest_principle TEXT NOT NULL,
    intervention TEXT NOT NULL,
    thresholds JSONB
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.methodologies (
    id TEXT PRIMARY KEY,
    scan_id TEXT NOT NULL REFERENCES katalyst.scans(id) ON DELETE CASCADE,
    files_analyzed INTEGER NOT NULL,
    test_files_analyzed INTEGER NOT NULL,
    adrs_analyzed INTEGER NOT NULL,
    coverage_report_found BOOLEAN,
    confidence_notes JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.scan_jobs (
    id TEXT PRIMARY KEY,
    repository_path TEXT NOT NULL,
    repository_name TEXT,
    status TEXT NOT NULL,
    error_message TEXT,
    scan_id TEXT REFERENCES katalyst.scans(id),
    created_at TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT
  )`);

  // ── Domain Model children ─────────────────────────────────────────────

  await run(`CREATE TABLE IF NOT EXISTS katalyst.bounded_contexts (
    id TEXT PRIMARY KEY,
    domain_model_id TEXT NOT NULL REFERENCES katalyst.domain_models(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    responsibility TEXT NOT NULL,
    source_directory TEXT,
    team_ownership TEXT,
    owner_team TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    subdomain_type TEXT,
    context_type TEXT NOT NULL DEFAULT 'internal',
    taxonomy_node TEXT,
    relationships JSONB DEFAULT '[]'::jsonb,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.aggregates (
    id TEXT PRIMARY KEY,
    domain_model_id TEXT NOT NULL REFERENCES katalyst.domain_models(id) ON DELETE CASCADE,
    context_id TEXT NOT NULL REFERENCES katalyst.bounded_contexts(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    root_entity TEXT NOT NULL,
    entities JSONB DEFAULT '[]'::jsonb,
    value_objects JSONB DEFAULT '[]'::jsonb,
    events JSONB DEFAULT '[]'::jsonb,
    commands JSONB DEFAULT '[]'::jsonb,
    invariants JSONB DEFAULT '[]'::jsonb,
    source_file TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.value_objects (
    id TEXT PRIMARY KEY,
    domain_model_id TEXT NOT NULL REFERENCES katalyst.domain_models(id) ON DELETE CASCADE,
    context_id TEXT NOT NULL REFERENCES katalyst.bounded_contexts(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    properties JSONB DEFAULT '[]'::jsonb,
    validation_rules JSONB DEFAULT '[]'::jsonb,
    immutable BOOLEAN DEFAULT true,
    source_file TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.domain_events (
    id TEXT PRIMARY KEY,
    domain_model_id TEXT NOT NULL REFERENCES katalyst.domain_models(id) ON DELETE CASCADE,
    context_id TEXT NOT NULL REFERENCES katalyst.bounded_contexts(id) ON DELETE CASCADE,
    aggregate_id TEXT REFERENCES katalyst.aggregates(id) ON DELETE SET NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    payload JSONB DEFAULT '[]'::jsonb,
    consumed_by JSONB DEFAULT '[]'::jsonb,
    triggers JSONB DEFAULT '[]'::jsonb,
    side_effects JSONB DEFAULT '[]'::jsonb,
    source_file TEXT,
    source_capability_id TEXT,
    target_capability_ids JSONB DEFAULT '[]'::jsonb,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.glossary_terms (
    id TEXT PRIMARY KEY,
    domain_model_id TEXT NOT NULL REFERENCES katalyst.domain_models(id) ON DELETE CASCADE,
    context_id TEXT REFERENCES katalyst.bounded_contexts(id) ON DELETE SET NULL,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    aliases JSONB DEFAULT '[]'::jsonb,
    examples JSONB DEFAULT '[]'::jsonb,
    related_terms JSONB DEFAULT '[]'::jsonb,
    source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.domain_workflows (
    id TEXT PRIMARY KEY,
    domain_model_id TEXT NOT NULL REFERENCES katalyst.domain_models(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    context_ids JSONB DEFAULT '[]'::jsonb,
    states JSONB DEFAULT '[]'::jsonb,
    transitions JSONB DEFAULT '[]'::jsonb,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  // ── Chat ────────────────────────────────────────────────────────────────

  await run(`CREATE TABLE IF NOT EXISTS katalyst.chat_sessions (
    id TEXT PRIMARY KEY,
    domain_model_id TEXT REFERENCES katalyst.domain_models(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES katalyst.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);

  // ── Governance children ─────────────────────────────────────────────────

  await run(`CREATE TABLE IF NOT EXISTS katalyst.governance_capabilities (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.governance_snapshots(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    road_count INTEGER NOT NULL DEFAULT 0,
    story_count INTEGER NOT NULL DEFAULT 0,
    taxonomy_node TEXT,
    capability_id TEXT,
    description TEXT,
    category TEXT,
    parent_capability TEXT,
    depends_on JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.governance_road_items (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.governance_snapshots(id) ON DELETE CASCADE,
    road_id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    phase INTEGER NOT NULL DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'medium',
    taxonomy_node TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.governance_contexts (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.governance_snapshots(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    aggregate_count INTEGER NOT NULL DEFAULT 0,
    event_count INTEGER NOT NULL DEFAULT 0
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.governance_user_types (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.governance_snapshots(id) ON DELETE CASCADE,
    user_type_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    archetype TEXT NOT NULL DEFAULT 'consumer',
    description TEXT,
    goals JSONB DEFAULT '[]'::jsonb,
    pain_points JSONB DEFAULT '[]'::jsonb,
    behaviors JSONB DEFAULT '[]'::jsonb,
    typical_capabilities JSONB DEFAULT '[]'::jsonb,
    technical_profile JSONB,
    related_stories JSONB DEFAULT '[]'::jsonb,
    related_user_types JSONB DEFAULT '[]'::jsonb,
    story_count INTEGER NOT NULL DEFAULT 0,
    capability_count INTEGER NOT NULL DEFAULT 0
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.governance_user_stories (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.governance_snapshots(id) ON DELETE CASCADE,
    story_id TEXT NOT NULL,
    title TEXT NOT NULL,
    user_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    capabilities JSONB DEFAULT '[]'::jsonb,
    use_cases JSONB DEFAULT '[]'::jsonb,
    acceptance_criteria JSONB DEFAULT '[]'::jsonb,
    taxonomy_node TEXT
  )`);

  // ── Taxonomy children ───────────────────────────────────────────────────

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_nodes (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    node_type TEXT NOT NULL,
    fqtn TEXT NOT NULL,
    description TEXT,
    parent_node TEXT,
    owners JSONB DEFAULT '[]'::jsonb,
    environments JSONB DEFAULT '[]'::jsonb,
    labels JSONB DEFAULT '{}'::jsonb,
    depends_on JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_environments (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    parent_environment TEXT,
    promotion_targets JSONB DEFAULT '[]'::jsonb,
    template_replacements JSONB DEFAULT '{}'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_layer_types (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    default_layer_dir TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_capabilities (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    categories JSONB DEFAULT '[]'::jsonb,
    depends_on JSONB DEFAULT '[]'::jsonb,
    parent_capability TEXT,
    tag TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_capability_rels (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    node TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    capabilities JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_actions (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    layer_type TEXT,
    tags JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_stages (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    depends_on JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_tools (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    actions JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_teams (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    team_type TEXT NOT NULL,
    description TEXT,
    focus_area TEXT,
    communication_channels JSONB DEFAULT '[]'::jsonb,
    owned_nodes JSONB DEFAULT '[]'::jsonb
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_persons (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT,
    role TEXT,
    avatar_url TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_team_memberships (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    person_name TEXT NOT NULL,
    role TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.taxonomy_layer_healths (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    layer_node TEXT NOT NULL,
    understandability_score DOUBLE PRECISION NOT NULL,
    understandability_status TEXT NOT NULL,
    understandability_metrics JSONB NOT NULL,
    understandability_nfr_ids JSONB DEFAULT '[]'::jsonb,
    understandability_adr_ids JSONB DEFAULT '[]'::jsonb,
    functionality_score DOUBLE PRECISION NOT NULL,
    functionality_status TEXT NOT NULL,
    functionality_metrics JSONB NOT NULL,
    functionality_nfr_ids JSONB DEFAULT '[]'::jsonb,
    functionality_adr_ids JSONB DEFAULT '[]'::jsonb,
    compliance_score DOUBLE PRECISION NOT NULL,
    compliance_status TEXT NOT NULL,
    compliance_metrics JSONB NOT NULL,
    compliance_nfr_ids JSONB DEFAULT '[]'::jsonb,
    compliance_adr_ids JSONB DEFAULT '[]'::jsonb,
    overall_score DOUBLE PRECISION NOT NULL,
    overall_status TEXT NOT NULL
  )`);

  // ── Contributions ───────────────────────────────────────────────────────

  await run(`CREATE TABLE IF NOT EXISTS katalyst.contribution_items (
    id TEXT PRIMARY KEY,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'draft',
    supersedes TEXT,
    superseded_by TEXT,
    submitted_by TEXT,
    submitted_at TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    review_feedback TEXT,
    item_data JSONB,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.contribution_audit_log (
    id TEXT PRIMARY KEY,
    contrib_id TEXT NOT NULL REFERENCES katalyst.contribution_items(id),
    action TEXT NOT NULL,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    actor TEXT,
    feedback TEXT,
    "timestamp" TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.contribution_versions (
    id TEXT PRIMARY KEY,
    contrib_id TEXT NOT NULL REFERENCES katalyst.contribution_items(id),
    version INTEGER NOT NULL,
    item_data JSONB NOT NULL,
    created_at TEXT NOT NULL
  )`);

  // ── Practice Areas & Adoption ───────────────────────────────────────────

  await run(`CREATE TABLE IF NOT EXISTS katalyst.practice_areas (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    labels TEXT NOT NULL DEFAULT '{}',
    owners TEXT NOT NULL DEFAULT '[]',
    depends_on TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    contribution TEXT NOT NULL DEFAULT '{}',
    title TEXT NOT NULL,
    canonical BOOLEAN NOT NULL DEFAULT false,
    pillars TEXT NOT NULL DEFAULT '[]',
    competencies_list TEXT NOT NULL DEFAULT '[]',
    methods TEXT NOT NULL DEFAULT '[]',
    tools_list TEXT NOT NULL DEFAULT '[]'
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.competencies (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    labels TEXT NOT NULL DEFAULT '{}',
    owners TEXT NOT NULL DEFAULT '[]',
    depends_on TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    contribution TEXT NOT NULL DEFAULT '{}',
    title TEXT NOT NULL,
    practice_area_id TEXT NOT NULL,
    competency_type TEXT NOT NULL,
    skills TEXT NOT NULL DEFAULT '[]',
    level_definitions TEXT NOT NULL DEFAULT '[]',
    dependencies TEXT NOT NULL DEFAULT '[]'
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.team_adoptions (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    labels TEXT NOT NULL DEFAULT '{}',
    owners TEXT NOT NULL DEFAULT '[]',
    depends_on TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    contribution TEXT NOT NULL DEFAULT '{}',
    team_name TEXT NOT NULL,
    practice_area_id TEXT NOT NULL,
    adoption_level TEXT NOT NULL,
    adopted_at TEXT NOT NULL,
    last_assessed_at TEXT,
    assessed_by TEXT,
    competency_progress TEXT NOT NULL DEFAULT '[]',
    scan_evidence TEXT NOT NULL DEFAULT '[]',
    notes TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS katalyst.individual_adoptions (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES katalyst.taxonomy_snapshots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    labels TEXT NOT NULL DEFAULT '{}',
    owners TEXT NOT NULL DEFAULT '[]',
    depends_on TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    contribution TEXT NOT NULL DEFAULT '{}',
    person_name TEXT NOT NULL,
    practice_area_id TEXT NOT NULL,
    role TEXT NOT NULL,
    competency_progress TEXT NOT NULL DEFAULT '[]',
    skill_assessments TEXT NOT NULL DEFAULT '[]',
    notes TEXT
  )`);

  console.log("[db] Schema initialization complete (41 tables)");
}

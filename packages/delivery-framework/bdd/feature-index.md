---
title: Feature Index
---

# Feature Index

All BDD feature files organized by capability context and test layer.

## Organization

```
stack-tests/features/
  api/
    reporting/        # CAP-001: FOE Report Generation
    governance/       # CAP-002: Governance Validation API
    scanning/         # CAP-004: Repository Scanning
    jira/             # CAP-005: Jira Bidirectional Integration
    confluence/       # CAP-006: Confluence Bidirectional Integration
    github/           # CAP-007: GitHub Integration (Feedback, Understanding, Confidence)
    streaming/        # CAP-008: Real-time SSE Streaming
    domain-models/    # CAP-009: DDD Domain Modeling API
    (root)            # Existing health, reports, repositories, scans, config
  ui/
    reporting/        # CAP-001: Report viewer & dashboards
    (root)            # Existing UI examples
  hybrid/
    governance/       # CAP-002 + CAP-003: Cross-layer governance flows
    integrations/     # CAP-005 + CAP-006: Cross-layer Jira & Confluence flows
    streaming/        # CAP-008: Real-time SSE Streaming E2E
    domain-models/    # CAP-009: DDD Domain Modeling E2E
    (root)            # Existing hybrid examples
```

## Tagging Convention

Every feature file uses these tag layers:

| Tag Type | Examples | Purpose |
|----------|---------|---------|
| **Layer** | `@api`, `@ui`, `@hybrid` | Determines which steps are available |
| **Capability Context** | `@report-gen`, `@gov-validation`, `@repo-scanning` | Groups by system capability |
| **Roadmap** | `@ROAD-001`, `@ROAD-005` | Links to road item being tested |
| **Capability** | `@CAP-001`, `@CAP-002` | Links to capability definition |
| **Lifecycle** | `@wip`, `@smoke`, `@e2e` | Controls test execution |

Scenarios tagged `@wip` are excluded from normal test runs. They represent BDD-first scenarios for not-yet-implemented endpoints.

---

## API Features

### Existing (Runnable)

| File | Feature | Scenarios | Tags |
|------|---------|-----------|------|
| `api/00_api_examples.feature` | Health & Readiness | 2 | `@api` |
| `api/01_reports.feature` | Report Management (CRUD) | 5 | `@api` |
| `api/02_repositories.feature` | Repository Tracking | 5 | `@api` |
| `api/03_scans.feature` | Scan Jobs | 6 | `@api` |
| `api/04_config.feature` | Configuration | 4 | `@api` |

### New: Reporting (CAP-001)

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/reporting/05_foe_dimension_scores.feature` | Dimension Scores & Triangle | 3 | US-001 | `@api @report-gen @ROAD-001 @CAP-001` |
| `api/reporting/06_report_comparison.feature` | Report Comparison | 4 | US-030 | `@api @report-gen @ROAD-001 @CAP-001` |
| `api/reporting/07_report_raw_retrieval.feature` | Raw Report Retrieval | 3 | US-001 | `@api @report-gen @ROAD-001 @CAP-001` |
| `api/reporting/08_report_filtering_pagination.feature` | Report Filtering & Pagination | 6 | US-031 | `@api @report-gen @ROAD-001 @CAP-001` |

### New: Governance (CAP-002) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/governance/01_governance_ingest.feature` | Governance Index Ingestion | 4 | US-005 | `@api @gov-validation @ROAD-005 @CAP-002 @wip` |
| `api/governance/02_governance_coverage.feature` | Coverage & Trend Tracking | 6 | US-002, US-005 | `@api @gov-validation @ROAD-005 @CAP-002 @wip` |
| `api/governance/03_governance_state_machine.feature` | State Machine Transitions | 1 (9 examples) | US-009 | `@api @gov-validation @ROAD-002 @CAP-002 @wip` |

### New: Scanning (CAP-004) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/scanning/01_scan_governance_scoring.feature` | Governance Dimension Scoring | 2 | US-006, US-011 | `@api @repo-scanning @ROAD-006 @CAP-004 @CAP-002 @wip` |

### New: Jira Integration (CAP-005) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/jira/01_jira_sync.feature` | Jira Bidirectional Sync | 7 | US-016, US-017 | `@api @jira-integration @ROAD-010 @CAP-005 @wip` |

### New: Confluence Integration (CAP-006) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/confluence/01_confluence_sync.feature` | Confluence Bidirectional Sync | 9 | US-018, US-019 | `@api @confluence-integration @ROAD-011 @CAP-006 @wip` |

### New: GitHub Integration (CAP-007) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/github/01_github_feedback.feature` | GitHub Feedback Dimension | 7 | US-020, US-021 | `@api @github-integration @ROAD-012 @CAP-007 @wip` |
| `api/github/02_github_understanding.feature` | GitHub Understanding Dimension | 7 | US-022, US-023 | `@api @github-integration @ROAD-013 @CAP-007 @wip` |
| `api/github/03_github_confidence.feature` | GitHub Confidence Dimension | 7 | US-024, US-025 | `@api @github-integration @ROAD-014 @CAP-007 @wip` |

### New: Streaming (CAP-008) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/streaming/01_sse_streaming.feature` | SSE Streaming for Agent Responses | 8 | US-026 | `@api @sse-streaming @ROAD-015 @CAP-008 @wip` |

### New: DDD Domain Modeling (CAP-009)

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/domain-models/01_domain_model_crud.feature` | Domain Model CRUD | 9 | US-028 | `@api @ddd-modeling @ROAD-008 @CAP-009` |
| `api/domain-models/02_bounded_context_management.feature` | Bounded Context Management | 6 | US-028 | `@api @ddd-modeling @ROAD-008 @CAP-009` |
| `api/domain-models/03_domain_artifacts.feature` | Domain Artifacts (Aggregates, Events, VOs, Glossary) | 8 | US-028 | `@api @ddd-modeling @ROAD-008 @CAP-009` |

---

## UI Features

### Existing (Runnable)

| File | Feature | Scenarios | Tags |
|------|---------|-----------|------|
| `ui/00_ui_examples.feature` | Report Viewer Basics | 2 | `@ui` |

### New: Reporting (CAP-001)

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `ui/reporting/01_report_upload_viewer.feature` | Report Upload & Viewer | 2 runnable + 2 @wip | US-001, US-010 | `@ui @report-gen @ROAD-001 @CAP-001` |

---

## Hybrid Features

### Existing (Runnable)

| File | Feature | Scenarios | Tags |
|------|---------|-----------|------|
| `hybrid/00_hybrid_examples.feature` | E2E Ingest & Verify | 1 | `@hybrid` |

### New: Governance (CAP-002 + CAP-003) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `hybrid/governance/01_governance_e2e.feature` | Governance E2E Flow | 2 | US-002, US-014 | `@hybrid @gov-validation @ROAD-005 @ROAD-008 @CAP-002 @CAP-003 @wip` |

### New: Integrations (CAP-005 + CAP-006) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `hybrid/integrations/01_jira_e2e.feature` | Jira Integration E2E | 2 | US-017 | `@hybrid @jira-integration @ROAD-010 @CAP-005 @CAP-004 @wip` |
| `hybrid/integrations/01_confluence_e2e.feature` | Confluence Integration E2E | 2 | US-018, US-019 | `@hybrid @confluence-integration @ROAD-011 @CAP-006 @CAP-004 @wip` |
| `hybrid/integrations/02_github_feedback_e2e.feature` | GitHub Feedback E2E | 2 | US-020, US-021 | `@hybrid @github-integration @ROAD-012 @CAP-007 @CAP-004 @wip` |
| `hybrid/integrations/02_github_understanding_e2e.feature` | GitHub Understanding E2E | 2 | US-022, US-023 | `@hybrid @github-integration @ROAD-013 @CAP-007 @CAP-004 @wip` |
| `hybrid/integrations/02_github_confidence_e2e.feature` | GitHub Confidence E2E | 2 | US-024, US-025 | `@hybrid @github-integration @ROAD-014 @CAP-007 @CAP-004 @wip` |

### New: Streaming (CAP-008) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `hybrid/streaming/01_sse_e2e.feature` | SSE Streaming E2E | 2 | US-026, US-027 | `@hybrid @sse-streaming @ROAD-015 @CAP-008 @wip` |

### New: DDD Domain Modeling (CAP-009) -- @wip

| File | Feature | Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `hybrid/domain-models/01_domain_model_e2e.feature` | DDD Domain Model E2E | 2 | US-028, US-029 | `@hybrid @ddd-modeling @ROAD-008 @ROAD-009 @CAP-009 @wip` |

---

## User Story Coverage

| User Story | Feature Files | Layer | Status |
|-----------|--------------|-------|--------|
| US-001: View FOE Scan Report | `05_foe_dimension_scores`, `01_report_upload_viewer` | API + UI | Runnable |
| US-002: Track Governance Health | `02_governance_coverage`, `01_governance_e2e` | API + Hybrid | @wip |
| US-003: Governance Zod Schemas | -- | Unit tests in @foe/schemas | N/A |
| US-004: Build Governance Index | -- | Integration tests in @foe/field-guide-tools | N/A |
| US-005: API Governance Ingest | `01_governance_ingest`, `02_governance_coverage` | API | @wip |
| US-006: Scanner Docker Build | `01_scan_governance_scoring` | API | @wip |
| US-007: DDD Artifact Schemas | -- | Unit tests in @foe/schemas | N/A |
| US-008: Validate Before Commit | -- | CLI integration tests | N/A |
| US-009: Advance Governance Gates | `03_governance_state_machine` | API | @wip |
| US-010: Governance Dashboard | `01_report_upload_viewer` (2 scenarios) | UI | @wip |
| US-011: Governance Scan Scoring | `01_scan_governance_scoring` | API | @wip |
| US-012: Author DDD Model Docs | -- | Documentation + validation | N/A |
| US-013: Validate Frontmatter | -- | CLI integration tests | N/A |
| US-014: Import Framework | `01_governance_e2e` | Hybrid | @wip |
| US-015: CI Governance Validation | -- | CI pipeline tests | N/A |
| US-016: Sync Artifacts to Jira | `01_jira_sync` | API | @wip |
| US-017: Import Jira Metrics | `01_jira_sync`, `01_jira_e2e` | API + Hybrid | @wip |
| US-018: Sync Docs to Confluence | `01_confluence_sync`, `01_confluence_e2e` | API + Hybrid | @wip |
| US-019: Import Confluence Content | `01_confluence_sync`, `01_confluence_e2e` | API + Hybrid | @wip |
| US-020: Import GitHub Actions Metrics | `01_github_feedback`, `02_github_feedback_e2e` | API + Hybrid | @wip |
| US-021: Track Deployment Frequency | `01_github_feedback`, `02_github_feedback_e2e` | API + Hybrid | @wip |
| US-022: Import GitHub Docs | `02_github_understanding`, `02_github_understanding_e2e` | API + Hybrid | @wip |
| US-023: Publish Governance to GitHub | `02_github_understanding`, `02_github_understanding_e2e` | API + Hybrid | @wip |
| US-024: Import GitHub Quality Signals | `03_github_confidence`, `02_github_confidence_e2e` | API + Hybrid | @wip |
| US-025: Branch Protection & Security | `03_github_confidence`, `02_github_confidence_e2e` | API + Hybrid | @wip |
| US-026: Stream Agent Responses via SSE | `01_sse_streaming`, `01_sse_e2e` | API + Hybrid | @wip |
| US-027: View Live Agent Progress in UI | `01_sse_e2e` | Hybrid | @wip |
| US-028: Manage DDD Domain Models via API | `01_domain_model_crud`, `02_bounded_context_management`, `03_domain_artifacts`, `01_domain_model_e2e` | API + Hybrid | Runnable (API) / @wip (Hybrid) |
| US-029: View Domain Model in Context Map UI | `01_domain_model_e2e` | Hybrid | @wip |
| US-030: Compare FOE Reports | `06_report_comparison` | API | Runnable |
| US-031: Filter & Paginate Reports | `08_report_filtering_pagination` | API | Runnable |
| US-032: Configure API Key & Scanner | `04_config` | API | Runnable |

**Summary**: 27 of 32 user stories have BDD feature coverage. The remaining 5 (US-003, US-004, US-007, US-008, US-012, US-013, US-015) are tooling/schema stories tested via unit and integration tests rather than BDD.

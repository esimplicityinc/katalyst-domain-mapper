---
title: Feature Index
sidebar_label: Feature Index
---

# Feature Index

All BDD feature files organized by test layer. Generated from the actual `.feature` files on disk in `stack-tests/features/`.

## Summary

| Layer | Files | ~Total Scenarios |
|-------|-------|-----------------|
| API | 24 | ~138 |
| UI | 6 | ~91 |
| Hybrid | 11 | ~31 |
| **Total** | **41** | **~260** |

## Tagging Convention

Every feature file uses these tag layers:

| Tag Type | Examples | Purpose |
|----------|---------|---------|
| **Layer** | `@api`, `@ui`, `@hybrid` | Determines which steps are available |
| **Capability Context** | `@report-gen`, `@feature-flags`, `@chat`, `@landscape` | Groups by system capability |
| **Roadmap** | `@ROAD-001`, `@ROAD-044` | Links to road item being tested |
| **Capability** | `@CAP-001`, `@CAP-027` | Links to capability definition |
| **Lifecycle** | `@wip`, `@smoke`, `@e2e`, `@detail`, `@error` | Controls test execution |

Scenarios tagged `@wip` are excluded from normal test runs. They represent BDD-first scenarios for not-yet-implemented endpoints.

---

## API Layer Features

### Core (Root-Level)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/00_api_examples.feature` | FOE API Health & Readiness | `@api` | 2 |
| `api/01_reports.feature` | FOE Report Management | `@api` | 5 |
| `api/02_repositories.feature` | FOE Repository Tracking | `@api` | 5 |
| `api/03_scans.feature` | FOE Scan Jobs | `@api` | 6 |
| `api/04_config.feature` | FOE API Configuration | `@api` | 4 |

### Reporting (CAP-001)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/reporting/05_foe_dimension_scores.feature` | FOE Report Dimension Scores & Cognitive Triangle | `@api @report-gen @ROAD-001 @CAP-001` | 3 |
| `api/reporting/06_report_comparison.feature` | FOE Report Comparison | `@api @report-gen @ROAD-001 @CAP-001` | 4 |
| `api/reporting/07_report_raw_retrieval.feature` | FOE Report Raw Retrieval | `@api @report-gen @ROAD-001 @CAP-001` | 3 |
| `api/reporting/08_report_filtering_pagination.feature` | FOE Report Filtering & Pagination | `@api @report-gen @ROAD-001 @CAP-001` | 6 |

### Scanning (CAP-004) — `@wip`

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/scanning/01_scan_governance_scoring.feature` | Scanner Governance Dimension Scoring | `@api @repo-scanning @ROAD-006 @CAP-004 @CAP-002 @wip` | 2 |

### Orchestrator

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/orchestrator/01_orchestrator_runtime.feature` | Agent Orchestrator Runtime Switching | `@api @orchestrator` | 12 |

### Taxonomy (CAP-002)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/taxonomy/01_taxonomy_teams.feature` | Taxonomy Teams and Persons API | `@api @taxonomy-teams` | 6 |
| `api/taxonomy/02_taxonomy_contribution_lifecycle.feature` | Taxonomy Contribution Lifecycle | `@api @taxonomy @CAP-002` | 5 |

### Landscape (CAP-023, CAP-024)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/landscape/01_landscape_graph.feature` | Business Landscape Graph API | `@api @landscape @ROAD-044 @CAP-023` | 7 |
| `api/landscape/02_landscape_lint.feature` | Landscape Domain Linter API | `@api @landscape-lint @ROAD-044 @CAP-024` | 6 |

### Feature Flags (CAP-028)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/flags/01_feature_flags.feature` | Feature Flag API | `@api @feature-flags @CAP-028` | 6 |

### Chat (CAP-027)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/chat/01_chat_sessions.feature` | AI Chat Session Management | `@api @chat @CAP-027` | 5 |

### Layer Health (CAP-031) — `@wip`

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/layer-health/01_layer_health.feature` | Layer Health API | `@api @layer-health @CAP-031 @wip` | 5 |

### Jira Integration (CAP-005) — `@wip`

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/jira/01_jira_sync.feature` | Jira Bidirectional Sync | `@api @jira-integration @ROAD-010 @CAP-005 @wip` | 7 |

### Confluence Integration (CAP-006) — `@wip`

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/confluence/01_confluence_sync.feature` | Confluence Bidirectional Sync | `@api @confluence-integration @ROAD-011 @CAP-006 @wip` | 9 |

### GitHub Integration (CAP-007) — `@wip`

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/github/01_github_feedback.feature` | GitHub Feedback Dimension Integration | `@api @github-integration @ROAD-012 @CAP-007 @wip` | 7 |
| `api/github/02_github_understanding.feature` | GitHub Understanding Dimension Integration | `@api @github-integration @ROAD-013 @CAP-007 @wip` | 7 |
| `api/github/03_github_confidence.feature` | GitHub Confidence Dimension Integration | `@api @github-integration @ROAD-014 @CAP-007 @wip` | 7 |

### Streaming (CAP-008) — `@wip`

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `api/streaming/01_sse_streaming.feature` | SSE Streaming for Agent Responses | `@api @sse-streaming @ROAD-015 @CAP-008 @wip` | 8 |

---

## UI Layer Features

### Root-Level

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `ui/00_ui_examples.feature` | FOE Web UI - Report Viewer | `@ui` | 2 |
| `ui/web-app-lifecycle-navigation.feature` | Web App Lifecycle Navigation (ROAD-040) | `@ui @ROAD-040` | 27 |
| `ui/navigation-restructure.feature` | Lifecycle-Oriented Navigation Restructure | `@wip @ui @ROAD-029` | 30 |

### Reporting (CAP-001)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `ui/reporting/01_report_upload_viewer.feature` | FOE Report Upload & Viewer | `@hybrid @report-gen @ROAD-001 @CAP-001` | 4 |
| `ui/reporting/02_foe_project_browser.feature` | FOE Project Browser & Persistent Report Selection | `@ui @foe-scanner @ROAD-030 @CAP-001` | 24 |

### Domain Model

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `ui/domain-model/05_context_map_diagram.feature` | Interactive Context Map Diagram | `@hybrid @ddd-modeling @ROAD-016` | 4 |

---

## Hybrid Layer Features

### Root-Level

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `hybrid/00_hybrid_examples.feature` | FOE End-to-End - Ingest Report and View | `@hybrid` | 1 |

### Chat (CAP-027)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `hybrid/chat/01_chat_e2e.feature` | AI Chat Component E2E | `@hybrid @chat @CAP-027` | 4 |

### Architecture (CAP-025)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `hybrid/architecture/01_architecture_ui.feature` | Architecture Management UI E2E | `@hybrid @architecture @CAP-025` | 5 |

### Landscape (CAP-023)

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `hybrid/landscape/01_landscape_visualization_e2e.feature` | Business Landscape Visualization E2E | `@hybrid @landscape @ROAD-044 @CAP-023` | 6 |
| `hybrid/landscape/02_landscape_v2_layout.feature` | Landscape v2 Zoned Layout | `@hybrid @landscape @CAP-023 @wip` | 3 |

### Integrations (CAP-005 + CAP-006 + CAP-007) — `@wip`

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `hybrid/integrations/01_jira_e2e.feature` | Jira Integration End-to-End | `@hybrid @jira-integration @ROAD-010 @CAP-005 @CAP-004 @wip` | 2 |
| `hybrid/integrations/01_confluence_e2e.feature` | Confluence Integration End-to-End | `@hybrid @confluence-integration @ROAD-011 @CAP-006 @CAP-004 @wip` | 2 |
| `hybrid/integrations/02_github_feedback_e2e.feature` | GitHub Feedback Integration End-to-End | `@hybrid @github-integration @ROAD-012 @CAP-007 @CAP-004 @wip` | 2 |
| `hybrid/integrations/02_github_understanding_e2e.feature` | GitHub Understanding Integration End-to-End | `@hybrid @github-integration @ROAD-013 @CAP-007 @CAP-004 @wip` | 2 |
| `hybrid/integrations/02_github_confidence_e2e.feature` | GitHub Confidence Integration End-to-End | `@hybrid @github-integration @ROAD-014 @CAP-007 @CAP-004 @wip` | 2 |

### Streaming (CAP-008) — `@wip`

| File | Feature | Tags | ~Scenarios |
|------|---------|------|-----------|
| `hybrid/streaming/01_sse_e2e.feature` | SSE Streaming End-to-End | `@hybrid @sse-streaming @ROAD-015 @CAP-008 @CAP-001 @wip` | 2 |

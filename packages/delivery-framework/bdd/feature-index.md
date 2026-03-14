---
title: Feature Index
sidebar_label: Feature Index
---

# Feature Index

All BDD feature files organized by capability context and test layer.

## Organization

```
stack-tests/features/
  api/
    reporting/        # CAP-001: FOE Report Generation
    flags/            # CAP-028: Feature Flag Management
    chat/             # CAP-027: AI Chat Session Management
    layer-health/     # CAP-031: Layer Health API
    taxonomy/         # CAP-002: Taxonomy & Contribution Lifecycle
    orchestrator/     # Agent Orchestrator Runtime Switching
    scanning/         # CAP-004: Repository Scanning
    jira/             # CAP-005: Jira Bidirectional Integration
    confluence/       # CAP-006: Confluence Bidirectional Integration
    github/           # CAP-007: GitHub Integration (Feedback, Understanding, Confidence)
    streaming/        # CAP-008: Real-time SSE Streaming
    landscape/        # CAP-023 + CAP-024: Business Landscape Graph & Lint
    (root)            # Health, reports, repositories, scans, config
  ui/
    reporting/        # CAP-001: Report viewer, project browser
    domain-model/     # Context Map Diagram
    (root)            # Lifecycle navigation, navigation restructure, UI examples
  hybrid/
    chat/             # CAP-027: AI Chat Component E2E
    architecture/     # CAP-025: Architecture Management UI E2E
    landscape/        # CAP-023: Business Landscape Visualization E2E
    integrations/     # CAP-005 + CAP-006 + CAP-007: Cross-layer Jira, Confluence & GitHub flows
    streaming/        # CAP-008: Real-time SSE Streaming E2E
    (root)            # Existing hybrid examples
```

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

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `api/00_api_examples.feature` | FOE API Health & Readiness | 2 | `@api` |
| `api/01_reports.feature` | FOE Report Management | 5 | `@api` |
| `api/02_repositories.feature` | FOE Repository Tracking | 5 | `@api` |
| `api/03_scans.feature` | FOE Scan Jobs | 6 | `@api` |
| `api/04_config.feature` | FOE API Configuration | 4 | `@api` |

### Reporting (CAP-001)

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/reporting/05_foe_dimension_scores.feature` | FOE Report Dimension Scores & Cognitive Triangle | 3 | US-001 | `@api @report-gen @ROAD-001 @CAP-001` |
| `api/reporting/06_report_comparison.feature` | FOE Report Comparison | 4 | US-030 | `@api @report-gen @ROAD-001 @CAP-001` |
| `api/reporting/07_report_raw_retrieval.feature` | FOE Report Raw Retrieval | 3 | US-001 | `@api @report-gen @ROAD-001 @CAP-001` |
| `api/reporting/08_report_filtering_pagination.feature` | FOE Report Filtering & Pagination | 6 | US-031 | `@api @report-gen @ROAD-001 @CAP-001` |

### Feature Flags (CAP-028)

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `api/flags/01_feature_flags.feature` | Feature Flag API | 6 | `@api @feature-flags @CAP-028` |

### Chat (CAP-027)

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `api/chat/01_chat_sessions.feature` | AI Chat Session Management | 5 | `@api @chat @CAP-027` |

### Layer Health (CAP-031) -- @wip

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `api/layer-health/01_layer_health.feature` | Layer Health API | 5 | `@api @layer-health @CAP-031 @wip` |

### Taxonomy (CAP-002)

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `api/taxonomy/01_taxonomy_teams.feature` | Taxonomy Teams and Persons API | 6 | `@api @taxonomy-teams` |
| `api/taxonomy/02_taxonomy_contribution_lifecycle.feature` | Taxonomy Contribution Lifecycle | 5 | `@api @taxonomy @CAP-002` |

### Orchestrator

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `api/orchestrator/01_orchestrator_runtime.feature` | Agent Orchestrator Runtime Switching | 12 | `@api @orchestrator` |

### Scanning (CAP-004) -- @wip

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/scanning/01_scan_governance_scoring.feature` | Scanner Governance Dimension Scoring | 2 | US-006, US-011 | `@api @repo-scanning @ROAD-006 @CAP-004 @CAP-002 @wip` |

### Jira Integration (CAP-005) -- @wip

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/jira/01_jira_sync.feature` | Jira Bidirectional Sync | 7 | US-016, US-017 | `@api @jira-integration @ROAD-010 @CAP-005 @wip` |

### Confluence Integration (CAP-006) -- @wip

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/confluence/01_confluence_sync.feature` | Confluence Bidirectional Sync | 9 | US-018, US-019 | `@api @confluence-integration @ROAD-011 @CAP-006 @wip` |

### GitHub Integration (CAP-007) -- @wip

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/github/01_github_feedback.feature` | GitHub Feedback Dimension Integration | 7 | US-020, US-021 | `@api @github-integration @ROAD-012 @CAP-007 @wip` |
| `api/github/02_github_understanding.feature` | GitHub Understanding Dimension Integration | 7 | US-022, US-023 | `@api @github-integration @ROAD-013 @CAP-007 @wip` |
| `api/github/03_github_confidence.feature` | GitHub Confidence Dimension Integration | 7 | US-024, US-025 | `@api @github-integration @ROAD-014 @CAP-007 @wip` |

### Streaming (CAP-008) -- @wip

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `api/streaming/01_sse_streaming.feature` | SSE Streaming for Agent Responses | 8 | US-026 | `@api @sse-streaming @ROAD-015 @CAP-008 @wip` |

### Landscape (CAP-023, CAP-024)

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `api/landscape/01_landscape_graph.feature` | Business Landscape Graph API | 7 | `@api @landscape @ROAD-044 @CAP-023` |
| `api/landscape/02_landscape_lint.feature` | Landscape Domain Linter API | 6 | `@api @landscape-lint @ROAD-044 @CAP-024` |

---

## UI Layer Features

### Root-Level

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `ui/00_ui_examples.feature` | FOE Web UI - Report Viewer | 2 | `@ui` |
| `ui/web-app-lifecycle-navigation.feature` | Web App Lifecycle Navigation (ROAD-040) | 27 | `@ui @ROAD-040` |
| `ui/navigation-restructure.feature` | Lifecycle-Oriented Navigation Restructure | 30 (incl. 11 Scenario Outline examples) | `@wip @ui @ROAD-029` |

### Reporting (CAP-001)

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `ui/reporting/01_report_upload_viewer.feature` | FOE Report Upload & Viewer | 4 | US-001, US-010 | `@hybrid @report-gen @ROAD-001 @CAP-001` |
| `ui/reporting/02_foe_project_browser.feature` | FOE Project Browser & Persistent Report Selection | 24 | | `@ui @foe-scanner @ROAD-030 @CAP-001` |

### Domain Model

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `ui/domain-model/05_context_map_diagram.feature` | Interactive Context Map Diagram | 4 | `@hybrid @ddd-modeling @ROAD-016` |

---

## Hybrid Layer Features

### Root-Level

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `hybrid/00_hybrid_examples.feature` | FOE End-to-End - Ingest Report and View | 1 | `@hybrid` |

### Chat (CAP-027)

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `hybrid/chat/01_chat_e2e.feature` | AI Chat Component E2E | 4 | `@hybrid @chat @CAP-027` |

### Architecture (CAP-025)

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `hybrid/architecture/01_architecture_ui.feature` | Architecture Management UI E2E | 5 | `@hybrid @architecture @CAP-025` |

### Landscape (CAP-023)

| File | Feature | ~Scenarios | Tags |
|------|---------|-----------|------|
| `hybrid/landscape/01_landscape_visualization_e2e.feature` | Business Landscape Visualization E2E | 6 | `@hybrid @landscape @ROAD-044 @CAP-023` |
| `hybrid/landscape/02_landscape_v2_layout.feature` | Landscape v2 Zoned Layout | 3 | `@hybrid @landscape @CAP-023 @wip` |

### Integrations (CAP-005 + CAP-006 + CAP-007) -- @wip

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `hybrid/integrations/01_jira_e2e.feature` | Jira Integration End-to-End | 2 | US-017 | `@hybrid @jira-integration @ROAD-010 @CAP-005 @CAP-004 @wip` |
| `hybrid/integrations/01_confluence_e2e.feature` | Confluence Integration End-to-End | 2 | US-018, US-019 | `@hybrid @confluence-integration @ROAD-011 @CAP-006 @CAP-004 @wip` |
| `hybrid/integrations/02_github_feedback_e2e.feature` | GitHub Feedback Integration End-to-End | 2 | US-020, US-021 | `@hybrid @github-integration @ROAD-012 @CAP-007 @CAP-004 @wip` |
| `hybrid/integrations/02_github_understanding_e2e.feature` | GitHub Understanding Integration End-to-End | 2 | US-022, US-023 | `@hybrid @github-integration @ROAD-013 @CAP-007 @CAP-004 @wip` |
| `hybrid/integrations/02_github_confidence_e2e.feature` | GitHub Confidence Integration End-to-End | 2 | US-024, US-025 | `@hybrid @github-integration @ROAD-014 @CAP-007 @CAP-004 @wip` |

### Streaming (CAP-008) -- @wip

| File | Feature | ~Scenarios | User Stories | Tags |
|------|---------|-----------|-------------|------|
| `hybrid/streaming/01_sse_e2e.feature` | SSE Streaming End-to-End | 2 | US-026, US-027 | `@hybrid @sse-streaming @ROAD-015 @CAP-008 @CAP-001 @wip` |

---

## Summary

| Layer | Files | ~Total Scenarios |
|-------|-------|-----------------|
| API | 22 | ~117 |
| UI | 5 | ~87 |
| Hybrid | 9 | ~27 |
| **Total** | **41** | **~231** |

---
id: CHANGE-049
road_id: ~
title: "Feature Flags Infrastructure with OpenFeature Integration"
date: "2026-03-14"
version: "0.12.0"
status: published
categories:
  - Added
compliance:
  adr_check:
    status: pass
    validated_by: "@opencode"
    validated_at: "2026-03-14"
    notes: "ADR-022 defines the feature flags architecture, provider strategy, and override hierarchy (env vars > API > flags.json defaults)."
  bdd_check:
    status: pass
    scenarios: 6
    passed: 6
    coverage: "100%"
    notes: "All 6 scenarios in 01_feature_flags.feature pass. Covers flag resolution, env var overrides, API endpoint, default values, and unknown flag handling."
  nfr_checks:
    performance:
      status: pass
      evidence: "Flag resolution is synchronous in-memory lookup: < 1ms. flags.json loaded once at startup. No external service calls for evaluation."
      validated_by: "@opencode"
    security:
      status: pass
      evidence: "GET /api/v1/flags endpoint returns only flag names and current boolean values — no internal configuration details. FF_* env var overrides are server-side only."
      validated_by: "@opencode"
    accessibility:
      status: na
      evidence: "Infrastructure package. No user-facing interface."
      validated_by: "@opencode"
signatures:
  - agent: "@opencode"
    role: "implementation"
    status: "approved"
    timestamp: "2026-03-14T00:00:00Z"
---

### [CHANGE-049] Feature Flags Infrastructure with OpenFeature Integration — 2026-03-14

**Roadmap**: N/A (cross-cutting infrastructure)
**Type**: Added
**Author**: opencode

#### Summary

Introduces the `@foe/feature-flags` package providing a lightweight, OpenFeature-compatible feature flag system. Flags are defined in a `flags.json` registry with server-side and client-side initialization paths, environment variable overrides via `FF_*` prefix, and a REST endpoint for runtime inspection.

#### What Changed

- **@foe/feature-flags package** — New shared package providing feature flag primitives for both server and client consumers
- **flags.json registry** — Declarative flag definitions with `name`, `description`, `defaultValue`, and `owner` fields; 9 initial flags defined
- **initServerFlags()** — Server-side initialization function that loads `flags.json`, applies `FF_*` environment variable overrides, and caches resolved values in memory
- **fetchAndInitFlags()** — Client-side initialization function that fetches current flag state from the API endpoint and hydrates a local evaluation cache
- **FF_* environment variable overrides** — Any flag can be overridden server-side by setting `FF_FLAG_NAME=true|false` (e.g., `FF_LANDSCAPE_LAYOUT_V2=true`)
- **GET /api/v1/flags** — REST endpoint returning all flags with their current resolved values, respecting override hierarchy
- **9 initial flags** — `landscape-layout-v2`, `orchestrator-runtime`, `chat-streaming`, `taxonomy-teams`, `taxonomy-snapshots`, `neo4j-graph`, `pdf-export`, `dark-mode`, `experimental-features`

#### Related Artifacts

- **ADR**: [ADR-022](../adrs/ADR-022.md) — Feature Flags Architecture
- **Capability**: [CAP-028](../capabilities/CAP-028.md) — Feature Flag Management
- **User Stories**: [US-081](../user-stories/US-081.md), [US-082](../user-stories/US-082.md)

#### Git Commits

- `83552fa` — feat(flags): add @foe/feature-flags package with flags.json, server/client init, and API endpoint

#### BDD Test Results

```yaml
feature: 01_feature_flags.feature
scenarios: 6
passed: 6
failed: 0
coverage: "100%"
```

#### Technical Details

**Dependencies:** None (zero external dependencies — pure TypeScript)
**Breaking changes:** None — new additive package
**Migration notes:** Add `@foe/feature-flags` to consuming packages. Call `initServerFlags()` at server startup. Call `fetchAndInitFlags()` in client app initialization.
**Performance impact:** Flag resolution is synchronous in-memory lookup (< 1ms). No network calls during evaluation.
**Security considerations:** `FF_*` overrides are server-side only. API endpoint exposes flag names and boolean values only — no internal configuration or override sources revealed.

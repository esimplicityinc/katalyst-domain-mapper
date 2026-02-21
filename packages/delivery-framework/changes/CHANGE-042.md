---
id: CHANGE-042
road_id: ROAD-045
title: "FOE Historical Scan Data — Prima Control Tower 2025-2026"
date: "2026-02-19"
version: "0.11.0"
status: published
categories:
  - Added
compliance:
  adr_check:
    status: pass
    validated_by: "@opencode"
    validated_at: "2026-02-19"
    notes: "No new ADR required. Historical scan data follows established FOEReport schema (ADR-002). Data pipeline follows existing batch scan patterns."
  bdd_check:
    status: na
    scenarios: 0
    passed: 0
    coverage: "N/A"
    notes: "Data and tooling change. Validated by reviewing generated JSON against FOEReport Zod schema and confirming roadmap-data.json updates are accurate."
  nfr_checks:
    performance:
      status: pass
      evidence: "Batch scan runner completes 9 months of scans in under 15 minutes total. Individual scan files are < 50KB each."
      validated_by: "@opencode"
    security:
      status: pass
      evidence: "Scan files contain only synthetic assessment data. No credentials, keys, or production data."
      validated_by: "@opencode"
    accessibility:
      status: na
      evidence: "Data pipeline change only. No end-user UI impact."
      validated_by: "@opencode"
signatures:
  - agent: "@opencode"
    role: "implementation"
    status: "approved"
    timestamp: "2026-02-19T13:22:00Z"
---

### [CHANGE-042] FOE Historical Scan Data — Prima Control Tower 2025-2026 — 2026-02-19

**Roadmap**: [ROAD-045](../roads/ROAD-045)  
**Type**: Added  
**Author**: opencode

#### Summary

Generates and commits 9 months of FOE historical scan data for the Prima Control Tower repository (June 2025 – January 2026), documents the maturity trajectory in a summary narrative, and synchronizes the delivery framework's `bdd-data.json` and `roadmap-data.json` static data files with the current completion state of recently-finished ROAD items.

#### Changes

**Historical Scan Data (foe-historical-scans/):**
- `prima-control-tower-2025-06-15.json` through `prima-control-tower-2026-01-15.json` — 7 complete FOE assessment reports (~435-471 lines each), each containing dimension scores, findings, gaps, and recommendations
- `scan-summary.md` — Narrative analysis of the 9-month maturity trajectory
- `scan-log.txt` — 313-line raw batch runner execution log
- `PROGRESS.md` — Pipeline execution progress tracker
- `run-historical-scans.sh` — 461-line batch FOE assessment runner script

**Delivery Framework Static Data:**
- `packages/delivery-framework/static/bdd-data.json` — Added new test entries: Husky pre-commit hooks, AWS Bedrock scanner support
- `packages/delivery-framework/static/roadmap-data.json` — Updated ROAD-027, ROAD-029, ROAD-030, ROAD-031, ROAD-039, ROAD-040, ROAD-041 to `status: complete`

**Database:**
- `data/foe.db` — Updated to include historical scan records
- `packages/intelligence/data/foe.db` — Updated for Intelligence package

#### Git Commits

- `7c6a726` — Add FOE Historical Scan Summary and update BDD and roadmap data

#### BDD Test Results

```yaml
# Not applicable for this change type
```

#### Technical Details

**Dependencies:** None  
**Breaking changes:** None  
**Migration notes:** None — data additions only  
**Performance impact:** None — static JSON files  
**Security considerations:** All scan data is synthetic assessment output. No production data, credentials, or PII.

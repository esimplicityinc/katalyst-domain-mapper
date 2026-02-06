---
id: NFR-MAINT-002
title: "Backward-Compatible CLI"
category: maintainability
priority: should
status: active
created: "2026-02-06"
updated: "2026-02-06"
owner: "Katalyst Team"
road_items: [ROAD-004]
---

# NFR-MAINT-002: Backward-Compatible CLI

## Requirement

New CLI commands added to `@foe/field-guide-tools` must be additive-only. Existing commands (`build`, `validate`, `stats`) must continue to work with identical behavior, output format, and exit codes. No existing command may be removed, renamed, or have its default behavior changed without a deprecation cycle.

## Rationale

The `@foe/field-guide-tools` CLI is used by:
1. **CI/CD pipelines** - Commands like `build` and `validate` are hardcoded in pipeline configurations
2. **Docker multi-stage builds** - The scanner Dockerfile calls specific CLI commands (ADR-007)
3. **Justfile recipes** - Developer workflow recipes invoke CLI commands
4. **AI agents** - Agent prompts reference specific CLI commands for governance validation
5. **Documentation** - README files and skill documents reference CLI usage

Breaking changes to existing commands would cascade across all consumers, potentially breaking CI pipelines, Docker builds, and agent workflows simultaneously.

## Acceptance Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Existing command regression | 0 failures | Run existing command test suite after adding new commands |
| `build` command output | Unchanged format | Diff output before/after CLI extension |
| `validate` command output | Unchanged format | Diff output before/after CLI extension |
| `stats` command output | Unchanged format | Diff output before/after CLI extension |
| CLI help output | Additive only (new commands listed) | Diff `--help` output before/after |
| Exit codes | Unchanged for existing commands | Verify 0 on success, non-zero on failure |
| New commands | Namespaced with colon prefix | `build:governance`, `validate:governance`, etc. |
| Deprecation notices | Warning on stderr for deprecated features | Manual test of any deprecated command |

## Test Strategy

### How to Validate

1. **Snapshot testing**: Before adding new commands, capture output of:
   - `bunx foe-field-guide build` (full output + exit code)
   - `bunx foe-field-guide validate` (full output + exit code)
   - `bunx foe-field-guide stats` (full output + exit code)
   - `bunx foe-field-guide --help` (help text)
2. **After adding new commands**: Re-run all snapshot tests and diff against captured output
3. **Verify new commands use namespaced names**:
   - `build:governance` (not `build-governance` or `govbuild`)
   - `validate:governance` (not `validate-governance`)
   - `validate:transitions` (new functionality)
   - `coverage:capabilities` (new functionality)
   - `coverage:personas` (new functionality)
4. **Docker build test**: Verify existing Dockerfile `RUN` commands still work
5. **Justfile test**: Verify existing Justfile recipes still work

### Tools

- `bun test` for CLI integration tests
- Snapshot comparison (`diff` or `vitest` snapshot testing)
- Docker build verification
- Justfile recipe execution

## Current Status

| Environment | Status | Last Measured | Value |
|-------------|--------|---------------|-------|
| CLI (existing commands) | Pending | - | - |
| Docker builds | Pending | - | - |
| Justfile recipes | Pending | - | - |

## Evidence

Evidence of compliance will be recorded here as validation occurs.

## Related

- **ADRs**: ADR-001 (Bun runtime), ADR-007 (Docker multi-stage builds)
- **Road Items**: ROAD-004 (Governance Parsers, Index Builder & CLI)
- **BDD Scenarios**: CLI regression tests

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-06

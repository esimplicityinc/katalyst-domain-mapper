---
id: NFR-SEC-001
title: "API Key and Credential Protection"
category: security
priority: must
status: active
created: "2026-02-06"
updated: "2026-02-06"
owner: "Katalyst Team"
road_items: [ROAD-005, ROAD-010, ROAD-011]
---

# NFR-SEC-001: API Key and Credential Protection

## Requirement

API keys (ANTHROPIC_API_KEY), database credentials, integration tokens (Jira, Confluence), and other secrets must never be committed to the repository, embedded in Docker images, logged to stdout/stderr, or included in scan report output. The scanner container must have read-only access to mounted repositories.

## Rationale

The system handles sensitive credentials at multiple points:
1. **ANTHROPIC_API_KEY** - Required by the scanner's AI agents (Claude API access)
2. **Jira/Confluence tokens** - Required for bidirectional integration (ROAD-010/011)
3. **Database files** - SQLite databases may contain sensitive governance data
4. **Scan reports** - May contain file paths that inadvertently reveal infrastructure details

A credential leak could expose API access, integration tokens, or internal infrastructure information. The FOE Confidence dimension specifically measures security practices.

## Acceptance Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Secrets in git history | 0 occurrences | `git-secrets` or `trufflehog` scan of full repo history |
| Secrets in Docker images | 0 occurrences | `docker history --no-trunc` and `dive` analysis |
| Secrets in log output | 0 occurrences | Grep all log output for key patterns during test runs |
| Scanner mount permissions | Read-only | Docker `--mount type=bind,source=...,target=/repo,readonly` |
| API response sanitization | No absolute file paths | Automated check on all API response bodies |
| Environment variable injection | Runtime only | No ENV with secret values in Dockerfile |
| .env files in .gitignore | All .env variants | Check `.gitignore` includes `.env`, `.env.local`, `.env.production` |
| Secret rotation support | Supported | Environment variable-based; no restart required for key rotation |

## Test Strategy

### How to Validate

1. Run `trufflehog` or `git-secrets` against the entire repository history
2. Inspect Docker image layers with `dive` to verify no secrets baked in
3. Run a full scan and grep stdout/stderr for known secret patterns (API key prefixes, token formats)
4. Verify Docker Compose mounts `/repo` as read-only
5. Attempt to write to `/repo` from within the scanner container (should fail)
6. Review all API response schemas for file path fields; ensure they're relative, not absolute
7. Verify `.gitignore` covers all credential file patterns
8. Test that changing `ANTHROPIC_API_KEY` environment variable takes effect without container rebuild

### Tools

- `trufflehog` - Git history secret scanning
- `git-secrets` - Pre-commit secret detection
- `dive` - Docker image layer analysis
- `docker inspect` - Mount permission verification
- Custom grep patterns in CI pipeline

## Current Status

| Environment | Status | Last Measured | Value |
|-------------|--------|---------------|-------|
| Development | Pending | - | - |
| CI | Pending | - | - |
| Docker | Pending | - | - |

## Evidence

Evidence of compliance will be recorded here as validation occurs.

## Related

- **ADRs**: ADR-004 (Elysia API), ADR-007 (Docker Multi-Stage Builds)
- **Road Items**: ROAD-005 (API), ROAD-010 (Jira Integration), ROAD-011 (Confluence Integration)
- **BDD Scenarios**: Security-focused scenarios in API and integration features

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-06

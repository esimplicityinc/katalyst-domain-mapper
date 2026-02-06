---
id: CHANGE-XXX
road_id: ROAD-XXX
title: "Change Title Here"
date: "YYYY-MM-DD"
version: "0.0.0"
status: draft  # draft -> published
categories:
  - Added  # Added | Changed | Deprecated | Removed | Fixed | Security
compliance:
  adr_check:
    status: pending  # pending | pass | fail
    validated_by: ""
    validated_at: ""
    notes: ""
  bdd_check:
    status: pending  # pending | pass | fail
    scenarios: 0
    passed: 0
    coverage: "0%"
  nfr_checks:
    performance:
      status: pending  # pending | pass | fail | na
      evidence: ""
      validated_by: ""
    security:
      status: pending
      evidence: ""
      validated_by: ""
    accessibility:
      status: pending
      evidence: ""
      validated_by: ""
signatures: []  # Populated during governance workflow
# Example signatures structure:
# signatures:
#   - agent: "@architecture-inspector"
#     role: "adr_validation"
#     status: "approved"
#     timestamp: "2026-02-01T10:00:00Z"
#   - agent: "@bdd-writer"
#     role: "bdd_author"
#     status: "approved"
#     timestamp: "2026-02-01T11:00:00Z"
#   - agent: "@bdd-runner"
#     role: "test_validation"
#     status: "approved"
#     timestamp: "2026-02-01T11:05:00Z"
#   - agent: "@code-writer"
#     role: "implementation"
#     status: "approved"
#     timestamp: "2026-02-01T13:00:00Z"
#   - agent: "@performance-agent"
#     role: "nfr_validation"
#     status: "approved"
#     timestamp: "2026-02-01T14:00:00Z"
#   - agent: "@security-agent"
#     role: "nfr_validation"
#     status: "approved"
#     timestamp: "2026-02-01T14:05:00Z"
#   - agent: "@a11y-agent"
#     role: "nfr_validation"
#     status: "approved"
#     timestamp: "2026-02-01T14:10:00Z"
---

### [CHANGE-XXX] Title - YYYY-MM-DD

**Roadmap**: [ROAD-XXX](../roads/ROAD-XXX.md)
**Type**: Added
**Author**: AI Agent

#### Summary

Brief description of what this change accomplishes. This should be a high-level overview that anyone can understand.

#### Changes

**Domain Layer:**
- Created `EntityName` aggregate with properties
- Created `ValueObjectName` value object
- Created domain events: `EventOne`, `EventTwo`

**Application Layer:**
- Created `UseCaseName` use case
- Created `ServiceName` application service
- Defined port interfaces: `RepositoryPort`, `ServicePort`

**Infrastructure Layer:**
- Created Convex mutations: `mutationOne`, `mutationTwo`
- Created Convex queries: `queryOne`, `queryTwo`
- Implemented `RepositoryAdapter` adapter

**API Layer:**
- Created `GET /api/resource` endpoint
- Created `POST /api/resource` endpoint
- Added authentication middleware

**UI Layer:**
- Created `ComponentName` React component
- Created page: `/app/resource/page.tsx`
- Added form validation

#### BDD Test Results

```yaml
test_results:
  bdd:
    total: 15
    passed: 15
    failed: 0
    status: pass
    features:
      - name: "Feature One"
        file: "stack-tests/features/context/feature-one.feature"
        scenarios: 7
        passed: 7
        failed: 0
      - name: "Feature Two"
        file: "stack-tests/features/context/feature-two.feature"
        scenarios: 8
        passed: 8
        failed: 0
```

#### Technical Details

**Dependencies:**
- Requires: ROAD-YYY
- Enables: ROAD-ZZZ

**Breaking Changes:**
- None

**Migration Notes:**
- No migration required

**Performance Impact:**
- New endpoints average response time: `<200ms`
- Database query optimization: N/A

**Security Considerations:**
- API endpoints protected with authentication
- Input validation on all user inputs
- No sensitive data exposed

---

## How to Use This Template

1. **Copy this file** to `docs/changes/CHANGE-XXX.md` (get next ID from @change-manager)
2. **Update all XXX placeholders** with actual values
3. **Fill in frontmatter** with compliance data from ROAD item
4. **Add agent signatures** as they approve
5. **Update status** to `published` when complete
6. **Add to index** in `docs/changes/README.md`

## Validation Checklist

Before marking as `published`, ensure:
- [ ] All 7 agent signatures present
- [ ] ADR check: `status: pass`
- [ ] BDD check: `status: pass` (all scenarios passed)
- [ ] NFR checks: all `status: pass`
- [ ] Associated ROAD item: `status: complete`
- [ ] No placeholder text remaining (no "XXX", no empty strings)
- [ ] Valid YAML frontmatter (test with `just validate-changes`)

## File Location

**MUST** be saved as: `docs/changes/CHANGE-XXX.md`

**NEVER** add changes directly to CHANGELOG.md - that's auto-generated from this index.

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-01
**Maintained By**: @change-manager

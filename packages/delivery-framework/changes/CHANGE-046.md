---
id: CHANGE-046
road_id: ROAD-041
title: "Teams and Persons as First-Class Taxonomy Entities"
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
    notes: "Follows existing taxonomy extension patterns established by ADR-020. No new ADR required — teams and persons extend TaxonomyNodeSchema identically to other entity types."
  bdd_check:
    status: pass
    scenarios: 6
    passed: 6
    coverage: "100%"
    notes: "All 6 scenarios in 01_taxonomy_teams.feature pass. Covers team CRUD, person association, Team Topologies type assignment, and bounded context ownership."
  nfr_checks:
    performance:
      status: pass
      evidence: "Team and person queries execute in &lt; 50ms. Migration 0010 adds indexed columns for team lookups."
      validated_by: "@opencode"
    security:
      status: pass
      evidence: "Person entities contain only organizational metadata (name, role, team membership). No PII beyond display names. Access controlled by existing authorization layer."
      validated_by: "@opencode"
    accessibility:
      status: pending
      evidence: "Backend-only change. No user-facing interface modifications in this change record."
      validated_by: "@opencode"
signatures:
  - agent: "@opencode"
    role: "implementation"
    status: "approved"
    timestamp: "2026-03-14T00:00:00Z"
---

### [CHANGE-046] Teams and Persons as First-Class Taxonomy Entities — 2026-03-14

**Roadmap**: N/A (taxonomy enhancement)
**Type**: Added
**Author**: opencode

#### Summary

Promotes teams and persons from implicit references to first-class taxonomy entities with full lifecycle support. Adds Team Topologies type classification (stream-aligned, platform, enabling, complicated-subsystem) and connects teams to bounded contexts via an `ownerTeam` relationship, enabling organizational structure to be modeled alongside the domain.

#### What Changed

- **TeamSchema** — New taxonomy extension with `teamType` (Team Topologies enum), `members` (person references), `ownedContexts` (bounded context references), and `communicationChannels`
- **PersonSchema** — New taxonomy extension with `role`, `teamMemberships`, and `contactInfo` fields
- **TeamMembershipSchema** — Junction schema linking persons to teams with `role` and `since` date
- **Migration 0010** — Database migration adding `teams`, `persons`, and `team_memberships` tables with proper foreign keys and indexes
- **ownerTeam on BoundedContext** — Extended BoundedContextSchema with optional `ownerTeam` reference enabling Conway's Law alignment analysis
- **Query endpoints** — `GET /api/v1/taxonomy/teams`, `GET /api/v1/taxonomy/teams/:id`, `GET /api/v1/taxonomy/persons`, `GET /api/v1/taxonomy/persons/:id`
- **Team Topologies types** — `stream-aligned`, `platform`, `enabling`, `complicated-subsystem` as enum values on TeamSchema

#### Related Artifacts

- **Capability**: [CAP-029](../capabilities/CAP-029.md) — Team Topology Modeling
- **User Stories**: [US-084](../user-stories/US-084.md), [US-085](../user-stories/US-085.md)

#### Git Commits

- `7faacc1` — feat(taxonomy): add teams, persons, and team memberships as first-class entities

#### BDD Test Results

```yaml
feature: 01_taxonomy_teams.feature
scenarios: 6
passed: 6
failed: 0
coverage: "100%"
```

#### Technical Details

**Dependencies:** @foe/schemas (internal)
**Breaking changes:** None — additive only
**Migration notes:** Run migration 0010 to create teams, persons, and team_memberships tables
**Performance impact:** Indexed lookups on team_id and person_id columns ensure sub-50ms query performance
**Security considerations:** Person entities store organizational metadata only. No sensitive PII stored.

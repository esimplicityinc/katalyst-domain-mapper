---
id: ROAD-048
title: "Practice Area, Competency & Adoption CRUD"
status: in_progress
priority: High
phase: 2
created: 2026-03-16
tags: [practice-area, competency, adoption, crud, api, db, schemas]
capabilities:
  - CAP-032
user_stories:
  - US-093
  - US-094
  - US-095
  - US-096
dependencies:
  - ROAD-041
enables: []
estimated_effort: XL
governance:
  adrs:
    validated: true
    ids: [ADR-003, ADR-011, ADR-012]
  bdd:
    id: BDD-048
    status: in_progress
    feature_files:
      - "api/taxonomy/03_practice_areas.feature"
      - "api/taxonomy/04_competencies.feature"
      - "api/taxonomy/05_team_adoptions.feature"
      - "api/taxonomy/06_individual_adoptions.feature"
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-001]
    status: pending
  agent_signatures:
    code-writer: "approved"
contribution:
  status: accepted
  proposed_by: "Katalyst Team"
  proposed_at: "2026-03-16"
  accepted_at: "2026-03-16"
  reviewed_by: "governance-linter"
  reviewed_at: "2026-03-16"
---

# ROAD-048: Practice Area, Competency & Adoption CRUD

**Status**: 🔄 In Progress
**Priority**: High
**Phase**: 2 — Advanced Features
**Estimated Effort**: XL (5+ days)

## Description

Full CRUD API for practice areas, competencies, team adoptions, and individual adoptions. Zod schemas define the data contracts, database migrations create the persistence layer, and 22 API endpoints provide comprehensive management across four route groups. Schemas and routes are complete; BDD test scenarios are in progress.

## Value Proposition

- **Maturity Domain Management**: Define and maintain practice areas with six-pillar structure (strategy, standards, frameworks, libraries, processes, measures)
- **Skill Taxonomy**: Model assessable competencies with proficiency levels and DAG prerequisite dependencies
- **Team Adoption Tracking**: Record team-level maturity per practice area with evidence and assessment history
- **Individual Skill Tracking**: Track person-level competency assessments to identify skill gaps and plan development

## User Stories

- **US-093** — Manage Practice Areas via CRUD API
- **US-094** — Manage Competencies via CRUD API
- **US-095** — Track Team Adoption of Practice Areas
- **US-096** — Track Individual Skill Assessments

## Capabilities

- **Implements**: CAP-032 (Practice Area & Competency Management)

## Implementation Tasks

- [x] Zod schemas: `TaxonomyPracticeAreaSchema`, `TaxonomyCompetencySchema`, `TaxonomyTeamAdoptionSchema`, `TaxonomyIndividualAdoptionSchema`
- [x] Database migration: `taxonomy_practice_areas`, `taxonomy_competencies`, `taxonomy_team_adoptions`, `taxonomy_individual_adoptions` tables
- [x] `TaxonomyRepository` port: CRUD methods for practice areas, competencies, team adoptions, individual adoptions
- [x] `TaxonomyRepositorySQLite` adapter: full implementation
- [x] `taxonomy-practice-areas.ts` HTTP route (GET/POST/PUT/DELETE)
- [x] `taxonomy-competencies.ts` HTTP route (GET/POST/PUT/DELETE)
- [x] `taxonomy-team-adoptions.ts` HTTP route (GET/POST/PUT/DELETE + by-team query)
- [x] `taxonomy-individual-adoptions.ts` HTTP route (GET/POST/PUT/DELETE + by-person query)
- [ ] BDD feature: `03_practice_areas.feature`
- [ ] BDD feature: `04_competencies.feature`
- [ ] BDD feature: `05_team_adoptions.feature`
- [ ] BDD feature: `06_individual_adoptions.feature`

## Dependencies

- **ROAD-041** — Taxonomy CRUD baseline (provides TaxonomyRepository port and database schema foundation)

## Non-Functional Requirements

### NFR-PERF-001: Performance
- **Status**: Pending
- **Target**: CRUD operations < 200ms (SQLite)

## Testing Strategy

### Automated
- BDD scenarios covering all 22 API endpoints (in progress)
- Schema validation: POST/PUT bodies validated with Zod before persistence
- DAG cycle detection for competency prerequisites

### Manual
- Practice area CRUD with all six pillars populated
- Competency creation with prerequisite dependencies
- Team adoption records with maturity level progression
- Individual adoption records with evidence and notes

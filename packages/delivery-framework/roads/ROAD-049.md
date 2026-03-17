---
id: ROAD-049
title: "Organization Intelligence Views"
status: in_progress
priority: High
phase: 3
created: 2026-03-17
tags: [organization, teams, people, adoption, heatmap, org-map, value-stream, traceability, ui]
capabilities:
  - CAP-033
  - CAP-034
  - CAP-035
user_stories:
  - US-097
  - US-098
  - US-099
  - US-100
  - US-101
  - US-102
dependencies:
  - ROAD-048
  - ROAD-044
enables: []
estimated_effort: XXL
governance:
  adrs:
    validated: true
    ids: [ADR-003, ADR-018]
  bdd:
    id: BDD-049
    status: pending
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-001]
    status: pending
  agent_signatures: {}
contribution:
  status: accepted
  proposed_by: "Katalyst Team"
  proposed_at: "2026-03-17"
  accepted_at: "2026-03-17"
  reviewed_by: "governance-linter"
  reviewed_at: "2026-03-17"
---

# ROAD-049: Organization Intelligence Views

**Status**: 🚧 In Progress
**Priority**: High
**Phase**: 3 — Visualization & Intelligence
**Estimated Effort**: XXL (10+ days)

## Description

A suite of interactive web UI visualizations that surface the relationships between people, teams, systems, user types, and outcomes. Adds a top-level "Organization" navigation section with an org map graph, team profiles, person competency profiles, and an adoption heatmap. Extends the Strategy section with a "Value Streams" area containing user type journey tracing and contribution-to-outcome traceability views.

## Value Proposition

- **Organizational Visibility**: See who is on which teams, what they own, and who they serve — all in one interactive graph
- **Skill Intelligence**: Team adoption heatmaps and person competency radars surface maturity gaps at a glance
- **Value Stream Tracing**: Trace user type journeys through stories → capabilities → systems → teams to verify Conway's Law alignment
- **Impact Measurement**: Link individual contributions through road items to capabilities to user outcomes, demonstrating engineering ROI

## User Stories

- **US-097** — View Organization Map (force-directed graph of teams, persons, systems, user types)
- **US-098** — View Team Profile with Adoption Dashboard (members, owned systems, users served, adoptions)
- **US-099** — View Person Competency Profile (teams, radar chart, contribution activity)
- **US-100** — View Practice Area Adoption Heatmap (teams × practice areas grid)
- **US-101** — Trace User Type Journey Through Teams (multi-column swim lane flow)
- **US-102** — View Contribution-to-Outcome Traceability (reverse cascade from people to user value)

## Capabilities

- **Implements**: CAP-033 (Organization & Team Intelligence)
- **Implements**: CAP-034 (Adoption & Competency Dashboard)
- **Implements**: CAP-035 (Value Stream Traceability)

## Implementation Phases

### Phase 1: Navigation Shell + Governance Artifacts
- [x] Write CAP-033, CAP-034, CAP-035 capability files
- [x] Write ROAD-049 road item file
- [x] Write US-097 through US-102 user story files
- [ ] Add "Organization" top-level nav section in Layout.tsx
- [ ] Create stub pages for all routes
- [ ] Add "Value Streams" section under Strategy

### Phase 2: Team Profile (US-098)
- [ ] TeamsListView component (team cards with type badges)
- [ ] TeamProfilePage component (4 panels: members, systems, users, adoptions)
- [ ] Aggregate API endpoint: GET /api/v1/taxonomy/teams/:name/profile

### Phase 3: Person Competency Profile (US-099)
- [ ] PeopleListView component (person cards with team badges)
- [ ] PersonProfilePage component (radar chart + contribution timeline)
- [ ] Aggregate API endpoint: GET /api/v1/taxonomy/persons/:name/profile

### Phase 4: Adoption Heatmap (US-100)
- [ ] AdoptionHeatmapView component (teams × practice areas grid)
- [ ] Cell drill-down for competency progress
- [ ] Tooltip with member skill breakdown

### Phase 5: Organization Map (US-097)
- [ ] OrgMapCanvas component (d3-force SVG)
- [ ] Node types: teams, persons, systems, user types
- [ ] Edge types: member-of, owns, serves

### Phase 6: User Type Journey (US-101)
- [ ] UserTypeJourneyView component (multi-column flow)
- [ ] Columns: User Type → Stories → Capabilities → Systems → Teams

### Phase 7: Outcome Traceability (US-102)
- [ ] OutcomeTraceView component (tree/cascade)
- [ ] Chain: Person → Contributions → Road Items → Capabilities → User Stories → User Types

## Dependencies

- **ROAD-048** — Practice Area & Competency CRUD (provides adoption data for heatmap and profiles)
- **ROAD-044** — Business Landscape Graph (provides d3-force/ELK layout patterns reused in org map)

## Non-Functional Requirements

### NFR-PERF-001: Performance
- **Status**: Pending
- **Targets**:
  - Org map render < 3 seconds for up to 50 nodes
  - Heatmap render < 2 seconds for up to 20 teams × 10 practice areas
  - Profile pages load < 1 second

## Testing Strategy

### Automated
- BDD scenarios for new page routes (smoke tests)
- BDD scenarios for aggregate API endpoints
- Component rendering tests where applicable

### Manual
- Visual verification of org map layout quality
- Heatmap color contrast and accessibility
- Radar chart readability with varying data

# Phase 7: Web Visualization — Governance Templates

**Package:** `packages/web-report/src/`
**Depends on:** Phase 4 (API governance endpoints) or Phase 3 (governance index JSON)
**Last phase — runs after all others are complete**

## Objective

Add 2-3 new report templates to `@foe/web-report` that visualize governance health, DDD domain models, and cross-reference integrity. These follow the same pattern as the existing 11 templates — self-contained Next.js pages that render from a baked-in data file.

## Data Source

Templates consume governance data from one of:
1. A baked-in `governance-index.json` (like existing `report.json` pattern)
2. The API (`GET /api/v1/governance?project=name`) if running with the API server
3. File upload (like `@foe/web-ui`'s drag-and-drop pattern)

For the initial implementation, use the baked-in JSON pattern matching the existing `src/data/report.json` approach.

### New Data File: `packages/web-report/src/data/governance.json`

A sample governance index JSON for the "ClawMarket" project with:
- 8 capabilities (CAP-001..008)
- 5 personas (PER-001..005)
- ~12 road items at various states
- 4 bounded contexts with aggregates, value objects, events
- Some intentional cross-reference gaps for demonstration

### New Types File: `packages/web-report/src/data/governance-types.ts`

TypeScript types mirroring `@foe/schemas/governance` (standalone copy, same pattern as existing `types.ts` which mirrors `@foe/schemas/scan`):

```typescript
export interface GovernanceIndex {
  version: string;
  generated: string;
  capabilities: Record<string, Capability>;
  personas: Record<string, Persona>;
  userStories: Record<string, UserStory>;
  roadItems: Record<string, RoadItem>;
  boundedContexts: Record<string, BoundedContext>;
  aggregates: Record<string, Aggregate>;
  valueObjects: Record<string, ValueObject>;
  domainEvents: Record<string, DomainEvent>;
  byCapability: Record<string, { personas: string[]; stories: string[]; roads: string[] }>;
  byContext: Record<string, { aggregates: string[]; events: string[]; valueObjects: string[] }>;
  stats: GovernanceStats;
}
// ... full type definitions for each artifact type
```

## Templates to Create

### Template 12: Governance Dashboard

**File:** `packages/web-report/src/app/template-12-governance/page.tsx`
**~600 lines**

A comprehensive governance health dashboard with:

#### Section 1: Governance Health Summary
- Overall governance score (computed from artifact completeness + integrity)
- Artifact count cards: Capabilities, Personas, Stories, Road Items, ADRs, NFRs, Changes
- Referential integrity status (pass/fail with error count)
- Radar chart: 7-axis radar (one axis per artifact type, showing % completeness)

#### Section 2: Road Item Kanban
- 4-column Kanban board showing road items by governance state group:
  - **Planning**: proposed, adr_validated
  - **BDD**: bdd_pending, bdd_complete
  - **Implementation**: implementing, nfr_validating
  - **Done**: complete (+ nfr_blocked as a warning state)
- Each card shows: ROAD ID, title, priority badge, capability count, dependency count
- Color-coded by phase (phase 0 = gray, phase 1 = blue, phase 2 = purple, phase 3 = green)

#### Section 3: Capability Coverage Matrix
- Table with one row per capability
- Columns: Capability, Category, Status, Persona Count, Story Count, Road Count, Coverage %
- Coverage % = (stories with tests passing / total stories) * 100
- Color-coded cells: green (>= 75%), yellow (>= 50%), red (< 50%)
- Expandable rows showing linked personas and stories

#### Section 4: Cross-Reference Integrity Report
- List of referential integrity errors (if any)
- Grouped by type: "Broken Persona→Capability", "Broken Story→Persona", etc.
- Visual indicator: green checkmark for valid, red X for broken

**Shared components used:** `ScoreDisplay`, `StatusBadge`, `RadarChart`

### Template 13: DDD Context Map

**File:** `packages/web-report/src/app/template-13-context-map/page.tsx`
**~800 lines**

An interactive visualization of the DDD domain model:

#### Section 1: Context Overview
- Card grid showing each bounded context with:
  - Title and responsibility description
  - Aggregate count, event count, value object count
  - Communication pattern badge
  - Status badge (draft/stable/deprecated)
  - Source directory path

#### Section 2: Context Map (SVG or CSS Grid)
- Visual representation of bounded context relationships
- Upstream/downstream arrows between contexts
- Each context is a box containing its aggregate names
- Communication pattern labels on connection arrows
- Color-coded by communication pattern (domain-events = blue, shared-kernel = purple, etc.)

#### Section 3: Aggregate Deep Dive (expandable)
- For each aggregate, show:
  - Root entity name
  - Child entities
  - Value objects (as pills/chips linking to their definitions)
  - Domain events emitted (as pills/chips)
  - Commands accepted
  - Invariants (as a checklist with enforced/not-enforced status)

#### Section 4: Event Flow Diagram
- Timeline/flow showing domain events:
  - Which aggregate emits each event
  - Which contexts consume it
  - What side effects occur
- Grouped by bounded context
- Shows the complete event-driven communication pattern

#### Section 5: Ubiquitous Language Glossary
- Table of domain terms extracted from value objects and aggregates
- Columns: Term, Context, Definition, Usage Count
- Sortable and searchable

**New shared components needed:**

### `packages/web-report/src/components/shared/ContextCard.tsx`

Reusable card for displaying a bounded context with aggregate count, event count, and status.

### `packages/web-report/src/components/shared/KanbanBoard.tsx`

Generic Kanban board component that accepts column definitions and items. Used by the governance dashboard for road items.

## Template Navigation

Update the home page (`src/app/page.tsx`) to add the 2 new template cards:

```typescript
{
  id: 12,
  name: 'Governance Dashboard',
  description: 'Governance health, road item kanban, capability coverage matrix',
  icon: Shield,       // from lucide-react
  color: 'text-amber-500',
  path: '/template-12-governance',
},
{
  id: 13,
  name: 'DDD Context Map',
  description: 'Bounded contexts, aggregates, domain events, and ubiquitous language',
  icon: GitBranch,    // from lucide-react
  color: 'text-indigo-500',
  path: '/template-13-context-map',
  featured: true,     // highlight as new
},
```

## Estimated File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| `src/data/governance.json` | ~400 | Sample governance index |
| `src/data/governance-types.ts` | ~150 | TypeScript type definitions |
| `src/app/template-12-governance/page.tsx` | ~600 | Governance dashboard |
| `src/app/template-13-context-map/page.tsx` | ~800 | DDD context map |
| `src/components/shared/ContextCard.tsx` | ~80 | Bounded context card component |
| `src/components/shared/KanbanBoard.tsx` | ~120 | Generic Kanban board |
| `src/app/page.tsx` (modified) | +20 | Add 2 template cards |
| **Total** | **~2,170** | |

## Design Notes

### Color Palette Extension

Add governance-specific colors to `tailwind.config.js`:

```javascript
governance: {
  capability: '#f59e0b',  // amber-500
  persona: '#8b5cf6',     // violet-500
  story: '#06b6d4',       // cyan-500
  road: '#10b981',        // emerald-500
  adr: '#6366f1',         // indigo-500
  nfr: '#ef4444',         // red-500
  change: '#64748b',      // slate-500
},
ddd: {
  context: '#6366f1',     // indigo-500
  aggregate: '#8b5cf6',   // violet-500
  valueObject: '#06b6d4', // cyan-500
  event: '#f97316',       // orange-500
},
```

### Responsive Design

Both templates should work on:
- Desktop (1200px+): Full layout with side panels
- Tablet (768px-1199px): Stacked cards, simplified Kanban
- Mobile (< 768px): Single column, accordion sections

### Dark Mode

Follow existing pattern in `globals.css` — all governance colors should have dark mode variants using CSS custom properties.

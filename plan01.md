# Plan 01: Universal Contribution Lifecycle

## 1. Concept Overview

Every item in the system gets a **`contribution`** block that gates whether the item is visible, editable, and canonical. This is **layered on top** of existing type-specific statuses. An item must be `accepted` in the contribution lifecycle before its type-specific lifecycle activates.

**Example**: A Road Item must first be `accepted` via contribution review. Only then does its governance state machine (`proposed → adr_validated → ... → complete`) begin.

### Design Decisions

- **Layer, don't replace**: The universal lifecycle gates contribution/acceptance. Type-specific statuses (like Road Item's 8-state machine) remain and only activate AFTER the item is `accepted`.
- **Versioning via new drafts**: Editing an accepted item creates a new draft version that goes through the full contribution cycle. The old version remains accepted until the new version is accepted (then old becomes `superseded`).
- **Universal coverage**: Every item in the system goes through the contribution lifecycle, including types that currently have no status (Value Object, Domain Event, Glossary Term, Use Case, base taxonomy nodes).
- **Integer versions**: Each item gets a simple incrementing version (v1, v2, v3).
- **Nested `contribution` block**: A new `contribution` block in every schema's frontmatter keeps it separate from type-specific status.

---

## 2. The State Machine

```
                    ┌──────────┐
                    │          │
       ┌────────── │  draft    │ ◄──────────────┐
       │            │          │                 │
       │            └──────────┘                 │
       │  submit         ▲                       │
       ▼                 │ withdraw               │ revise
  ┌──────────┐           │                  ┌──────────┐
  │          │ ──────────┘                  │          │
  │ proposed │                              │ rejected │
  │          │ ────────────────────────────► │          │
  └──────────┘         reject               └──────────┘
       │
       │ accept
       ▼
  ┌──────────┐        deprecate        ┌────────────┐
  │          │ ──────────────────────► │            │
  │ accepted │                         │ deprecated │
  │          │ ◄────────────────────── │            │
  └──────────┘       reactivate        └────────────┘
       │
       │ (new version created)
       ▼
  ┌────────────┐
  │            │
  │ superseded │  (terminal - old version after new version accepted)
  │            │
  └────────────┘
```

### States (6 total)

| State | Meaning | Visible to viewers? | Editable? |
|-------|---------|-------------------|-----------|
| `draft` | Being authored/revised | No (contributors only) | Yes |
| `proposed` | Submitted for review | Yes (read-only) | No (must withdraw first) |
| `rejected` | Review rejected with feedback | No (author + reviewers) | No (must revise → draft) |
| `accepted` | Canonical, live in the system | Yes | No (must create new version) |
| `deprecated` | Retired, kept for history | Yes (marked as deprecated) | No |
| `superseded` | Replaced by newer version | No (historical record) | No |

### Transitions (8 total)

| # | From | To | Action Name | Who (later) |
|---|------|----|-------------|-------------|
| 1 | `draft` | `proposed` | **submit** | Contributor |
| 2 | `proposed` | `accepted` | **accept** | Reviewer |
| 3 | `proposed` | `rejected` | **reject** | Reviewer |
| 4 | `proposed` | `draft` | **withdraw** | Contributor |
| 5 | `rejected` | `draft` | **revise** | Contributor |
| 6 | `accepted` | `deprecated` | **deprecate** | Admin |
| 7 | `deprecated` | `draft` | **reactivate** | Admin |
| 8 | `accepted` | `superseded` | **supersede** | System (automatic when new version accepted) |

---

## 3. The `contribution` Schema Block

Added to every item's frontmatter/schema:

```yaml
contribution:
  status: draft              # draft | proposed | rejected | accepted | deprecated | superseded
  version: 1                 # Integer, increments on each new accepted version
  supersedes: null           # ID + version of the item this replaces (e.g., "CAP-001@v1")
  superseded_by: null        # ID + version that replaced this (e.g., "CAP-001@v2")
  submitted_at: null         # ISO-8601 timestamp when proposed
  submitted_by: null         # Who submitted (user/agent ID)
  reviewed_at: null          # ISO-8601 timestamp of accept/reject decision
  reviewed_by: null          # Who reviewed (user/agent ID)
  review_feedback: null      # Rejection reason or acceptance notes
  created_at: "2026-03-14"   # When this version was created
  updated_at: "2026-03-14"   # Last modification timestamp
```

### Zod Schema

New file: `packages/foe-schemas/src/taxonomy/contribution.ts`

```typescript
import { z } from 'zod';

// --- Status enum ---
export const ContributionStatusSchema = z.enum([
  'draft',
  'proposed',
  'rejected',
  'accepted',
  'deprecated',
  'superseded',
]);
export type ContributionStatus = z.infer<typeof ContributionStatusSchema>;

// --- Contribution block ---
export const ContributionSchema = z.object({
  status: ContributionStatusSchema.default('draft'),
  version: z.number().int().positive().default(1),
  supersedes: z.string().nullable().default(null),     // "ITEM-ID@vN"
  superseded_by: z.string().nullable().default(null),   // "ITEM-ID@vN"
  submitted_at: z.string().datetime().nullable().default(null),
  submitted_by: z.string().nullable().default(null),
  reviewed_at: z.string().datetime().nullable().default(null),
  reviewed_by: z.string().nullable().default(null),
  review_feedback: z.string().nullable().default(null),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Contribution = z.infer<typeof ContributionSchema>;

// --- State machine transitions ---
export const CONTRIBUTION_TRANSITIONS: Record<ContributionStatus, ContributionStatus[]> = {
  draft:      ['proposed'],
  proposed:   ['accepted', 'rejected', 'draft'],
  rejected:   ['draft'],
  accepted:   ['deprecated', 'superseded'],
  deprecated: ['draft'],
  superseded: [],  // terminal state
};

export function validateContributionTransition(
  from: ContributionStatus,
  to: ContributionStatus,
): boolean {
  return CONTRIBUTION_TRANSITIONS[from].includes(to);
}

export function getNextContributionStates(
  current: ContributionStatus,
): ContributionStatus[] {
  return CONTRIBUTION_TRANSITIONS[current];
}

// --- Transition action names ---
export const CONTRIBUTION_ACTIONS: Record<string, { from: ContributionStatus; to: ContributionStatus }> = {
  submit:     { from: 'draft',      to: 'proposed'   },
  accept:     { from: 'proposed',   to: 'accepted'   },
  reject:     { from: 'proposed',   to: 'rejected'   },
  withdraw:   { from: 'proposed',   to: 'draft'      },
  revise:     { from: 'rejected',   to: 'draft'      },
  deprecate:  { from: 'accepted',   to: 'deprecated' },
  reactivate: { from: 'deprecated', to: 'draft'      },
  supersede:  { from: 'accepted',   to: 'superseded' },
};
```

---

## 4. How Versioning Works

**Scenario**: CAP-001 is accepted at v1. Someone wants to change it.

1. System creates a **new draft** of CAP-001 with `version: 2`, `supersedes: "CAP-001@v1"`
2. New draft goes through `draft → proposed → accepted`
3. When v2 is **accepted**, the system automatically transitions v1 to `superseded` and sets `superseded_by: "CAP-001@v2"` on v1
4. The item ID (`CAP-001`) stays the same. The canonical version is always the one with `status: accepted`

### File naming convention (for markdown files)

- Current: `CAP-001.md` (always points to the accepted version)
- Historical: `CAP-001.v1.md` (superseded version, moved/renamed when superseded)

---

## 5. How This Layers Over Existing Type-Specific Statuses

| Item Type | contribution.status | Type-specific status | Relationship |
|-----------|-------------------|---------------------|-------------|
| Road Item | `accepted` | `proposed → adr_validated → ... → complete` | Type status only meaningful when contribution is `accepted` |
| User Story | `accepted` | `draft → approved → implementing → complete` | Same - type status activates after acceptance |
| User Type | `accepted` | `draft → approved → deprecated` | Same |
| Change Entry | `accepted` | `draft → published → archived` | Same |
| Capability | `accepted` | `planned → stable → deprecated` | Same |
| ADR | `accepted` | `proposed → accepted → deprecated → superseded` | Same |
| NFR | `accepted` | `active → deprecated` | Same |
| Bounded Context | `accepted` | `draft → stable → deprecated` | Same |
| Aggregate | `accepted` | `draft → implemented → deprecated` | Same |
| Glossary Term | `accepted` | *(none)* | Contribution lifecycle is the only lifecycle |
| Value Object | `accepted` | *(none)* | Same |
| Domain Event | `accepted` | *(none)* | Same |
| Use Case | `accepted` | *(none)* | Same |

**Key rule**: An item's type-specific status is **only relevant** when `contribution.status === 'accepted'`. When in draft/proposed/rejected, the type-specific status is frozen.

---

## 6. Items Affected (All 20+ Types)

### Group A - Already have status (add `contribution` block, keep existing status)

1. Road Item (ROAD-XXX)
2. Change Entry (CHANGE-XXX)
3. User Story (US-XXX)
4. User Type (UT-XXX)
5. Capability (CAP-XXX)
6. ADR (ADR-XXX)
7. NFR (NFR-XXX)
8. Bounded Context
9. Aggregate

### Group B - No status currently (add `contribution` block, no type-specific status needed)

10. Value Object
11. Domain Event
12. Glossary Term
13. Use Case

### Group C - Base taxonomy infrastructure nodes (add `contribution` block)

14. System
15. Subsystem
16. Stack
17. Library
18. Layer
19. User (node type)
20. Org Unit

---

## 7. Current State Inventory

For reference, these are all the existing per-type status fields across the system:

| Item Type | Current Status Values | Formal Machine? |
|-----------|----------------------|-----------------|
| Road Item | proposed, adr_validated, bdd_pending, bdd_complete, implementing, nfr_validating, nfr_blocked, complete | Yes (transitions + gates) |
| Change Entry | draft, published, archived | Partial (signature gates) |
| User Story | draft, approved, implementing, complete, deprecated | No |
| User Type | draft, approved, deprecated | No |
| Capability | planned, stable, deprecated | No |
| ADR | proposed, accepted, deprecated, superseded | No |
| NFR | active, deprecated | No |
| Bounded Context | draft, stable, deprecated | No |
| Aggregate | draft, implemented, deprecated | No |
| Value Object | *(none)* | No |
| Domain Event | *(none)* | No |
| Glossary Term | *(none)* | No |
| Use Case | *(none)* | No |

---

## 8. Implementation Steps

| Step | What | Where |
|------|------|-------|
| 1 | Create `ContributionSchema` + transition validator | `packages/foe-schemas/src/taxonomy/contribution.ts` |
| 2 | Add `contribution` field to `TaxonomyNodeSchema` (base) | `packages/foe-schemas/src/taxonomy/taxonomy-node.ts` |
| 3 | Add `contribution` field to all 13 extension schemas | `packages/foe-schemas/src/taxonomy/extensions/*.ts` |
| 4 | Add `contribution` field to all stored/CRUD schemas | `packages/foe-schemas/src/taxonomy/stored/*.ts` |
| 5 | Update governance linter to validate contribution transitions | `packages/delivery-framework/scripts/governance-linter.js` |
| 6 | Update all existing markdown frontmatter files (~200+ files) | `packages/delivery-framework/{roads,changes,capabilities,...}/*.md` |
| 7 | Add contribution-aware API endpoints (submit, accept, reject, etc.) | `packages/intelligence/` or new package |
| 8 | Update Web UI to show contribution status | `packages/foe-web-ui/` |

---

## 9. Permission Model Hooks (Future)

When we get to "who can do what," the contribution lifecycle provides clean permission hooks:

| Action | Permission Needed |
|--------|------------------|
| Create draft | `contribute` on item type |
| Submit (draft → proposed) | `contribute` on item type |
| Withdraw (proposed → draft) | `contribute` + must be submitter |
| Accept (proposed → accepted) | `review` on item type |
| Reject (proposed → rejected) | `review` on item type |
| Revise (rejected → draft) | `contribute` + must be submitter |
| Deprecate | `admin` on item type |
| Reactivate | `admin` on item type |

Each permission can be scoped per item type (e.g., "can review Capabilities but not Road Items").

### Three permission levels per item type

| Level | Actions | Description |
|-------|---------|-------------|
| `view` | Read accepted + proposed items | Default for all authenticated users |
| `contribute` | Create drafts, submit, withdraw, revise | Content authors |
| `review` | Accept, reject proposed items | Domain experts / leads |
| `admin` | Deprecate, reactivate, manage permissions | System administrators |

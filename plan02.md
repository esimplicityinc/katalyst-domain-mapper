# Plan 02: Universal Contribution Management UI

## Overview

A global slide-out panel accessible from any page in the Katalyst intelligence web UI (`packages/intelligence/web/`). It provides a unified inbox for managing the contribution lifecycle of all item types, plus inline contribution indicators on existing item-specific pages.

**Location:** `packages/intelligence/web/` (extends the existing React + Tailwind + Vite application)

### Design Decisions

- **Global nav trigger**: A persistent icon/badge in the sidebar (or top bar on mobile) showing a count of items needing attention. Clicking opens a slide-out panel from the right.
- **Queue list + drill-in**: The panel shows a filtered list of all items across all types. Clicking an item drills into its contribution detail + transition actions within the same panel.
- **Inline + detail actions**: Quick actions (accept/reject) inline on cards, full workflow (reject with feedback, version history) in the detail view.
- **Full scope**: New contribution queue, API endpoints, per-type overlays on existing pages, reusable components, version history.

---

## 1. Interaction Model

### 1.1 Global Trigger

A contribution bell/inbox icon added to the Layout component, positioned in the sidebar footer area (above the dark mode toggle) on desktop, and in the mobile top bar.

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar                           │  Main Content       │
│  ┌──────────────┐                  │                     │
│  │ Katalyst Logo │                 │                     │
│  ├──────────────┤                  │                     │
│  │ Design   ▼   │                 │                     │
│  │   Business   │                 │                     │
│  │   Architect  │                 │                     │
│  │   User Types │                 │                     │
│  │ Strategy ▼   │                 │                     │
│  │   FOE Proj   │                 │                     │
│  │   Governance │                 │                     │
│  │ ...          │                 │                     │
│  │              │                 │                     │
│  ├──────────────┤                  │                     │
│  │ 📥 Contributions (3)│  <-- NEW │                     │
│  │ 🌙 Dark Mode │                 │                     │
│  └──────────────┘                  │                     │
└──────────────────────────────────────────────────────────┘
```

The badge count shows: items in `proposed` state (for reviewers) + items in `rejected` state (for contributors). This count is fetched from a new API endpoint on an interval (e.g., every 30s).

### 1.2 Slide-Out Panel (Queue View)

Opens from the right edge, width ~480px (consistent with existing detail panels but slightly wider for queue list). Has a semi-transparent backdrop overlay on mobile.

```
┌─────────────────────────────────────┬──────────────────────┐
│  Main Content (dimmed)              │  Contribution Panel  │
│                                     │ ┌──────────────────┐ │
│                                     │ │ ✕  Contributions │ │
│                                     │ ├──────────────────┤ │
│                                     │ │ [My Drafts] [Pending│
│                                     │ │  Review] [Rejected] │
│                                     │ │ [Accepted] [All]    │
│                                     │ ├──────────────────┤ │
│                                     │ │ 🔍 Search...     │ │
│                                     │ │ Type: [All ▼]    │ │
│                                     │ ├──────────────────┤ │
│                                     │ │ ┌──────────────┐ │ │
│                                     │ │ │ CAP-012 v2   │ │ │
│                                     │ │ │ Capability   │ │ │
│                                     │ │ │ ● proposed   │ │ │
│                                     │ │ │ [Accept][Reject]│ │
│                                     │ │ └──────────────┘ │ │
│                                     │ │ ┌──────────────┐ │ │
│                                     │ │ │ UT-003 v1    │ │ │
│                                     │ │ │ User Type    │ │ │
│                                     │ │ │ ● draft      │ │ │
│                                     │ │ │       [Submit]│ │ │
│                                     │ │ └──────────────┘ │ │
│                                     │ │        ...       │ │
│                                     │ └──────────────────┘ │
└─────────────────────────────────────┴──────────────────────┘
```

**Tab filters:**

| Tab | Shows | Badge Count |
|-----|-------|-------------|
| My Drafts | Items where I am the submitter and status = `draft` | Count |
| Pending Review | Items with status = `proposed` | Count |
| Rejected | Items with status = `rejected` (authored by me) | Count |
| Accepted | Items with status = `accepted` (recent, last 20) | — |
| All | All items, all statuses | — |

**Type filter dropdown:** All / Capability / User Type / User Story / Road Item / ADR / NFR / Domain Event / Value Object / Glossary Term / Bounded Context / Aggregate / Use Case / Change Entry

### 1.3 Slide-Out Panel (Detail View - Drill-In)

Clicking an item in the queue list transitions the panel to a detail view with a back button.

```
┌──────────────────────┐
│ ← Back  CAP-012 v2   │
├──────────────────────┤
│                      │
│ ● Proposed           │
│ Capability           │
│                      │
│ ┌──────────────────┐ │
│ │ Title: OAuth2... │ │
│ │ Category: Secur. │ │
│ │ Status: planned  │ │
│ │ (type-specific)  │ │
│ └──────────────────┘ │
│                      │
│ ── Contribution ──   │
│ Submitted by: @jane  │
│ Submitted: 2026-03-14│
│ Version: 2           │
│ Supersedes: v1       │
│                      │
│ ── Actions ──────    │
│ [Accept]  [Reject]   │
│                      │
│ Rejection feedback:  │
│ ┌──────────────────┐ │
│ │ (textarea)       │ │
│ └──────────────────┘ │
│                      │
│ ── Version History ──│
│ v2 ● proposed (now)  │
│ v1 ● accepted        │
│                      │
│ ── Diff from v1 ──   │
│ + Added OAuth2 scope │
│ - Removed basic auth │
└──────────────────────┘
```

---

## 2. Reusable Components

These components are the building blocks, designed to be used both in the slide-out panel AND inline on existing type-specific pages.

### 2.1 `ContributionBadge`

Displays the contribution status as a colored pill badge.

```
New file: src/components/contribution/ContributionBadge.tsx
```

| Status | Color | Icon |
|--------|-------|------|
| `draft` | Gray | Pencil |
| `proposed` | Blue | Clock |
| `rejected` | Red | XCircle |
| `accepted` | Green | CheckCircle |
| `deprecated` | Amber/Yellow | Archive |
| `superseded` | Gray (strikethrough) | GitBranch |

**Props:**
```typescript
interface ContributionBadgeProps {
  status: ContributionStatus;
  version?: number;
  size?: 'sm' | 'md';
  showVersion?: boolean;
}
```

### 2.2 `TransitionActions`

Context-sensitive action buttons based on current status and user role.

```
New file: src/components/contribution/TransitionActions.tsx
```

**Props:**
```typescript
interface TransitionActionsProps {
  item: ContributionItem;
  onTransition: (action: ContributionAction, feedback?: string) => Promise<void>;
  layout?: 'inline' | 'full';  // inline = compact buttons, full = with feedback textarea
  loading?: boolean;
}
```

**Renders:**

| Current Status | Buttons Shown (inline) | Buttons Shown (full) |
|---------------|----------------------|---------------------|
| `draft` | `[Submit for Review]` | Same + preview |
| `proposed` | `[Accept] [Reject]` | Same + feedback textarea + withdraw |
| `rejected` | `[Revise]` | Same + shows rejection feedback |
| `accepted` | `[Create New Version] [Deprecate]` | Same + version history |
| `deprecated` | `[Reactivate]` | Same |
| `superseded` | *(none, read-only)* | Shows "Superseded by vN" link |

### 2.3 `ContributionTimeline`

A vertical timeline showing the contribution history of an item across versions.

```
New file: src/components/contribution/ContributionTimeline.tsx
```

```
  v2 ● proposed ─── submitted by @jane, Mar 14 2026
  │
  v1 ● accepted ─── accepted by @bob, Mar 10 2026
  │                  submitted by @jane, Mar 8 2026
  │
  v1 ○ draft ────── created by @jane, Mar 5 2026
```

**Props:**
```typescript
interface ContributionTimelineProps {
  itemId: string;
  versions: ContributionVersion[];
}
```

### 2.4 `VersionDiff`

Shows what changed between two versions of an item. Renders a structured diff of the item's fields.

```
New file: src/components/contribution/VersionDiff.tsx
```

Not a raw text diff - a **field-level** comparison:

```
┌─────────────────────────────────────┐
│ Changes from v1 → v2                │
├─────────────────────────────────────┤
│ title:  "Basic Auth" → "OAuth2..."  │
│ category:  (unchanged)              │
│ description:  + 3 lines added       │
│ dependsOn:  + ["CAP-005"]           │
└─────────────────────────────────────┘
```

### 2.5 `ReviewFeedbackForm`

A textarea + submit for reject feedback, shown in the detail view when a reviewer clicks "Reject."

```
New file: src/components/contribution/ReviewFeedbackForm.tsx
```

**Props:**
```typescript
interface ReviewFeedbackFormProps {
  onSubmit: (feedback: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

### 2.6 `ContributionQueueItem`

A card component for rendering a single item in the queue list.

```
New file: src/components/contribution/ContributionQueueItem.tsx
```

```
┌───────────────────────────────────┐
│ 📦 CAP-012                  v2   │
│ OAuth2 Authorization Capability   │
│ Capability · Security             │
│                                   │
│ ● proposed  ·  submitted 2h ago   │
│ by @jane                          │
│                                   │
│             [Accept] [Reject]  →  │
└───────────────────────────────────┘
```

Shows: item ID, title, item type badge, category (if applicable), contribution status, submitter, time since last action, inline transition actions, and a chevron to drill into detail.

---

## 3. Slide-Out Panel Components

### 3.1 `ContributionPanel`

The main slide-out container. Manages the queue-list vs. detail-view state internally.

```
New file: src/components/contribution/ContributionPanel.tsx
```

**Props:**
```typescript
interface ContributionPanelProps {
  open: boolean;
  onClose: () => void;
}
```

**Internal state:**
- `view: 'queue' | 'detail'`
- `selectedItem: ContributionItem | null`
- `activeTab: 'drafts' | 'pending' | 'rejected' | 'accepted' | 'all'`
- `typeFilter: string | null`
- `searchQuery: string`

### 3.2 `ContributionQueueList`

The scrollable list of items, with tab bar and filters at top.

```
New file: src/components/contribution/ContributionQueueList.tsx
```

### 3.3 `ContributionDetail`

The drill-in detail view for a single item. Shows item summary, contribution metadata, actions, timeline, and version diff.

```
New file: src/components/contribution/ContributionDetail.tsx
```

---

## 4. Layout Integration

### 4.1 Global State: `ContributionProvider`

A React context that provides contribution panel state and counts across the entire app.

```
New file: src/components/contribution/ContributionProvider.tsx
```

```typescript
interface ContributionContextValue {
  // Panel control
  isOpen: boolean;
  open: (options?: { tab?: string; itemId?: string }) => void;
  close: () => void;

  // Badge counts (fetched on interval)
  counts: {
    myDrafts: number;
    pendingReview: number;
    rejected: number;
  };
  refreshCounts: () => Promise<void>;
}
```

Wraps the entire app in `App.tsx` (inside `<BrowserRouter>`). Fetches counts every 30 seconds from `GET /api/v1/contributions/counts`.

### 4.2 Layout.tsx Changes

Add a `ContributionTrigger` button in the sidebar footer, between the nav and the dark mode toggle:

```tsx
{/* Contribution inbox trigger */}
<button onClick={contribution.open} className="...">
  <Inbox className="w-4 h-4" />
  Contributions
  {totalCount > 0 && (
    <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
      {totalCount}
    </span>
  )}
</button>
```

The `<ContributionPanel />` component renders at the Layout level (sibling to `<main>`), so it overlays the main content regardless of which page/route is active.

### 4.3 App.tsx Changes

Wrap routes with `<ContributionProvider>`:

```tsx
<BrowserRouter>
  <ContributionProvider>
    <Routes>
      <Route element={<Layout />}>
        ...existing routes...
      </Route>
    </Routes>
  </ContributionProvider>
</BrowserRouter>
```

---

## 5. Per-Type Page Overlays

Existing pages get contribution awareness without major rewrites. Each item card/row gains a `ContributionBadge` and inline `TransitionActions`.

### 5.1 UserTypeListView Changes

Each user type card in the grid gains:
- A `<ContributionBadge>` next to the existing `<StatusBadge>`
- Inline `<TransitionActions layout="inline">` at the card footer
- Click-to-open contribution detail: calls `contribution.open({ itemId: 'UT-003' })`

### 5.2 UserStoryBoardView Changes

The kanban board gets:
- `<ContributionBadge>` on each story card
- Cards in `draft` contribution status are visually muted (lower opacity, dashed border)
- Cards in `proposed` status get a subtle blue left-border highlight

### 5.3 CapabilityTreeView Changes

The tree nodes gain:
- `<ContributionBadge size="sm">` inline with capability name
- Detail panel gets a "Contribution" section showing status + actions

### 5.4 KanbanBoard (Governance Roads) Changes

Road item cards gain:
- `<ContributionBadge>` (contribution lifecycle is separate from the 8-state governance lifecycle)
- Note: Road items must be `accepted` in contribution before their governance status is meaningful

### 5.5 Domain Model Views (ContextMapView, AggregateTreeView, etc.)

Domain artifacts (bounded contexts, aggregates, events, value objects, glossary terms) gain:
- `<ContributionBadge>` on each node/card
- Contribution status filtering in existing filter toolbars

### 5.6 GovernanceDashboard Changes

Add a new "Contribution Queue" summary card at the top:
- Shows counts by status (drafts, pending, rejected)
- Click-through opens the contribution panel filtered by status

---

## 6. API Endpoints

New endpoints under `/api/v1/contributions/` to support the universal contribution lifecycle.

### 6.1 New Route File

```
New file: packages/intelligence/api/http/routes/contributions.ts
```

### 6.2 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/contributions` | List items with contribution data. Query: `?status=proposed&type=capability&submittedBy=...&search=...&limit=20&offset=0` |
| GET | `/api/v1/contributions/counts` | Badge counts: `{ myDrafts, pendingReview, rejected }` |
| GET | `/api/v1/contributions/:type/:id` | Get contribution detail for a specific item (includes all versions) |
| POST | `/api/v1/contributions/:type/:id/submit` | Transition: draft → proposed |
| POST | `/api/v1/contributions/:type/:id/accept` | Transition: proposed → accepted |
| POST | `/api/v1/contributions/:type/:id/reject` | Transition: proposed → rejected. Body: `{ feedback: string }` |
| POST | `/api/v1/contributions/:type/:id/withdraw` | Transition: proposed → draft |
| POST | `/api/v1/contributions/:type/:id/revise` | Transition: rejected → draft |
| POST | `/api/v1/contributions/:type/:id/deprecate` | Transition: accepted → deprecated |
| POST | `/api/v1/contributions/:type/:id/reactivate` | Transition: deprecated → draft |
| POST | `/api/v1/contributions/:type/:id/new-version` | Create new draft version of an accepted item |
| GET | `/api/v1/contributions/:type/:id/versions` | List all versions of an item |
| GET | `/api/v1/contributions/:type/:id/diff/:v1/:v2` | Field-level diff between two versions |

**`:type` parameter values:** `capability`, `user-type`, `user-story`, `road-item`, `adr`, `nfr`, `change-entry`, `bounded-context`, `aggregate`, `value-object`, `domain-event`, `glossary-term`, `use-case`

### 6.3 Response Shapes

**List response** (`GET /contributions`):
```typescript
interface ContributionListResponse {
  items: ContributionListItem[];
  total: number;
  counts: {
    draft: number;
    proposed: number;
    rejected: number;
    accepted: number;
    deprecated: number;
    superseded: number;
  };
}

interface ContributionListItem {
  itemType: string;       // "capability" | "user-type" | ...
  itemId: string;         // "CAP-012" | "UT-003" | ...
  title: string;          // Human-readable title
  contribution: {
    status: ContributionStatus;
    version: number;
    submittedBy: string | null;
    submittedAt: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewFeedback: string | null;
    createdAt: string;
    updatedAt: string;
  };
  // Minimal item-specific metadata for display
  metadata: Record<string, unknown>;  // e.g., { category: "Security", archetype: "operator" }
}
```

**Transition response** (`POST .../submit`, `.../accept`, etc.):
```typescript
interface TransitionResponse {
  success: boolean;
  item: ContributionListItem;   // Updated item
  transition: {
    from: ContributionStatus;
    to: ContributionStatus;
    action: string;
    timestamp: string;
  };
}
```

### 6.4 API Client Additions

```
Modified file: src/api/client.ts
```

Add a `contributions` namespace to the existing `api` object:

```typescript
contributions: {
  list(params?: ContributionListParams): Promise<ContributionListResponse>;
  counts(): Promise<ContributionCounts>;
  getDetail(type: string, id: string): Promise<ContributionDetail>;
  submit(type: string, id: string): Promise<TransitionResponse>;
  accept(type: string, id: string): Promise<TransitionResponse>;
  reject(type: string, id: string, feedback: string): Promise<TransitionResponse>;
  withdraw(type: string, id: string): Promise<TransitionResponse>;
  revise(type: string, id: string): Promise<TransitionResponse>;
  deprecate(type: string, id: string): Promise<TransitionResponse>;
  reactivate(type: string, id: string): Promise<TransitionResponse>;
  createNewVersion(type: string, id: string): Promise<TransitionResponse>;
  versions(type: string, id: string): Promise<ContributionVersion[]>;
  diff(type: string, id: string, v1: number, v2: number): Promise<FieldDiff[]>;
}
```

---

## 7. Database Changes

### 7.1 New Table: `contribution_items`

A universal table that tracks the contribution lifecycle for any item in the system.

```sql
CREATE TABLE contribution_items (
  id            TEXT PRIMARY KEY,               -- UUID
  item_type     TEXT NOT NULL,                  -- 'capability' | 'user-type' | ...
  item_id       TEXT NOT NULL,                  -- 'CAP-012' | 'UT-003' | ...
  version       INTEGER NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'draft',  -- draft|proposed|rejected|accepted|deprecated|superseded
  supersedes    TEXT,                           -- 'CAP-012@v1'
  superseded_by TEXT,                           -- 'CAP-012@v2'
  submitted_by  TEXT,
  submitted_at  TEXT,                           -- ISO-8601
  reviewed_by   TEXT,
  reviewed_at   TEXT,                           -- ISO-8601
  review_feedback TEXT,
  created_at    TEXT NOT NULL,                  -- ISO-8601
  updated_at    TEXT NOT NULL,                  -- ISO-8601
  
  UNIQUE(item_type, item_id, version)
);

CREATE INDEX idx_contribution_status ON contribution_items(status);
CREATE INDEX idx_contribution_type ON contribution_items(item_type);
CREATE INDEX idx_contribution_item ON contribution_items(item_type, item_id);
CREATE INDEX idx_contribution_submitted_by ON contribution_items(submitted_by);
```

### 7.2 New Table: `contribution_audit_log`

Tracks every transition for audit/history.

```sql
CREATE TABLE contribution_audit_log (
  id          TEXT PRIMARY KEY,     -- UUID
  contrib_id  TEXT NOT NULL REFERENCES contribution_items(id),
  action      TEXT NOT NULL,        -- 'submit' | 'accept' | 'reject' | ...
  from_status TEXT NOT NULL,
  to_status   TEXT NOT NULL,
  actor       TEXT,                 -- who performed the action
  feedback    TEXT,                 -- rejection feedback, etc.
  timestamp   TEXT NOT NULL,        -- ISO-8601
  
  FOREIGN KEY (contrib_id) REFERENCES contribution_items(id)
);

CREATE INDEX idx_audit_contrib ON contribution_audit_log(contrib_id);
```

### 7.3 New Table: `contribution_versions`

Stores snapshots of item data at each version for diff.

```sql
CREATE TABLE contribution_versions (
  id          TEXT PRIMARY KEY,     -- UUID
  contrib_id  TEXT NOT NULL REFERENCES contribution_items(id),
  version     INTEGER NOT NULL,
  item_data   TEXT NOT NULL,        -- JSON snapshot of the full item at this version
  created_at  TEXT NOT NULL,
  
  FOREIGN KEY (contrib_id) REFERENCES contribution_items(id)
);

CREATE INDEX idx_version_contrib ON contribution_versions(contrib_id);
```

### 7.4 Migration

```
New file: packages/intelligence/drizzle/XXXX_add_contribution_tables.sql
```

Plus corresponding Drizzle schema additions in `packages/intelligence/api/db/schema.ts`.

---

## 8. Backend Service Layer

### 8.1 Contribution Use Case

Following the existing hexagonal architecture pattern in the intelligence package.

```
New file: packages/intelligence/api/usecases/contribution.ts
```

**Key operations:**
- `listContributions(filters)` — Query across all item types
- `getContributionDetail(type, id)` — Full detail + versions
- `performTransition(type, id, action, actor, feedback?)` — Validates transition against state machine, updates status, writes audit log
- `createNewVersion(type, id, actor)` — Clones accepted item into new draft at version+1
- `getVersionDiff(type, id, v1, v2)` — Field-level diff between two version snapshots

### 8.2 Contribution Port

```
New file: packages/intelligence/api/ports/contribution-port.ts
```

Interface for the contribution repository, allowing the use case to remain storage-agnostic.

### 8.3 Contribution Adapter

```
New file: packages/intelligence/api/adapters/contribution-adapter.ts
```

SQLite/Drizzle implementation of the contribution port.

---

## 9. Types (Shared)

### 9.1 Contribution UI Types

```
New file: packages/intelligence/web/src/types/contribution.ts
```

```typescript
export type ContributionStatus = 'draft' | 'proposed' | 'rejected' | 'accepted' | 'deprecated' | 'superseded';

export type ContributionAction = 'submit' | 'accept' | 'reject' | 'withdraw' | 'revise' | 'deprecate' | 'reactivate' | 'supersede';

export type ContributableItemType =
  | 'capability' | 'user-type' | 'user-story'
  | 'road-item' | 'adr' | 'nfr' | 'change-entry'
  | 'bounded-context' | 'aggregate' | 'value-object'
  | 'domain-event' | 'glossary-term' | 'use-case';

export interface ContributionItem {
  itemType: ContributableItemType;
  itemId: string;
  title: string;
  contribution: ContributionData;
  metadata: Record<string, unknown>;
}

export interface ContributionData {
  status: ContributionStatus;
  version: number;
  supersedes: string | null;
  supersededBy: string | null;
  submittedBy: string | null;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewFeedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionVersion {
  version: number;
  status: ContributionStatus;
  createdAt: string;
  submittedBy: string | null;
  reviewedBy: string | null;
  reviewFeedback: string | null;
}

export interface FieldDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'added' | 'removed' | 'modified' | 'unchanged';
}

export interface ContributionCounts {
  myDrafts: number;
  pendingReview: number;
  rejected: number;
}

// Display constants
export const CONTRIBUTION_STATUS_COLORS: Record<ContributionStatus, string> = {
  draft:      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  proposed:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  rejected:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  accepted:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  deprecated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  superseded: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500',
};

export const CONTRIBUTION_STATUS_LABELS: Record<ContributionStatus, string> = {
  draft:      'Draft',
  proposed:   'Pending Review',
  rejected:   'Rejected',
  accepted:   'Accepted',
  deprecated: 'Deprecated',
  superseded: 'Superseded',
};

export const ITEM_TYPE_LABELS: Record<ContributableItemType, string> = {
  'capability':      'Capability',
  'user-type':       'User Type',
  'user-story':      'User Story',
  'road-item':       'Road Item',
  'adr':             'ADR',
  'nfr':             'NFR',
  'change-entry':    'Change Entry',
  'bounded-context': 'Bounded Context',
  'aggregate':       'Aggregate',
  'value-object':    'Value Object',
  'domain-event':    'Domain Event',
  'glossary-term':   'Glossary Term',
  'use-case':        'Use Case',
};
```

---

## 10. File Inventory

### New Files (18 total)

**Frontend Components (11):**
| # | File | Purpose |
|---|------|---------|
| 1 | `web/src/components/contribution/ContributionPanel.tsx` | Main slide-out panel container |
| 2 | `web/src/components/contribution/ContributionQueueList.tsx` | Queue list with tabs + filters |
| 3 | `web/src/components/contribution/ContributionQueueItem.tsx` | Single item card in queue |
| 4 | `web/src/components/contribution/ContributionDetail.tsx` | Drill-in detail view |
| 5 | `web/src/components/contribution/ContributionBadge.tsx` | Reusable status badge |
| 6 | `web/src/components/contribution/TransitionActions.tsx` | Context-sensitive action buttons |
| 7 | `web/src/components/contribution/ContributionTimeline.tsx` | Version history timeline |
| 8 | `web/src/components/contribution/VersionDiff.tsx` | Field-level diff display |
| 9 | `web/src/components/contribution/ReviewFeedbackForm.tsx` | Reject feedback textarea |
| 10 | `web/src/components/contribution/ContributionProvider.tsx` | React context + global state |
| 11 | `web/src/types/contribution.ts` | TypeScript types + display constants |

**Backend (6):**
| # | File | Purpose |
|---|------|---------|
| 12 | `api/http/routes/contributions.ts` | API route handlers |
| 13 | `api/usecases/contribution.ts` | Business logic |
| 14 | `api/ports/contribution-port.ts` | Port interface |
| 15 | `api/adapters/contribution-adapter.ts` | SQLite adapter |
| 16 | `api/db/schema.ts` (modified) | Add 3 new tables |
| 17 | `drizzle/XXXX_add_contribution_tables.sql` | Migration |

**Shared Schema (1):**
| # | File | Purpose |
|---|------|---------|
| 18 | `packages/foe-schemas/src/taxonomy/contribution.ts` | Zod schema (from plan01) |

### Modified Files (10)

| # | File | Change |
|---|------|--------|
| 1 | `web/src/App.tsx` | Wrap with `ContributionProvider` |
| 2 | `web/src/components/Layout.tsx` | Add contribution trigger button + render `ContributionPanel` |
| 3 | `web/src/api/client.ts` | Add `contributions` namespace |
| 4 | `web/src/components/user-types/UserTypeListView.tsx` | Add `ContributionBadge` + `TransitionActions` |
| 5 | `web/src/components/user-types/UserStoryBoardView.tsx` | Add `ContributionBadge` on cards |
| 6 | `web/src/components/taxonomy/CapabilityTreeView.tsx` | Add `ContributionBadge` on nodes |
| 7 | `web/src/components/domain/KanbanBoard.tsx` | Add `ContributionBadge` on road items |
| 8 | `web/src/pages/GovernanceDashboard.tsx` | Add contribution queue summary card |
| 9 | `api/http/server.ts` | Register new contributions route |
| 10 | `api/db/schema.ts` | Add contribution tables to Drizzle schema |

---

## 11. Implementation Order

| Phase | Tasks | Depends On |
|-------|-------|-----------|
| **Phase 1: Schema + DB** | Create Zod `ContributionSchema` (plan01). Add 3 DB tables + migration. Create Drizzle schema. | — |
| **Phase 2: Backend** | Implement port, adapter, use case. Add API routes. Register in server. | Phase 1 |
| **Phase 3: Types + Client** | Create `contribution.ts` types. Add `contributions` namespace to API client. | Phase 2 |
| **Phase 4: Core Components** | Build `ContributionBadge`, `TransitionActions`, `ReviewFeedbackForm`. | Phase 3 |
| **Phase 5: Panel** | Build `ContributionPanel`, `ContributionQueueList`, `ContributionQueueItem`, `ContributionDetail`. | Phase 4 |
| **Phase 6: Provider + Layout** | Build `ContributionProvider`. Integrate into `App.tsx` and `Layout.tsx`. | Phase 5 |
| **Phase 7: Timeline + Diff** | Build `ContributionTimeline` and `VersionDiff`. | Phase 5 |
| **Phase 8: Page Overlays** | Add badges/actions to UserTypeListView, UserStoryBoardView, CapabilityTreeView, KanbanBoard, GovernanceDashboard. | Phase 4 + 6 |

---

## 12. UX Details

### 12.1 Animations

- **Panel open/close**: Slide from right with `transform: translateX()`, 200ms ease-in-out (matches existing sidebar animation)
- **Queue → Detail transition**: Cross-fade with slide-left, 150ms
- **Detail → Queue (back)**: Cross-fade with slide-right, 150ms
- **Badge count update**: Scale pulse animation when count changes

### 12.2 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close panel (if open) |
| `Backspace` (in detail view) | Go back to queue |

### 12.3 Empty States

| Tab | Empty State Message |
|-----|-------------------|
| My Drafts | "No drafts. Create a new item from any page to start contributing." |
| Pending Review | "No items pending review. All caught up!" |
| Rejected | "No rejected items. Your submissions are looking great." |
| Accepted | "No recently accepted items." |

### 12.4 Loading States

- Queue list: Skeleton cards (3 placeholder cards with pulsing animation)
- Detail view: Skeleton layout matching the detail structure
- Transition actions: Button shows spinner, disabled during request
- Count badge: No skeleton (shows cached count, updates silently)

### 12.5 Error States

- API failure on list: "Failed to load contributions. [Retry]" with red AlertCircle icon
- Transition failure: Toast-style error message at top of panel, auto-dismiss after 5s
- Network offline: Badge shows "—" instead of count

### 12.6 Mobile Behavior

- Panel becomes full-width on screens < 768px (same as existing sidebar behavior)
- Backdrop overlay to close
- Trigger moves to mobile top bar (next to hamburger menu)
- Swipe-right to close (optional enhancement)

### 12.7 Dark Mode

All components use Tailwind `dark:` variants, consistent with the existing color system defined in `web/src/styles/colors.css` and the `CONTRIBUTION_STATUS_COLORS` map.

# Plan 03: AI-Assisted Contribution Management Chat

## Overview

A unified AI chat tab inside the contribution slide-out panel (from plan02) that replaces the 3 existing per-page chats (DDDChat, TaxonomyChat, UserTypeChat) with a single, contribution-aware assistant. The AI can create, edit, review, and manage items across all types, but every AI action goes through the contribution lifecycle with human-in-the-loop confirmation.

**Core principle**: AI proposes, human accepts. The AI creates items as `proposed` in the contribution lifecycle. Humans review and accept/reject via the contribution queue or inline in chat using the OpenCode question tool.

---

## 1. Architecture Change: From 3 Chats to 1

### Current State

```
DomainMapperPage
  └── DDDChat (agent: ddd-domain-mapper)
        └── Creates bounded contexts, aggregates, events, glossary, workflows via curl
        └── Items go directly to DB with no review gate

ArchitecturePage
  └── TaxonomyChat (agent: taxonomy-architect)
        └── Creates/updates capabilities, taxonomy nodes via curl
        └── Items go directly to DB

UserTypesPage
  └── UserTypeChat (agent: user-type-storyteller)
        └── Creates/updates user types, user stories via curl
        └── Items go directly to DB
```

**Problems:**
- 3 separate agents with duplicated patterns
- No contribution lifecycle integration
- Items bypass human review
- `onModelUpdated`/`onUpdated` callbacks declared but never called (stale UI)
- Each chat only knows about its own domain

### Target State

```
ContributionPanel (global, any page)
  ├── Queue Tab (from plan02)
  ├── Detail View (from plan02)
  └── Chat Tab (NEW)
        └── ContributionChat (agent: contribution-assistant)
              └── Single agent that handles ALL item types
              └── Uses question tool for human confirmation before creating
              └── Creates items as 'proposed' in contribution lifecycle
              └── Can also accept/reject/manage items (with confirmation)
              └── Context-aware: knows current page, selected items, queue state
```

**Existing per-page chat tabs removed:**
- `DDDChat.tsx` → removed, tab removed from DomainMapperPage
- `TaxonomyChat.tsx` → removed, tab removed from ArchitecturePage  
- `UserTypeChat.tsx` → removed, tab removed from UserTypesPage

The contribution panel's chat replaces all three. Since the panel is globally accessible, users can chat from any page.

---

## 2. The Contribution Assistant Agent

### 2.1 New Agent Definition

```
New file: .opencode/agents/contribution-assistant.md
```

A single agent that combines the capabilities of `ddd-domain-mapper`, `taxonomy-architect`, and `user-type-storyteller`, plus new contribution lifecycle management abilities.

**Key properties:**

| Property | Value |
|----------|-------|
| Name | `contribution-assistant` |
| Mode | `primary` |
| Model | `claude-sonnet-4-5` (or configured model) |
| Temperature | 0.3 |
| Tools | bash (curl only), question |
| Write/Edit | false (API-only mutations) |

**Bash permissions (same restricted pattern as existing agents):**
```yaml
permission:
  bash:
    "*": deny
    "grep *": allow
    "find *": allow
    "wc *": allow
    "ls *": allow
    "curl *": allow
```

### 2.2 Agent Capabilities

The agent system prompt instructs it to:

1. **Discover and create items** across all 13 item types (bounded contexts, aggregates, events, value objects, glossary terms, workflows, capabilities, user types, user stories, road items, ADRs, NFRs, change entries)

2. **Always use the question tool before creating** - Present the proposed item as an interactive card so the human can approve, edit, or skip before the curl call is made

3. **Route all creates through the contribution API** - Instead of calling `POST /api/v1/domain-models/{id}/contexts` directly, call `POST /api/v1/contributions/create` which creates the item AND sets `contribution.status = 'proposed'`

4. **Manage contribution lifecycle** - Accept, reject, deprecate items when asked, using the contribution transition endpoints (with question tool confirmation)

5. **Provide context-aware help** - Explain why items were rejected, suggest improvements, help write review feedback

6. **Bulk operations** - "Create 5 bounded contexts for this domain" → presents all 5 as question cards, user approves each

### 2.3 Agent System Prompt Structure

```markdown
# Contribution Assistant

You are the Contribution Assistant for the Katalyst platform. You help users discover, create, and manage taxonomy items across all types through the contribution lifecycle.

## Your Capabilities
- Create any item type (bounded contexts, aggregates, events, value objects, glossary terms, workflows, capabilities, user types, user stories, road items, ADRs, NFRs, change entries)
- Manage contribution lifecycle (submit, accept, reject, deprecate, etc.)
- Explain items, suggest improvements, help with review feedback
- Query existing items and their contribution status

## CRITICAL RULES
1. ALWAYS use the question tool to present proposed items to the user BEFORE creating them
2. ALL new items MUST be created through the contribution API endpoints
3. NEVER create items directly via the type-specific CRUD endpoints
4. When accepting/rejecting items, ALWAYS confirm with the user first via question tool

## API Endpoints
[... contribution API endpoints from plan02 ...]
[... type-specific read endpoints for context gathering ...]

## Interaction Patterns
[... detailed patterns for each operation type ...]
```

---

## 3. Chat Tab in Contribution Panel

### 3.1 Panel Tab Layout

The contribution panel (from plan02) gains a third mode: Chat.

```
┌──────────────────────────────┐
│ ✕  Contributions             │
├──────────────────────────────┤
│  [Queue]  [Detail]  [Chat]   │  <-- Tab bar
├──────────────────────────────┤
│                              │
│  (Chat content below)        │
│                              │
└──────────────────────────────┘
```

Alternatively, since Detail is a drill-in from Queue (not a separate tab), the tabs are:

```
│  [Queue]  [Chat]             │
```

With Queue handling the drill-in to detail internally.

### 3.2 Chat Component

```
New file: web/src/components/contribution/ContributionChat.tsx
```

Uses the existing `<OpenCodeChat>` component from `@katalyst/chat` with contribution-specific configuration:

```typescript
interface ContributionChatProps {
  // Context injected from the current page/selection
  pageContext: PageContext;
  // Contribution panel state
  selectedItem?: ContributionItem;
  queueCounts: ContributionCounts;
  // Callback when AI creates/modifies items (to refresh queue)
  onContributionChanged: () => void;
}

interface PageContext {
  currentPage: string;           // 'business-domain' | 'architecture' | 'user-types' | ...
  domainModelId?: string;        // If on domain mapper page
  snapshotId?: string;           // If on architecture page
  selectedContextId?: string;    // If a bounded context is selected
  selectedCapabilityId?: string; // If a capability is selected
  // ... other page-specific context
}
```

### 3.3 Context Preamble

The `buildContextPreamble` function dynamically builds context based on:

1. **Current page** - What the user is looking at
2. **Selected item** - If they clicked an item before opening chat
3. **Queue state** - How many items are pending review, in draft, etc.
4. **Active domain model** - ID and artifact counts (replaces DDDChat's preamble)
5. **Active taxonomy snapshot** - Node and capability counts (replaces TaxonomyChat's preamble)
6. **User type/story counts** - (replaces UserTypeChat's preamble)

```typescript
function buildContextPreamble(ctx: PageContext, counts: ContributionCounts): string {
  let preamble = `CONTRIBUTION CONTEXT:\n`;
  preamble += `- Pending review: ${counts.pendingReview} items\n`;
  preamble += `- My drafts: ${counts.myDrafts} items\n`;
  preamble += `- Rejected: ${counts.rejected} items\n`;
  preamble += `- Current page: ${ctx.currentPage}\n`;

  if (ctx.domainModelId) {
    preamble += `\nDOMAIN MODEL:\n`;
    preamble += `- DOMAIN_MODEL_ID: ${ctx.domainModelId}\n`;
    // ... artifact counts fetched from API
  }

  if (ctx.snapshotId) {
    preamble += `\nTAXONOMY SNAPSHOT:\n`;
    preamble += `- SNAPSHOT_ID: ${ctx.snapshotId}\n`;
    // ... node/capability counts
  }

  // ... user type/story counts always included

  preamble += `\nAPI_BASE: ${apiBase}\n`;
  preamble += `\nIMPORTANT: Use the contribution API endpoints for ALL create/update operations.\n`;

  return preamble;
}
```

### 3.4 Chat Suggestions

Context-aware starter suggestions based on current page:

| Current Page | Suggestions |
|-------------|-------------|
| Business Domain | "Discover bounded contexts", "Add aggregates for [context]", "Review pending domain items" |
| Architecture | "Map system capabilities", "Suggest taxonomy structure", "Review proposed capabilities" |
| User Types | "Identify user types", "Write user stories for [type]", "Review pending stories" |
| Governance | "Summarize contribution queue", "What needs my review?", "Bulk accept approved items" |
| Any | "What's pending review?", "Show rejected items", "Create a new [type]" |

---

## 4. AI-to-Contribution-API Integration

### 4.1 New API Endpoint: Contribution-Aware Create

Instead of the AI calling type-specific CRUD endpoints directly, it calls a unified contribution-aware create endpoint:

```
POST /api/v1/contributions/create
```

**Request body:**
```typescript
{
  itemType: ContributableItemType;  // 'bounded-context' | 'capability' | ...
  parentId?: string;                // e.g., domain model ID for bounded contexts
  data: Record<string, unknown>;    // The item's fields (type-specific)
  submittedBy: string;              // 'ai:contribution-assistant' or user ID
  contributionNote?: string;        // Optional note about why this was created
}
```

**What it does:**
1. Creates the item in the type-specific table (same as existing POST endpoints)
2. Creates a `contribution_items` record with `status: 'proposed'`, `version: 1`, `submitted_by: 'ai:contribution-assistant'`
3. Creates a `contribution_versions` record with the full item snapshot
4. Returns the item with its contribution data

**Response:**
```typescript
{
  item: ContributionListItem;  // From plan02
  created: true;
}
```

### 4.2 Existing Agent Endpoint Changes

The 3 existing agents (`ddd-domain-mapper`, `taxonomy-architect`, `user-type-storyteller`) are **retired**. Their agent definition files are removed. The `contribution-assistant` agent replaces all three.

The existing type-specific CRUD endpoints remain unchanged for direct UI usage, but the AI is instructed to always use the contribution endpoints.

### 4.3 Contribution-Aware Update (New Version)

When the AI suggests edits to an existing accepted item:

```
POST /api/v1/contributions/:type/:id/new-version
```

(Already defined in plan02.) The AI calls this to create a new draft version, then the human reviews the changes.

### 4.4 Contribution Transition via AI

The AI can trigger transitions, but always with question-tool confirmation first:

```
AI: "I see CAP-012 is pending review. Based on the description and completeness, 
     I recommend accepting it. Shall I accept it?"

[Question Card]
  Accept CAP-012?
  ○ Yes, accept it
  ○ No, I'll review it myself
  ○ Reject it (I'll provide feedback)

User selects "Yes, accept it"

AI: curl -X POST .../contributions/capability/CAP-012/accept
```

---

## 5. Human-in-the-Loop Flow: Question Tool Integration

### 5.1 Item Creation Flow

When the AI discovers an item to create:

```
User: "Help me identify bounded contexts for our e-commerce domain"

AI thinks, then uses the question tool:

┌──────────────────────────────────────┐
│ Create Bounded Context?              │
│                                      │
│ Name: Order Management               │
│ Type: Core Subdomain                  │
│ Description: Handles order lifecycle, │
│ payment processing, fulfillment...    │
│ Key Aggregates: Order, Payment        │
│                                      │
│ ○ Create as proposed                  │
│ ○ Edit before creating                │
│ ○ Skip this one                       │
└──────────────────────────────────────┘
```

If user selects "Create as proposed":
1. AI calls `POST /api/v1/contributions/create` with the item data
2. Item appears in the contribution queue as `proposed`
3. Chat shows confirmation: "Created 'Order Management' bounded context as proposed. You can review it in the queue."
4. `onContributionChanged()` callback fires → queue refreshes counts

If user selects "Edit before creating":
1. AI asks follow-up: "What would you like to change?"
2. User provides edits
3. AI presents updated question card
4. Cycle repeats

If user selects "Skip":
1. AI acknowledges and moves on

### 5.2 Bulk Creation Flow

```
User: "Identify all bounded contexts for this domain"

AI identifies 5 contexts, presents them one at a time:

"I've identified 5 bounded contexts. Let me present them one by one."

[Question Card 1/5]: Order Management  → Create / Edit / Skip
[Question Card 2/5]: Inventory         → Create / Edit / Skip
[Question Card 3/5]: Customer Profile  → Create / Edit / Skip
[Question Card 4/5]: Shipping          → Create / Edit / Skip
[Question Card 5/5]: Analytics         → Create / Edit / Skip

"Created 4 bounded contexts as proposed (skipped Analytics). 
 You can review them all in the Contributions queue."
```

### 5.3 Review Assistance Flow

```
User: "Help me review the pending items"

AI: "You have 7 items pending review. Let me summarize them."

AI fetches: GET /api/v1/contributions?status=proposed

"Here's a summary:
 1. CAP-015 'OAuth2 Authorization' - Capability, proposed by @jane
 2. UT-008 'External Auditor' - User Type, proposed by AI
 3. US-045 'Auditor views compliance report' - User Story, proposed by AI
 ..."

[Question Card]
  What would you like to do?
  ○ Review them one by one
  ○ Accept all AI-proposed items
  ○ Show me just the ones I should look closely at
  ○ Let me pick specific items

User: "Review them one by one"

AI presents each item with recommendation:

[Question Card: CAP-015]
  OAuth2 Authorization Capability
  Category: Security, Status: planned
  Proposed by: @jane, 2 hours ago
  
  My assessment: Looks complete. Description is thorough,
  dependencies are properly linked.
  
  ○ Accept
  ○ Reject (provide feedback)
  ○ Skip for now
```

### 5.4 Rejection Feedback Flow

```
User selects "Reject" on a question card

AI: "What feedback would you like to provide?"

User: "The description is too vague and it's missing the OAuth scopes"

AI: curl -X POST .../contributions/capability/CAP-015/reject
     -d '{ "feedback": "Description is too vague. Please add specific OAuth scopes..." }'

"Rejected CAP-015 with feedback. The contributor will see your feedback
 when they revise it."
```

---

## 6. Real-Time Queue Updates

### 6.1 The Stale UI Problem (and Solution)

Today, AI creates items via curl, but the UI doesn't know about it (the `onUpdated` callbacks are never called). With the contribution system, this is solved:

1. **AI creates via contribution API** → contribution record created in DB
2. **`ContributionProvider` polls `GET /api/v1/contributions/counts`** every 30s
3. **Badge count updates** → user sees "3" become "4" in the sidebar trigger
4. **`onContributionChanged` callback** fires from the chat component when AI creates something
5. **Queue list refreshes** immediately (not waiting for poll interval)
6. **Per-page views** can optionally subscribe to contribution changes via the provider context

### 6.2 Provider Enhancement

The `ContributionProvider` from plan02 gains:

```typescript
interface ContributionContextValue {
  // ... existing from plan02 ...
  
  // NEW: Event bus for real-time updates
  lastChangeTimestamp: number;           // Increments on any AI or human action
  subscribe: (callback: () => void) => () => void;  // Subscribe to changes
}
```

Page-level components (ContextMapView, CapabilityTreeView, UserTypeListView) can subscribe to contribution changes and auto-refresh their data:

```typescript
const { lastChangeTimestamp } = useContribution();

useEffect(() => {
  refreshData();  // Re-fetch when contributions change
}, [lastChangeTimestamp]);
```

This solves the stale-UI gap that exists today.

---

## 7. Session Continuity and Context

### 7.1 Single Persistent Session

Unlike the existing chats (which create a new session per page/model), the contribution chat maintains a **single persistent session** across panel open/close cycles. The session is:

- Created on first panel open
- Persisted across panel close/reopen (messages retained in state)
- Reset only when the user explicitly starts a new conversation
- Session ID stored in `ContributionProvider` state (not localStorage, so it resets on page reload)

### 7.2 Dynamic Context Injection

The `buildContextPreamble` is called on **every message**, not just the first one. This means the AI always has the latest context:

- If the user navigates from the Domain page to the User Types page and asks "Create user stories for this," the preamble reflects the new page context
- If items are accepted/rejected between messages, the counts are updated
- The domain model ID, snapshot ID, etc., are always current

### 7.3 Session Title

`sessionTitle: "Contribution Assistant"` (fixed, not per-domain)

### 7.4 Reinit Trigger

The chat reinitializes (new session) only when explicitly requested by the user via a "New Conversation" button in the chat header.

---

## 8. Component Details

### 8.1 `ContributionChat.tsx`

```
New file: web/src/components/contribution/ContributionChat.tsx
```

Wraps `<OpenCodeChat>` from `@katalyst/chat` with contribution-specific config:

```typescript
function ContributionChat({ pageContext, selectedItem, queueCounts, onContributionChanged }: ContributionChatProps) {
  const [reinitTrigger, setReinitTrigger] = useState(0);
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header with "New Conversation" button */}
      <div className="flex items-center justify-between px-4 py-2 border-b ...">
        <span className="text-sm font-medium">AI Assistant</span>
        <button onClick={() => setReinitTrigger(t => t + 1)} className="...">
          New Conversation
        </button>
      </div>
      
      {/* The chat */}
      <OpenCodeChat
        agentName="contribution-assistant"
        model={{ providerID: "amazon-bedrock", modelID: "..." }}
        accentColor="blue"
        title="Contribution Assistant"
        subtitle="Create, review, and manage items with AI"
        opencodeUrl="/opencode"
        sessionTitle="Contribution Assistant"
        reinitTrigger={reinitTrigger}
        buildContextPreamble={(userMessage) => buildContextPreamble(pageContext, queueCounts)}
        suggestions={getSuggestions(pageContext)}
        inputPlaceholder="Ask me to create items, review contributions, or manage the queue..."
        className="flex-1"
      />
    </div>
  );
}
```

### 8.2 `ContributionPanel.tsx` Updates (from plan02)

The panel gains a tab bar switching between Queue and Chat:

```typescript
type PanelView = 'queue' | 'chat';
// Detail is a sub-view of queue, not a separate tab

function ContributionPanel({ open, onClose }: ContributionPanelProps) {
  const [view, setView] = useState<PanelView>('queue');
  const [selectedItem, setSelectedItem] = useState<ContributionItem | null>(null);
  const pageContext = usePageContext();  // Hook that reads current route + page state
  
  return (
    <SlideOutPanel open={open} onClose={onClose} width={480}>
      {/* Header */}
      <PanelHeader onClose={onClose} />
      
      {/* Tab bar */}
      <TabBar active={view} onChange={setView} tabs={[
        { id: 'queue', label: 'Queue', count: totalPendingCount },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
      ]} />
      
      {/* Content */}
      {view === 'queue' && (
        selectedItem 
          ? <ContributionDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
          : <ContributionQueueList onSelectItem={setSelectedItem} />
      )}
      
      {view === 'chat' && (
        <ContributionChat
          pageContext={pageContext}
          selectedItem={selectedItem}
          queueCounts={counts}
          onContributionChanged={refreshCounts}
        />
      )}
    </SlideOutPanel>
  );
}
```

### 8.3 `usePageContext` Hook

```
New file: web/src/hooks/usePageContext.ts
```

Reads the current route and page-level state to build context for the AI:

```typescript
function usePageContext(): PageContext {
  const location = useLocation();
  
  // Determine current page from route
  const currentPage = inferPage(location.pathname);
  
  // Read page-specific state from a shared context or route params
  // (domain model ID, snapshot ID, etc.)
  
  return { currentPage, domainModelId, snapshotId, ... };
}
```

This requires a lightweight `PageContextProvider` that each page writes to when it loads data:

```typescript
// In DomainMapperPage:
const { setPageState } = usePageContextWriter();
useEffect(() => {
  setPageState({ domainModelId: model.id, ... });
}, [model]);
```

---

## 9. Removed Components

### Files Deleted

| # | File | Reason |
|---|------|--------|
| 1 | `web/src/components/domain/DDDChat.tsx` | Replaced by ContributionChat |
| 2 | `web/src/components/taxonomy/TaxonomyChat.tsx` | Replaced by ContributionChat |
| 3 | `web/src/components/user-types/UserTypeChat.tsx` | Replaced by ContributionChat |

### Files Modified (Tab Removal)

| # | File | Change |
|---|------|--------|
| 1 | `web/src/pages/DomainMapperPage.tsx` | Remove "Chat" tab from navigation, remove DDDChat import and route |
| 2 | `web/src/pages/ArchitecturePage.tsx` | Remove "Chat" tab, remove TaxonomyChat import and route |
| 3 | `web/src/pages/UserTypesPage.tsx` | Remove "Chat" tab, remove UserTypeChat import and route |

### Agent Files Retired

| # | File | Reason |
|---|------|--------|
| 1 | `.opencode/agents/ddd-domain-mapper.md` | Capabilities absorbed into contribution-assistant |
| 2 | `.opencode/agents/taxonomy-architect.md` | Capabilities absorbed into contribution-assistant |
| 3 | `.opencode/agents/user-type-storyteller.md` | Capabilities absorbed into contribution-assistant |

### OpenCode Config Update

`opencode.json` updated to:
- Remove the 3 retired agent registrations
- Add the `contribution-assistant` agent registration

---

## 10. New API Endpoint: Unified Create

### 10.1 Route

```
POST /api/v1/contributions/create
```

Added to `api/http/routes/contributions.ts` (from plan02).

### 10.2 Implementation

The use case (`api/usecases/contribution.ts`) implements a **router** that:

1. Validates the `itemType` field
2. Delegates to the appropriate type-specific repository for the actual create
3. Wraps the result in a contribution record with `status: 'proposed'`
4. Snapshots the item data for versioning

```typescript
async createContributedItem(input: CreateContributionInput): Promise<ContributionListItem> {
  // 1. Validate input against the type-specific schema
  const validated = validateItemData(input.itemType, input.data);
  
  // 2. Create the item in the type-specific table
  const item = await this.typeRouter.create(input.itemType, input.parentId, validated);
  
  // 3. Create contribution record
  const contribution = await this.contributionRepo.create({
    itemType: input.itemType,
    itemId: item.id,
    version: 1,
    status: 'proposed',
    submittedBy: input.submittedBy,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  // 4. Snapshot for versioning
  await this.contributionRepo.createVersionSnapshot(contribution.id, 1, item);
  
  // 5. Log the transition
  await this.contributionRepo.logTransition(contribution.id, 'create', 'draft', 'proposed', input.submittedBy);
  
  return { ...item, contribution };
}
```

### 10.3 Type Router

A mapping from `itemType` to the appropriate repository/create function:

```typescript
const TYPE_ROUTES: Record<ContributableItemType, TypeRouteConfig> = {
  'bounded-context': {
    create: (parentId, data) => domainRepo.createContext(parentId!, data),
    read: (id) => domainRepo.getContext(id),
    schema: CreateBoundedContextInputSchema,
  },
  'aggregate': {
    create: (parentId, data) => domainRepo.createAggregate(parentId!, data),
    // ...
  },
  'capability': {
    create: (_, data) => governanceRepo.createCapability(data),
    // ...
  },
  // ... all 13 types
};
```

---

## 11. File Inventory (Additions to Plan 02)

### New Files (6)

| # | File | Purpose |
|---|------|---------|
| 1 | `web/src/components/contribution/ContributionChat.tsx` | Chat tab component wrapping OpenCodeChat |
| 2 | `web/src/hooks/usePageContext.ts` | Hook to read current page context for AI preamble |
| 3 | `web/src/components/contribution/PageContextProvider.tsx` | Context provider for page-level state sharing |
| 4 | `.opencode/agents/contribution-assistant.md` | New unified AI agent definition |
| 5 | `api/usecases/type-router.ts` | Routes contribution creates to type-specific repos |
| 6 | `web/src/components/contribution/ChatSuggestions.ts` | Per-page suggestion chip definitions |

### Deleted Files (3)

| # | File |
|---|------|
| 1 | `web/src/components/domain/DDDChat.tsx` |
| 2 | `web/src/components/taxonomy/TaxonomyChat.tsx` |
| 3 | `web/src/components/user-types/UserTypeChat.tsx` |

### Modified Files (7)

| # | File | Change |
|---|------|--------|
| 1 | `web/src/pages/DomainMapperPage.tsx` | Remove Chat tab + route |
| 2 | `web/src/pages/ArchitecturePage.tsx` | Remove Chat tab + route, add `PageContextWriter` |
| 3 | `web/src/pages/UserTypesPage.tsx` | Remove Chat tab + route, add `PageContextWriter` |
| 4 | `web/src/components/contribution/ContributionPanel.tsx` | Add Chat tab (from plan02) |
| 5 | `web/src/App.tsx` | Add `PageContextProvider` wrapper |
| 6 | `opencode.json` | Remove 3 old agents, add contribution-assistant |
| 7 | `api/http/routes/contributions.ts` | Add `POST /create` endpoint (from plan02) |

### Agent Files Retired (3)

| # | File |
|---|------|
| 1 | `.opencode/agents/ddd-domain-mapper.md` |
| 2 | `.opencode/agents/taxonomy-architect.md` |
| 3 | `.opencode/agents/user-type-storyteller.md` |

---

## 12. Implementation Phases (Additions to Plan 02)

Plan 02 defined 8 phases. This plan adds to them:

| Phase | Tasks | Depends On |
|-------|-------|-----------|
| **Phase 2b: Create Endpoint** | Add `POST /contributions/create` + type router to backend | Plan02 Phase 2 |
| **Phase 5b: Chat Component** | Build `ContributionChat`, `usePageContext`, `PageContextProvider`, `ChatSuggestions` | Plan02 Phase 5 |
| **Phase 5c: Agent Definition** | Create `contribution-assistant.md` agent. Update `opencode.json`. | Phase 2b |
| **Phase 9: Remove Old Chats** | Delete DDDChat, TaxonomyChat, UserTypeChat. Remove tabs from pages. | Phase 5b + 5c verified working |
| **Phase 10: Page Context Wiring** | Add `PageContextWriter` to DomainMapperPage, ArchitecturePage, UserTypesPage. | Phase 5b |

---

## 13. Agent Prompt: Interaction Patterns

The `contribution-assistant.md` agent prompt includes detailed interaction patterns for the most common operations.

### Pattern 1: Discover and Create

```
User: "Help me discover bounded contexts for our e-commerce platform"

1. Ask clarifying questions about the domain (using question tool)
2. Analyze the domain model (fetch current state via GET)
3. Identify candidate bounded contexts
4. For EACH context, present via question tool:
   - Name, type, description, key aggregates
   - Options: Create / Edit / Skip
5. For approved items, call POST /api/v1/contributions/create
6. Summarize what was created
```

### Pattern 2: Review Queue

```
User: "What needs my review?"

1. Fetch: GET /api/v1/contributions?status=proposed
2. Summarize items grouped by type
3. For each item, provide assessment and recommendation
4. Use question tool for batch or individual review actions
5. Execute transitions via contribution API
```

### Pattern 3: Improve Rejected Item

```
User: "Help me fix the rejected capability CAP-015"

1. Fetch: GET /api/v1/contributions/capability/CAP-015
2. Show the rejection feedback
3. Suggest specific improvements
4. Present revised item via question tool
5. On approval, call POST /api/v1/contributions/capability/CAP-015/revise
6. Then create new version with improvements
```

### Pattern 4: Cross-Type Discovery

```
User: "I need to model the shipping domain end to end"

1. Create bounded context (Shipping) → question tool → create
2. Create aggregates within it (Shipment, Carrier) → question tool → create
3. Create domain events (ShipmentDispatched, DeliveryConfirmed) → question tool → create
4. Create related capability (CAP: Shipment Tracking) → question tool → create
5. Create user type (UT: Logistics Coordinator) → question tool → create
6. Create user stories for the type → question tool → create
7. All items appear in contribution queue as 'proposed'
8. Summary: "Created 8 items across 5 types. Review them in the queue."
```

---

## 14. Edge Cases

### 14.1 AI Creates While Panel is on Queue Tab

If the user is viewing the queue and the AI (in another tab/session) creates items, the queue should update. This is handled by the `lastChangeTimestamp` subscription in the `ContributionProvider`.

### 14.2 AI Creates Item That Depends on Another Proposed Item

Example: AI creates a bounded context (proposed), then tries to create an aggregate within it. The aggregate references the context, which is not yet accepted.

**Solution**: The contribution system allows items to reference other proposed items. The type-specific status is frozen until contribution is accepted. Dependencies between proposed items are noted but not enforced until acceptance.

### 14.3 Chat Session Survives Panel Close/Reopen

The chat session state (messages, pending questions) lives in the `ContributionProvider` context, not in the panel component. Closing and reopening the panel restores the chat exactly where it was.

### 14.4 User Navigates While Question is Pending

If the AI asks a question and the user navigates to a different page, the question remains pending in the chat. The panel can be reopened from any page and the user can still answer.

### 14.5 Concurrent AI and Human Actions

If the AI proposes an accept while the human clicks accept on the same item in the queue:
- The first request wins (DB constraint)
- The second gets a 409 Conflict response
- UI shows "This item was already accepted" message

---

## 15. Summary: Complete System View

```
┌─────────────────────────────────────────────────────────────┐
│  Katalyst Web UI                                            │
│                                                             │
│  ┌─────────┐  ┌──────────────────────────────────────────┐  │
│  │ Sidebar  │  │  Main Content (any page)                 │  │
│  │         │  │                                          │  │
│  │ Design  │  │  [Domain Mapper / Architecture / etc.]   │  │
│  │ Strategy│  │                                          │  │
│  │ ...     │  │  Items show ContributionBadge inline     │  │
│  │         │  │                                          │  │
│  │─────────│  │                                          │  │
│  │📥 (3)   │──┼──────────────────────► ┌───────────────┐ │  │
│  │ Contribs│  │                        │ Contribution  │ │  │
│  │─────────│  │                        │ Panel (480px) │ │  │
│  │🌙 Dark  │  │                        │               │ │  │
│  └─────────┘  │                        │ [Queue][Chat] │ │  │
│               │                        │               │ │  │
│               │                        │ Queue: list,  │ │  │
│               │                        │ filter, drill │ │  │
│               │                        │ in to detail  │ │  │
│               │                        │               │ │  │
│               │                        │ Chat: unified │ │  │
│               │                        │ AI assistant  │ │  │
│               │                        │ creates items │ │  │
│               │                        │ as proposed,  │ │  │
│               │                        │ helps review  │ │  │
│               │                        └───────────────┘ │  │
│               └──────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Backend (Elysia)                                    │    │
│  │  /api/v1/contributions/*  ← AI calls via curl        │    │
│  │  /api/v1/contributions/create  ← unified create      │    │
│  │  contribution_items table  ← tracks all lifecycles   │    │
│  │  contribution_audit_log   ← full history             │    │
│  │  contribution_versions    ← snapshots for diff       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  OpenCode                                            │    │
│  │  contribution-assistant agent                        │    │
│  │  - Replaces ddd-domain-mapper                        │    │
│  │  - Replaces taxonomy-architect                       │    │
│  │  - Replaces user-type-storyteller                    │    │
│  │  - Uses question tool for human confirmation         │    │
│  │  - All creates go through contribution API           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

# Plan 04: AI Context & Prompt Architecture

## Problem Statement

The contribution assistant needs context at three different scopes:

1. **Universal** — Always present, regardless of page or selection. The agent's identity, contribution lifecycle rules, API contracts.
2. **Domain-scoped** — Changes based on what page the user is on. Domain model IDs, taxonomy snapshot IDs, artifact counts.
3. **Item-scoped** — Changes based on what specific item the user is interacting with. Full item data, contribution history, version diffs.

Today, the system has two layers (static agent prompt + first-message-only preamble) and no item-level awareness. This plan defines exactly how context is structured, composed, and delivered to the AI on every message.

---

## 1. Current Architecture (How It Works Today)

### Layer 1: Static Agent System Prompt

Defined in `.opencode/agents/{agent-name}.md`. Loaded by OpenCode when the agent is invoked. Applied to **every message** in the session as the agent's persistent identity.

**Contains:**
- Role and methodology (DDD patterns, taxonomy principles, user story writing)
- All API endpoint URLs, HTTP methods, request body schemas, example payloads
- Conversation flow phases (Discovery → Modeling → Validation)
- Anti-patterns and quality rules
- Tool permissions (curl allowlist)
- Port detection logic (3001 dev / 8090 prod)

**Does NOT contain:** Entity IDs, current state, user context, item details.

### Layer 2: Runtime Preamble

Built by `buildContextPreamble()` in the React chat component. Prepended to the user's text as a single string.

**Current behavior:**
- Signature: `() => string` (no arguments)
- Called on **first message only** (`isFirstMessageRef` flag in `useOpenCodeChat.ts`)
- Concatenated directly: `preamble + userText` sent as one prompt
- User sees only their text in the chat UI; AI sees preamble + text
- Captures values via closure at call time (always latest React state)

**Contains (varies by chat):**
- DDDChat: `DOMAIN_MODEL_ID`, model name/description, artifact counts
- TaxonomyChat: `SNAPSHOT_ID`, node count, capability count
- UserTypeChat: user type count, story count, capability count
- All: API base URL instruction

**Problems:**
1. First-message-only means mid-conversation context goes stale
2. No item-level context (can't ask "help me with this specific capability")
3. Three separate agents with duplicated patterns
4. No contribution lifecycle awareness

---

## 2. Target Architecture: Three-Layer Context System

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: Static Agent Prompt                        │
│  (in .opencode/agents/contribution-assistant.md)     │
│  Applied by OpenCode to EVERY message                │
│                                                      │
│  • Agent identity & role                             │
│  • Contribution lifecycle rules                      │
│  • ALL API endpoint contracts (13 item types)        │
│  • Question tool usage patterns                      │
│  • Port detection logic                              │
│  • Methodology for all domains (DDD, taxonomy, etc.) │
└─────────────────────────────────────────────────────┘
         ↓ always present
┌─────────────────────────────────────────────────────┐
│  Layer 2: Dynamic Context Preamble                   │
│  (built by buildContextPreamble in React)            │
│  Prepended to EVERY user message                     │
│                                                      │
│  Section A: Universal (always)                       │
│  • Contribution queue counts                         │
│  • API base URL                                      │
│                                                      │
│  Section B: Domain-scoped (based on current page)    │
│  • Domain model ID + artifact counts (if on DDD pg)  │
│  • Snapshot ID + node counts (if on architecture pg) │
│  • User type/story counts (if on user types pg)      │
│  • Governance health summary (if on governance pg)   │
│                                                      │
│  Section C: Item-scoped (if item is selected/active) │
│  • Full item data (all fields)                       │
│  • Contribution status + version + history           │
│  • Review feedback (if rejected)                     │
│  • Related items (dependencies, parent, children)    │
│  • Version diff (if superseding a previous version)  │
└─────────────────────────────────────────────────────┘
```

### Key change: Preamble injected on EVERY message, not just the first.

---

## 3. Shared Hook Change: `@katalyst/chat`

### 3.1 Signature Change

**Before:**
```typescript
buildContextPreamble?: () => string;
```

**After:**
```typescript
buildContextPreamble?: () => string;
// No signature change needed — the function is a closure that captures
// the latest React state at call time. The change is in WHEN it's called.
```

The signature stays the same. The function already captures current React state via closure. What changes is the **call site** — it must be called on every `handleSend`, not just the first.

### 3.2 Hook Change in `useOpenCodeChat.ts`

**Before (lines 374-380):**
```typescript
let promptText = text;
if (isFirstMessageRef.current) {
  if (buildContextPreamble) {
    promptText = buildContextPreamble() + text;
  }
  isFirstMessageRef.current = false;
}
```

**After:**
```typescript
let promptText = text;
if (buildContextPreamble) {
  promptText = buildContextPreamble() + text;
}
```

Remove the `isFirstMessageRef` guard entirely. The preamble function is called on every send. The function itself decides what to include (it may return an empty string if no context is relevant).

### 3.3 Backward Compatibility

The existing DDDChat, TaxonomyChat, and UserTypeChat components pass `buildContextPreamble` functions that return context strings. After this change, those strings will be prepended to **every** message instead of just the first. This is a behavioral improvement (fresher context), not a breaking change — the AI handles repeated context gracefully since it's part of the user prompt, not a separate system instruction.

However, since plan03 removes those 3 components entirely, backward compatibility is moot in practice.

### 3.4 `isFirstMessageRef` Removal

The `isFirstMessageRef` is only used for the preamble guard. After removing the guard, the ref can be removed entirely (cleanup).

---

## 4. Preamble Builder: Detailed Structure

### 4.1 The `buildContextPreamble` Function

```
File: web/src/components/contribution/ContributionChat.tsx
```

```typescript
function buildContributionPreamble(
  universalCtx: UniversalContext,
  domainCtx: DomainContext | null,
  itemCtx: ItemContext | null,
): string {
  const sections: string[] = [];

  // ── Section A: Universal (always present) ──
  sections.push(buildUniversalSection(universalCtx));

  // ── Section B: Domain-scoped (present when on a relevant page) ──
  if (domainCtx) {
    sections.push(buildDomainSection(domainCtx));
  }

  // ── Section C: Item-scoped (present when an item is selected/active) ──
  if (itemCtx) {
    sections.push(buildItemSection(itemCtx));
  }

  return `[CONTEXT]\n${sections.join('\n')}\n[/CONTEXT]\n\n`;
}
```

The wrapping `[CONTEXT]...[/CONTEXT]` delimiters make it clear to the AI where context ends and the user's actual message begins.

### 4.2 Section A: Universal Context

Always included. Lightweight, stable across messages.

```typescript
interface UniversalContext {
  contributionCounts: ContributionCounts;
  apiBase: string;
}

function buildUniversalSection(ctx: UniversalContext): string {
  return `== CONTRIBUTION STATE ==
Pending review: ${ctx.contributionCounts.pendingReview} items
My drafts: ${ctx.contributionCounts.myDrafts} items
Rejected: ${ctx.contributionCounts.rejected} items
API_BASE: ${ctx.apiBase}
IMPORTANT: ALL create/update operations MUST use /api/v1/contributions/* endpoints.
IMPORTANT: ALWAYS use the question tool to confirm with the user before creating or modifying items.`;
}
```

**Token cost:** ~60-80 tokens. Negligible.

### 4.3 Section B: Domain-Scoped Context

Included when the user is on a page with relevant domain data. The `usePageContext` hook (from plan03) determines which domain section to include.

```typescript
interface DomainContext {
  type: 'business-domain' | 'architecture' | 'user-types' | 'governance' | 'none';
  data: BusinessDomainData | ArchitectureData | UserTypesData | GovernanceData | null;
}

// ── Business Domain (DDD) ──
interface BusinessDomainData {
  domainModelId: string;
  domainModelName: string;
  domainModelDescription?: string;
  boundedContexts: Array<{ id: string; title: string; subdomainType: string }>;
  aggregateCount: number;
  eventCount: number;
  glossaryTermCount: number;
  workflowCount: number;
}

function buildBusinessDomainSection(data: BusinessDomainData): string {
  return `== ACTIVE DOMAIN MODEL ==
DOMAIN_MODEL_ID: ${data.domainModelId}
Name: ${data.domainModelName}
${data.domainModelDescription ? `Description: ${data.domainModelDescription}` : ''}
Bounded Contexts (${data.boundedContexts.length}): ${data.boundedContexts.map(c => `${c.title} [${c.id}] (${c.subdomainType})`).join(', ') || 'none yet'}
Aggregates: ${data.aggregateCount}
Domain Events: ${data.eventCount}
Glossary Terms: ${data.glossaryTermCount}
Workflows: ${data.workflowCount}
When creating domain artifacts, use DOMAIN_MODEL_ID above as the parent.`;
}

// ── Architecture (Taxonomy) ──
interface ArchitectureData {
  snapshotId: string | null;
  nodeCount: number;
  capabilityCount: number;
  topLevelNodes: Array<{ name: string; nodeType: string }>;
}

function buildArchitectureSection(data: ArchitectureData): string {
  return `== ACTIVE TAXONOMY ==
SNAPSHOT_ID: ${data.snapshotId ?? 'none'}
Taxonomy nodes: ${data.nodeCount}
Capabilities: ${data.capabilityCount}
Top-level nodes: ${data.topLevelNodes.map(n => `${n.name} (${n.nodeType})`).join(', ') || 'none'}`;
}

// ── User Types & Stories ──
interface UserTypesData {
  userTypeCount: number;
  storyCount: number;
  capabilityCount: number;
  userTypes: Array<{ id: string; name: string; archetype: string; status: string }>;
}

function buildUserTypesSection(data: UserTypesData): string {
  return `== USER TYPES & STORIES ==
User types (${data.userTypeCount}): ${data.userTypes.map(ut => `${ut.name} [${ut.id}] (${ut.archetype}, ${ut.status})`).join(', ') || 'none'}
User stories: ${data.storyCount}
Capabilities available: ${data.capabilityCount}`;
}

// ── Governance ──
interface GovernanceData {
  roadItemCount: number;
  roadsByStatus: Record<string, number>;
  capabilityCoverage: number;  // percentage
  userTypeCoverage: number;    // percentage
}

function buildGovernanceSection(data: GovernanceData): string {
  return `== GOVERNANCE STATE ==
Road items: ${data.roadItemCount}
Status breakdown: ${Object.entries(data.roadsByStatus).map(([s, c]) => `${s}: ${c}`).join(', ')}
Capability coverage: ${data.capabilityCoverage}%
User type coverage: ${data.userTypeCoverage}%`;
}
```

**Token cost:** ~100-300 tokens depending on data volume. Acceptable for per-message injection.

### 4.4 Section C: Item-Scoped Context

Included when the user has selected a specific item — either by drilling into it in the contribution queue, or by explicitly asking about it in chat.

```typescript
interface ItemContext {
  item: ContributionDetailFull;  // Full item data + contribution metadata
  relatedItems?: RelatedItem[];  // Dependencies, parent, children
  versionHistory?: ContributionVersion[];
  previousVersionData?: Record<string, unknown>;  // For diff context
  rejectionFeedback?: string;
}

function buildItemSection(ctx: ItemContext): string {
  const { item } = ctx;
  let section = `== FOCUSED ITEM ==
Type: ${item.itemType}
ID: ${item.itemId}
Title: ${item.title}
Contribution Status: ${item.contribution.status}
Version: ${item.contribution.version}
`;

  // Contribution metadata
  if (item.contribution.submittedBy) {
    section += `Submitted by: ${item.contribution.submittedBy} at ${item.contribution.submittedAt}\n`;
  }
  if (item.contribution.reviewedBy) {
    section += `Reviewed by: ${item.contribution.reviewedBy} at ${item.contribution.reviewedAt}\n`;
  }
  if (item.contribution.reviewFeedback) {
    section += `Review feedback: ${item.contribution.reviewFeedback}\n`;
  }
  if (item.contribution.supersedes) {
    section += `Supersedes: ${item.contribution.supersedes}\n`;
  }

  // Full item data (type-specific fields)
  section += `\nItem Data:\n${JSON.stringify(item.metadata, null, 2)}\n`;

  // Related items
  if (ctx.relatedItems?.length) {
    section += `\nRelated Items:\n`;
    for (const rel of ctx.relatedItems) {
      section += `- ${rel.relationship}: ${rel.itemType} ${rel.itemId} "${rel.title}" (${rel.contributionStatus})\n`;
    }
  }

  // Version history
  if (ctx.versionHistory?.length) {
    section += `\nVersion History:\n`;
    for (const v of ctx.versionHistory) {
      section += `- v${v.version}: ${v.status} (${v.createdAt})`;
      if (v.reviewedBy) section += ` reviewed by ${v.reviewedBy}`;
      if (v.reviewFeedback) section += ` — "${v.reviewFeedback}"`;
      section += `\n`;
    }
  }

  // Diff from previous version (if this is v2+)
  if (ctx.previousVersionData) {
    section += `\nChanges from previous version:\n${JSON.stringify(ctx.previousVersionData, null, 2)}\n`;
  }

  return section;
}
```

**Token cost:** ~200-800 tokens depending on item complexity. For a bounded context with aggregates, events, and relationships this could be on the higher end. Still well within budget for per-message injection.

---

## 5. How Context Flows Through the System

### 5.1 Data Flow Diagram

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│ Current Page │     │ Contribution  │     │ Selected Item    │
│ (route +     │     │ Provider      │     │ (queue drill-in  │
│  page state) │     │ (poll counts) │     │  or chat ref)    │
└──────┬───────┘     └──────┬────────┘     └──────┬───────────┘
       │                    │                      │
       ▼                    ▼                      ▼
┌──────────────────────────────────────────────────────────────┐
│  usePageContext() hook                                        │
│  Returns: { currentPage, domainModelId, snapshotId, ... }    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  ContributionChat component                                   │
│                                                               │
│  buildContextPreamble = () => {                               │
│    const universal = { counts, apiBase };                     │
│    const domain = pageContext → fetch relevant data;          │
│    const item = selectedItem → fetch full detail;             │
│    return buildContributionPreamble(universal, domain, item); │
│  }                                                            │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  useOpenCodeChat hook                                         │
│                                                               │
│  handleSend(text):                                            │
│    preamble = buildContextPreamble()   // called EVERY send   │
│    promptText = preamble + text                               │
│    sendPromptAsync(sessionId, promptText, agent, model)       │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  OpenCode Server                                              │
│                                                               │
│  Agent: contribution-assistant                                │
│  System prompt (Layer 1): static methodology + API contracts  │
│  User message: [CONTEXT]...[/CONTEXT] + user's actual text    │
│                                                               │
│  AI sees:                                                     │
│  1. Static system prompt (always, every message)              │
│  2. [CONTEXT] block with universal + domain + item sections   │
│  3. The user's actual question/instruction                    │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 What the AI Sees (Example)

User is on the Business Domain page, has drilled into a rejected bounded context, and types "Help me fix this":

**Layer 1 (system prompt, always present, managed by OpenCode):**
```
You are the Contribution Assistant for the Katalyst platform...
[275+ lines of methodology, API contracts, rules]
```

**Layer 2 (preamble, prepended to user message):**
```
[CONTEXT]
== CONTRIBUTION STATE ==
Pending review: 5 items
My drafts: 2 items
Rejected: 1 items
API_BASE: http://localhost:3001
IMPORTANT: ALL create/update operations MUST use /api/v1/contributions/* endpoints.
IMPORTANT: ALWAYS use the question tool to confirm with the user before creating or modifying items.

== ACTIVE DOMAIN MODEL ==
DOMAIN_MODEL_ID: dm_abc123
Name: E-Commerce Platform
Description: Core e-commerce domain model
Bounded Contexts (3): Order Management [bc_001] (core), Inventory [bc_002] (supporting), Shipping [bc_003] (supporting)
Aggregates: 7
Domain Events: 12
Glossary Terms: 15
Workflows: 2
When creating domain artifacts, use DOMAIN_MODEL_ID above as the parent.

== FOCUSED ITEM ==
Type: bounded-context
ID: bc_003
Title: Shipping
Contribution Status: rejected
Version: 1
Submitted by: ai:contribution-assistant at 2026-03-13T14:30:00Z
Reviewed by: user:jane at 2026-03-14T09:15:00Z
Review feedback: Missing carrier integration patterns. Needs to define the relationship with the external carrier APIs as an anti-corruption layer.
Supersedes: null

Item Data:
{
  "title": "Shipping",
  "subdomainType": "supporting",
  "description": "Handles shipment dispatch and delivery tracking",
  "relationships": [
    { "targetId": "bc_001", "type": "upstream", "pattern": "conformist" }
  ]
}

Related Items:
- parent: domain-model dm_abc123 "E-Commerce Platform" (accepted)
- upstream: bounded-context bc_001 "Order Management" (accepted)

Version History:
- v1: rejected (2026-03-13) reviewed by user:jane — "Missing carrier integration patterns..."
[/CONTEXT]

Help me fix this
```

The AI now has everything it needs to:
1. Understand the rejection reason
2. See the full item data
3. Know the domain context (other bounded contexts, relationships)
4. Suggest specific improvements (add anti-corruption layer for carrier APIs)
5. Use the question tool to present the revised version for approval
6. Call the correct API endpoint with the right IDs

---

## 6. Context Data Fetching

### 6.1 When Is Data Fetched?

The preamble function is called on every message send. But we can't make API calls inside it synchronously. The data must be **pre-fetched and cached** in React state.

**Strategy: Eager fetch on context change, cache in state.**

```typescript
// In ContributionChat.tsx

const pageContext = usePageContext();         // From route + page state
const { counts } = useContribution();        // From ContributionProvider
const [domainData, setDomainData] = useState<DomainContext | null>(null);
const [itemData, setItemData] = useState<ItemContext | null>(null);

// Fetch domain data when page context changes
useEffect(() => {
  fetchDomainData(pageContext).then(setDomainData);
}, [pageContext.currentPage, pageContext.domainModelId, pageContext.snapshotId]);

// Fetch item data when selected item changes
useEffect(() => {
  if (selectedItem) {
    fetchItemData(selectedItem.itemType, selectedItem.itemId).then(setItemData);
  } else {
    setItemData(null);
  }
}, [selectedItem?.itemId]);

// The preamble builder closes over the latest state
const buildPreamble = useCallback(() => {
  const universal: UniversalContext = { contributionCounts: counts, apiBase };
  return buildContributionPreamble(universal, domainData, itemData);
}, [counts, domainData, itemData]);
```

### 6.2 API Calls for Context Data

| Context Section | API Call | When Fetched |
|----------------|----------|--------------|
| Universal (counts) | `GET /api/v1/contributions/counts` | Polled every 30s by ContributionProvider |
| Business Domain | `GET /api/v1/domain-models/{id}` | On page navigation to business-domain |
| Architecture | `GET /api/v1/taxonomy/latest` | On page navigation to architecture |
| User Types | `GET /api/v1/user-types` + `GET /api/v1/user-stories?limit=0` (count only) | On page navigation to user-types |
| Governance | `GET /api/v1/governance/latest` | On page navigation to governance |
| Item detail | `GET /api/v1/contributions/{type}/{id}` | On item selection in queue or chat reference |
| Item versions | `GET /api/v1/contributions/{type}/{id}/versions` | On item selection |
| Related items | `GET /api/v1/contributions/{type}/{id}` (includes relations) | On item selection |

### 6.3 Token Budget

Worst case (all 3 sections active, complex item with history):

| Section | Estimated Tokens |
|---------|-----------------|
| Universal | ~80 |
| Domain (business domain with 5 BCs) | ~250 |
| Item (full BC with relationships, history, feedback) | ~600 |
| **Total preamble** | **~930** |

At ~930 tokens per message, with a 200K context window, the preamble overhead is negligible. Even in a 50-message conversation, total preamble tokens would be ~46,500 — well within budget.

Typical case (universal + domain, no item selected):

| Section | Estimated Tokens |
|---------|-----------------|
| Universal | ~80 |
| Domain | ~200 |
| **Total preamble** | **~280** |

---

## 7. Item Selection: How Items Enter Context

### 7.1 From Queue Drill-In

User clicks an item in the contribution queue → panel switches to detail view → `selectedItem` state is set → item context is fetched and cached → next chat message includes the item in Section C.

The chat and queue share state via the `ContributionPanel` component (both are children of it). When the user switches from the detail view back to chat, the `selectedItem` remains set until explicitly cleared.

### 7.2 From Chat Reference

The AI can reference items in its responses. When the user asks "tell me about CAP-012", the AI can fetch item data via curl. But for the **preamble** to include the item, the UI needs to know about it.

**Solution: `setFocusedItem` callback from chat.**

The ContributionChat exposes a mechanism for the AI to signal which item it's discussing. This can be done via:

1. **Convention in AI response**: The AI includes a structured reference like `[FOCUS: capability/CAP-012]` in its response. A lightweight parser in the chat component detects this and calls `setSelectedItem`.

2. **More practically**: The user explicitly navigates to the item in the queue (either by clicking a link the AI provides, or by switching to the queue tab and selecting it). The chat picks up the selection on the next message.

Option 1 is a nice-to-have but adds parsing complexity. Option 2 works with no additional code.

### 7.3 Clearing Item Context

Item context is cleared when:
- User clicks "Back" in the queue detail view (returns to list)
- User starts a new conversation (reinit)
- User explicitly asks the AI about a different item (navigates to it in queue)

---

## 8. Page Context Provider: How Domain Data Reaches the Chat

### 8.1 The Problem

The ContributionChat lives in the contribution panel (rendered at the Layout level). The domain-specific data (domain model ID, snapshot ID, etc.) lives in individual page components (DomainMapperPage, ArchitecturePage, UserTypesPage). These are in different parts of the React tree.

### 8.2 The Solution: `PageContextProvider`

A React context that each page writes to when it loads data, and the ContributionChat reads from.

```
File: web/src/components/contribution/PageContextProvider.tsx
```

```typescript
interface PageState {
  currentPage: string;
  domainModelId?: string;
  domainModelName?: string;
  domainModelDescription?: string;
  snapshotId?: string;
  // ... other page-specific IDs
}

interface PageContextValue {
  state: PageState;
  setState: (partial: Partial<PageState>) => void;
}
```

**Placement in component tree:**

```tsx
<BrowserRouter>
  <ContributionProvider>
    <PageContextProvider>
      <Routes>
        <Route element={<Layout />}>
          ...
        </Route>
      </Routes>
    </PageContextProvider>
  </ContributionProvider>
</BrowserRouter>
```

**Page writes:**
```tsx
// In DomainMapperPage.tsx
const { setState } = usePageContextWriter();
useEffect(() => {
  setState({
    currentPage: 'business-domain',
    domainModelId: model.id,
    domainModelName: model.name,
    domainModelDescription: model.description,
  });
  return () => setState({ currentPage: 'none', domainModelId: undefined });
}, [model]);
```

**Chat reads:**
```tsx
// In ContributionChat.tsx
const pageState = usePageContext();  // reads from PageContextProvider
```

### 8.3 Route-Based Fallback

If the page hasn't written to the context yet (e.g., data is still loading), the `usePageContext` hook falls back to inferring the page from the current route:

```typescript
function inferPageFromRoute(pathname: string): string {
  if (pathname.startsWith('/design/business-domain')) return 'business-domain';
  if (pathname.startsWith('/design/architecture')) return 'architecture';
  if (pathname.startsWith('/design/user-types')) return 'user-types';
  if (pathname.startsWith('/strategy/governance')) return 'governance';
  return 'none';
}
```

This ensures the preamble always has at least the page scope, even before API data loads.

---

## 9. Static Agent Prompt: What Goes in `contribution-assistant.md`

The static agent prompt in `.opencode/agents/contribution-assistant.md` contains everything that does NOT change per-message. This is the longest document in the system (~500-700 lines estimated) because it absorbs the methodology from all 3 retired agents plus new contribution lifecycle instructions.

### 9.1 Structure

```markdown
---
name: contribution-assistant
description: Unified AI assistant for creating, reviewing, and managing all taxonomy items through the contribution lifecycle
model: openrouter/anthropic/claude-sonnet-4-20250514
temperature: 0.3
mode: primary
permission:
  bash:
    "*": deny
    "grep *": allow
    "find *": allow
    "wc *": allow
    "ls *": allow
    "curl *": allow
  write: false
  edit: false
  read: true
  glob: true
  grep: true
  question: true
---

# Contribution Assistant

You are the Contribution Assistant for the Katalyst platform. You help users 
discover, create, review, and manage taxonomy items across all types through 
the contribution lifecycle.

## Your Role
[Universal identity and behavioral rules]

## Contribution Lifecycle Rules
[The 6-state machine, 8 transitions, rules about when to use question tool]

## API Contracts

### Contribution Endpoints (ALWAYS use these for mutations)
[POST /api/v1/contributions/create]
[POST /api/v1/contributions/:type/:id/submit]
[POST /api/v1/contributions/:type/:id/accept]
[POST /api/v1/contributions/:type/:id/reject]
[... all 13 endpoints from plan02]

### Read Endpoints (use these to gather context)
[GET /api/v1/domain-models/:id]
[GET /api/v1/taxonomy/latest]
[GET /api/v1/governance/user-types]
[... all read endpoints across all item types]

## Domain Methodologies

### DDD (Bounded Contexts, Aggregates, Events, etc.)
[Absorbed from ddd-domain-mapper.md — strategic patterns, tactical patterns, 
 conversation flow, anti-patterns, output formats]

### Taxonomy Architecture (Capabilities, Nodes)
[Absorbed from taxonomy-architect.md — categories, hierarchy principles, 
 lifecycle statuses, anti-patterns]

### User Types & Stories
[Absorbed from user-type-storyteller.md — archetypes, story quality, 
 acceptance criteria, Gherkin format, anti-patterns]

## Interaction Patterns

### Creating Items
[Question tool flow: present → confirm → create as proposed]

### Reviewing Items  
[Fetch queue → summarize → present each with recommendation → confirm]

### Fixing Rejected Items
[Fetch feedback → suggest improvements → present revised → confirm]

### Cross-Type Discovery
[End-to-end domain modeling flow across all types]

## Runtime Context

You will receive a [CONTEXT]...[/CONTEXT] block prepended to each user message. 
This contains:
- CONTRIBUTION STATE: Queue counts and API base URL
- ACTIVE DOMAIN MODEL: Domain model ID and artifact counts (when on domain page)
- ACTIVE TAXONOMY: Snapshot ID and node counts (when on architecture page)
- USER TYPES & STORIES: Counts and type list (when on user types page)
- GOVERNANCE STATE: Road item status breakdown (when on governance page)
- FOCUSED ITEM: Full data for a specific item (when one is selected)

Use this context to scope your responses. When DOMAIN_MODEL_ID is present, 
use it as the parent for domain artifact creation. When a FOCUSED ITEM is 
present, your responses should be about that specific item.

## Port Detection
[curl probe logic for 3001 vs 8090]
```

### 9.2 What's Static vs. Dynamic

| Content | Where | Why |
|---------|-------|-----|
| Agent identity, role, behavioral rules | Static (agent .md) | Never changes |
| Contribution lifecycle state machine | Static (agent .md) | Rules don't change per-message |
| API endpoint contracts (URLs, methods, schemas) | Static (agent .md) | Endpoints don't change per-message |
| DDD/Taxonomy/UserType methodology | Static (agent .md) | Domain expertise doesn't change |
| Question tool usage patterns | Static (agent .md) | Interaction rules don't change |
| Port detection logic | Static (agent .md) | Detection script is fixed |
| Contribution queue counts | Dynamic (preamble Section A) | Changes frequently |
| API base URL (resolved port) | Dynamic (preamble Section A) | Could change between sessions |
| Domain model ID + artifact counts | Dynamic (preamble Section B) | Changes on page navigation |
| Taxonomy snapshot + node counts | Dynamic (preamble Section B) | Changes on page navigation |
| User type/story counts | Dynamic (preamble Section B) | Changes on page navigation |
| Selected item full data | Dynamic (preamble Section C) | Changes on item selection |
| Version history and diff | Dynamic (preamble Section C) | Per-item |
| Review feedback | Dynamic (preamble Section C) | Per-item |

---

## 10. Ensuring Context Freshness

### 10.1 Staleness Vectors

| What could go stale? | How it's kept fresh |
|---------------------|-------------------|
| Contribution counts | `ContributionProvider` polls every 30s; immediate refresh on `onContributionChanged` |
| Domain model data | Fetched when `domainModelId` changes (page navigation); refetched on `lastChangeTimestamp` from ContributionProvider |
| Taxonomy snapshot | Fetched when `snapshotId` changes |
| User type/story counts | Fetched on page navigation; refetched on `lastChangeTimestamp` |
| Selected item data | Fetched on selection; refetched after any transition action |
| API base URL | Resolved once per component mount; stable within a session |

### 10.2 Preamble Rebuilds

The `buildPreamble` function is wrapped in `useCallback` with dependencies on all context state:

```typescript
const buildPreamble = useCallback(() => {
  return buildContributionPreamble(
    { contributionCounts: counts, apiBase },
    domainData,
    itemData,
  );
}, [counts, domainData, itemData, apiBase]);
```

When any dependency changes, the next message send will include the updated context.

### 10.3 What Happens If Data Is Loading?

If domain data or item data is still being fetched when the user sends a message, the preamble uses whatever is cached (possibly stale or null). The AI is instructed in the static prompt to handle missing context gracefully:

```markdown
If DOMAIN_MODEL_ID is not present in the context, ask the user which domain model 
they want to work with, or offer to list available models.

If no FOCUSED ITEM is present, respond based on the broader domain/contribution context.
```

---

## 11. File Changes Summary

### Modified Files

| # | File | Change |
|---|------|--------|
| 1 | `packages/chat/src/hooks/useOpenCodeChat.ts` | Remove `isFirstMessageRef` guard — call `buildContextPreamble()` on every `handleSend` |
| 2 | `packages/chat/src/types.ts` | Add JSDoc to `buildContextPreamble` clarifying per-message behavior |
| 3 | `web/src/components/contribution/ContributionChat.tsx` | Implement 3-section `buildContributionPreamble` with data fetching |
| 4 | `web/src/components/contribution/PageContextProvider.tsx` | (From plan03) — flesh out with full type definitions |
| 5 | `web/src/pages/DomainMapperPage.tsx` | Write domain model state to PageContextProvider |
| 6 | `web/src/pages/ArchitecturePage.tsx` | Write taxonomy state to PageContextProvider |
| 7 | `web/src/pages/UserTypesPage.tsx` | Write user type/story state to PageContextProvider |
| 8 | `web/src/pages/GovernanceDashboard.tsx` | Write governance state to PageContextProvider |

### New Files

| # | File | Purpose |
|---|------|---------|
| 1 | `.opencode/agents/contribution-assistant.md` | Unified agent definition (~500-700 lines) |
| 2 | `web/src/components/contribution/preamble-builder.ts` | The 3-section preamble builder functions (extracted for testability) |
| 3 | `web/src/types/page-context.ts` | TypeScript interfaces for all domain/page context types |

### Deleted Files

(Same as plan03 — the 3 chat components and 3 agent files)

---

## 12. Implementation Phases (Additions)

| Phase | Tasks | Depends On |
|-------|-------|-----------|
| **Phase 4a: Hook Change** | Modify `useOpenCodeChat` to call preamble on every message. Remove `isFirstMessageRef`. | — (can be done early) |
| **Phase 5d: Preamble Builder** | Implement `preamble-builder.ts` with all 3 sections and type definitions. | Types from plan02 Phase 3 |
| **Phase 5e: Agent Prompt** | Write `contribution-assistant.md` absorbing all 3 retired agents + contribution rules. | Plan02 Phase 2 (API endpoints defined) |
| **Phase 10a: Page Writers** | Add `PageContextWriter` calls to all 4 page components. | Plan03 Phase 10 (PageContextProvider) |

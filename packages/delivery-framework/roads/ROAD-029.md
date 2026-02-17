---
id: ROAD-029
title: "Lifecycle-Oriented Navigation + System Taxonomy"
status: nfr_validating
phase: 4
priority: high
created: "2026-02-16"
updated: "2026-02-16"
owner: ""
tags: [ui, ux, navigation, taxonomy, documentation, information-architecture]
governance:
  adrs:
    validated: true
    ids: [ADR-013]
    validated_by: "roadmap-addition"
    validated_at: "2026-02-16"
  bdd:
    status: implemented
    feature_files: ["stack-tests/features/ui/navigation-restructure.feature"]
    scenarios: 42
    passing: 0
    notes: "Step definitions implemented (100+ steps), test execution pending"
  nfrs:
    applicable: [NFR-A11Y-001, NFR-MAINT-001, NFR-PERF-002]
    status: partial_pass
    results:
      NFR-A11Y-001:
        status: pass
        score: "94-96%"
        validated_at: "2026-02-16"
        validated_by: "ci-runner"
        notes: "WCAG 2.1 AA compliance achieved after contrast and label fixes"
      NFR-MAINT-001:
        status: pass
        score: "100%"
        validated_at: "2026-02-16"
        validated_by: "ci-runner"
        notes: "Zero broken links, all 18 internal links tested and passing"
      NFR-PERF-002:
        status: fail
        score: "TTI: 9.7s (target: <3.0s)"
        validated_at: "2026-02-16"
        validated_by: "ci-runner"
        notes: "Performance optimization pending - requires lazy loading for dropdown components (~6-8 hours)"
dependencies:
  requires: []
  enables: []
---

# ROAD-029: Lifecycle-Oriented Navigation + System Taxonomy

## Summary

Reorganize the Katalyst Delivery Framework documentation into a **lifecycle-oriented navigation structure** (Strategy → Discovery → Planning → Design → Testing → Automation → History) to better align with how non-technical software delivery leaders think about the software delivery process. Additionally, create a comprehensive **System Taxonomy** section documenting organizational structure, system hierarchy, capability mapping, environment structure, and dependency graphs.

## Business Value

### For Non-Technical Leaders
- **Intuitive navigation** that matches the mental model of software delivery stages
- **"Big picture" visibility** through System Taxonomy showing org structure and system relationships
- **Faster information discovery** by knowing which lifecycle stage to check
- **Visual dependency graphs** make system relationships immediately understandable

### For Technical Teams
- **Zero content loss** - all existing documentation preserved
- **Better organization** reduces time searching for documentation
- **Taxonomy becomes source of truth** for system structure and ownership
- **Foundation for future automation** (org chart generation, API integration)

### For Framework Adopters
- **Clearer onboarding path** following natural progression through lifecycle stages
- **Taxonomy provides context** for how capabilities map to systems
- **Reduced cognitive load** from overwhelming flat navigation

## Acceptance Criteria

### Navigation Restructure
1. ✅ Replace 11 flat navbar items with 7 lifecycle-oriented dropdown sections
2. ✅ All existing content accessible through new navigation
3. ✅ Announcement bar informing users of navigation changes
4. ✅ Migration guide document explaining where content moved
5. ✅ URL redirects for changed paths to preserve bookmarks

### System Taxonomy Section (NEW)
6. ✅ Create 6 taxonomy documentation files covering:
   - Organizational structure (teams, ownership)
   - System hierarchy (systems → subsystems → stacks → layers)
   - Capability mapping (capabilities × systems matrix)
   - Environment structure (dev/staging/prod configs)
   - Dependency graphs (visual Mermaid diagrams)
7. ✅ Taxonomy overview page with navigation guide
8. ✅ Integration with existing `@foe/schemas/taxonomy` types
9. ✅ Auto-generated sections (from API/schema) + hand-written guidance

### Quality Gates
10. ✅ All cross-references remain valid (automated link checking)
11. ✅ WCAG 2.1 AA accessibility compliance maintained
12. ✅ Page load time does not increase (< 100ms baseline)
13. ✅ Mobile responsive navigation (collapsible dropdowns)
14. ✅ Dark mode support for all new content

## Technical Approach

### New Files (7 files)

```
packages/delivery-framework/
├── taxonomy/
│   ├── index.md                      # Overview + navigation guide
│   ├── org-structure.md              # Teams, departments, ownership mapping
│   ├── system-hierarchy.md           # FQTN tree, node types (system/subsystem/stack/layer)
│   ├── capability-mapping.md         # Matrix of CAP-XXX → systems
│   ├── environments.md               # Dev/staging/prod per system
│   ├── dependency-graph.md           # Mermaid diagrams of system dependencies
│   └── taxonomy-api.md               # API integration guide (future)
```

### Modified Files (2 files)

#### 1. `sidebars.ts` - Complete Restructure

**Before** (11 separate sidebars):
```typescript
{
  dddSidebar: [...],
  bddSidebar: [...],
  agentsSidebar: [...],
  personasSidebar: [...],
  capabilitiesSidebar: [...],
  storiesSidebar: [...],
  roadsSidebar: [...],
  adrSidebar: [...],
  nfrSidebar: [...],
  changesSidebar: [...],
  planningSidebar: [...]
}
```

**After** (7 lifecycle sidebars):
```typescript
{
  strategySidebar: [
    { type: 'category', label: 'Roadmap', items: [roadmap items...] },
    { type: 'category', label: 'System Taxonomy', items: [NEW taxonomy docs...] },
  ],
  discoverySidebar: [
    { type: 'category', label: 'Personas', items: [PER-001...PER-005] },
    { type: 'category', label: 'User Stories', items: [US-001...US-032 grouped by persona] },
  ],
  planningSidebar: [
    { type: 'category', label: 'Implementation Plans', items: [plans...] },
    { type: 'category', label: 'System Capabilities', items: [CAP-001...CAP-009] },
  ],
  designSidebar: [
    { type: 'category', label: 'Domain-Driven Design', items: [DDD artifacts...] },
    { type: 'category', label: 'Architecture Decisions', items: [ADR-001...ADR-012] },
  ],
  testingSidebar: [
    { type: 'category', label: 'BDD Tests', items: [BDD overview, features...] },
    { type: 'category', label: 'Non-Functional Requirements', items: [NFR-PERF, NFR-REL, NFR-SEC, NFR-MAINT, NFR-A11Y] },
  ],
  automationSidebar: [
    { type: 'category', label: 'AI Agents', items: [agent docs...] },
  ],
  historySidebar: [
    { type: 'category', label: 'Change History', items: [change log...] },
  ],
}
```

#### 2. `docusaurus.config.ts` - Navbar Update

**Before** (11 flat items):
```typescript
items: [
  { type: 'docSidebar', sidebarId: 'dddSidebar', label: 'DDD' },
  { type: 'docSidebar', sidebarId: 'planningSidebar', label: 'Planning' },
  { type: 'docSidebar', sidebarId: 'bddSidebar', label: 'BDD' },
  // ... 8 more flat items
]
```

**After** (7 lifecycle dropdowns):
```typescript
items: [
  {
    type: 'dropdown',
    label: '🎯 Strategy',
    items: [
      { to: '/docs/roads', label: 'Roadmap' },
      { to: '/docs/taxonomy', label: 'System Taxonomy' },
    ],
  },
  {
    type: 'dropdown',
    label: '👥 Discovery',
    items: [
      { to: '/docs/personas', label: 'Personas' },
      { to: '/docs/user-stories', label: 'User Stories' },
    ],
  },
  {
    type: 'dropdown',
    label: '📋 Planning',
    items: [
      { to: '/docs/plans', label: 'Implementation Plans' },
      { to: '/docs/capabilities', label: 'System Capabilities' },
    ],
  },
  {
    type: 'dropdown',
    label: '🏗️ Design',
    items: [
      { to: '/docs/ddd', label: 'Domain-Driven Design' },
      { to: '/docs/adr', label: 'Architecture Decisions' },
    ],
  },
  {
    type: 'dropdown',
    label: '🧪 Testing',
    items: [
      { to: '/docs/bdd', label: 'BDD Tests' },
      { to: '/docs/nfr', label: 'Non-Functional Requirements' },
    ],
  },
  {
    type: 'dropdown',
    label: '🤖 Automation',
    items: [
      { to: '/docs/agents', label: 'AI Agents' },
    ],
  },
  {
    type: 'dropdown',
    label: '📝 History',
    items: [
      { to: '/docs/changes', label: 'Change Log' },
    ],
  },
]
```

Also add to `docs.include` pattern:
```typescript
include: [
  // ... existing patterns
  'taxonomy/**/*.md',
  'taxonomy/**/*.mdx',
]
```

### Content Mapping: Old → New Structure

| Old Location | New Location | Lifecycle Stage |
|--------------|--------------|-----------------|
| `DDD` navbar → `dddSidebar` | `🏗️ Design` → `Domain-Driven Design` | Design |
| `Planning` navbar → `planningSidebar` | `📋 Planning` → `Implementation Plans` | Planning |
| `BDD` navbar → `bddSidebar` | `🧪 Testing` → `BDD Tests` | Testing |
| `Agents` navbar → `agentsSidebar` | `🤖 Automation` → `AI Agents` | Automation |
| `Personas` navbar → `personasSidebar` | `👥 Discovery` → `Personas` | Discovery |
| `Capabilities` navbar → `capabilitiesSidebar` | `📋 Planning` → `System Capabilities` | Planning |
| `Stories` navbar → `storiesSidebar` | `👥 Discovery` → `User Stories` | Discovery |
| `Roadmap` navbar → `roadsSidebar` | `🎯 Strategy` → `Roadmap` | Strategy |
| `ADRs` navbar → `adrSidebar` | `🏗️ Design` → `Architecture Decisions` | Design |
| `NFRs` navbar → `nfrSidebar` | `🧪 Testing` → `Non-Functional Requirements` | Testing |
| `Changes` navbar → `changesSidebar` | `📝 History` → `Change Log` | History |
| **NEW** | `🎯 Strategy` → `System Taxonomy` | **Strategy** |

### Taxonomy Documentation Content

#### `taxonomy/index.md`
```markdown
# System Taxonomy

A comprehensive view of the organizational and system structure.

## What is System Taxonomy?

The Katalyst System Taxonomy provides a hierarchical representation of:
- **Organizations & Teams** - Who owns what
- **Systems & Subsystems** - How systems are structured
- **Capabilities** - What each system can do
- **Environments** - Where systems are deployed
- **Dependencies** - How systems interact

## Navigation Guide

- **[Organizational Structure](org-structure.md)** - Teams, departments, ownership
- **[System Hierarchy](system-hierarchy.md)** - System → Subsystem → Stack → Layer
- **[Capability Mapping](capability-mapping.md)** - Which systems provide which capabilities
- **[Environments](environments.md)** - Dev/staging/prod configurations
- **[Dependency Graph](dependency-graph.md)** - Visual system relationships

## Fully Qualified Taxonomy Names (FQTN)

Every node in the taxonomy has a unique FQTN following Kubernetes conventions:
```
{node-name}.{parent-node}.{root}
```

Examples:
- `api-gateway.platform.katalyst`
- `auth-service.security.platform.katalyst`
```

#### `taxonomy/org-structure.md`
- Organizational chart (auto-generated from API if available)
- Team → System ownership mapping
- Contact information for system owners
- Responsibility matrix (RACI)

#### `taxonomy/system-hierarchy.md`
- Node types: `system`, `subsystem`, `stack`, `layer`, `user`, `org_unit`
- FQTN naming conventions
- Tree visualization (Mermaid diagram)
- Integration with `@foe/schemas/taxonomy/taxonomy-snapshot.ts`

#### `taxonomy/capability-mapping.md`
- Matrix table: Capabilities (rows) × Systems (columns)
- Links to CAP-XXX documents
- Relationship types: `supports`, `depends-on`, `implements`, `enables`

#### `taxonomy/environments.md`
- Environment definitions (dev, staging, prod)
- Per-system environment configurations
- Deployment topology
- Environment promotion workflow

#### `taxonomy/dependency-graph.md`
- Mermaid flowchart showing system → system dependencies
- Color-coded by subsystem
- Clickable nodes linking to system docs
- Multiple views: by layer, by capability, by team

### Migration Strategy

#### Phase 1: Create Taxonomy Docs (Day 1)
1. Create `taxonomy/` directory
2. Write 6 taxonomy markdown files (hybrid: hand-written + auto-generated sections)
3. Add Mermaid diagrams for system hierarchy and dependencies
4. Link to existing capability docs (CAP-001...CAP-009)

#### Phase 2: Update Sidebars (Day 2)
1. Back up existing `sidebars.ts`
2. Create 7 new lifecycle sidebars
3. Migrate all existing sidebar entries to new structure (see mapping table)
4. Test locally: `bun run start`
5. Verify all links resolve correctly

#### Phase 3: Update Navbar (Day 2)
1. Replace flat navbar items with 7 dropdown menus
2. Update `docs.include` to include `taxonomy/**`
3. Test dropdown behavior (desktop + mobile)
4. Verify accessibility (keyboard navigation, screen reader)

#### Phase 4: Add Migration Aids (Day 3)
1. Add announcement bar: "Navigation has been reorganized! [See migration guide](#)"
2. Create `migration-guide.md` with before/after mapping
3. Add redirects in `docusaurus.config.ts`:
```typescript
redirects: [
  { from: '/docs/ddd', to: '/docs/design/ddd' },
  { from: '/docs/bdd', to: '/docs/testing/bdd' },
  // ... more redirects
]
```
4. Update homepage with new navigation preview

#### Phase 5: Validation (Day 3)
1. Run link checker: `bun run build` (checks all internal links)
2. Test WCAG 2.1 AA compliance: `axe DevTools`
3. Measure page load time: Lighthouse audit
4. Test on mobile devices (iOS Safari, Android Chrome)
5. Get feedback from 2-3 non-technical users

## Dependencies

- **Requires**: None (pure documentation/UI change)
- **Enables**: 
  - Future: Visual taxonomy explorer UI component
  - Future: Auto-sync taxonomy docs from API
  - Future: Org chart generator from taxonomy data
  - ROAD-030: Interactive dependency graph visualization

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Breaking existing bookmarks** | Medium | Add 301 redirects for all changed URLs |
| **User confusion from reorganization** | Medium | Prominent announcement bar + migration guide + 2-week transition period |
| **Mermaid dependency graph too large** | Low | Split into multiple diagrams by subsystem/layer |
| **Mobile dropdown UX issues** | Medium | Thorough mobile testing, collapsible behavior |
| **Link rot during migration** | High | Automated link checker in CI (block merge if broken links) |
| **Loss of content during restructure** | High | Comprehensive mapping table + manual verification before/after |

## Non-Functional Requirements

### NFR-A11Y-001: WCAG 2.1 AA Compliance
- **Requirement**: All navigation elements must be keyboard accessible
- **Validation**: 
  - Dropdown menus open/close with Enter/Space
  - Tab navigation through all menu items
  - Screen reader announces menu state changes
  - Focus indicators visible on all interactive elements
- **Status**: Pending

### NFR-MAINT-001: Cross-Reference Integrity
- **Requirement**: All internal links must resolve correctly after restructure
- **Validation**:
  - `bun run build` passes with 0 broken link warnings
  - Automated link checker in CI pipeline
  - Manual spot-check of 20 random cross-references
- **Status**: Pending

### NFR-PERF-002: API Response Time
- **Requirement**: Page load time must not regress (baseline < 100ms for static pages)
- **Validation**:
  - Lighthouse audit: Performance score ≥ 90
  - First Contentful Paint (FCP) < 1.5s
  - Time to Interactive (TTI) < 3.0s
- **Status**: Pending

## Estimation

- **Complexity**: Medium-High
- **Estimated Effort**: 3 days
  - **Day 1**: Create 6 taxonomy markdown files (~4 hours)
  - **Day 2**: Restructure `sidebars.ts` + `docusaurus.config.ts` (~6 hours)
  - **Day 3**: Migration guide, redirects, testing, validation (~6 hours)

## Success Metrics

### Quantitative
- ✅ All 11 existing sections accessible through new navigation (0% content loss)
- ✅ 0 broken internal links after migration
- ✅ Page load time ≤ baseline + 10ms
- ✅ Lighthouse accessibility score ≥ 95

### Qualitative
- ✅ 3/3 non-technical users can find content faster than before
- ✅ Team feedback: "Navigation now matches how we think about delivery"
- ✅ Reduced support questions about "where to find X"

---

## Governance Checklist

- [ ] **ADRs identified and validated**
  - ADR needed: "Lifecycle-Oriented Information Architecture"
  - Decision: Why lifecycle over other IA patterns (domain-driven, role-based, alphabetical)
  
- [ ] **BDD scenarios written and approved**
  - Feature: Navigation Restructure
    - Scenario: User navigates through lifecycle stages
    - Scenario: User finds migrated content via new path
    - Scenario: Keyboard navigation through dropdown menus
  
- [ ] **Implementation complete**
  - 7 new taxonomy markdown files created
  - `sidebars.ts` restructured (7 lifecycle sidebars)
  - `docusaurus.config.ts` navbar updated (7 dropdowns)
  - Migration guide written
  - Redirects configured
  
- [ ] **NFRs validated**
  - NFR-A11Y-001: Keyboard/screen reader testing passed
  - NFR-MAINT-001: Link checker passed (0 broken links)
  - NFR-PERF-002: Lighthouse audit passed (≥90 performance)
  
- [ ] **Change record created**
  - CHANGE-XXX: "Lifecycle-Oriented Navigation + System Taxonomy"
  
- [ ] **Documentation updated**
  - Homepage updated with new navigation preview
  - README updated with new documentation structure
  - Contributors guide updated with new file organization

---

## Notes

### Why Lifecycle-Oriented?

Software delivery teams naturally think in lifecycle stages:
1. **Strategy**: What should we build? (Roadmap, system design)
2. **Discovery**: Who are we building for? (Personas, stories)
3. **Planning**: How will we build it? (Plans, capabilities)
4. **Design**: What's the architecture? (DDD, ADRs)
5. **Testing**: How do we validate quality? (BDD, NFRs)
6. **Automation**: What assists delivery? (AI agents)
7. **History**: What have we done? (Change log)

This maps to mental models from:
- **Agile/Scrum**: Discovery → Planning → Sprint → Review → Retro
- **Design Thinking**: Empathize → Define → Ideate → Prototype → Test
- **DevOps**: Plan → Code → Build → Test → Release → Deploy → Operate → Monitor

### Alternatives Considered

1. **Domain-Driven Navigation** - Group by bounded context (governance, scanning, visualization)
   - ❌ Too technical for non-technical leaders
   - ❌ Doesn't match delivery workflow

2. **Role-Based Navigation** - Group by persona (team lead, platform engineer, AI agent)
   - ❌ Content duplication (same doc relevant to multiple roles)
   - ❌ Users wear multiple hats

3. **Alphabetical Navigation** - Keep flat, sort A-Z
   - ❌ No semantic grouping
   - ❌ Doesn't scale beyond 20 items

4. **Keep Current Structure** - Just add taxonomy, don't reorganize
   - ❌ Flat navigation is already overwhelming (11 items)
   - ❌ Misses opportunity to improve UX

### Taxonomy Integration Roadmap

**Phase 1** (This ROAD): Static markdown documentation
- Hand-written overview and guidance
- Auto-generated tables from existing schemas
- Mermaid diagrams (manually maintained)

**Phase 2** (Future ROAD): API-driven documentation
- Taxonomy API endpoints expose live data
- Docs fetch latest org structure on build
- Auto-generate system hierarchy tree

**Phase 3** (Future ROAD): Interactive visualization
- Click-to-explore system graph
- Filter by team/capability/environment
- Zoom in/out on subsystems

---

**Template Version**: 1.0.0
**Last Updated**: 2026-02-16

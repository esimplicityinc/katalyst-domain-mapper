---
id: ROAD-030
title: "FOE Project Browser & Persistent Report Selection"
status: proposed
phase: 3
priority: high
created: "2026-02-17"
updated: "2026-02-17"
owner: "OpenCode AI"
tags: [ui, ux, reports, foe, project-browser, persistence, react, visualization]
governance:
  adrs:
    validated: false
    ids: []
    validated_by: ""
    validated_at: ""
    notes: "Follows established patterns from DomainMapperPage (ROAD-029). No new architectural decisions needed."
  bdd:
    status: ready
    feature_files: [stack-tests/features/ui/reporting/02_foe_project_browser.feature]
    scenarios: 24
    passing: 0
  nfrs:
    applicable: [NFR-A11Y-001, NFR-PERF-002, NFR-SEC-001]
    status: pending
    results: {}
implementation_plan: packages/delivery-framework/roads/ROAD-030-IMPLEMENTATION-PLAN.md
dependencies:
  requires: [ROAD-005]  # API endpoints for report persistence
  enables: [ROAD-031]   # FOE Assessment Agent Chat Interface
notes: |
  Transform FOE Reports page from one-shot upload/view to multi-project browser.
  Mirrors DomainMapperPage pattern: project list, selection state, sub-navigation tabs.
---

# ROAD-030: FOE Project Browser & Persistent Report Selection

## Summary

Redesign the FOE Reports page (`packages/intelligence/web/src/pages/ReportsPage.tsx`) to follow the same project-oriented pattern as the Domain Mapper. Currently, `ReportsPage.tsx` is a one-shot upload/view component — load a report, see it, reset to load another. There's no concept of persistent projects, no ability to browse previously scanned repositories, and no sub-navigation between report sections.

This roadmap item transforms the Reports experience into a **multi-project browser** mirroring the `DomainMapperPage` pattern with:
- Project list view showing all scanned repositories
- Persistent project selection (survives page refresh)
- Sub-navigation tabs for different report sections
- Multiple scans per project with history timeline
- Graceful handling of missing/deleted projects

## Business Value

### For Engineering Leaders
- **Historical tracking** - View assessment trends across multiple scans of the same repository
- **Portfolio view** - Compare FOE maturity across multiple projects/repositories
- **Persistent context** - Return to the same project assessment without re-uploading
- **Professional UX** - Enterprise-grade interface matching the Domain Mapper experience

### For Development Teams
- **Consistent patterns** - Same UX paradigms as Domain Mapper (familiar navigation)
- **Faster workflow** - No need to re-upload reports; bookmarkable URLs
- **Comparison capabilities** - Track improvement over time for a specific project
- **Better organization** - Projects grouped by repository, not scattered

### For Platform Engineers
- **API-driven** - Leverages existing report persistence endpoints (ROAD-005)
- **Scalable** - Handles hundreds of projects without performance degradation
- **Extensible** - Sets foundation for ROAD-031 (AI chat interface)

## Acceptance Criteria

### Project List View
1. ✅ Create `FOEProjectListPage` component that lists all scanned projects
2. ✅ Display project cards with: name, last scan date, maturity level badge, overall score
3. ✅ Empty state with "Upload First Report" call-to-action
4. ✅ Search/filter projects by name or maturity level
5. ✅ Sort options (by date, by score, by name)
6. ✅ Pagination or infinite scroll for large project lists

### Project Selection & Persistence
7. ✅ Store selected project ID in localStorage with key `foe:selectedProjectId`
8. ✅ Auto-select last viewed project on page load
9. ✅ Fallback to most recent project if saved project doesn't exist
10. ✅ URL param support: `/testing/reports/:projectId` for deep linking
11. ✅ "Switch Project" button in header (mirrors Domain Mapper)

### Project Detail Layout
12. ✅ Header showing project name, repository path, and "Switch Project" button
13. ✅ Sub-navigation tabs: Overview, Dimensions, Triangle, Strengths, Gaps
14. ✅ Tab routing: `/testing/reports/:projectId/overview`, `/testing/reports/:projectId/dimensions`, etc.
15. ✅ Active tab indicator with purple highlight (brand color consistency)
16. ✅ Mobile-responsive tab navigation with horizontal scroll

### Report Sections (Tabs)
17. ✅ **Overview tab** - OverviewCard + metadata (same as current view)
18. ✅ **Dimensions tab** - 3 DimensionCard components in grid layout
19. ✅ **Triangle tab** - TriangleDiagram with cognitive triangle visualization
20. ✅ **Strengths tab** - FindingsTable showing top strengths
21. ✅ **Gaps tab** - GapsTable showing improvement opportunities

### Upload & Scan Entry Points
22. ✅ Retain ReportUpload component as entry point for new projects
23. ✅ Auto-create project entry when report uploaded/scanned
24. ✅ Derive project name from repository URL or allow manual naming
25. ✅ Add "Upload New Report" button accessible from project list

### Scan History (Stretch Goal)
26. 🎯 Display scan history timeline for selected project
27. 🎯 "View History" button showing all scans for current project
28. 🎯 Scan comparison UI (side-by-side dimension scores)
29. 🎯 Trend chart showing score evolution over time

### Error Handling
30. ✅ Gracefully handle deleted projects (redirect to project list)
31. ✅ Gracefully handle invalid project IDs in URL (404 state)
32. ✅ Loading states while fetching project list
33. ✅ Error states for API failures with retry button

### Quality Gates
34. ✅ WCAG 2.1 AA accessibility compliance maintained
35. ✅ Keyboard navigation works for all tabs and buttons
36. ✅ Mobile responsive on 375px, 768px, 1920px viewports
37. ✅ Dark mode support for all new components
38. ✅ Page loads in &lt;2s (Time to Interactive)
39. ✅ Zero console errors or warnings

## Technical Approach

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ReportsPage.tsx (New Container)                             │
│  ├── FOEProjectListPage                                      │
│  │   ├── ProjectCard (repeating)                            │
│  │   ├── SearchBar                                          │
│  │   └── EmptyState                                         │
│  │                                                           │
│  └── FOEProjectDetailPage (when project selected)           │
│      ├── Header (project name + Switch Project button)      │
│      ├── SubNavTabs (Overview, Dimensions, Triangle, etc.)  │
│      └── Routes (tab content)                               │
│          ├── /overview → OverviewCard                       │
│          ├── /dimensions → DimensionCards                   │
│          ├── /triangle → TriangleDiagram                    │
│          ├── /strengths → FindingsTable                     │
│          └── /gaps → GapsTable                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                             ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Elysia API)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/v1/reports/ (ALREADY EXISTS via ROAD-005)             │
│  ├── GET /                (list reports with filters)       │
│  ├── POST /               (ingest report)                   │
│  ├── GET /:id             (get report by ID)                │
│  ├── GET /:id/raw         (get raw JSON)                    │
│  ├── DELETE /:id          (delete report)                   │
│  └── GET /:id/compare/:otherId (compare reports)            │
│                                                              │
│  NEW ENDPOINT (optional, for project grouping):             │
│  ├── GET /projects        (list unique repositories)        │
│  └── GET /projects/:repo/history (all scans for repo)       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Phases

**Phase 1: Data Model & API Client (2-3 hours)**
- Define `FOEProject` TypeScript type (derived from report list)
- Add `api.listProjects()` method to `web/src/api/client.ts`
- Add `api.getProjectReports(repositoryId)` for scan history
- Group reports by `repositoryId` to form "projects"

**Phase 2: Project List View (3-4 hours)**
- Create `FOEProjectListPage.tsx` component
- Create `ProjectCard.tsx` component (name, date, score, maturity badge)
- Add search/filter UI
- Handle empty state (no reports yet)
- Add "Upload New Report" button

**Phase 3: Project Selection & Routing (2-3 hours)**
- Update `ReportsPage.tsx` to be a router container
- Add routes: `/testing/reports` → list, `/testing/reports/:projectId/*` → detail
- Implement localStorage persistence for `foe:selectedProjectId`
- Auto-load saved project on mount
- Handle invalid project IDs (404 fallback)

**Phase 4: Project Detail Layout (4-5 hours)**
- Create `FOEProjectDetailPage.tsx` component
- Add header with project name breadcrumb + "Switch Project" button
- Create sub-navigation tabs (Overview, Dimensions, Triangle, Strengths, Gaps)
- Implement tab routing
- Style tabs to match DomainMapperPage (purple highlight for active)

**Phase 5: Tab Content Components (2-3 hours)**
- Move existing components (OverviewCard, DimensionCard, etc.) into routed tabs
- Create wrapper components for each tab
- Ensure all components receive correct props (report data)
- Add loading skeletons while fetching report

**Phase 6: Upload Integration (1-2 hours)**
- Retain `ReportUpload` component
- Auto-create project when report uploaded
- Derive project name from `repositoryPath` or allow manual entry
- Redirect to new project detail page after upload

**Phase 7: Error Handling & Edge Cases (2-3 hours)**
- Handle deleted projects (localStorage references missing project)
- Handle API failures (retry button)
- Handle loading states (skeleton loaders)
- Handle no reports case (empty state with upload button)

**Phase 8: Scan History (Stretch Goal - 4-6 hours)**
- Add "History" tab to sub-navigation
- Fetch all reports for selected project (grouped by `repositoryId`)
- Display timeline of scans with dates and scores
- Add comparison UI (side-by-side view)
- Optional: Trend chart using Recharts

**Phase 9: Testing & QA (4-5 hours)**
- Manual testing (desktop + mobile)
- Keyboard navigation testing
- Accessibility audit (WCAG 2.1 AA)
- Dark mode verification
- Performance testing (TTI &lt;2s)
- Cross-browser testing

**Phase 10: Documentation (1 hour)**
- Update README with new Reports page structure
- Add screenshots to docs
- Document URL structure for deep linking

### File Structure

**New Files to Create (Frontend - ~10 files):**
```
packages/intelligence/web/src/
├── pages/
│   └── reports/
│       ├── FOEProjectListPage.tsx      (project browser view)
│       ├── FOEProjectDetailPage.tsx    (project detail with tabs)
│       ├── OverviewTab.tsx             (wraps OverviewCard)
│       ├── DimensionsTab.tsx           (wraps DimensionCards)
│       ├── TriangleTab.tsx             (wraps TriangleDiagram)
│       ├── StrengthsTab.tsx            (wraps FindingsTable)
│       ├── GapsTab.tsx                 (wraps GapsTable)
│       └── HistoryTab.tsx              (scan history timeline - stretch)
├── components/
│   └── reports/
│       ├── ProjectCard.tsx             (project summary card)
│       ├── ProjectSearchBar.tsx        (search/filter UI)
│       └── ScanHistoryTimeline.tsx     (timeline viz - stretch)
└── types/
    └── project.ts                      (FOEProject type)
```

**Files to Modify (Frontend - 3 files):**
- `src/pages/ReportsPage.tsx` - Convert to router container
- `src/api/client.ts` - Add `listProjects()` and `getProjectReports()` methods
- `src/App.tsx` - Update routes from `/testing/reports` to `/testing/reports/*`

**Files to Modify (Backend - 1 file, optional):**
- `http/routes/v1/reports.ts` - Add `/projects` endpoint for grouped list

### Migration Strategy

**No Breaking Changes:**
- Existing `/testing/reports` route redirects to `/testing/reports` (list view)
- All existing components (OverviewCard, DimensionCard, etc.) are reused
- API endpoints remain unchanged (ROAD-005)

**New URL Structure:**
- `/testing/reports` → Project list view
- `/testing/reports/:projectId` → Redirects to `/testing/reports/:projectId/overview`
- `/testing/reports/:projectId/overview` → Overview tab
- `/testing/reports/:projectId/dimensions` → Dimensions tab
- `/testing/reports/:projectId/triangle` → Triangle tab
- `/testing/reports/:projectId/strengths` → Strengths tab
- `/testing/reports/:projectId/gaps` → Gaps tab
- `/testing/reports/:projectId/history` → Scan history (stretch)

**Backward Compatibility:**
- Old direct-upload flow still works (shows upload UI if no projects exist)
- localStorage key `foe:selectedProjectId` new (no conflicts with existing keys)

## BDD Scenarios (High-Level)

### Project List Scenarios (6 scenarios)
1. User navigates to /testing/reports with no projects → sees empty state
2. User navigates to /testing/reports with projects → sees project list
3. User searches for project by name → list filters accordingly
4. User clicks project card → navigates to project detail page
5. User clicks "Upload New Report" → shows upload modal
6. User uploads report → new project created and selected

### Project Selection Scenarios (5 scenarios)
7. User selects project → project ID saved to localStorage
8. User refreshes page → last selected project loads
9. User's saved project deleted → falls back to most recent project
10. User navigates to invalid project ID → shows 404 error
11. User clicks "Switch Project" button → returns to project list

### Sub-Navigation Scenarios (5 scenarios)
12. User clicks Overview tab → sees OverviewCard
13. User clicks Dimensions tab → sees 3 DimensionCard components
14. User clicks Triangle tab → sees TriangleDiagram
15. User clicks Strengths tab → sees FindingsTable
16. User clicks Gaps tab → sees GapsTable

### Persistence Scenarios (4 scenarios)
17. User navigates to /testing/reports/:projectId/overview → URL updates
18. User copies URL and pastes in new tab → same project loads
19. User uses browser back/forward → tabs navigate correctly
20. User's localStorage cleared → defaults to most recent project

### Mobile Scenarios (3 scenarios)
21. User opens on mobile → tabs scroll horizontally
22. User swipes tabs on mobile → tab navigation works
23. User taps "Switch Project" on mobile → project list displays

### Accessibility Scenarios (4 scenarios)
24. User navigates with keyboard → all tabs are focusable
25. User presses Tab → focus moves through tabs in logical order
26. User presses Enter on tab → tab activates
27. Screen reader user navigates → all elements have proper ARIA labels

### Error Handling Scenarios (4 scenarios)
28. API fails to load projects → error message with retry button
29. API fails to load report → error message with retry button
30. User tries to load non-existent project → 404 state
31. Network goes offline → graceful error handling

## Risks & Mitigations

### Risk 1: Report Grouping by Repository
**Impact**: Reports may not have consistent `repositoryId` values (different URL formats)  
**Mitigation**:
- Normalize repository URLs during ingestion (strip .git, trailing slashes)
- Add `projectName` field to report schema for manual override
- Provide "Edit Project Name" button to fix mismatched groupings

### Risk 2: Large Project Lists
**Impact**: Hundreds of projects may slow down list view  
**Mitigation**:
- Implement pagination (20 projects per page)
- Add virtualization for infinite scroll
- Optimize search with client-side filtering (fast enough for &lt;500 projects)

### Risk 3: URL Conflicts
**Impact**: New routing may conflict with legacy routes  
**Mitigation**:
- Use `/testing/reports/:projectId/*` pattern (clear separation)
- Test all existing routes after implementation
- Add redirect rules for old URLs if needed

### Risk 4: Scan History Complexity
**Impact**: Multiple scans per project adds UI complexity  
**Mitigation**:
- Make scan history a **stretch goal** (Phase 8)
- Start with "latest scan only" for MVP
- Add history tab later if user demand is high

## Success Metrics

### User Engagement
- **Target**: 80% of users with >2 reports adopt project browser within 2 weeks
- **Measurement**: Track usage of `/testing/reports/:projectId/*` routes

### Navigation Efficiency
- **Target**: Time to find specific report reduces by 50%
- **Measurement**: Track clicks from landing to target report

### Performance
- **Target**: Project list loads in &lt;1s, project detail loads in &lt;2s
- **Measurement**: Lighthouse CI, real user monitoring

### Adoption
- **Target**: 90% of active users use persistent selection (localStorage)
- **Measurement**: Check localStorage key presence

### Satisfaction
- **Target**: NPS score >8 for new Reports UX
- **Measurement**: In-app survey

## Dependencies

### Requires (Blocking)
- **ROAD-005**: API endpoints for report persistence ✅ **Complete**
  - Rationale: Needs `GET /reports`, `POST /reports`, `GET /reports/:id`
  - Status: Complete (2026-02-12)

### Enables (Unlocks)
- **ROAD-031**: FOE Assessment Agent Chat Interface 🎯 **Proposed**
  - Rationale: Chat needs persistent project context
  - Dependency: Project selection state + sub-navigation tabs

## Estimated Effort

**Total: 25-35 hours** (~4-6 days for full-time developer)

**MVP (without scan history): 21-29 hours** (~3-4 days)

Breakdown:
- Phase 1: Data Model & API Client (2-3 hours)
- Phase 2: Project List View (3-4 hours)
- Phase 3: Project Selection & Routing (2-3 hours)
- Phase 4: Project Detail Layout (4-5 hours)
- Phase 5: Tab Content Components (2-3 hours)
- Phase 6: Upload Integration (1-2 hours)
- Phase 7: Error Handling (2-3 hours)
- Phase 8: Scan History (4-6 hours) — **STRETCH GOAL**
- Phase 9: Testing & QA (4-5 hours)
- Phase 10: Documentation (1 hour)

## Next Steps

1. ✅ **Approval** - Get stakeholder sign-off on approach
2. 📝 **BDD Scenarios** - Write detailed feature files (~35 scenarios)
3. 🧪 **RED Phase** - Write failing BDD tests
4. 💻 **GREEN Phase** - Implement components to pass tests
5. ♻️ **REFACTOR Phase** - Clean up code, optimize performance
6. 📊 **QA** - Accessibility audit, performance testing, cross-browser
7. 🚀 **Deploy** - Ship to production

---

**Status**: 📋 **Proposed** — Ready for TDD/BDD implementation

**Created**: 2026-02-17  
**Last Updated**: 2026-02-17  
**Owner**: OpenCode AI

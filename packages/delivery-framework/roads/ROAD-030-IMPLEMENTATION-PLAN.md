# ROAD-030 Implementation Plan: FOE Project Browser & Persistent Report Selection

**Status:** Ready for execution  
**Created:** 2026-02-17  
**Methodology:** TDD/BDD (RED-GREEN-REFACTOR)  
**Estimated Duration:** 3-4 days (21-29 hours)

---

## Design Decisions Summary

1. **Projects = Repositories** - Use existing database schema, no new backend models
2. **Auto-create projects** - Derive from report uploads with manual edit capability
3. **Persistence Strategy** - localStorage + URL params with priority fallback chain:
   - URL param → localStorage → most recent → null
4. **MVP Scope** - Latest scan only per project; history tab deferred to Phase 8 (stretch goal)
5. **Zero Breaking Changes** - Graceful empty state if no projects exist
6. **Client-Side Grouping** - Use existing `/api/v1/reports` and `/api/v1/repositories` endpoints

---

## Phase 1: BDD Scenarios (RED) - 2 hours

### Task 1.1: Create Feature File Structure (5 min)
**Objective:** Set up feature file with proper frontmatter and tags

**Actions:**
- Create `stack-tests/features/ui/reporting/02_foe_project_browser.feature`
- Add frontmatter with `@ui`, `@ROAD-030`, `@foe-scanner` tags
- Define Feature description and business value

**Acceptance Criteria:**
- File exists at correct path
- Frontmatter includes all required tags
- Feature description matches ROAD-030 spec

**Agent:** @bdd-writer

---

### Task 1.2: Write Project List Scenarios (15 min)
**Objective:** Define BDD scenarios for project list view

**Scenarios to write:**
1. **Empty State** - User visits `/strategy/foe-scanner` with no projects
   - Then sees "No projects yet" message
   - And sees "Upload First Report" button

2. **Project List Display** - User visits page with 3 existing projects
   - Then sees 3 project cards
   - And each card shows: name, last scan date, maturity badge, overall score

3. **Project Selection** - User clicks on a project card
   - Then navigates to `/strategy/foe-scanner/:projectId/overview`
   - And project details load

4. **Search Filter** - User searches for project by name
   - Then only matching projects display
   - And count updates

5. **Upload New Report** - User clicks "Upload New Report" button
   - Then upload modal appears
   - When user uploads valid report
   - Then new project auto-created
   - And navigates to new project detail page

**Acceptance Criteria:**
- All 5 scenarios written with Given-When-Then format
- Use existing Katalyst BDD steps (refer to step reference)
- Include proper data tables where needed
- Tag with `@project-list`

**Agent:** @bdd-writer

---

### Task 1.3: Write Project Selection & Persistence Scenarios (15 min)
**Objective:** Define BDD scenarios for project selection and localStorage persistence

**Scenarios to write:**
6. **Selection Persistence** - User selects project → refreshes page
   - Then same project loads
   - And localStorage contains correct project ID

7. **Fallback to Recent** - User's saved project deleted → visits page
   - Then most recent project loads
   - And localStorage updates to new project ID

8. **Invalid Project ID** - User navigates to `/strategy/foe-scanner/invalid-id`
   - Then sees 404 error state
   - And "Back to Projects" button displays

9. **Switch Project Button** - User viewing project → clicks "Switch Project"
   - Then returns to project list view
   - And selection state preserved

10. **URL Deep Linking** - User pastes URL with project ID in new tab
    - Then correct project loads
    - And localStorage syncs with URL param

**Acceptance Criteria:**
- All 5 scenarios written with Given-When-Then format
- Include localStorage validation steps
- Tag with `@project-selection`, `@persistence`

**Agent:** @bdd-writer

---

### Task 1.4: Write Sub-Navigation Tab Scenarios (15 min)
**Objective:** Define BDD scenarios for tabbed navigation within project detail

**Scenarios to write:**
11. **Overview Tab** - User clicks "Overview" tab
    - Then sees OverviewCard with project metadata
    - And URL is `/strategy/foe-scanner/:projectId/overview`

12. **Dimensions Tab** - User clicks "Dimensions" tab
    - Then sees 3 DimensionCard components (Feedback, Understanding, Confidence)
    - And URL is `/strategy/foe-scanner/:projectId/dimensions`

13. **Triangle Tab** - User clicks "Triangle" tab
    - Then sees TriangleDiagram with cognitive triangle
    - And URL is `/strategy/foe-scanner/:projectId/triangle`

14. **Strengths Tab** - User clicks "Strengths" tab
    - Then sees FindingsTable with top strengths
    - And URL is `/strategy/foe-scanner/:projectId/strengths`

15. **Gaps Tab** - User clicks "Gaps" tab
    - Then sees GapsTable with improvement opportunities
    - And URL is `/strategy/foe-scanner/:projectId/gaps`

16. **Tab Navigation with Browser Back** - User clicks multiple tabs → presses back
    - Then previous tab displays
    - And browser history works correctly

**Acceptance Criteria:**
- All 6 scenarios written with Given-When-Then format
- Include URL validation for each tab
- Tag with `@sub-navigation`, `@tabs`

**Agent:** @bdd-writer

---

### Task 1.5: Write Mobile & Accessibility Scenarios (15 min)
**Objective:** Define BDD scenarios for responsive design and a11y compliance

**Scenarios to write:**
17. **Mobile Tab Scrolling** - User on 375px viewport → tabs overflow
    - Then tabs scroll horizontally
    - And active tab indicator visible

18. **Keyboard Navigation** - User presses Tab key repeatedly
    - Then focus moves through tabs in logical order
    - When user presses Enter on tab
    - Then tab activates

19. **Screen Reader Labels** - Screen reader user navigates project list
    - Then all elements have proper ARIA labels
    - And project counts announced

20. **Dark Mode Support** - User toggles dark mode
    - Then all new components use dark mode classes
    - And contrast ratios meet WCAG 2.1 AA

**Acceptance Criteria:**
- All 4 scenarios written with Given-When-Then format
- Include viewport size specifications for mobile
- Tag with `@mobile`, `@accessibility`, `@a11y`

**Agent:** @bdd-writer

---

### Task 1.6: Write Error Handling Scenarios (15 min)
**Objective:** Define BDD scenarios for error states and edge cases

**Scenarios to write:**
21. **API Failure - List Projects** - API returns 500 error
    - Then error message displays
    - And "Retry" button visible

22. **API Failure - Load Report** - Selected project report fails to load
    - Then error message displays within project detail
    - And "Back to Projects" button available

23. **Deleted Project Handling** - User's localStorage references deleted project
    - Then redirects to project list
    - And localStorage clears invalid project ID

24. **Loading States** - User navigates to project detail
    - Then skeleton loaders display during fetch
    - When data loads
    - Then skeleton loaders replaced with content

**Acceptance Criteria:**
- All 4 scenarios written with Given-When-Then format
- Include proper error message validation
- Tag with `@error-handling`, `@edge-cases`

**Agent:** @bdd-writer

---

### Task 1.7: Run BDD Tests to Confirm RED State (10 min)
**Objective:** Verify all scenarios fail (RED phase)

**Actions:**
```bash
bun test stack-tests/features/ui/reporting/02_foe_project_browser.feature
```

**Expected Result:**
- All 24 scenarios fail with "step definition not found" or "component not found"
- RED state confirmed

**Acceptance Criteria:**
- All scenarios marked as failing
- No false positives (scenarios passing prematurely)

**Agent:** @bdd-runner

---

## Phase 2: API Client Extensions (GREEN Foundation) - 2 hours

### Task 2.1: Add URL Normalization Utility (5 min)
**Objective:** Create utility to normalize repository URLs for consistent grouping

**Actions:**
- Create `packages/intelligence/web/src/utils/url.ts`
- Implement `normalizeRepositoryUrl()` function
  - Strip `.git` suffix
  - Remove trailing slashes
  - Convert to lowercase
  - Handle GitHub, GitLab, Bitbucket variants

**Test Cases:**
```typescript
normalizeRepositoryUrl("https://github.com/org/repo.git") 
// → "https://github.com/org/repo"

normalizeRepositoryUrl("git@github.com:org/repo.git")
// → "github.com/org/repo"
```

**Acceptance Criteria:**
- Function handles 5+ URL formats
- Unit tests pass
- TypeScript types defined

**Agent:** @code-writer

---

### Task 2.2: Add localStorage Utility (5 min)
**Objective:** Create type-safe localStorage helpers

**Actions:**
- Create `packages/intelligence/web/src/utils/storage.ts`
- Implement `getSelectedProjectId()`, `setSelectedProjectId()`, `clearSelectedProjectId()`
- Add storage event listener for multi-tab sync

**TypeScript Interface:**
```typescript
export const FOE_STORAGE_KEY = "foe:selectedProjectId";

export function getSelectedProjectId(): string | null;
export function setSelectedProjectId(id: string): void;
export function clearSelectedProjectId(): void;
export function onProjectIdChange(callback: (id: string | null) => void): () => void;
```

**Acceptance Criteria:**
- Type-safe functions
- Storage event listener works across tabs
- Error handling for quota exceeded

**Agent:** @code-writer

---

### Task 2.3: Add `listProjects()` Method to API Client (10 min)
**Objective:** Create client-side grouping of reports by repository

**Actions:**
- Open `packages/intelligence/web/src/api/client.ts`
- Add `listProjects()` method that:
  1. Calls `api.listRepositories()`
  2. Returns array of `FOEProject` objects

**TypeScript Interface:**
```typescript
export interface FOEProject {
  id: string;              // repository ID
  name: string;            // repository name
  url: string | null;      // normalized repository URL
  techStack: string[];
  isMonorepo: boolean;
  latestScan: {
    id: string;
    date: string;
    overallScore: number;
    maturityLevel: string;
  } | null;
  scanCount: number;
}

// Add to api object:
listProjects(): Promise<FOEProject[]>
```

**Acceptance Criteria:**
- Method returns projects sorted by last scan date (newest first)
- Handles empty report list gracefully
- TypeScript types exported

**Agent:** @code-writer

---

### Task 2.4: Add `getProjectDetail()` Method to API Client (5 min)
**Objective:** Fetch full project details including latest report

**Actions:**
- Add `getProjectDetail(projectId: string)` method to `api/client.ts`
- Fetches repository summary + latest report raw data

**TypeScript Interface:**
```typescript
export interface FOEProjectDetail extends FOEProject {
  latestReport: FOEReport | null;
}

// Add to api object:
getProjectDetail(projectId: string): Promise<FOEProjectDetail>
```

**Acceptance Criteria:**
- Method handles missing projects (throws 404 error)
- Returns full `FOEReport` object compatible with existing components
- Error messages are user-friendly

**Agent:** @code-writer

---

### Task 2.5: Add TypeScript Types File (5 min)
**Objective:** Create centralized types for FOE project browser

**Actions:**
- Create `packages/intelligence/web/src/types/project.ts`
- Move `FOEProject` and `FOEProjectDetail` interfaces from client.ts
- Export all project-related types

**Acceptance Criteria:**
- Types file created
- API client imports from types file
- No circular dependencies

**Agent:** @code-writer

---

## Phase 3: Project List Page (GREEN) - 3 hours

### Task 3.1: Create ProjectCard Component (20 min)
**Objective:** Build reusable card component for project list

**Actions:**
- Create `packages/intelligence/web/src/components/reports/ProjectCard.tsx`
- Display: project name, last scan date, maturity badge, overall score
- Add hover state and click handler
- Mobile responsive (cards stack on mobile)

**Props Interface:**
```typescript
interface ProjectCardProps {
  project: FOEProject;
  onClick: () => void;
}
```

**Styling:**
- Use existing Tailwind classes from DomainMapperPage
- Maturity badge colors: Hypothesized (red), Emerging (yellow), Practicing (blue), Optimized (green)
- Score displayed as circular progress indicator

**Acceptance Criteria:**
- Component renders correctly with mock data
- Click handler fires
- Dark mode support
- Keyboard accessible (focusable, Enter triggers click)

**Agent:** @code-writer

---

### Task 3.2: Create ProjectSearchBar Component (15 min)
**Objective:** Build search/filter UI for project list

**Actions:**
- Create `packages/intelligence/web/src/components/reports/ProjectSearchBar.tsx`
- Text input for name search
- Dropdown for maturity level filter
- Sort dropdown (by date, by score, by name)

**Props Interface:**
```typescript
interface ProjectSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  maturityFilter: string | null;
  onMaturityFilterChange: (level: string | null) => void;
  sortBy: 'date' | 'score' | 'name';
  onSortChange: (sort: 'date' | 'score' | 'name') => void;
}
```

**Acceptance Criteria:**
- Debounced search (300ms delay)
- Clear button for search input
- All filters work independently
- Mobile responsive

**Agent:** @code-writer

---

### Task 3.3: Create Empty State Component (10 min)
**Objective:** Build empty state for when no projects exist

**Actions:**
- Create `packages/intelligence/web/src/components/reports/EmptyProjectState.tsx`
- Display: "No projects yet" message
- "Upload First Report" CTA button
- Optional: illustration or icon

**Props Interface:**
```typescript
interface EmptyProjectStateProps {
  onUploadClick: () => void;
}
```

**Acceptance Criteria:**
- Centered layout
- Button triggers upload modal
- Dark mode support

**Agent:** @code-writer

---

### Task 3.4: Create FOEProjectListPage Component (30 min)
**Objective:** Build main project list page container

**Actions:**
- Create `packages/intelligence/web/src/pages/reports/FOEProjectListPage.tsx`
- Fetch projects on mount using `api.listProjects()`
- Implement search/filter/sort logic
- Handle loading state (skeleton loaders)
- Handle error state (with retry button)
- Handle empty state
- Render ProjectCard grid

**State Management:**
```typescript
const [projects, setProjects] = useState<FOEProject[]>([]);
const [filteredProjects, setFilteredProjects] = useState<FOEProject[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [maturityFilter, setMaturityFilter] = useState<string | null>(null);
const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
```

**Acceptance Criteria:**
- Projects load on mount
- Search filters list in real-time
- Sort options work correctly
- Error state shows retry button
- Loading state shows skeletons (3 skeleton cards)
- Empty state shows when no projects

**Agent:** @code-writer

---

### Task 3.5: Add Upload Modal Integration (15 min)
**Objective:** Integrate existing ReportUpload component into modal

**Actions:**
- Install modal library (or build simple overlay)
- Add "Upload New Report" button to FOEProjectListPage header
- Open modal with ReportUpload component
- On successful upload, close modal and refresh project list
- Navigate to new project detail page

**State:**
```typescript
const [showUploadModal, setShowUploadModal] = useState(false);
```

**Acceptance Criteria:**
- Modal opens/closes smoothly
- Upload completes successfully
- Modal closes after upload
- Project list refreshes
- User navigates to new project

**Agent:** @code-writer

---

## Phase 4: Project Detail Layout (GREEN) - 4 hours

### Task 4.1: Create SubNavTabs Component (20 min)
**Objective:** Build reusable sub-navigation tab component

**Actions:**
- Create `packages/intelligence/web/src/components/reports/SubNavTabs.tsx`
- Render tabs: Overview, Dimensions, Triangle, Strengths, Gaps
- Active tab indicator (purple underline, matches DomainMapperPage)
- Use React Router's `NavLink` for routing
- Horizontal scroll on mobile

**Tab Configuration:**
```typescript
const TABS = [
  { to: 'overview', label: 'Overview', icon: FileJson },
  { to: 'dimensions', label: 'Dimensions', icon: BarChart3 },
  { to: 'triangle', label: 'Triangle', icon: Triangle },
  { to: 'strengths', label: 'Strengths', icon: TrendingUp },
  { to: 'gaps', label: 'Gaps', icon: AlertTriangle },
];
```

**Acceptance Criteria:**
- Active tab highlighted with purple (#9333ea) underline
- Smooth transition between tabs
- Mobile: tabs scroll horizontally
- Keyboard accessible (Tab key, Enter to activate)

**Agent:** @code-writer

---

### Task 4.2: Create ProjectHeader Component (15 min)
**Objective:** Build header for project detail page

**Actions:**
- Create `packages/intelligence/web/src/components/reports/ProjectHeader.tsx`
- Display: project name, repository path, "Switch Project" button
- Breadcrumb navigation (Projects > Project Name)
- Responsive layout

**Props Interface:**
```typescript
interface ProjectHeaderProps {
  projectName: string;
  repositoryPath: string;
  onSwitchProject: () => void;
}
```

**Acceptance Criteria:**
- Header sticky on scroll
- Switch Project button navigates to list view
- Breadcrumb links work
- Dark mode support

**Agent:** @code-writer

---

### Task 4.3: Create Tab Wrapper Components (30 min)
**Objective:** Create wrapper components for each tab

**Actions:**
Create 5 wrapper components in `packages/intelligence/web/src/pages/reports/tabs/`:

1. **OverviewTab.tsx** - Wraps OverviewCard
2. **DimensionsTab.tsx** - Wraps 3 DimensionCard components in grid
3. **TriangleTab.tsx** - Wraps TriangleDiagram
4. **StrengthsTab.tsx** - Wraps FindingsTable
5. **GapsTab.tsx** - Wraps GapsTable

**Props Interface (all tabs):**
```typescript
interface TabProps {
  report: FOEReport;
}
```

**Acceptance Criteria:**
- Each tab renders corresponding component
- Tabs receive correct props
- Consistent spacing/layout
- Loading state while report fetches

**Agent:** @code-writer

---

### Task 4.4: Create FOEProjectDetailPage Component (45 min)
**Objective:** Build main project detail page with routing

**Actions:**
- Create `packages/intelligence/web/src/pages/reports/FOEProjectDetailPage.tsx`
- Fetch project detail on mount using `api.getProjectDetail()`
- Render ProjectHeader
- Render SubNavTabs
- Set up nested routes for tabs
- Handle loading state (skeleton loaders)
- Handle error state (404 for invalid project ID)
- Persist selected project to localStorage

**Routing Structure:**
```typescript
<Routes>
  <Route index element={<Navigate to="overview" replace />} />
  <Route path="overview" element={<OverviewTab report={report} />} />
  <Route path="dimensions" element={<DimensionsTab report={report} />} />
  <Route path="triangle" element={<TriangleTab report={report} />} />
  <Route path="strengths" element={<StrengthsTab report={report} />} />
  <Route path="gaps" element={<GapsTab report={report} />} />
</Routes>
```

**State Management:**
```typescript
const { projectId } = useParams();
const [project, setProject] = useState<FOEProjectDetail | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**Acceptance Criteria:**
- Project loads on mount
- URL param drives which project loads
- Tab navigation updates URL
- Error state shows 404 message
- localStorage syncs with URL param
- Switch Project button returns to list view

**Agent:** @code-writer

---

## Phase 5: Persistence Logic (GREEN) - 2 hours

### Task 5.1: Implement URL Param Parsing (10 min)
**Objective:** Parse project ID from URL params with React Router

**Actions:**
- In `FOEProjectDetailPage.tsx`, use `useParams()` hook
- Extract `projectId` from URL
- Validate project ID format (UUID or slug)

**Code:**
```typescript
import { useParams, useNavigate } from 'react-router-dom';

const { projectId } = useParams<{ projectId: string }>();
const navigate = useNavigate();

useEffect(() => {
  if (!projectId) {
    navigate('/strategy/foe-scanner');
    return;
  }
  loadProjectDetail(projectId);
}, [projectId]);
```

**Acceptance Criteria:**
- URL param extraction works
- Invalid/missing param redirects to list view
- TypeScript types correct

**Agent:** @code-writer

---

### Task 5.2: Implement localStorage Sync (15 min)
**Objective:** Sync selected project to localStorage on selection

**Actions:**
- In `FOEProjectDetailPage.tsx`, call `setSelectedProjectId()` after project loads
- On unmount, check if project still exists before persisting

**Code:**
```typescript
useEffect(() => {
  if (project) {
    setSelectedProjectId(project.id);
  }
}, [project]);
```

**Acceptance Criteria:**
- localStorage updates when project selected
- localStorage clears when invalid project loaded
- No infinite loops

**Agent:** @code-writer

---

### Task 5.3: Implement Fallback Chain (20 min)
**Objective:** Implement priority fallback: URL → localStorage → most recent → null

**Actions:**
- In `FOEProjectListPage.tsx`, implement auto-selection logic on mount
- Check URL param first (if coming from deep link)
- Check localStorage second (if returning user)
- Check most recent project third (if first-time user)
- Fall back to null (show empty state)

**Logic:**
```typescript
useEffect(() => {
  const urlProjectId = new URLSearchParams(window.location.search).get('project');
  const storedProjectId = getSelectedProjectId();
  
  if (urlProjectId && projects.some(p => p.id === urlProjectId)) {
    navigate(`/strategy/foe-scanner/${urlProjectId}/overview`);
  } else if (storedProjectId && projects.some(p => p.id === storedProjectId)) {
    navigate(`/strategy/foe-scanner/${storedProjectId}/overview`);
  } else if (projects.length > 0) {
    const mostRecent = projects[0]; // Already sorted by date
    navigate(`/strategy/foe-scanner/${mostRecent.id}/overview`);
  }
}, [projects, navigate]);
```

**Acceptance Criteria:**
- URL param takes priority
- localStorage used if URL missing
- Most recent used if localStorage invalid
- Empty state shown if no projects

**Agent:** @code-writer

---

### Task 5.4: Implement Storage Event Listener for Multi-Tab Sync (15 min)
**Objective:** Sync project selection across browser tabs

**Actions:**
- In `FOEProjectDetailPage.tsx`, add storage event listener
- When another tab changes selected project, sync current tab

**Code:**
```typescript
useEffect(() => {
  const unsubscribe = onProjectIdChange((newProjectId) => {
    if (newProjectId && newProjectId !== projectId) {
      navigate(`/strategy/foe-scanner/${newProjectId}/overview`);
    }
  });
  
  return unsubscribe;
}, [projectId, navigate]);
```

**Acceptance Criteria:**
- Changing project in one tab updates other tabs
- No race conditions
- Works in Firefox, Chrome, Safari

**Agent:** @code-writer

---

### Task 5.5: Handle Deleted Project Edge Case (15 min)
**Objective:** Gracefully handle localStorage referencing deleted project

**Actions:**
- In `FOEProjectListPage.tsx`, validate stored project ID against fetched list
- If stored ID not found, clear localStorage and select most recent

**Code:**
```typescript
useEffect(() => {
  const storedProjectId = getSelectedProjectId();
  
  if (storedProjectId && !projects.some(p => p.id === storedProjectId)) {
    // Stored project was deleted
    clearSelectedProjectId();
    
    if (projects.length > 0) {
      navigate(`/strategy/foe-scanner/${projects[0].id}/overview`);
    }
  }
}, [projects, navigate]);
```

**Acceptance Criteria:**
- Deleted project scenario handled
- localStorage cleared
- User redirected to valid project or list view
- No console errors

**Agent:** @code-writer

---

## Phase 6: Routing (GREEN) - 2 hours

### Task 6.1: Update ReportsPage to Router Container (20 min)
**Objective:** Convert ReportsPage.tsx to a routing container

**Actions:**
- Open `packages/intelligence/web/src/pages/ReportsPage.tsx`
- Replace current content with router logic
- Add routes for list view and detail view
- Add redirect from base path to list view

**New Structure:**
```typescript
export function ReportsPage() {
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route index element={<Navigate to="list" replace />} />
        <Route path="list" element={<FOEProjectListPage />} />
        <Route path=":projectId/*" element={<FOEProjectDetailPage />} />
      </Routes>
    </div>
  );
}
```

**Acceptance Criteria:**
- Old single-view code replaced with router
- Routes nested correctly
- Backward compatibility maintained (see Task 6.3)

**Agent:** @code-writer

---

### Task 6.2: Update App.tsx Routes (15 min)
**Objective:** Update top-level routing to support nested routes

**Actions:**
- Open `packages/intelligence/web/src/App.tsx`
- Change `/strategy/foe-scanner` route to support wildcard
- Ensure nested routes work

**Updated Route:**
```typescript
<Route path="strategy/foe-scanner/*" element={<ReportsPage />} />
```

**Acceptance Criteria:**
- Nested routes work: `/strategy/foe-scanner/list`, `/strategy/foe-scanner/:projectId/overview`
- No route conflicts
- Existing routes (governance, domain mapper) unaffected

**Agent:** @code-writer

---

### Task 6.3: Add Legacy Route Redirects (10 min)
**Objective:** Ensure backward compatibility with old URLs

**Actions:**
- Add redirects for legacy routes:
  - `/testing/reports` → `/strategy/foe-scanner/list`
  - `/reports` → `/strategy/foe-scanner/list`

**Code:**
```typescript
<Route path="testing/reports" element={<Navigate to="/strategy/foe-scanner/list" replace />} />
<Route path="reports" element={<Navigate to="/strategy/foe-scanner/list" replace />} />
```

**Acceptance Criteria:**
- Old URLs redirect correctly
- No broken links
- Users see seamless transition

**Agent:** @code-writer

---

### Task 6.4: Implement Deep Linking Support (15 min)
**Objective:** Enable direct navigation to specific project tabs via URL

**Actions:**
- Test URLs:
  - `/strategy/foe-scanner/:projectId/dimensions`
  - `/strategy/foe-scanner/:projectId/triangle`
  - `/strategy/foe-scanner/:projectId/strengths`
  - `/strategy/foe-scanner/:projectId/gaps`

**Acceptance Criteria:**
- Pasting URL in new tab loads correct project and tab
- Browser back/forward buttons work correctly
- URL updates when switching tabs
- Shareable URLs work for team members

**Agent:** @code-writer

---

### Task 6.5: Test Routing with Browser Dev Tools (15 min)
**Objective:** Manually verify routing logic

**Actions:**
- Open browser dev tools
- Test all routes:
  - List view
  - Project detail (all tabs)
  - Invalid project ID
  - Legacy redirects
- Check localStorage after each navigation
- Test browser back/forward buttons

**Acceptance Criteria:**
- All routes work without console errors
- localStorage updates correctly
- Back/forward navigation works
- Deep links load correctly

**Agent:** Manual testing (developer)

---

## Phase 7: Edge Cases (REFACTOR) - 2 hours

### Task 7.1: Implement 404 State for Invalid Project ID (20 min)
**Objective:** Show user-friendly 404 when project not found

**Actions:**
- In `FOEProjectDetailPage.tsx`, catch 404 errors from `api.getProjectDetail()`
- Display custom 404 component with:
  - "Project not found" message
  - "Back to Projects" button
  - Optional: suggestion to check URL

**Component:**
```typescript
function ProjectNotFound({ onBackClick }: { onBackClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <FileQuestion className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Project Not Found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The project you're looking for doesn't exist or was deleted.
      </p>
      <button onClick={onBackClick}>Back to Projects</button>
    </div>
  );
}
```

**Acceptance Criteria:**
- 404 state displays for invalid project ID
- Button navigates to list view
- localStorage cleared
- No console errors

**Agent:** @code-writer

---

### Task 7.2: Handle Deleted Project During Viewing (15 min)
**Objective:** Handle scenario where project deleted while user viewing it

**Actions:**
- Add error handling in `FOEProjectDetailPage` for 404 during refresh
- Show toast notification: "This project was deleted"
- Auto-redirect to list view after 3 seconds

**Code:**
```typescript
const loadProjectDetail = async (id: string) => {
  try {
    const data = await api.getProjectDetail(id);
    setProject(data);
  } catch (err) {
    if (err.message.includes('404')) {
      setError('project-deleted');
      setTimeout(() => {
        navigate('/strategy/foe-scanner/list');
      }, 3000);
    } else {
      setError('unknown');
    }
  }
};
```

**Acceptance Criteria:**
- Deleted project scenario handled gracefully
- User notified before redirect
- localStorage cleared
- Redirect happens automatically

**Agent:** @code-writer

---

### Task 7.3: Normalize Repository URLs on Upload (10 min)
**Objective:** Ensure consistent URL formatting for proper project grouping

**Actions:**
- In report upload handling, normalize repository URL before persisting
- Use `normalizeRepositoryUrl()` utility (from Task 2.1)
- Update API client to normalize URLs before API calls

**Code:**
```typescript
const uploadReport = async (report: FOEReport) => {
  const normalizedUrl = normalizeRepositoryUrl(report.repository.path);
  const payload = {
    ...report,
    repository: {
      ...report.repository,
      path: normalizedUrl,
    },
  };
  
  await api.uploadReport(payload);
};
```

**Acceptance Criteria:**
- URLs normalized before persistence
- Different URL formats (HTTPS, SSH) map to same project
- No duplicate projects created

**Agent:** @code-writer

---

### Task 7.4: Handle Empty State Variations (15 min)
**Objective:** Show appropriate empty states for different scenarios

**Actions:**
Create 3 empty state variations:

1. **No Projects Exist** - Show "Upload First Report" CTA
2. **No Projects Match Search** - Show "No results found" with clear filter button
3. **API Not Configured** - Show "Configure API key" message

**Acceptance Criteria:**
- Each empty state shows contextually appropriate message
- CTAs lead to correct actions
- Clear filter button works

**Agent:** @code-writer

---

### Task 7.5: Add Loading Skeletons (20 min)
**Objective:** Improve perceived performance with skeleton loaders

**Actions:**
- Create skeleton components for:
  - ProjectCard (3 cards in list view)
  - ProjectHeader
  - OverviewCard
  - DimensionCards

**Styling:**
- Use Tailwind's `animate-pulse` class
- Gray background with subtle shimmer
- Match dimensions of real components

**Acceptance Criteria:**
- Skeletons display during loading
- Smooth transition to real content
- No layout shift

**Agent:** @code-writer

---

### Task 7.6: Add Retry Mechanism for Failed API Calls (15 min)
**Objective:** Allow users to retry failed API requests

**Actions:**
- In error states, add "Retry" button
- Button re-invokes failed API call
- Show loading state during retry

**Code:**
```typescript
const retryLoadProjects = async () => {
  setError(null);
  setLoading(true);
  try {
    const data = await api.listProjects();
    setProjects(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Acceptance Criteria:**
- Retry button appears in error states
- Retry re-fetches data
- Loading state shown during retry
- Success clears error

**Agent:** @code-writer

---

## Phase 8: Quality Gates (Validation) - 4 hours

### Task 8.1: Run Full BDD Test Suite (30 min)
**Objective:** Execute all 24 BDD scenarios and verify GREEN state

**Actions:**
```bash
bun test stack-tests/features/ui/reporting/02_foe_project_browser.feature
```

**Expected Result:**
- All 24 scenarios pass
- No flaky tests
- Execution time < 5 minutes

**Acceptance Criteria:**
- ✅ All scenarios passing
- Zero failures
- GREEN state confirmed

**Agent:** @bdd-runner

---

### Task 8.2: Architecture Review (30 min)
**Objective:** Ensure implementation follows Clean Architecture + DDD principles

**Actions:**
- Run architecture inspector
- Check for:
  - Dependency direction (UI → API → Domain)
  - No circular dependencies
  - Proper separation of concerns
  - Type safety throughout

**Review Checklist:**
- [ ] UI components don't directly access localStorage (use utility)
- [ ] API client doesn't contain business logic
- [ ] Types defined in `types/` directory
- [ ] No prop drilling (use context if needed)
- [ ] Error boundaries implemented

**Acceptance Criteria:**
- Architecture review passes
- No critical issues flagged
- Recommendations documented (if any)

**Agent:** @architecture-inspector

---

### Task 8.3: TypeScript Type Check (10 min)
**Objective:** Ensure zero TypeScript errors

**Actions:**
```bash
cd packages/intelligence/web
bun run type-check
```

**Acceptance Criteria:**
- Zero TypeScript errors
- Zero `any` types (except for third-party libraries)
- All exports have explicit types

**Agent:** Developer (manual)

---

### Task 8.4: Accessibility Audit (45 min)
**Objective:** Ensure WCAG 2.1 AA compliance

**Actions:**
- Run Lighthouse accessibility audit
- Test with keyboard navigation
- Test with screen reader (VoiceOver or NVDA)

**Audit Checklist:**
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels on all buttons/links
- [ ] Color contrast ratios meet AA standards
- [ ] Tab order logical
- [ ] Screen reader announces all content

**Tools:**
- Chrome Lighthouse
- axe DevTools
- Screen reader (macOS VoiceOver or Windows NVDA)

**Acceptance Criteria:**
- Lighthouse accessibility score ≥ 95
- Zero critical a11y issues
- Keyboard navigation works for all features
- Screen reader usability verified

**Agent:** Developer (manual) + automated tools

---

### Task 8.5: Mobile Responsive Testing (30 min)
**Objective:** Verify responsive design on multiple viewport sizes

**Actions:**
- Test on viewports: 375px (iPhone SE), 768px (iPad), 1920px (desktop)
- Use Chrome DevTools device emulation
- Test on real devices if available

**Test Cases:**
- [ ] Project cards stack on mobile
- [ ] Tabs scroll horizontally on mobile
- [ ] Search bar responsive
- [ ] Project header responsive
- [ ] Tab content readable on mobile
- [ ] No horizontal scrollbars

**Acceptance Criteria:**
- All layouts work on 375px, 768px, 1920px viewports
- No content cutoff
- Touch targets ≥ 44x44px
- Text remains readable (no overflow)

**Agent:** Developer (manual)

---

### Task 8.6: Dark Mode Verification (15 min)
**Objective:** Ensure all new components support dark mode

**Actions:**
- Toggle system dark mode
- Check all new components:
  - ProjectCard
  - ProjectSearchBar
  - EmptyProjectState
  - FOEProjectListPage
  - FOEProjectDetailPage
  - SubNavTabs
  - ProjectHeader

**Acceptance Criteria:**
- All components use `dark:` Tailwind classes
- Contrast ratios meet WCAG AA in dark mode
- No white backgrounds in dark mode
- Smooth transition when toggling

**Agent:** Developer (manual)

---

### Task 8.7: Performance Testing (30 min)
**Objective:** Ensure page loads meet performance targets

**Actions:**
- Run Lighthouse performance audit
- Test with Chrome DevTools Performance tab
- Measure Time to Interactive (TTI)

**Targets:**
- Project list page TTI < 1s (with 20 projects)
- Project detail page TTI < 2s
- Tab switching < 100ms

**Optimization Checks:**
- [ ] Components lazy-loaded where appropriate
- [ ] Images optimized
- [ ] No unnecessary re-renders (use React DevTools Profiler)
- [ ] API calls debounced (search)

**Acceptance Criteria:**
- Lighthouse performance score ≥ 90
- TTI meets targets
- No layout shift (CLS < 0.1)
- No performance warnings in console

**Agent:** Developer (manual) + automated tools

---

### Task 8.8: Cross-Browser Testing (20 min)
**Objective:** Verify functionality in major browsers

**Actions:**
- Test in:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest, macOS)
  - Edge (latest)

**Test Checklist:**
- [ ] Routing works
- [ ] localStorage persists
- [ ] CSS renders correctly
- [ ] No console errors
- [ ] Animations smooth

**Acceptance Criteria:**
- Zero critical bugs in any browser
- Minor visual differences acceptable (note in docs)
- Functionality identical across browsers

**Agent:** Developer (manual)

---

## Phase 9: Documentation & Handoff (1 hour)

### Task 9.1: Update README (15 min)
**Objective:** Document new Reports page structure

**Actions:**
- Update `packages/intelligence/README.md`
- Add section: "FOE Project Browser"
- Include screenshots of:
  - Project list view
  - Project detail with tabs
  - Empty state

**Content:**
```markdown
## FOE Project Browser

The Reports page now supports multi-project management:

### Project List View
- Browse all scanned projects
- Search by name
- Filter by maturity level
- Sort by date, score, or name

### Project Detail View
- Persistent selection (survives page refresh)
- Sub-navigation tabs: Overview, Dimensions, Triangle, Strengths, Gaps
- Deep linking support: `/strategy/foe-scanner/:projectId/:tab`
- "Switch Project" button to return to list

### URL Structure
- `/strategy/foe-scanner/list` - Project list
- `/strategy/foe-scanner/:projectId/overview` - Overview tab
- `/strategy/foe-scanner/:projectId/dimensions` - Dimensions tab
- `/strategy/foe-scanner/:projectId/triangle` - Triangle tab
- `/strategy/foe-scanner/:projectId/strengths` - Strengths tab
- `/strategy/foe-scanner/:projectId/gaps` - Gaps tab
```

**Acceptance Criteria:**
- README updated
- Screenshots included
- URL structure documented

**Agent:** Developer (manual)

---

### Task 9.2: Update ROAD-030 Status (5 min)
**Objective:** Mark roadmap item as complete

**Actions:**
- Open `packages/delivery-framework/roads/ROAD-030.md`
- Change status from `proposed` to `completed`
- Update frontmatter with completion date
- Mark all acceptance criteria as ✅

**Acceptance Criteria:**
- Status updated
- Completion date added
- All ACs checked off

**Agent:** Developer (manual)

---

### Task 9.3: Create Demo Video (Optional - 20 min)
**Objective:** Record walkthrough of new features

**Actions:**
- Record 2-3 minute video showing:
  - Project list navigation
  - Project selection
  - Tab navigation
  - Search/filter
  - Upload new report
  - Persistent selection (refresh demo)

**Tools:**
- Loom, QuickTime, or OBS

**Acceptance Criteria:**
- Video < 3 minutes
- Audio clear
- Covers all main features

**Agent:** Developer (manual)

---

## Summary

**Total Estimated Time:** 21-29 hours (3-4 days)

**Task Breakdown:**
- Phase 1: BDD Scenarios (2h) - 7 tasks
- Phase 2: API Client (2h) - 5 tasks
- Phase 3: Project List Page (3h) - 5 tasks
- Phase 4: Project Detail Layout (4h) - 4 tasks
- Phase 5: Persistence Logic (2h) - 5 tasks
- Phase 6: Routing (2h) - 5 tasks
- Phase 7: Edge Cases (2h) - 6 tasks
- Phase 8: Quality Gates (4h) - 8 tasks
- Phase 9: Documentation (1h) - 3 tasks

**Total Tasks:** 48 atomic tasks (avg 2-5 minutes each)

**Agent Distribution:**
- @bdd-writer: 6 tasks (Phase 1)
- @code-writer: 30 tasks (Phases 2-7)
- @bdd-runner: 2 tasks (Phase 1 & 8)
- @architecture-inspector: 1 task (Phase 8)
- Developer (manual): 9 tasks (Phase 8-9)

---

## Next Steps

1. **Review & Approve Plan** - Stakeholder sign-off on approach
2. **Kick off Phase 1** - Delegate to @bdd-writer to create feature file
3. **Execute Sequentially** - Follow RED-GREEN-REFACTOR cycle
4. **Track Progress** - Update ROAD-030.md with task completions
5. **Celebrate** 🎉 - Ship to production after all quality gates pass

---

**Ready to start?** Begin with **Task 1.1** by delegating to @bdd-writer.

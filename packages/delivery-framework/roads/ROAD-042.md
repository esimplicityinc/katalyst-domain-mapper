---
id: ROAD-042
title: "FOE Report Trend Visualization (Web UI)"
status: proposed
phase: 3
priority: high
created: "2026-02-17"
updated: "2026-02-17"
owner: "OpenCode AI"
tags: [ui, visualization, trends, charts, history, foe-reports]
governance:
  adrs:
    validated: false
    ids: []
    validated_by: ""
    validated_at: ""
    notes: "No new ADR required. Follows existing React component patterns."
  bdd:
    status: draft
    feature_files: []
    scenarios: 0
    passing: 0
  nfrs:
    applicable: [NFR-PERF-002, NFR-A11Y-001]
    status: pending
    results: {}
dependencies:
  requires: []
  enables: []
---

# ROAD-042: FOE Report Trend Visualization (Web UI)

## Summary

Build React UI components to visualize FOE report history and trends over time. The backend API already provides trend data via `/repositories/:id/trend` and report comparison via `CompareReports` use case. This roadmap item focuses entirely on frontend visualization components using Recharts for interactive line charts, maturity timelines, and side-by-side report comparisons.

## Business Value

**Current Pain Points:**
- Backend API for trends exists but no UI to visualize it
- Users must manually download reports and analyze in spreadsheets
- No way to see improvement trajectory visually
- Comparison data exists but requires API calls to access
- Difficult to demonstrate progress to stakeholders

**Benefits After Implementation:**
- Visual trend lines show improvement at a glance
- Maturity timeline celebrates milestone achievements
- Side-by-side comparison highlights specific changes
- Export to CSV for presentations
- Data-driven decision making for improvement initiatives
- Stakeholder-friendly visualizations for reporting

**Target Personas:**
- **PER-001** (Engineering Team Lead) — Primary user for tracking team progress
- **PER-002** (Platform Engineer) — Monitors organizational maturity trends
- **PER-005** (Framework Adopter) — Demonstrates value to leadership
- **PER-006** (Non-Technical Stakeholder) — Views high-level progress

## Acceptance Criteria

### 1. ✅ **Trend Page Route**
   - New route: `/reports/history/:repositoryId`
   - Page displays repository name and scan count in header
   - Shows "No scans yet" empty state if repository has 0 scans
   - Shows "Run another scan to see trends" if only 1 scan exists

### 2. ✅ **Multi-Line Trend Chart**
   - Uses Recharts `<LineChart>` component
   - 4 lines: Overall score + 3 dimensions (Feedback, Understanding, Confidence)
   - X-axis: Scan dates (formatted as "Jan 15" or custom)
   - Y-axis: Score range 0-100
   - Grid lines for readability
   - Legend showing line colors/names
   - Responsive: Adjusts to screen width

### 3. ✅ **Interactive Features**
   - Hover tooltips showing:
     - Scan date
     - Overall score
     - Dimension scores
     - Maturity level
   - Checkboxes to toggle dimension lines on/off
   - Date range selector (30 days, 90 days, 1 year, all time)
   - Export button downloads CSV with trend data

### 4. ✅ **Maturity Timeline Component**
   - Horizontal timeline showing 4 maturity stages
   - Each scan plotted as a dot at its maturity level
   - Color-coded:
     - Hypothesized: Gray
     - Emerging: Yellow/Amber
     - Practicing: Blue
     - Optimized: Green
   - Shows duration at each stage
   - Clicking a dot navigates to full report

### 5. ✅ **Report History Table**
   - Sortable table with columns:
     - Scan Date
     - Overall Score
     - Maturity Level
     - Actions (View, Compare)
   - Pagination (10 per page)
   - Click "View" opens report detail
   - Click "Compare" opens comparison modal

### 6. ✅ **Comparison View (Modal or Page)**
   - Select two reports from dropdowns
   - Side-by-side display:
     - Overall score with delta (+7)
     - Dimension scores with deltas
     - Maturity level change (Emerging → Practicing)
   - "New Gaps" and "Resolved Gaps" lists
   - "New Strengths" list
   - Close button or navigate back

### 7. ✅ **Accessibility (WCAG 2.1 AA)**
   - Charts have ARIA labels
   - Keyboard navigation for all interactive elements
   - Focus indicators visible
   - Screen reader announcements for chart data
   - High contrast mode compatible

### 8. ✅ **Performance**
   - Trend page loads in <2s with 50 data points
   - Chart renders without lag
   - Smooth hover interactions
   - No memory leaks on component unmount

## Technical Approach

### Architecture Changes

```
packages/intelligence/web/src/
├── pages/
│   └── reports/
│       ├── TrendPage.tsx                # NEW — Main trend visualization page
│       └── ComparisonPage.tsx           # NEW — Side-by-side comparison
├── components/
│   └── reports/
│       ├── TrendLineChart.tsx           # NEW — Recharts line chart
│       ├── MaturityTimeline.tsx         # NEW — Timeline component
│       ├── ReportHistoryTable.tsx       # NEW — Sortable table
│       ├── ComparisonView.tsx           # NEW — Two-column comparison
│       ├── DateRangeSelector.tsx        # NEW — Dropdown filter
│       ├── DimensionToggles.tsx         # NEW — Checkboxes
│       └── ExportButton.tsx             # NEW — CSV download
├── hooks/
│   ├── useReportTrend.ts                # NEW — TanStack Query hook
│   ├── useReportComparison.ts           # NEW — Comparison data fetching
│   └── useCSVExport.ts                  # NEW — Export utility
└── utils/
    ├── chartFormatters.ts               # NEW — Date/score formatting
    └── csvExport.ts                     # NEW — CSV generation
```

### Key Components

#### 1. TrendPage.tsx
```tsx
export function TrendPage() {
  const { repositoryId } = useParams();
  const { data, isLoading } = useReportTrend(repositoryId);
  const [dateRange, setDateRange] = useState('all');
  const [visibleLines, setVisibleLines] = useState(['overall', 'feedback', 'understanding', 'confidence']);

  const filteredData = filterByDateRange(data, dateRange);

  return (
    <div className="container mx-auto p-6">
      <PageHeader repository={data?.repository} />
      <div className="mb-4 flex gap-4">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
        <DimensionToggles visible={visibleLines} onChange={setVisibleLines} />
        <ExportButton data={filteredData} />
      </div>
      <TrendLineChart data={filteredData} visibleLines={visibleLines} />
      <MaturityTimeline scans={data?.trend} />
      <ReportHistoryTable reports={data?.trend} />
    </div>
  );
}
```

#### 2. TrendLineChart.tsx
```tsx
export function TrendLineChart({ data, visibleLines }: Props) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="scanDate" 
          tickFormatter={formatDate}
          aria-label="Scan date"
        />
        <YAxis domain={[0, 100]} aria-label="Score" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {visibleLines.includes('overall') && (
          <Line type="monotone" dataKey="overallScore" stroke="#8884d8" name="Overall" />
        )}
        {visibleLines.includes('feedback') && (
          <Line type="monotone" dataKey="feedback" stroke="#82ca9d" name="Feedback" />
        )}
        {visibleLines.includes('understanding') && (
          <Line type="monotone" dataKey="understanding" stroke="#ffc658" name="Understanding" />
        )}
        {visibleLines.includes('confidence') && (
          <Line type="monotone" dataKey="confidence" stroke="#ff7c7c" name="Confidence" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

#### 3. MaturityTimeline.tsx
```tsx
const maturityColors = {
  Hypothesized: 'bg-gray-400',
  Emerging: 'bg-yellow-400',
  Practicing: 'bg-blue-500',
  Optimized: 'bg-green-500'
};

export function MaturityTimeline({ scans }: Props) {
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Maturity Progression</h2>
      <div className="flex items-center justify-between">
        {scans.map((scan, idx) => (
          <div key={scan.scanId} className="flex flex-col items-center">
            <button
              onClick={() => navigate(`/reports/${scan.scanId}`)}
              className={`w-4 h-4 rounded-full ${maturityColors[scan.maturityLevel]}`}
              aria-label={`Scan from ${scan.scanDate} - ${scan.maturityLevel}`}
            />
            <span className="text-xs mt-2">{formatDate(scan.scanDate)}</span>
            <span className="text-xs font-bold">{scan.overallScore}</span>
            {idx < scans.length - 1 && (
              <div className="w-12 h-0.5 bg-gray-300 absolute" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### API Integration

```typescript
// packages/intelligence/web/src/hooks/useReportTrend.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useReportTrend(repositoryId: string) {
  return useQuery(
    ['trend', repositoryId],
    () => api.request(`/api/v1/repositories/${repositoryId}/trend`),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}
```

### CSV Export Utility

```typescript
// packages/intelligence/web/src/utils/csvExport.ts
export function exportTrendToCSV(data: ScoreTrendPoint[], filename: string) {
  const headers = ['Date', 'Overall Score', 'Feedback', 'Understanding', 'Confidence'];
  const rows = data.map(point => [
    point.scanDate,
    point.overallScore,
    point.feedback,
    point.understanding,
    point.confidence
  ]);

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

## BDD Scenarios

Feature files will be created at:
- `stack-tests/features/ui/reports/trend-visualization.feature` (8 scenarios)
- `stack-tests/features/ui/reports/maturity-timeline.feature` (5 scenarios)
- `stack-tests/features/ui/reports/report-comparison.feature` (6 scenarios)

### Example Scenarios

```gherkin
Feature: FOE Report Trend Visualization
  As an Engineering Team Lead
  I want to view score trends over time
  So that I can track improvement and identify stagnation

  @CAP-014 @ROAD-042 @ui @trends
  Scenario: View trend chart with multiple scans
    Given a repository "katalyst" has 5 FOE scans:
      | scanDate   | overallScore | feedback | understanding | confidence | maturityLevel |
      | 2024-01-15 | 45           | 40       | 50            | 45         | Emerging      |
      | 2024-02-01 | 52           | 48       | 55            | 53         | Emerging      |
      | 2024-03-15 | 65           | 60       | 70            | 65         | Practicing    |
      | 2024-04-01 | 68           | 62       | 72            | 70         | Practicing    |
      | 2024-05-15 | 72           | 65       | 75            | 75         | Practicing    |
    When I navigate to "/reports/history/katalyst"
    Then I should see a line chart with 4 lines
    And the chart should have 5 data points
    And hovering over the first point shows "Jan 15, 2024 - 45"

  @CAP-014 @ROAD-042 @ui @trends
  Scenario: Toggle dimension lines
    Given I am viewing the trend page for "katalyst"
    When I uncheck "Feedback"
    Then the feedback line should be hidden
    And the chart should show 3 lines

  @CAP-014 @ROAD-042 @ui @trends
  Scenario: Filter by date range
    Given a repository has scans spanning 1 year
    When I select "Last 30 days" from the date range dropdown
    Then only scans from the last 30 days are displayed

  @CAP-014 @ROAD-042 @ui @trends
  Scenario: Export trend data as CSV
    Given I am viewing the trend page
    When I click "Export CSV"
    Then a file "katalyst-trend.csv" should download
    And the CSV should contain columns: Date, Overall, Feedback, Understanding, Confidence

  @CAP-014 @ROAD-042 @ui @accessibility
  Scenario: Keyboard navigation
    Given I am viewing the trend page
    When I press Tab
    Then the date range selector should receive focus
    When I press Tab again
    Then the first dimension toggle checkbox should receive focus
```

## Dependencies

### Existing Libraries ✅
- **Recharts** (already in project) - For line charts
- **Tailwind CSS** (already in project) - Styling
- **React Router** (already in project) - Routing

### New Libraries (Optional)
- **TanStack Query** (React Query) - Data fetching and caching (if not already used)
- **date-fns** or **Day.js** - Date formatting (if not already used)

### Backend API (Already Exists) ✅
- `GET /api/v1/repositories/:id/trend` - Score trend data
- `GET /api/v1/reports?repositoryId=:id` - List all reports
- `CompareReports` use case - Comparison logic (needs HTTP route)

### Missing API Route
- `GET /api/v1/reports/:id/compare/:otherId` - Not implemented yet
  - **Quick Fix**: Add route that calls `CompareReports` use case

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large datasets slow chart rendering | Medium | Paginate data, limit to 100 points, add loading states |
| Comparison endpoint missing | High | Add HTTP route in Phase 1 before UI work |
| Mobile responsiveness challenges | Medium | Use responsive Recharts container, test on devices |
| Accessibility violations | High | Use axe-core testing, follow ARIA best practices |

## Estimation

- **Complexity**: Medium (mostly UI work, API exists)
- **Estimated Effort**: 16-24 hours

### Breakdown:
1. TrendLineChart component (4 hours)
2. MaturityTimeline component (3 hours)
3. ReportHistoryTable component (2 hours)
4. ComparisonView component (3 hours)
5. Date range + dimension toggles (2 hours)
6. CSV export utility (1 hour)
7. API integration hooks (2 hours)
8. Routing + page layout (2 hours)
9. BDD scenarios + tests (6 hours)
10. Accessibility testing + fixes (3 hours)

**Total**: ~28 hours (rounded to 24-30 for estimates)

## NFR Validation

| NFR | Requirement | Test Approach |
|-----|-------------|---------------|
| NFR-PERF-002 | Page loads <2s with 50 data points | Lighthouse audit, BDD timing assertions |
| NFR-A11Y-001 | WCAG 2.1 AA compliant | axe-core automated testing, manual keyboard nav |

---

## Governance Checklist

- [ ] ADRs validated (None needed - follows existing patterns)
- [ ] BDD scenarios written (~20 scenarios estimated)
- [ ] Implementation complete (components, hooks, utils)
- [ ] NFRs validated (performance, accessibility)
- [ ] Comparison HTTP route added
- [ ] Change record created (CHANGE-042.md)
- [ ] Documentation updated (user guide, component docs)

---

**Status**: 🎯 **Proposed**
**Created**: 2026-02-17
**Capability**: CAP-014 (FOE Report Trend Analysis & History)
**Priority**: High — Unlocks data-driven improvement tracking
**User Stories**: US-047 (View Trends), US-048 (Track Maturity), US-030 (Compare Reports)

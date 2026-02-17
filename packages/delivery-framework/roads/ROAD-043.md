---
id: ROAD-043
title: "Manual FOE Assessment Wizard UI"
status: proposed
priority: High
phase: 3
created: 2026-02-17
tags: [ui, foe, manual-assessment, wizard, react, web-report]
capabilities:
  - CAP-015
  - CAP-001
  - CAP-002
user_stories:
  - US-055
dependencies: []
enables: []
estimated_effort: M
---

# ROAD-043: Manual FOE Assessment Wizard UI

**Status**: 🎯 Proposed  
**Priority**: High  
**Phase**: 3 — API & Visualization  
**Estimated Effort**: M (2-3 days)

## Description

Build a step-by-step wizard interface in `@foe/web-report` (Next.js) that allows users to create FOE assessment reports manually without running an automated scan. The wizard guides users through scoring three dimensions, identifying findings, and generating a valid FOE report JSON that works in all 11 visualization templates.

## Value Proposition

- **Accessibility**: FOE framework available without code access
- **Speed**: Faster than scanning for initial assessments
- **Education**: Hands-on learning tool for FOE concepts
- **Flexibility**: Works for any project regardless of tech stack  
- **No AI Required**: Manual alternative to automated scanner

## User Stories

- **US-055** (Create Manual FOE Assessment) -- Primary story delivered

## Capabilities

- **Implements**: CAP-015 (Manual FOE Assessment Creation)
- **Depends on**: CAP-001 (FOE Report Generation) -- Schema
- **Depends on**: CAP-002 (FOE Report Visualization) -- Templates

## Technical Design

### Architecture

```
packages/web-report/
├── src/
│   ├── app/
│   │   ├── manual-assessment/
│   │   │   └── page.tsx            # NEW - Route page
│   │   └── page.tsx                 # MODIFIED - Add CTA banner
│   └── components/
│       └── manual-assessment/
│           └── AssessmentWizard.tsx # NEW - Main wizard component
```

### Component Structure

**AssessmentWizard.tsx** (~650 lines):
- Main wizard shell with step navigation
- State management (useState)
- Progress indicator
- Step components:
  1. **MetadataStep** - Repository name, executive summary
  2. **DimensionStep (×3)** - Feedback, Understanding, Confidence
     - Visual sliders (0-100)
     - Assessment criteria guidance
     - Scoring rubric
  3. **FindingsStep** - Add strengths and gaps
  4. **RecommendationsStep** - Add recommendations
  5. **ReviewStep** - Summary and export

### Data Flow

```
User Input → Wizard State → Validation → FOEReport JSON
                                              ↓
                                    Download or View
                                              ↓
                                    Visualization Templates
```

### Schema Compliance

Generated JSON must match `FOEReport` type from `@foe/schemas`:

```typescript
interface FOEReport {
  repository: string;
  scanDate: string;
  overallScore: number;
  maturityLevel: "Emerging" | "Developing" | "Optimized";
  assessmentMode: "standard" | "critical";
  executiveSummary: string;
  dimensions: {
    feedback: DimensionScore;
    understanding: DimensionScore;
    confidence: DimensionScore;
  };
  criticalFailures: Finding[];
  strengths: Strength[];
  gaps: Finding[];
  recommendations: Recommendation[];
  methodology: {
    filesAnalyzed: number;
    testFilesAnalyzed: number;
    adrsAnalyzed: number;
    confidenceNotes: string[];
  };
}
```

## Implementation Tasks

### Phase 1: Core Wizard (Day 1)
- [ ] Create `AssessmentWizard.tsx` component
- [ ] Implement 7 step components with navigation
- [ ] Add state management (useState)
- [ ] Implement progress tracking
- [ ] Add form validation

### Phase 2: Dimension Scoring (Day 1-2)
- [ ] Build dimension scoring UI with sliders
- [ ] Add assessment criteria guidance
- [ ] Implement maturity level scoring guide
- [ ] Add overall score calculation (weighted average)
- [ ] Visual feedback on score changes

### Phase 3: Findings & Export (Day 2)
- [ ] Create findings input (strengths + gaps)
- [ ] Create recommendations input
- [ ] Build review/summary step
- [ ] Implement JSON export functionality
- [ ] Add Zod schema validation

### Phase 4: UI Polish (Day 2-3)
- [ ] Create `/manual-assessment` route page
- [ ] Add success screen with score summary
- [ ] Add homepage CTA banner
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility audit (keyboard nav, ARIA labels)

### Phase 5: Integration & Testing (Day 3)
- [ ] Test JSON exports in all 11 templates
- [ ] Add "View in Template" button
- [ ] Unit tests for score calculations
- [ ] Integration test for complete wizard flow
- [ ] Manual testing checklist

## Acceptance Criteria

From US-055:

1. [ ] User can access wizard from homepage CTA
2. [ ] Wizard has 7 clear steps with progress indicator
3. [ ] Each dimension has assessment guidance
4. [ ] Overall score calculates automatically
5. [ ] Can add strengths, gaps, recommendations
6. [ ] Review step shows complete summary
7. [ ] Exported JSON validates against schema
8. [ ] Generated report works in all 11 templates
9. [ ] Completion time &lt;10 minutes
10. [ ] Keyboard navigable, WCAG 2.1 AA compliant

## Visual Design

### Color Scheme (Consistent with templates)
- **Feedback**: Blue (`#3B82F6`)
- **Understanding**: Purple (`#8B5CF6`)
- **Confidence**: Green (`#10B981`)

### Components
- Progress bar with percentage
- Step navigation breadcrumbs
- Range sliders with numeric input
- Cards for strengths/gaps/recommendations
- Success screen with score summary

## Non-Functional Requirements

### NFR-USAB-001: Usability
- **Target**: Wizard completion &lt;10 minutes
- **Test**: User testing + analytics
- **Priority**: High

### NFR-A11Y-001: Accessibility
- **Target**: WCAG 2.1 AA compliant
- **Test**: axe-core + manual keyboard nav
- **Priority**: High

### NFR-REL-001: Data Integrity
- **Target**: 100% schema validation success
- **Test**: Zod validation in unit tests
- **Priority**: Critical

### NFR-PERF-001: Performance
- **Target**: Form interactions &lt;100ms
- **Test**: React DevTools profiling
- **Priority**: Medium

## Testing Strategy

### Unit Tests
- [ ] Score calculation logic
- [ ] Maturity level determination
- [ ] JSON generation matches schema

### Integration Tests
- [ ] Complete wizard flow
- [ ] JSON export/download
- [ ] Template viewer integration

### Manual Testing
- [ ] Fill out all fields → valid JSON
- [ ] Empty optional fields → still works
- [ ] Edge scores (0, 100) → handled correctly
- [ ] Download → file saves correctly
- [ ] View in template → loads and displays
- [ ] Keyboard navigation → all steps accessible
- [ ] Screen reader → announces correctly

## Dependencies

- **Existing**: `@/data/types.ts` - TypeScript types
- **Existing**: `lucide-react` - Icons
- **Existing**: `tailwindcss` - Styling
- **New**: None (uses existing Next.js/React)

## Files to Clean Up

From premature implementation:
```bash
rm -rf packages/web-report/src/components/manual-assessment/
rm -rf packages/web-report/src/app/manual-assessment/
# Revert homepage changes (already done)
```

## Success Metrics

- [ ] Users can create FOE reports without AI scanner
- [ ] Generated JSON validates against schema
- [ ] Reports display correctly in all 11 templates
- [ ] Wizard completion time < 10 minutes
- [ ] No TypeScript errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] 100% acceptance criteria met

## Related Documentation

- **Planning Doc**: `docs/features/manual-assessment-wizard.md`
- **Capability**: CAP-015 (Manual FOE Assessment Creation)
- **User Story**: US-055 (Create Manual FOE Assessment)
- **Cleanup Script**: `scripts/cleanup-manual-assessment.sh`

## Future Enhancements (Not in Scope)

- [ ] localStorage persistence (save progress)
- [ ] Import existing JSON to edit
- [ ] File upload for JSON import
- [ ] Export to PDF or markdown
- [ ] Multi-user collaborative scoring
- [ ] Template library (pre-populated assessments)
- [ ] Historical comparison with previous assessments

---

**Status**: Proposed  
**Priority**: High (enables FOE without AI)  
**Estimated Effort**: M (2-3 days, one developer)  
**Next Steps**: Prioritize against other Phase 3 roadmap items

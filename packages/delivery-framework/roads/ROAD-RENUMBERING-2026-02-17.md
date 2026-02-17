# ROAD Renumbering — 2026-02-17

## Issue

Two parallel roadmap systems were discovered with conflicting ROAD numbers:

1. **ROADMAP.mdx** (source of truth for web app features)
2. **roads/*.md files** (detailed implementation docs for infrastructure/docs features)

## Conflicts Found

| Original Number | ROADMAP.mdx Definition | roads/*.md Definition | Resolution |
|----------------|------------------------|----------------------|------------|
| ROAD-029 | "Fix Model Selection Not Persisting" ✅ | "Lifecycle Navigation (Docs Site)" | Renamed to ROAD-039 |
| ROAD-030 | "FOE Project Browser & Persistent Report Selection" 🎯 | "Lifecycle Navigation (Web App)" ✅ | Renamed to ROAD-040 |

## Resolution Strategy

**ROADMAP.mdx is the source of truth** for numbering. The roads/*.md files were renumbered to avoid conflicts.

### Changes Made

1. **Created ROAD-039.md** (renamed from ROAD-029.md)
   - "Lifecycle-Oriented Navigation + System Taxonomy (Docs Site)"
   - Status: nfr_validating
   - Documentation site (Docusaurus) navigation restructure

2. **Created ROAD-040.md** (renamed from ROAD-030.md)
   - "Lifecycle Navigation + Interactive Taxonomy (Web App)"
   - Status: complete ✅
   - Web application navigation restructure (COMPLETED 2026-02-17)

3. **Updated CHANGE-030.md**
   - Changed `road_id` from ROAD-030 to ROAD-040
   - Added migration note explaining renumbering

4. **Left unchanged:**
   - ROAD-029.md and ROAD-030.md (old files, can be archived)
   - ROADMAP.mdx (remains authoritative)

## ROADMAP.mdx Numbers (Authoritative)

These numbers are **reserved** and should NOT be used in roads/*.md files:

- ROAD-029: "Fix Model Selection Not Persisting Across Page Refresh" ✅ Complete
- ROAD-030: "FOE Project Browser & Persistent Report Selection" 🎯 Proposed
- ROAD-031: "FOE Assessment Agent Chat Interface" 🎯 Proposed
- ROAD-032: "Clickable Artifact Counts in Context Detail Panel" 🎯 Proposed
- ROAD-033: "Aggregate Tree Filtering & Search" 🎯 Proposed
- ROAD-034: "Fix Markdown Rendering in DDDChat Question Answers" 🎯 Proposed
- ROAD-035: "Chat Session Persistence & Live Data Refresh" 🎯 Proposed
- ROAD-036: "Fix Workflow State Machine Diagram Text Readability" 🎯 Proposed
- ROAD-037: "Enhance Chat Tab with AI Branding & Right Justification" 🎯 Proposed
- ROAD-038: "Filter Glossary Terms by Clickable Tags" 🎯 Proposed

## Future ROAD Numbers

When creating new roadmap items in roads/*.md:
- Start from **ROAD-039** onwards (ROAD-039 and ROAD-040 now taken)
- Next available: **ROAD-041**
- Always check ROADMAP.mdx for conflicts before assigning numbers

## Implementation Status

### Completed
- ✅ ROAD-040: Lifecycle Navigation (Web App) — 28/28 BDD tests passing, 100% coverage

### In Progress
- ⏸️ ROAD-039: Lifecycle Navigation (Docs Site) — NFR validation (performance blocked)

### Proposed (ROADMAP.mdx)
- 🎯 ROAD-030: FOE Project Browser
- 🎯 ROAD-031: FOE Assessment Chat
- 🎯 ROAD-032-038: Various web app enhancements

## Migration Notes

**For developers referencing old numbers:**
- If you see "ROAD-030" in logs/docs before 2026-02-17, it refers to ROAD-040 (web app navigation)
- If you see "ROAD-029" in logs/docs before 2026-02-17, it may refer to ROAD-039 (docs site navigation)
- CHANGE-030.md now correctly references ROAD-040

**For Git history:**
- Search for "ROAD-030" before 2026-02-17 → means ROAD-040
- Search for "ROAD-029" before 2026-02-17 → may mean ROAD-039
- Execution log: `.opencode/logs/2026-02-16-133839-ROAD-030.md` refers to ROAD-040

## Cleanup Tasks

Optional (not urgent):
1. Archive old ROAD-029.md and ROAD-030.md files
2. Update any internal wiki/docs that reference old numbers
3. Add this renumbering note to ROADMAP.mdx header
4. Create a validation script to prevent future duplicates

---

**Created**: 2026-02-17
**Reason**: Resolve duplicate ROAD numbering between ROADMAP.mdx and roads/*.md files
**Impact**: Two roadmap items renumbered, one CHANGE file updated, no functional code changes

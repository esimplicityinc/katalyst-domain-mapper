---
id: CHANGE-032
road_id: ROAD-029
title: "Model Selection Persistence Across Page Refresh"
date: "2026-02-17"
version: "0.9.0"
status: published
categories:
  - Fixed
compliance:
  adr_check:
    status: pass
    validated_by: "opencode"
    validated_at: "2026-02-17"
    notes: "No new ADR required. Follows existing client-side state management patterns."
  bdd_check:
    status: na
    scenarios: 0
    passed: 0
    coverage: "N/A"
    notes: "UX fix validated manually. Selection persists across page refresh and URL deep linking works correctly."
  nfr_checks:
    performance:
      status: pass
      evidence: "localStorage read/write is synchronous and sub-millisecond. No perceptible delay."
      validated_by: "opencode"
    security:
      status: pass
      evidence: "Only non-sensitive IDs stored in localStorage. No PII or credentials persisted."
      validated_by: "opencode"
    accessibility:
      status: na
      evidence: "No UI changes. State persistence is invisible to the user."
      validated_by: "opencode"
signatures:
  - agent: "@opencode"
    role: "implementation"
    status: "approved"
    timestamp: "2026-02-17T10:00:00Z"
---

### [CHANGE-032] Model Selection Persistence Across Page Refresh — 2026-02-17

**Roadmap**: [ROAD-029](../roads/ROAD-029.md)
**Type**: Fixed
**Author**: opencode

#### Summary

Fixed domain model selection not persisting across page refresh. Added localStorage-based persistence for the active domain model ID and FOE project selections. Created URL deep linking utilities so users can share direct links to specific models and projects. This eliminates the frustrating UX issue where users lost their context after every page reload.

#### Changes

**State Persistence:**
- Updated `DomainMapperPage.tsx` to read/write selected model ID to localStorage on change
- Model ID restored from localStorage on component mount before first render
- Graceful fallback when stored model ID no longer exists (selects first available)

**URL Deep Linking:**
- Created `url.ts` utility for reading/writing URL query parameters
- Domain model ID and FOE project ID reflected in URL query string
- Users can copy URL to share direct links to specific selections
- URL parameters take precedence over localStorage when both present

**Storage Utilities:**
- Created `storage.ts` utility module wrapping localStorage with:
  - Type-safe get/set/remove operations
  - JSON serialization for complex values
  - Error handling for storage quota and disabled storage scenarios
  - Namespaced keys to avoid collisions (`katalyst:modelId`, `katalyst:foeProjectId`)

#### Git Commits

- `7cab375` — Add localStorage persistence and URL deep linking for model/project selection

#### Files Changed

**Added:**
- `packages/intelligence/web/src/utils/storage.ts`
- `packages/intelligence/web/src/utils/url.ts`

**Modified:**
- `packages/intelligence/web/src/pages/DomainMapperPage.tsx`

#### Dependencies

- **Requires**: None
- **Enables**: Better UX for ROAD-030 (FOE Project Browser)

---

**Compliance Evidence:**
- Manually validated: selection persists across refresh, URL deep linking works
- No sensitive data stored in localStorage
- Graceful degradation when localStorage unavailable

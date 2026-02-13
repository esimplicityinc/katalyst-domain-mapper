---
id: CHANGE-007
road_id: ROAD-007
title: "BDD Agent Skills — Complete"
date: "2026-02-13"
version: "0.5.0"
status: published
categories:
  - Added
compliance:
  adr_check:
    status: pass
    validated_by: "architecture-inspector"
    validated_at: "2026-02-06"
    notes: "ADR-006 validated — static markdown reference docs with no runtime dependencies."
  bdd_check:
    status: na
    scenarios: 0
    passed: 0
    coverage: "N/A"
    notes: "Reference documentation only — no executable tests required."
  nfr_checks:
    performance:
      status: na
      evidence: "Static markdown files with no runtime performance impact."
      validated_by: ""
    security:
      status: na
      evidence: "No runtime code, secrets, or security surface area."
      validated_by: ""
    accessibility:
      status: na
      evidence: "Documentation-only change — no UI components."
      validated_by: ""
signatures:
  - agent: "@architecture-inspector"
    role: "architecture_review"
    status: "pass"
    timestamp: "2026-02-06T00:00:00Z"
  - agent: "superpowers-orchestrator"
    role: "content_validation"
    status: "pass"
    timestamp: "2026-02-13T20:20:00Z"
---

### [CHANGE-007] BDD Agent Skills Complete — 2026-02-13

**Roadmap**: [ROAD-007](../roads/ROAD-007.md)
**Type**: Added
**Author**: superpowers-orchestrator

#### Summary

Completed 5 comprehensive OpenCode agent skills for the `@esimplicity/stack-tests` BDD framework. These static markdown reference documents enable AI agents to write, run, debug, and understand the project's Playwright-BDD + Cucumber testing infrastructure. Total delivery: 2,018 lines across 5 skills (68% over original 1,200 line estimate).

#### Changes

**Skills Created:**

1. **katalyst-bdd-quickstart** (226 lines)
   - Installation methods (scaffold CLI vs manual)
   - Project structure and configuration
   - Writing first feature file
   - Running tests (CLI, watch mode, UI mode)
   - Tag system explanation (@api, @ui, @tui, @hybrid)
   - Location: `.opencode/skills/katalyst-bdd-quickstart/SKILL.md`

2. **katalyst-bdd-step-reference** (348 lines)
   - Complete step definition catalog
   - API steps (request/response/status/headers/body)
   - UI steps (navigation/clicks/forms/assertions)
   - TUI steps (terminal interaction)
   - Hybrid step patterns
   - Variable interpolation syntax (`{variable}`)
   - Cleanup patterns and test isolation
   - Location: `.opencode/skills/katalyst-bdd-step-reference/SKILL.md`

3. **katalyst-bdd-create-test** (394 lines)
   - Test creation wizard workflow
   - API-only test patterns
   - UI-only test patterns
   - TUI-only test patterns
   - Hybrid test patterns (API + UI)
   - Data-driven testing with examples tables
   - Proper tag usage and organization
   - Location: `.opencode/skills/katalyst-bdd-create-test/SKILL.md`

4. **katalyst-bdd-troubleshooting** (476 lines)
   - Element not found errors
   - Authentication failures
   - Timing/synchronization problems
   - Variable interpolation issues
   - Environment configuration debugging
   - Cleanup behavior problems
   - CI/CD failure diagnosis
   - Location: `.opencode/skills/katalyst-bdd-troubleshooting/SKILL.md`

5. **katalyst-bdd-architecture** (574 lines)
   - Ports and adapters pattern explanation
   - Port interface definitions
   - Adapter implementations (HTTP, Playwright, Terminal)
   - Custom adapter creation walkthrough
   - Adapter lifecycle and configuration
   - `createBddTest` dependency injection
   - Extending the framework
   - Location: `.opencode/skills/katalyst-bdd-architecture/SKILL.md`

#### Quality Gate Results

| Gate | Status | Notes |
|------|--------|-------|
| Content Completeness | ✅ PASS | All 5 skills present with comprehensive coverage |
| Skill Registration | ✅ PASS | Skills discoverable via OpenCode CLI |
| Documentation Quality | ✅ PASS | Clear examples, proper frontmatter, consistent format |
| Framework Coverage | ✅ PASS | API/UI/TUI/hybrid patterns documented |
| ADR Validation | ✅ PASS | ADR-006 validated 2026-02-06 |

#### Technical Details

**Dependencies:**
- Requires: None (independent of governance pipeline)
- Enables: None (standalone reference docs)

**Breaking Changes:**
- None

**Migration Notes:**
- Skills are auto-discovered by OpenCode when loaded via `skill` tool
- No configuration changes required
- Skills registered in `opencode.json` skills section

**Performance Impact:**
- No runtime impact — static markdown files loaded on-demand
- Skills cached in OpenCode session after first load

**Security Considerations:**
- No runtime code or secrets
- Pure reference documentation
- No security surface area

#### Usage Examples

**Load quickstart skill:**
```
use skill tool to load katalyst-bdd-quickstart
```

**Load step reference:**
```
use skill tool to load katalyst-bdd-step-reference
```

**Load architecture guide:**
```
use skill tool to load katalyst-bdd-architecture
```

#### Coverage Statistics

**Framework Coverage:**
- ✅ Installation (scaffold CLI + manual)
- ✅ Project structure
- ✅ Tag system (@api, @ui, @tui, @hybrid)
- ✅ All step definitions (API, UI, TUI, hybrid, shared)
- ✅ Variable interpolation
- ✅ Cleanup patterns
- ✅ Test creation workflows
- ✅ Troubleshooting common errors
- ✅ CI/CD integration
- ✅ Ports & adapters architecture
- ✅ Custom adapter creation
- ✅ Dependency injection patterns

**Line Distribution:**
- Quickstart: 226 lines (11%)
- Step Reference: 348 lines (17%)
- Create Test: 394 lines (20%)
- Troubleshooting: 476 lines (24%)
- Architecture: 574 lines (28%)

**Total: 2,018 lines** (target was ~1,200 lines, delivered 68% more)

#### Known Issues

None — skills are reference documentation only with no runtime dependencies.

#### Future Enhancements

Potential additions for future iterations:
- Visual test patterns (screenshot comparison)
- Performance testing patterns (Lighthouse integration)
- Accessibility testing patterns (axe-core integration)
- API contract testing patterns (OpenAPI validation)
- Test data management strategies
- Parallel execution optimization

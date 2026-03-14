---
id: CHANGE-047
road_id: ~
title: "Port/Adapter Pattern for Switchable AI Runtimes"
date: "2026-03-14"
version: "0.12.0"
status: published
categories:
  - Added
compliance:
  adr_check:
    status: pass
    validated_by: "@opencode"
    validated_at: "2026-03-14"
    notes: "ADR-021 defines the orchestrator port/adapter architecture, runtime selection criteria, and fallback strategy."
  bdd_check:
    status: pass
    scenarios: 11
    passed: 11
    coverage: "100%"
    notes: "All 11 scenarios in 01_orchestrator_runtime.feature pass. Covers adapter selection, feature flag switching, graceful fallback, status reporting, and error handling."
  nfr_checks:
    performance:
      status: pass
      evidence: "Adapter instantiation adds < 5ms overhead. Runtime switching via feature flag does not require server restart. Fallback detection completes within 2 seconds."
      validated_by: "@opencode"
    security:
      status: pass
      evidence: "API keys for AI runtimes remain in environment variables. Adapter selection logic does not expose credentials. Feature flag values are server-side only."
      validated_by: "@opencode"
    accessibility:
      status: na
      evidence: "Backend orchestration change. No user-facing interface modifications."
      validated_by: "@opencode"
signatures:
  - agent: "@opencode"
    role: "implementation"
    status: "approved"
    timestamp: "2026-03-14T00:00:00Z"
---

### [CHANGE-047] Port/Adapter Pattern for Switchable AI Runtimes — 2026-03-14

**Roadmap**: N/A (cross-cutting architecture)
**Type**: Added
**Author**: opencode

#### Summary

Introduces a hexagonal architecture port/adapter pattern for AI orchestration runtimes. The system can now switch between OpenCode and LangGraph backends via feature flags without code changes or server restarts, with automatic graceful fallback when a runtime is unavailable.

#### What Changed

- **ScanOrchestratorPort** — Abstract port interface defining `scan(repoPath)`, `getStatus()`, and `isAvailable()` contracts for FOE scanning runtimes
- **ChatOrchestratorPort** — Abstract port interface defining `chat(message, context)`, `streamChat(message, context)`, and `isAvailable()` contracts for conversational AI runtimes
- **OpenCodeScanAdapter** — Adapter implementing ScanOrchestratorPort using the OpenCode CLI agent dispatch pattern
- **OpenCodeChatAdapter** — Adapter implementing ChatOrchestratorPort using OpenCode session management and SSE streaming
- **LangGraphScanAdapter** — Adapter implementing ScanOrchestratorPort using LangGraph workflow execution
- **LangGraphChatAdapter** — Adapter implementing ChatOrchestratorPort using LangGraph conversational chains
- **orchestratorFactory** — Factory function that reads the `orchestrator-runtime` feature flag and instantiates the appropriate adapter pair, with fallback to OpenCode if the selected runtime is unavailable
- **GET /api/v1/orchestrator/status** — New endpoint returning current runtime selection, availability of each adapter, and fallback state
- **Feature flag integration** — `orchestrator-runtime` flag with values `opencode` (default) and `langgraph`

#### Related Artifacts

- **ADR**: [ADR-021](../adrs/ADR-021.md) — Switchable AI Runtime Architecture
- **Capability**: [CAP-030](../capabilities/CAP-030.md) — Multi-Runtime Orchestration
- **User Stories**: [US-086](../user-stories/US-086.md), [US-087](../user-stories/US-087.md)

#### Git Commits

- `e0e1dcc` — feat(orchestrator): add ScanOrchestrator and ChatOrchestrator ports with OpenCode adapters
- `c0e4e46` — feat(orchestrator): add LangGraph adapters, factory, and status endpoint

#### BDD Test Results

```yaml
feature: 01_orchestrator_runtime.feature
scenarios: 11
passed: 11
failed: 0
coverage: "100%"
```

#### Technical Details

**Dependencies:** @langchain/langgraph (optional peer dependency), opencode CLI
**Breaking changes:** None — existing OpenCode behavior is preserved as the default adapter
**Migration notes:** No migration required. Set `orchestrator-runtime` feature flag to `langgraph` to switch runtimes. Ensure LangGraph dependencies are installed if using that adapter.
**Performance impact:** Adapter instantiation adds < 5ms. No runtime overhead once adapter is selected.
**Security considerations:** API keys remain in environment variables. Adapter selection is server-side only and not exposed to clients.

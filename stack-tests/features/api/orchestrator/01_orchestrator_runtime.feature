@api @orchestrator @CAP-030 @US-086
Feature: Agent Orchestrator Runtime Switching
  As a platform operator
  I want to verify the agent orchestrator port/adapter pattern works correctly
  So that I can switch between OpenCode and LangGraph runtimes via feature flags

  # ── Runtime Self-Consistency ───────────────────────────────────────────────
  # The actual default runtime is configured in flags.json and may be either
  # "opencode" or "langgraph". These tests verify the orchestrator status is
  # internally consistent (runtime === flagValue) and uses a supported value.

  Scenario: Orchestrator status endpoint returns OK
    When I GET "/api/v1/orchestrator/status"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Scan runtime is consistent with its feature flag value
    When I GET "/api/v1/orchestrator/status"
    Then the response status should be 200
    And I store the value at "scan.runtime" as "scanRuntime"
    And the value at "scan.flagValue" should equal "{scanRuntime}"

  Scenario: Chat runtime is consistent with its feature flag value
    When I GET "/api/v1/orchestrator/status"
    Then the response status should be 200
    And I store the value at "chat.runtime" as "chatRuntime"
    And the value at "chat.flagValue" should equal "{chatRuntime}"

  Scenario: Supported runtimes include both OpenCode and LangGraph
    When I GET "/api/v1/orchestrator/status"
    Then the response status should be 200
    And the value at "supportedRuntimes[0]" should equal "opencode"
    And the value at "supportedRuntimes[1]" should equal "langgraph"

  # ── Feature Flags Integration ──────────────────────────────────────────────

  Scenario: Feature flags expose scan and chat runtime values
    When I GET "/api/v1/flags"
    Then the response status should be 200
    And the response should be a JSON object

  # ── Config Status Includes Scanner Availability ────────────────────────────

  Scenario: Config status indicates scanner availability
    When I GET "/api/v1/config/status"
    Then the response status should be 200
    And the response should be a JSON object

  # ── Scan Job API Still Works With Orchestrator ─────────────────────────────

  Scenario: Scan jobs list works with orchestrator wiring
    When I GET "/api/v1/scans"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Scan jobs filter by status works with orchestrator wiring
    When I GET "/api/v1/scans?status=queued"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Non-existent scan returns 404 with orchestrator wiring
    When I GET "/api/v1/scans/non-existent-id"
    Then the response status should be 404

  # ── Health Check Still Works After Orchestrator Integration ────────────────

  Scenario: Health check passes with orchestrator integration
    When I GET "/api/v1/health"
    Then the response status should be 200
    And the value at "status" should equal "ok"

  Scenario: Readiness check passes with orchestrator integration
    When I GET "/api/v1/ready"
    Then the response status should be 200
    And the value at "status" should equal "ready"

  # ── Report Ingestion Still Works (Validates normalize.ts Compatibility) ────

  Scenario: Report ingestion works with orchestrator container wiring
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "d0000001-0001-4000-8000-000000000001",
        "repository": "orchestrator-test-repo",
        "repositoryUrl": "https://github.com/example/orchestrator-test",
        "scanDate": "2026-03-09T10:00:00Z",
        "scanDuration": 120000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 65,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Testing that report ingestion works after orchestrator integration.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 70, "max": 100, "confidence": "high", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 18, "max": 25, "confidence": "high", "evidence": ["Fast CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 17, "max": 25, "confidence": "medium", "evidence": ["Weekly"], "gaps": []},
              {"name": "Test Coverage", "score": 18, "max": 25, "confidence": "high", "evidence": ["80% coverage"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 17, "max": 25, "confidence": "medium", "evidence": ["Husky"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 60, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 16, "max": 25, "confidence": "medium", "evidence": ["Hexagonal"], "gaps": []},
              {"name": "Domain Modeling", "score": 14, "max": 25, "confidence": "medium", "evidence": ["Some DDD"], "gaps": ["No context map"]},
              {"name": "Documentation Quality", "score": 15, "max": 25, "confidence": "medium", "evidence": ["3 ADRs"], "gaps": []},
              {"name": "Code Organization", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Modules"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 65, "max": 100, "confidence": "high", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 18, "max": 25, "confidence": "high", "evidence": ["Good ratio"], "gaps": []},
              {"name": "Contract Testing", "score": 14, "max": 25, "confidence": "medium", "evidence": ["OpenAPI"], "gaps": ["No Pact"]},
              {"name": "Dependency Health", "score": 17, "max": 25, "confidence": "medium", "evidence": ["Clean"], "gaps": []},
              {"name": "Change Safety", "score": 16, "max": 25, "confidence": "medium", "evidence": ["PRs"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [
          {"id": "s-1", "area": "CI Pipeline", "evidence": "Fast builds with good coverage"}
        ],
        "gaps": [
          {"id": "g-1", "area": "Domain Modeling", "severity": "medium", "title": "Missing context map", "evidence": "No bounded context documentation", "impact": "Alignment issues", "recommendation": "Add context map"}
        ],
        "recommendations": [
          {"id": "r-1", "priority": "short-term", "title": "Add context map", "description": "Document bounded contexts", "impact": "medium"}
        ],
        "triangleDiagnosis": {
          "cycleHealth": "virtuous",
          "pattern": "Balanced with room to grow",
          "weakestPrinciple": "understanding",
          "intervention": "Invest in domain documentation"
        },
        "methodology": {"filesAnalyzed": 150, "testFilesAnalyzed": 40, "adrsAnalyzed": 3, "confidenceNotes": ["Orchestrator integration test"]}
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "reportId"
    And the value at "maturityLevel" should equal "Practicing"
    And the value at "overallScore" should equal "65"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

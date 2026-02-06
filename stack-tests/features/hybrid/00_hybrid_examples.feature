@hybrid
Feature: FOE End-to-End - Ingest Report and View
  As a development team lead
  I want to ingest a report via API and see it reflected in the UI
  So that I can verify the full pipeline works

  Scenario: Ingest report via API and verify health
    # Verify the API is healthy
    When I GET "/api/v1/health"
    Then the response status should be 200
    And the value at "status" should equal "ok"

    # Ingest a report
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": {
          "name": "hybrid-e2e-repo",
          "url": "https://github.com/example/hybrid-e2e",
          "techStack": ["TypeScript", "Playwright"],
          "isMonorepo": false
        },
        "scanDate": "2026-02-05T16:00:00Z",
        "overallScore": 75,
        "maturityLevel": "Practicing",
        "dimensions": {
          "feedback": { "score": 80, "subscores": [], "findings": [], "gaps": [] },
          "understanding": { "score": 70, "subscores": [], "findings": [], "gaps": [] },
          "confidence": { "score": 75, "subscores": [], "findings": [], "gaps": [] }
        },
        "strengths": [],
        "topGaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "feedback": 80,
          "understanding": 70,
          "confidence": 75,
          "belowThreshold": [],
          "healthy": true
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    # Verify the report is retrievable
    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 200
    And the value at "overallScore" should equal "75"

@hybrid @gov-validation @ROAD-005 @ROAD-008 @CAP-002 @CAP-003 @wip
Feature: Governance End-to-End Flow
  As an Engineering Team Lead
  I want to ingest governance data via API and see it reflected in the dashboard
  So that I can verify the full governance pipeline works

  @e2e @ingest
  Scenario: Ingest governance snapshot via API and verify on dashboard
    # API: Ingest a governance snapshot
    When I POST "/api/v1/governance" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-05T10:00:00Z",
        "project": "katalyst-domain-mapper",
        "capabilities": {
          "CAP-001": {"id": "CAP-001", "title": "FOE Report Generation", "status": "stable"},
          "CAP-002": {"id": "CAP-002", "title": "Governance Validation", "status": "planned"}
        },
        "personas": {
          "PER-001": {"id": "PER-001", "name": "Engineering Team Lead", "type": "human"}
        },
        "roadItems": {
          "ROAD-001": {"id": "ROAD-001", "title": "Import Infrastructure", "status": "implementing"},
          "ROAD-002": {"id": "ROAD-002", "title": "Governance Schemas", "status": "proposed"}
        },
        "stats": {
          "capabilities": 4,
          "personas": 5,
          "userStories": 15,
          "roadItems": 9,
          "integrityStatus": "pass",
          "integrityErrors": 0
        }
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "snapshotId"
    Given I register cleanup DELETE "/api/v1/governance/{snapshotId}"

    # UI: Verify snapshot appears on governance dashboard
    Given I navigate to "/governance"
    Then I wait for the page to load
    Then I should see text "katalyst-domain-mapper"
    And I should see text "Import Infrastructure"

  @e2e
  Scenario: Ingest FOE report with governance dimension and view in report viewer
    # API: Ingest a report with governance subscores
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": {
          "name": "e2e-governance-repo",
          "url": "https://github.com/example/e2e-governance",
          "techStack": ["TypeScript"],
          "isMonorepo": true
        },
        "scanDate": "2026-02-05T15:00:00Z",
        "overallScore": 70,
        "maturityLevel": "Practicing",
        "dimensions": {
          "feedback": { "score": 75, "subscores": [], "findings": [], "gaps": [] },
          "understanding": {
            "score": 65,
            "subscores": [
              {"name": "Governance Health", "score": 72, "max": 100}
            ],
            "findings": [],
            "gaps": []
          },
          "confidence": { "score": 70, "subscores": [], "findings": [], "gaps": [] }
        },
        "strengths": [],
        "topGaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "feedback": 75, "understanding": 65, "confidence": 70,
          "belowThreshold": [], "healthy": true
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    # API: Verify report is retrievable
    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 200
    And the value at "overallScore" should equal "70"
    And the value at "maturityLevel" should equal "Practicing"

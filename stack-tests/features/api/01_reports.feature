@api
Feature: FOE Report Management
  As a development team lead
  I want to ingest and query FOE scan reports
  So that I can track engineering maturity over time

  Scenario: Ingest a valid FOE report
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": {
          "name": "bdd-test-repo",
          "url": "https://github.com/example/bdd-test-repo",
          "techStack": ["TypeScript", "React"],
          "isMonorepo": false
        },
        "scanDate": "2026-02-05T10:00:00Z",
        "overallScore": 65,
        "maturityLevel": "Practicing",
        "dimensions": {
          "feedback": {
            "score": 70,
            "subscores": [],
            "findings": [],
            "gaps": []
          },
          "understanding": {
            "score": 60,
            "subscores": [],
            "findings": [],
            "gaps": []
          },
          "confidence": {
            "score": 65,
            "subscores": [],
            "findings": [],
            "gaps": []
          }
        },
        "strengths": [],
        "topGaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "feedback": 70,
          "understanding": 60,
          "confidence": 65,
          "belowThreshold": [],
          "healthy": true
        }
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "reportId"
    And the value at "maturityLevel" should equal "Practicing"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

  Scenario: List all reports
    When I GET "/api/v1/reports"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Get a specific report by ID
    # First ingest a report
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": {
          "name": "lookup-test-repo",
          "url": null,
          "techStack": ["Go"],
          "isMonorepo": false
        },
        "scanDate": "2026-02-05T12:00:00Z",
        "overallScore": 42,
        "maturityLevel": "Emerging",
        "dimensions": {
          "feedback": { "score": 45, "subscores": [], "findings": [], "gaps": [] },
          "understanding": { "score": 40, "subscores": [], "findings": [], "gaps": [] },
          "confidence": { "score": 40, "subscores": [], "findings": [], "gaps": [] }
        },
        "strengths": [],
        "topGaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "feedback": 45,
          "understanding": 40,
          "confidence": 40,
          "belowThreshold": [],
          "healthy": true
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    # Now retrieve it
    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 200
    And the value at "overallScore" should equal "42"

  Scenario: Delete a report
    # Ingest then delete
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": {
          "name": "delete-test-repo",
          "url": null,
          "techStack": [],
          "isMonorepo": false
        },
        "scanDate": "2026-02-05T14:00:00Z",
        "overallScore": 20,
        "maturityLevel": "Hypothesized",
        "dimensions": {
          "feedback": { "score": 20, "subscores": [], "findings": [], "gaps": [] },
          "understanding": { "score": 20, "subscores": [], "findings": [], "gaps": [] },
          "confidence": { "score": 20, "subscores": [], "findings": [], "gaps": [] }
        },
        "strengths": [],
        "topGaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "feedback": 20,
          "understanding": 20,
          "confidence": 20,
          "belowThreshold": ["feedback", "understanding"],
          "healthy": false
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"

    When I DELETE "/api/v1/reports/{reportId}"
    Then the response status should be 200

    # Confirm it's gone
    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 404

  Scenario: Retrieve non-existent report returns 404
    When I GET "/api/v1/reports/non-existent-id-12345"
    Then the response status should be 404

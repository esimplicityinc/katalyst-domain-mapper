@api
Feature: FOE Report Management
  As a development team lead
  I want to ingest and query FOE scan reports
  So that I can track engineering maturity over time

  Scenario: Ingest a valid FOE report
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "a0000001-0001-4000-8000-000000000001",
        "repository": "bdd-test-repo",
        "repositoryUrl": "https://github.com/example/bdd-test-repo",
        "scanDate": "2026-02-05T10:00:00Z",
        "scanDuration": 300000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 65,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "BDD test repo scored 65/100 overall.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 70, "max": 100, "confidence": "high", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 20, "max": 25, "confidence": "high", "evidence": ["Fast CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 18, "max": 25, "confidence": "medium", "evidence": ["Weekly deploys"], "gaps": []},
              {"name": "Test Coverage", "score": 17, "max": 25, "confidence": "high", "evidence": ["80% coverage"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Husky hooks"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 60, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 18, "max": 25, "confidence": "high", "evidence": ["Clean arch"], "gaps": []},
              {"name": "Domain Modeling", "score": 12, "max": 25, "confidence": "medium", "evidence": ["Some DDD"], "gaps": ["No aggregates"]},
              {"name": "Documentation Quality", "score": 15, "max": 25, "confidence": "medium", "evidence": ["README exists"], "gaps": []},
              {"name": "Code Organization", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Modular"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 65, "max": 100, "confidence": "high", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 18, "max": 25, "confidence": "high", "evidence": ["Good tests"], "gaps": []},
              {"name": "Contract Testing", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OpenAPI spec"], "gaps": []},
              {"name": "Dependency Health", "score": 16, "max": 25, "confidence": "medium", "evidence": ["Up to date"], "gaps": []},
              {"name": "Change Safety", "score": 16, "max": 25, "confidence": "medium", "evidence": ["CI pipeline"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [{"id": "s-1", "area": "CI Speed", "evidence": "Fast pipeline under 5 min"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "cycleHealth": "virtuous",
          "pattern": "Balanced development across all dimensions",
          "weakestPrinciple": "understanding",
          "intervention": "Invest in domain modeling documentation"
        },
        "methodology": {
          "filesAnalyzed": 150,
          "testFilesAnalyzed": 45,
          "adrsAnalyzed": 3,
          "confidenceNotes": ["BDD test run"]
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
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "a0000001-0002-4000-8000-000000000002",
        "repository": "lookup-test-repo",
        "scanDate": "2026-02-05T12:00:00Z",
        "scanDuration": 200000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 42,
        "maturityLevel": "Emerging",
        "assessmentMode": "standard",
        "executiveSummary": "Lookup test repo scored 42/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 45, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 12, "max": 25, "confidence": "medium", "evidence": ["CI exists"], "gaps": []},
              {"name": "Deployment Frequency", "score": 11, "max": 25, "confidence": "low", "evidence": ["Monthly"], "gaps": []},
              {"name": "Test Coverage", "score": 12, "max": 25, "confidence": "medium", "evidence": ["Some tests"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 10, "max": 25, "confidence": "low", "evidence": ["Basic lint"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 40, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 10, "max": 25, "confidence": "medium", "evidence": ["Flat arch"], "gaps": []},
              {"name": "Domain Modeling", "score": 10, "max": 25, "confidence": "low", "evidence": ["Anemic model"], "gaps": []},
              {"name": "Documentation Quality", "score": 10, "max": 25, "confidence": "medium", "evidence": ["README only"], "gaps": []},
              {"name": "Code Organization", "score": 10, "max": 25, "confidence": "medium", "evidence": ["Single package"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 40, "max": 100, "confidence": "low", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 12, "max": 25, "confidence": "low", "evidence": ["Unit tests"], "gaps": []},
              {"name": "Contract Testing", "score": 8, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": ["No contracts"]},
              {"name": "Dependency Health", "score": 10, "max": 25, "confidence": "medium", "evidence": ["Some deps"], "gaps": []},
              {"name": "Change Safety", "score": 10, "max": 25, "confidence": "low", "evidence": ["Manual QA"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [{"id": "s-1", "area": "Basic CI", "evidence": "CI pipeline exists"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "cycleHealth": "at-risk",
          "pattern": "All dimensions near threshold",
          "weakestPrinciple": "confidence",
          "intervention": "Improve test quality and coverage"
        },
        "methodology": {
          "filesAnalyzed": 80,
          "testFilesAnalyzed": 15,
          "adrsAnalyzed": 0,
          "confidenceNotes": ["BDD test run"]
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 200
    And the value at "overallScore" should equal "42"

  Scenario: Delete a report
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "a0000001-0003-4000-8000-000000000003",
        "repository": "delete-test-repo",
        "scanDate": "2026-02-05T14:00:00Z",
        "scanDuration": 100000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 20,
        "maturityLevel": "Hypothesized",
        "assessmentMode": "standard",
        "executiveSummary": "Delete test repo scored 20/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 20, "max": 100, "confidence": "low", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 5, "max": 25, "confidence": "low", "evidence": ["Slow CI"], "gaps": ["15min builds"]},
              {"name": "Deployment Frequency", "score": 5, "max": 25, "confidence": "low", "evidence": ["Rare"], "gaps": []},
              {"name": "Test Coverage", "score": 5, "max": 25, "confidence": "low", "evidence": ["Minimal"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 5, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 20, "max": 100, "confidence": "low", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 5, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Domain Modeling", "score": 5, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Documentation Quality", "score": 5, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Code Organization", "score": 5, "max": 25, "confidence": "low", "evidence": ["Monolith"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 20, "max": 100, "confidence": "low", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 5, "max": 25, "confidence": "low", "evidence": ["Few tests"], "gaps": []},
              {"name": "Contract Testing", "score": 5, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Dependency Health", "score": 5, "max": 25, "confidence": "low", "evidence": ["Outdated"], "gaps": []},
              {"name": "Change Safety", "score": 5, "max": 25, "confidence": "low", "evidence": ["No CI"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "cycleHealth": "vicious",
          "pattern": "All dimensions below threshold",
          "weakestPrinciple": "feedback",
          "intervention": "Start with basic CI/CD pipeline"
        },
        "methodology": {
          "filesAnalyzed": 30,
          "testFilesAnalyzed": 2,
          "adrsAnalyzed": 0,
          "confidenceNotes": ["BDD test run"]
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

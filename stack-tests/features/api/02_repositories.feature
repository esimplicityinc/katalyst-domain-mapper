@api
Feature: FOE Repository Tracking
  As a platform engineer
  I want to list and inspect tracked repositories
  So that I can understand which repos have been scanned

  Scenario: List all repositories
    When I GET "/api/v1/repositories"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Get non-existent repository returns 404
    When I GET "/api/v1/repositories/non-existent-repo-id"
    Then the response status should be 404

  Scenario: Get a repository by ID after ingesting a report
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "b0000002-0001-4000-8000-000000000001",
        "repository": "repo-detail-test",
        "repositoryUrl": "https://github.com/example/repo-detail",
        "scanDate": "2026-02-05T10:00:00Z",
        "scanDuration": 250000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 65,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Repo detail test scored 65/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 70, "max": 100, "confidence": "high", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 20, "max": 25, "confidence": "high", "evidence": ["Fast CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 18, "max": 25, "confidence": "medium", "evidence": ["Weekly"], "gaps": []},
              {"name": "Test Coverage", "score": 17, "max": 25, "confidence": "high", "evidence": ["80%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Hooks"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 60, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 18, "max": 25, "confidence": "high", "evidence": ["Clean"], "gaps": []},
              {"name": "Domain Modeling", "score": 12, "max": 25, "confidence": "medium", "evidence": ["Some"], "gaps": []},
              {"name": "Documentation Quality", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Docs"], "gaps": []},
              {"name": "Code Organization", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Good"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 65, "max": 100, "confidence": "high", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 18, "max": 25, "confidence": "high", "evidence": ["Good"], "gaps": []},
              {"name": "Contract Testing", "score": 15, "max": 25, "confidence": "medium", "evidence": ["API spec"], "gaps": []},
              {"name": "Dependency Health", "score": 16, "max": 25, "confidence": "medium", "evidence": ["Clean"], "gaps": []},
              {"name": "Change Safety", "score": 16, "max": 25, "confidence": "medium", "evidence": ["CI"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [{"id": "s-1", "area": "CI", "evidence": "Fast pipeline"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "cycleHealth": "virtuous",
          "pattern": "Balanced",
          "weakestPrinciple": "understanding",
          "intervention": "Improve documentation"
        },
        "methodology": {"filesAnalyzed": 100, "testFilesAnalyzed": 30, "adrsAnalyzed": 2, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    When I GET "/api/v1/repositories"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Get repository trend after multiple reports
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "b0000002-0002-4000-8000-000000000002",
        "repository": "trend-test-repo",
        "scanDate": "2026-01-01T10:00:00Z",
        "scanDuration": 180000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 45,
        "maturityLevel": "Emerging",
        "assessmentMode": "standard",
        "executiveSummary": "Trend test repo first scan scored 45/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 50, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 14, "max": 25, "confidence": "medium", "evidence": ["CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 12, "max": 25, "confidence": "low", "evidence": ["Monthly"], "gaps": []},
              {"name": "Test Coverage", "score": 13, "max": 25, "confidence": "medium", "evidence": ["50%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 11, "max": 25, "confidence": "low", "evidence": ["Basic"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 40, "max": 100, "confidence": "low", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 10, "max": 25, "confidence": "low", "evidence": ["Flat"], "gaps": []},
              {"name": "Domain Modeling", "score": 10, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Documentation Quality", "score": 10, "max": 25, "confidence": "low", "evidence": ["Sparse"], "gaps": []},
              {"name": "Code Organization", "score": 10, "max": 25, "confidence": "low", "evidence": ["Mono"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 45, "max": 100, "confidence": "medium", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 13, "max": 25, "confidence": "medium", "evidence": ["Tests"], "gaps": []},
              {"name": "Contract Testing", "score": 10, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Dependency Health", "score": 12, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Change Safety", "score": 10, "max": 25, "confidence": "low", "evidence": ["Manual"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [{"id": "s-1", "area": "CI", "evidence": "Pipeline exists"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "at-risk", "pattern": "Low across the board", "weakestPrinciple": "understanding", "intervention": "Document architecture"},
        "methodology": {"filesAnalyzed": 60, "testFilesAnalyzed": 10, "adrsAnalyzed": 0, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId1"
    Given I register cleanup DELETE "/api/v1/reports/{reportId1}"

    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "b0000002-0003-4000-8000-000000000003",
        "repository": "trend-test-repo",
        "scanDate": "2026-02-01T10:00:00Z",
        "scanDuration": 200000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 65,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Trend test repo second scan scored 65/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 70, "max": 100, "confidence": "high", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 20, "max": 25, "confidence": "high", "evidence": ["Fast"], "gaps": []},
              {"name": "Deployment Frequency", "score": 17, "max": 25, "confidence": "medium", "evidence": ["Weekly"], "gaps": []},
              {"name": "Test Coverage", "score": 18, "max": 25, "confidence": "high", "evidence": ["75%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Hooks"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 60, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 17, "max": 25, "confidence": "medium", "evidence": ["Better"], "gaps": []},
              {"name": "Domain Modeling", "score": 13, "max": 25, "confidence": "medium", "evidence": ["Started"], "gaps": []},
              {"name": "Documentation Quality", "score": 15, "max": 25, "confidence": "medium", "evidence": ["ADRs"], "gaps": []},
              {"name": "Code Organization", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Modular"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 65, "max": 100, "confidence": "high", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 18, "max": 25, "confidence": "high", "evidence": ["Good"], "gaps": []},
              {"name": "Contract Testing", "score": 15, "max": 25, "confidence": "medium", "evidence": ["API"], "gaps": []},
              {"name": "Dependency Health", "score": 16, "max": 25, "confidence": "medium", "evidence": ["Clean"], "gaps": []},
              {"name": "Change Safety", "score": 16, "max": 25, "confidence": "medium", "evidence": ["CI"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [{"id": "s-1", "area": "Improvement", "evidence": "Score improved 20 points"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "virtuous", "pattern": "Improving across all dimensions", "weakestPrinciple": "understanding", "intervention": "Continue DDD adoption"},
        "methodology": {"filesAnalyzed": 100, "testFilesAnalyzed": 30, "adrsAnalyzed": 3, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId2"
    Given I register cleanup DELETE "/api/v1/reports/{reportId2}"

    When I GET "/api/v1/repositories"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Get trend for non-existent repository returns 404
    When I GET "/api/v1/repositories/non-existent-repo-id/trend"
    Then the response status should be 404

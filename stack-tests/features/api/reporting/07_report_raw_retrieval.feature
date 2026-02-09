@api @report-gen @ROAD-001 @CAP-001
Feature: FOE Report Raw Retrieval
  As a Platform Engineer
  I want to retrieve the original raw report JSON as it was submitted
  So that I can debug normalization issues and verify the original scanner output

  Scenario: Retrieve raw report matches original submission format
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "e0000007-0001-4000-8000-000000000001",
        "repository": "raw-test-repo",
        "repositoryUrl": "https://github.com/example/raw-test",
        "scanDate": "2026-02-05T10:00:00Z",
        "scanDuration": 250000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 65,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Raw test repo scored 65/100.",
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
              {"name": "Architecture Clarity", "score": 17, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Domain Modeling", "score": 13, "max": 25, "confidence": "medium", "evidence": ["Some"], "gaps": []},
              {"name": "Documentation Quality", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Docs"], "gaps": []},
              {"name": "Code Organization", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Good"], "gaps": []}
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
        "strengths": [{"id": "s-1", "area": "CI", "evidence": "Fast pipeline"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "virtuous", "pattern": "Balanced", "weakestPrinciple": "understanding", "intervention": "Improve docs"},
        "methodology": {"filesAnalyzed": 100, "testFilesAnalyzed": 30, "adrsAnalyzed": 2, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    When I GET "/api/v1/reports/{reportId}/raw"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Raw retrieval for non-existent report returns 404
    When I GET "/api/v1/reports/non-existent-raw-id/raw"
    Then the response status should be 404

  Scenario: Raw and canonical endpoints return different representations
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "e0000007-0002-4000-8000-000000000002",
        "repository": "dual-format-repo",
        "scanDate": "2026-02-05T11:00:00Z",
        "scanDuration": 180000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 45,
        "maturityLevel": "Emerging",
        "assessmentMode": "standard",
        "executiveSummary": "Dual format repo scored 45/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 50, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 14, "max": 25, "confidence": "medium", "evidence": ["CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 12, "max": 25, "confidence": "low", "evidence": ["Monthly"], "gaps": []},
              {"name": "Test Coverage", "score": 12, "max": 25, "confidence": "medium", "evidence": ["45%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 12, "max": 25, "confidence": "low", "evidence": ["Basic"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 40, "max": 100, "confidence": "low", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 11, "max": 25, "confidence": "low", "evidence": ["Flat"], "gaps": []},
              {"name": "Domain Modeling", "score": 9, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Documentation Quality", "score": 10, "max": 25, "confidence": "low", "evidence": ["Sparse"], "gaps": []},
              {"name": "Code Organization", "score": 10, "max": 25, "confidence": "low", "evidence": ["Mixed"], "gaps": []}
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
        "strengths": [],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "at-risk", "pattern": "Understanding very low", "weakestPrinciple": "understanding", "intervention": "Document architecture"},
        "methodology": {"filesAnalyzed": 70, "testFilesAnalyzed": 12, "adrsAnalyzed": 0, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 200
    And the response should be a JSON object

    When I GET "/api/v1/reports/{reportId}/raw"
    Then the response status should be 200
    And the response should be a JSON object

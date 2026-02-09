@api @report-gen @ROAD-001 @CAP-001
Feature: FOE Report Filtering & Pagination
  As an Engineering Team Lead
  I want to filter and paginate the report listing
  So that I can find specific reports by repository, maturity level, or score range

  Background:
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "f0000008-0001-4000-8000-000000000001",
        "repository": "filter-repo-alpha",
        "scanDate": "2026-01-15T10:00:00Z",
        "scanDuration": 200000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 45,
        "maturityLevel": "Emerging",
        "assessmentMode": "standard",
        "executiveSummary": "Filter alpha repo scored 45/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 50, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 14, "max": 25, "confidence": "medium", "evidence": ["CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 12, "max": 25, "confidence": "low", "evidence": ["Monthly"], "gaps": []},
              {"name": "Test Coverage", "score": 12, "max": 25, "confidence": "medium", "evidence": ["50%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 12, "max": 25, "confidence": "low", "evidence": ["Basic"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 40, "max": 100, "confidence": "low", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 11, "max": 25, "confidence": "low", "evidence": ["Flat"], "gaps": []},
              {"name": "Domain Modeling", "score": 9, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Documentation Quality", "score": 10, "max": 25, "confidence": "low", "evidence": ["README"], "gaps": []},
              {"name": "Code Organization", "score": 10, "max": 25, "confidence": "low", "evidence": ["OK"], "gaps": []}
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
        "triangleDiagnosis": {"cycleHealth": "at-risk", "pattern": "Low scores", "weakestPrinciple": "understanding", "intervention": "Document things"},
        "methodology": {"filesAnalyzed": 60, "testFilesAnalyzed": 10, "adrsAnalyzed": 0, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportAlphaId"
    Given I register cleanup DELETE "/api/v1/reports/{reportAlphaId}"

    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "f0000008-0002-4000-8000-000000000002",
        "repository": "filter-repo-beta",
        "scanDate": "2026-02-01T10:00:00Z",
        "scanDuration": 350000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 78,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Filter beta repo scored 78/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 80, "max": 100, "confidence": "high", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 22, "max": 25, "confidence": "high", "evidence": ["Fast"], "gaps": []},
              {"name": "Deployment Frequency", "score": 20, "max": 25, "confidence": "high", "evidence": ["Daily"], "gaps": []},
              {"name": "Test Coverage", "score": 19, "max": 25, "confidence": "high", "evidence": ["85%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 19, "max": 25, "confidence": "high", "evidence": ["Full"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 75, "max": 100, "confidence": "high", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 20, "max": 25, "confidence": "high", "evidence": ["Hexagonal"], "gaps": []},
              {"name": "Domain Modeling", "score": 18, "max": 25, "confidence": "medium", "evidence": ["DDD"], "gaps": []},
              {"name": "Documentation Quality", "score": 19, "max": 25, "confidence": "high", "evidence": ["ADRs"], "gaps": []},
              {"name": "Code Organization", "score": 18, "max": 25, "confidence": "medium", "evidence": ["Clean"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 78, "max": 100, "confidence": "high", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 21, "max": 25, "confidence": "high", "evidence": ["Excellent"], "gaps": []},
              {"name": "Contract Testing", "score": 18, "max": 25, "confidence": "medium", "evidence": ["OpenAPI"], "gaps": []},
              {"name": "Dependency Health", "score": 20, "max": 25, "confidence": "high", "evidence": ["0 CVEs"], "gaps": []},
              {"name": "Change Safety", "score": 19, "max": 25, "confidence": "high", "evidence": ["Full CI"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [{"id": "s-1", "area": "Overall", "evidence": "Strong across all dimensions"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "virtuous", "pattern": "Virtuous cycle across all dimensions", "weakestPrinciple": "understanding", "intervention": "Maintain and refine"},
        "methodology": {"filesAnalyzed": 200, "testFilesAnalyzed": 70, "adrsAnalyzed": 8, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportBetaId"
    Given I register cleanup DELETE "/api/v1/reports/{reportBetaId}"

  Scenario: Filter reports by maturity level
    When I GET "/api/v1/reports?maturityLevel=Practicing"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Filter reports by minimum score
    When I GET "/api/v1/reports?minScore=70"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Filter reports by score range
    When I GET "/api/v1/reports?minScore=40&maxScore=60"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Paginate reports with limit and offset
    When I GET "/api/v1/reports?limit=1&offset=0"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Filter with no matching results returns empty array
    When I GET "/api/v1/reports?maturityLevel=Optimized&minScore=99"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: List all reports without filters
    When I GET "/api/v1/reports"
    Then the response status should be 200
    And the response should be a JSON array

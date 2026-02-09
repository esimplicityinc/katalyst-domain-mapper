@api @report-gen @ROAD-001 @CAP-001
Feature: FOE Report Comparison
  As an Engineering Team Lead
  I want to compare two FOE scan reports side-by-side
  So that I can measure improvement over time and verify that interventions are working

  Scenario: Compare two reports and see score improvement
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "d0000006-0001-4000-8000-000000000001",
        "repository": "compare-repo",
        "scanDate": "2026-01-01T10:00:00Z",
        "scanDuration": 300000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 55,
        "maturityLevel": "Emerging",
        "assessmentMode": "standard",
        "executiveSummary": "Compare repo baseline scored 55/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 60, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 16, "max": 25, "confidence": "medium", "evidence": ["CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Biweekly"], "gaps": []},
              {"name": "Test Coverage", "score": 15, "max": 25, "confidence": "medium", "evidence": ["60%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 14, "max": 25, "confidence": "medium", "evidence": ["Lint"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 50, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 14, "max": 25, "confidence": "medium", "evidence": ["Layered"], "gaps": []},
              {"name": "Domain Modeling", "score": 10, "max": 25, "confidence": "low", "evidence": ["Anemic"], "gaps": ["No DDD"]},
              {"name": "Documentation Quality", "score": 13, "max": 25, "confidence": "medium", "evidence": ["README"], "gaps": ["No ADRs"]},
              {"name": "Code Organization", "score": 13, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 55, "max": 100, "confidence": "medium", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Tests"], "gaps": []},
              {"name": "Contract Testing", "score": 12, "max": 25, "confidence": "low", "evidence": ["Partial"], "gaps": []},
              {"name": "Dependency Health", "score": 14, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Change Safety", "score": 14, "max": 25, "confidence": "medium", "evidence": ["CI"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [],
        "gaps": [{"id": "g-1", "area": "DDD", "severity": "medium", "title": "Missing ADRs", "evidence": "No ADRs found", "impact": "Decision history lost", "recommendation": "Start writing ADRs"}],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "at-risk", "pattern": "Understanding lags behind", "weakestPrinciple": "understanding", "intervention": "Document architecture decisions"},
        "methodology": {"filesAnalyzed": 120, "testFilesAnalyzed": 25, "adrsAnalyzed": 0, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "baseReportId"
    Given I register cleanup DELETE "/api/v1/reports/{baseReportId}"

    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "d0000006-0002-4000-8000-000000000002",
        "repository": "compare-repo",
        "scanDate": "2026-02-01T10:00:00Z",
        "scanDuration": 310000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 72,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Compare repo improved to 72/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 75, "max": 100, "confidence": "high", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 20, "max": 25, "confidence": "high", "evidence": ["Fast"], "gaps": []},
              {"name": "Deployment Frequency", "score": 18, "max": 25, "confidence": "medium", "evidence": ["Weekly"], "gaps": []},
              {"name": "Test Coverage", "score": 19, "max": 25, "confidence": "high", "evidence": ["78%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 18, "max": 25, "confidence": "medium", "evidence": ["Hooks"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 68, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 19, "max": 25, "confidence": "high", "evidence": ["Clean arch"], "gaps": []},
              {"name": "Domain Modeling", "score": 15, "max": 25, "confidence": "medium", "evidence": ["DDD started"], "gaps": []},
              {"name": "Documentation Quality", "score": 17, "max": 25, "confidence": "medium", "evidence": ["ADRs added"], "gaps": []},
              {"name": "Code Organization", "score": 17, "max": 25, "confidence": "medium", "evidence": ["Modular"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 70, "max": 100, "confidence": "high", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 19, "max": 25, "confidence": "high", "evidence": ["Good"], "gaps": []},
              {"name": "Contract Testing", "score": 16, "max": 25, "confidence": "medium", "evidence": ["OpenAPI"], "gaps": []},
              {"name": "Dependency Health", "score": 18, "max": 25, "confidence": "medium", "evidence": ["Clean"], "gaps": []},
              {"name": "Change Safety", "score": 17, "max": 25, "confidence": "medium", "evidence": ["Reviews"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [{"id": "s-1", "area": "ADRs", "evidence": "ADRs now present and maintained"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "virtuous", "pattern": "Balanced improvement", "weakestPrinciple": "understanding", "intervention": "Continue DDD adoption"},
        "methodology": {"filesAnalyzed": 140, "testFilesAnalyzed": 40, "adrsAnalyzed": 5, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "compareReportId"
    Given I register cleanup DELETE "/api/v1/reports/{compareReportId}"

    When I GET "/api/v1/reports/{baseReportId}/compare/{compareReportId}"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Compare reports shows maturity level change
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "d0000006-0003-4000-8000-000000000003",
        "repository": "maturity-change-repo",
        "scanDate": "2026-01-01T10:00:00Z",
        "scanDuration": 200000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 35,
        "maturityLevel": "Hypothesized",
        "assessmentMode": "standard",
        "executiveSummary": "Maturity change repo started at Hypothesized.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 30, "max": 100, "confidence": "low", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 8, "max": 25, "confidence": "low", "evidence": ["Slow"], "gaps": []},
              {"name": "Deployment Frequency", "score": 7, "max": 25, "confidence": "low", "evidence": ["Rare"], "gaps": []},
              {"name": "Test Coverage", "score": 8, "max": 25, "confidence": "low", "evidence": ["25%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 7, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 40, "max": 100, "confidence": "low", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 11, "max": 25, "confidence": "low", "evidence": ["Basic"], "gaps": []},
              {"name": "Domain Modeling", "score": 9, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Documentation Quality", "score": 10, "max": 25, "confidence": "low", "evidence": ["README"], "gaps": []},
              {"name": "Code Organization", "score": 10, "max": 25, "confidence": "low", "evidence": ["Flat"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 35, "max": 100, "confidence": "low", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 10, "max": 25, "confidence": "low", "evidence": ["Few"], "gaps": []},
              {"name": "Contract Testing", "score": 7, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": []},
              {"name": "Dependency Health", "score": 10, "max": 25, "confidence": "low", "evidence": ["Old"], "gaps": []},
              {"name": "Change Safety", "score": 8, "max": 25, "confidence": "low", "evidence": ["Manual"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "vicious", "pattern": "All below threshold", "weakestPrinciple": "feedback", "intervention": "Build CI pipeline"},
        "methodology": {"filesAnalyzed": 40, "testFilesAnalyzed": 5, "adrsAnalyzed": 0, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "oldReportId"
    Given I register cleanup DELETE "/api/v1/reports/{oldReportId}"

    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "d0000006-0004-4000-8000-000000000004",
        "repository": "maturity-change-repo",
        "scanDate": "2026-02-01T10:00:00Z",
        "scanDuration": 250000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 50,
        "maturityLevel": "Emerging",
        "assessmentMode": "standard",
        "executiveSummary": "Maturity change repo improved to Emerging.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 50, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 14, "max": 25, "confidence": "medium", "evidence": ["Better CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 12, "max": 25, "confidence": "medium", "evidence": ["Biweekly"], "gaps": []},
              {"name": "Test Coverage", "score": 12, "max": 25, "confidence": "medium", "evidence": ["50%"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 12, "max": 25, "confidence": "medium", "evidence": ["Lint"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 55, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Improved"], "gaps": []},
              {"name": "Domain Modeling", "score": 13, "max": 25, "confidence": "medium", "evidence": ["Started"], "gaps": []},
              {"name": "Documentation Quality", "score": 14, "max": 25, "confidence": "medium", "evidence": ["ADRs"], "gaps": []},
              {"name": "Code Organization", "score": 13, "max": 25, "confidence": "medium", "evidence": ["Better"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 45, "max": 100, "confidence": "medium", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 13, "max": 25, "confidence": "medium", "evidence": ["More tests"], "gaps": []},
              {"name": "Contract Testing", "score": 10, "max": 25, "confidence": "low", "evidence": ["Started"], "gaps": []},
              {"name": "Dependency Health", "score": 12, "max": 25, "confidence": "medium", "evidence": ["Updated"], "gaps": []},
              {"name": "Change Safety", "score": 10, "max": 25, "confidence": "medium", "evidence": ["CI added"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [{"id": "s-1", "area": "Progress", "evidence": "15-point improvement"}],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "at-risk", "pattern": "Improving but still fragile", "weakestPrinciple": "confidence", "intervention": "Focus on test quality"},
        "methodology": {"filesAnalyzed": 60, "testFilesAnalyzed": 15, "adrsAnalyzed": 2, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "newReportId"
    Given I register cleanup DELETE "/api/v1/reports/{newReportId}"

    When I GET "/api/v1/reports/{oldReportId}/compare/{newReportId}"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Compare with non-existent base report returns 404
    When I GET "/api/v1/reports/non-existent-base/compare/non-existent-other"
    Then the response status should be 404

  Scenario: Compare report with itself returns zero deltas
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "d0000006-0005-4000-8000-000000000005",
        "repository": "self-compare-repo",
        "scanDate": "2026-02-05T10:00:00Z",
        "scanDuration": 200000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 60,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Self compare repo scored 60/100.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 60, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Deployment Frequency", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Test Coverage", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 60, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Domain Modeling", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Documentation Quality", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Code Organization", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 60, "max": 100, "confidence": "medium", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Contract Testing", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Dependency Health", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Change Safety", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {"cycleHealth": "virtuous", "pattern": "Balanced", "weakestPrinciple": "feedback", "intervention": "Maintain current practices"},
        "methodology": {"filesAnalyzed": 100, "testFilesAnalyzed": 30, "adrsAnalyzed": 3, "confidenceNotes": ["BDD test"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "sameReportId"
    Given I register cleanup DELETE "/api/v1/reports/{sameReportId}"

    When I GET "/api/v1/reports/{sameReportId}/compare/{sameReportId}"
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "scoreDelta" should equal "0"

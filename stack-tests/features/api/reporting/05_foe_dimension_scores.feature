@api @report-gen @ROAD-001 @CAP-001
Feature: FOE Report Dimension Scores & Cognitive Triangle
  As an Engineering Team Lead
  I want to ingest FOE reports with full dimension scoring
  So that I can assess engineering maturity across Understanding, Feedback, and Confidence

  Scenario: Ingest report with complete dimension scores and subscores
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "c0000005-0001-4000-8000-000000000001",
        "repository": "dimension-test-repo",
        "repositoryUrl": "https://github.com/example/dimension-test",
        "scanDate": "2026-02-05T10:00:00Z",
        "scanDuration": 350000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 72,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Dimension test repo demonstrates strong Feedback practices with room for improvement in Understanding.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 78, "max": 100, "confidence": "high", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 22, "max": 25, "confidence": "high", "evidence": ["Sub-5min builds", "Parallelized stages"], "gaps": []},
              {"name": "Deployment Frequency", "score": 20, "max": 25, "confidence": "high", "evidence": ["Daily deploys to staging"], "gaps": []},
              {"name": "Test Coverage", "score": 18, "max": 25, "confidence": "medium", "evidence": ["78% line coverage"], "gaps": ["No mutation testing"]},
              {"name": "Feedback Loop Investment", "score": 18, "max": 25, "confidence": "medium", "evidence": ["Husky + lint-staged"], "gaps": []}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 68, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 19, "max": 25, "confidence": "high", "evidence": ["Hexagonal architecture documented"], "gaps": []},
              {"name": "Domain Modeling", "score": 15, "max": 25, "confidence": "medium", "evidence": ["Some DDD patterns"], "gaps": ["Missing bounded context documentation"]},
              {"name": "Documentation Quality", "score": 17, "max": 25, "confidence": "medium", "evidence": ["5 ADRs exist"], "gaps": []},
              {"name": "Code Organization", "score": 17, "max": 25, "confidence": "medium", "evidence": ["Clean module boundaries"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 70, "max": 100, "confidence": "high", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 20, "max": 25, "confidence": "high", "evidence": ["Good test-to-code ratio"], "gaps": []},
              {"name": "Contract Testing", "score": 15, "max": 25, "confidence": "medium", "evidence": ["OpenAPI spec exists"], "gaps": ["No runtime validation"]},
              {"name": "Dependency Health", "score": 18, "max": 25, "confidence": "medium", "evidence": ["No CVEs"], "gaps": []},
              {"name": "Change Safety", "score": 17, "max": 25, "confidence": "medium", "evidence": ["PR reviews required"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [
          {"id": "s-1", "area": "CI Pipeline", "evidence": "Sub-5min builds with parallelization"},
          {"id": "s-2", "area": "Test Ratio", "evidence": "Good test-to-code ratio across packages"}
        ],
        "gaps": [
          {"id": "g-1", "area": "Domain Modeling", "severity": "medium", "title": "Missing bounded context docs", "evidence": "No context map found", "impact": "Team alignment suffers", "recommendation": "Add DDD context map"}
        ],
        "recommendations": [
          {"id": "r-1", "priority": "short-term", "title": "Add DDD documentation", "description": "Create bounded context documentation and context map", "impact": "medium"}
        ],
        "triangleDiagnosis": {
          "cycleHealth": "virtuous",
          "pattern": "Strong Feedback loop supports Confidence",
          "weakestPrinciple": "understanding",
          "intervention": "Invest in domain modeling documentation"
        },
        "methodology": {"filesAnalyzed": 200, "testFilesAnalyzed": 60, "adrsAnalyzed": 5, "confidenceNotes": ["High confidence in Feedback dimension", "Medium confidence in Understanding"]}
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "reportId"
    And the value at "maturityLevel" should equal "Practicing"
    And the value at "overallScore" should equal "72"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

  Scenario: Retrieve report and verify cognitive triangle diagnosis
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "c0000005-0002-4000-8000-000000000002",
        "repository": "triangle-test-repo",
        "scanDate": "2026-02-05T11:00:00Z",
        "scanDuration": 280000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 35,
        "maturityLevel": "Hypothesized",
        "assessmentMode": "critical",
        "executiveSummary": "Triangle test repo has critical gaps across all dimensions.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 30, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 8, "max": 25, "confidence": "medium", "evidence": ["Slow CI"], "gaps": ["20min builds"]},
              {"name": "Deployment Frequency", "score": 8, "max": 25, "confidence": "low", "evidence": ["Monthly"], "gaps": []},
              {"name": "Test Coverage", "score": 7, "max": 25, "confidence": "low", "evidence": ["30% coverage"], "gaps": ["Low coverage"]},
              {"name": "Feedback Loop Investment", "score": 7, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": ["No pre-commit"]}
            ]
          },
          "understanding": {
            "name": "Understanding", "score": 45, "max": 100, "confidence": "medium", "color": "#8b5cf6",
            "subscores": [
              {"name": "Architecture Clarity", "score": 13, "max": 25, "confidence": "medium", "evidence": ["Some structure"], "gaps": []},
              {"name": "Domain Modeling", "score": 10, "max": 25, "confidence": "low", "evidence": ["Anemic models"], "gaps": ["No DDD"]},
              {"name": "Documentation Quality", "score": 12, "max": 25, "confidence": "medium", "evidence": ["README only"], "gaps": []},
              {"name": "Code Organization", "score": 10, "max": 25, "confidence": "low", "evidence": ["Mixed concerns"], "gaps": []}
            ]
          },
          "confidence": {
            "name": "Confidence", "score": 25, "max": 100, "confidence": "low", "color": "#10b981",
            "subscores": [
              {"name": "Test Quality", "score": 8, "max": 25, "confidence": "low", "evidence": ["Brittle tests"], "gaps": ["Flaky suite"]},
              {"name": "Contract Testing", "score": 5, "max": 25, "confidence": "low", "evidence": ["None"], "gaps": ["No contracts"]},
              {"name": "Dependency Health", "score": 7, "max": 25, "confidence": "low", "evidence": ["15 CVEs"], "gaps": ["Vulnerabilities"]},
              {"name": "Change Safety", "score": 5, "max": 25, "confidence": "low", "evidence": ["No reviews"], "gaps": ["No PR process"]}
            ]
          }
        },
        "criticalFailures": [
          {"id": "cf-1", "area": "Security", "severity": "critical", "title": "15 known vulnerabilities", "evidence": "npm audit shows 15 CVEs", "impact": "Production security risk", "recommendation": "Run npm audit fix"}
        ],
        "strengths": [],
        "gaps": [
          {"id": "g-1", "area": "Testing", "severity": "high", "title": "Low test coverage", "evidence": "30% line coverage", "impact": "Changes are risky", "recommendation": "Increase coverage to 60%+"}
        ],
        "recommendations": [
          {"id": "r-1", "priority": "immediate", "title": "Fix security vulnerabilities", "description": "Address 15 known CVEs immediately", "impact": "high"}
        ],
        "triangleDiagnosis": {
          "cycleHealth": "vicious",
          "pattern": "Confidence critically low, dragging Feedback down",
          "weakestPrinciple": "confidence",
          "intervention": "Focus on test quality and dependency health before anything else"
        },
        "methodology": {"filesAnalyzed": 80, "testFilesAnalyzed": 10, "adrsAnalyzed": 0, "confidenceNotes": ["Low confidence across all dimensions"]}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 200
    And the value at "triangleDiagnosis.cycleHealth" should equal "vicious"
    And the value at "maturityLevel" should equal "Hypothesized"

  @validation
  Scenario: Reject report with missing required dimensions
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "c0000005-0003-4000-8000-000000000003",
        "repository": "invalid-report-repo",
        "scanDate": "2026-02-05T12:00:00Z",
        "scanDuration": 100000,
        "scannerVersion": "1.0.0-bdd",
        "overallScore": 50,
        "maturityLevel": "Emerging",
        "assessmentMode": "standard",
        "executiveSummary": "Invalid report missing dimensions.",
        "dimensions": {
          "feedback": {
            "name": "Feedback", "score": 50, "max": 100, "confidence": "medium", "color": "#3b82f6",
            "subscores": [
              {"name": "CI Pipeline Speed", "score": 13, "max": 25, "confidence": "medium", "evidence": ["CI"], "gaps": []},
              {"name": "Deployment Frequency", "score": 12, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Test Coverage", "score": 13, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []},
              {"name": "Feedback Loop Investment", "score": 12, "max": 25, "confidence": "medium", "evidence": ["OK"], "gaps": []}
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "cycleHealth": "vicious",
          "pattern": "Missing dimensions",
          "weakestPrinciple": "confidence",
          "intervention": "Add all dimensions"
        },
        "methodology": {"filesAnalyzed": 50, "testFilesAnalyzed": 5, "adrsAnalyzed": 0, "confidenceNotes": ["Incomplete scan"]}
      }
      """
    Then the response status should be 400

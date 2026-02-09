@api @repo-scanning @ROAD-006 @CAP-004 @CAP-002 @wip
Feature: Scanner Governance Dimension Scoring
  As an AI Agent running the FOE scanner
  I want scans to include governance maturity scoring
  So that the Understanding dimension reflects governance health alongside architecture and documentation

  @dimension
  Scenario: Scan report includes governance subscores in Understanding dimension
    # Ingest a report that has governance subscores
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": {
          "name": "governance-scored-repo",
          "url": "https://github.com/example/governance-scored",
          "techStack": ["TypeScript"],
          "isMonorepo": true
        },
        "scanDate": "2026-02-05T10:00:00Z",
        "overallScore": 68,
        "maturityLevel": "Practicing",
        "dimensions": {
          "feedback": { "score": 70, "subscores": [], "findings": [], "gaps": [] },
          "understanding": {
            "score": 65,
            "subscores": [
              {"name": "Architecture Clarity", "score": 70, "max": 100},
              {"name": "Domain Modeling", "score": 55, "max": 100},
              {"name": "Documentation Quality", "score": 60, "max": 100},
              {"name": "Governance Health", "score": 75, "max": 100}
            ],
            "findings": [
              {"title": "Governance artifacts present with valid frontmatter", "severity": "positive"}
            ],
            "gaps": [
              {"title": "Cross-reference integrity has 3 broken links", "severity": "medium"}
            ]
          },
          "confidence": { "score": 70, "subscores": [], "findings": [], "gaps": [] }
        },
        "strengths": [],
        "topGaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "feedback": 70, "understanding": 65, "confidence": 70,
          "belowThreshold": [], "healthy": true
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 200
    And the value at "dimensions.understanding.score" should equal "65"

  @dimension
  Scenario: Scan report handles repository with no governance artifacts
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": {
          "name": "no-governance-repo",
          "url": null,
          "techStack": ["Python"],
          "isMonorepo": false
        },
        "scanDate": "2026-02-05T11:00:00Z",
        "overallScore": 45,
        "maturityLevel": "Emerging",
        "dimensions": {
          "feedback": { "score": 50, "subscores": [], "findings": [], "gaps": [] },
          "understanding": {
            "score": 40,
            "subscores": [
              {"name": "Architecture Clarity", "score": 45, "max": 100},
              {"name": "Domain Modeling", "score": 35, "max": 100},
              {"name": "Documentation Quality", "score": 40, "max": 100}
            ],
            "findings": [],
            "gaps": [{"title": "No governance artifacts found", "severity": "low"}]
          },
          "confidence": { "score": 45, "subscores": [], "findings": [], "gaps": [] }
        },
        "strengths": [],
        "topGaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "feedback": 50, "understanding": 40, "confidence": 45,
          "belowThreshold": ["understanding"], "healthy": false
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

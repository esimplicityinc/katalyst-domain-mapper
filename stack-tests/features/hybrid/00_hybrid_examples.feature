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

    # Ingest a report with complete canonical FOE format
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "id": "550e8400-e29b-41d4-a716-446655440100",
        "repository": "hybrid-e2e-repo",
        "repositoryUrl": "https://github.com/example/hybrid-e2e",
        "scanDate": "2026-02-05T16:00:00Z",
        "scanDuration": 120000,
        "scannerVersion": "1.0.0",
        "overallScore": 75,
        "maturityLevel": "Practicing",
        "assessmentMode": "standard",
        "executiveSummary": "Test report for hybrid E2E testing",
        "dimensions": {
          "feedback": {
            "name": "Feedback",
            "score": 80,
            "max": 100,
            "confidence": "high",
            "color": "#3B82F6",
            "subscores": [
              { 
                "name": "CI/CD Speed", 
                "score": 20, 
                "max": 25,
                "confidence": "high",
                "evidence": ["Fast CI pipeline", "Quick feedback loops"],
                "gaps": []
              },
              { 
                "name": "Test Feedback", 
                "score": 20, 
                "max": 25,
                "confidence": "high",
                "evidence": ["Comprehensive test suite"],
                "gaps": []
              },
              { 
                "name": "Deployment Frequency", 
                "score": 20, 
                "max": 25,
                "confidence": "high",
                "evidence": ["Daily deployments"],
                "gaps": []
              },
              { 
                "name": "Learning Cycles", 
                "score": 20, 
                "max": 25,
                "confidence": "high",
                "evidence": ["Regular retrospectives"],
                "gaps": []
              }
            ]
          },
          "understanding": {
            "name": "Understanding",
            "score": 70,
            "max": 100,
            "confidence": "medium",
            "color": "#8B5CF6",
            "subscores": [
              { 
                "name": "Architecture Clarity", 
                "score": 18, 
                "max": 25,
                "confidence": "medium",
                "evidence": ["Documented architecture"],
                "gaps": ["Could improve diagrams"]
              },
              { 
                "name": "Documentation", 
                "score": 17, 
                "max": 25,
                "confidence": "medium",
                "evidence": ["README files present"],
                "gaps": ["API docs incomplete"]
              },
              { 
                "name": "Domain Modeling", 
                "score": 18, 
                "max": 25,
                "confidence": "medium",
                "evidence": ["DDD patterns used"],
                "gaps": []
              },
              { 
                "name": "Onboarding", 
                "score": 17, 
                "max": 25,
                "confidence": "medium",
                "evidence": ["Onboarding guide exists"],
                "gaps": ["Could be more detailed"]
              }
            ]
          },
          "confidence": {
            "name": "Confidence",
            "score": 75,
            "max": 100,
            "confidence": "high",
            "color": "#10B981",
            "subscores": [
              { 
                "name": "Test Coverage", 
                "score": 19, 
                "max": 25,
                "confidence": "high",
                "evidence": ["80% code coverage"],
                "gaps": []
              },
              { 
                "name": "Static Analysis", 
                "score": 18, 
                "max": 25,
                "confidence": "high",
                "evidence": ["ESLint configured"],
                "gaps": []
              },
              { 
                "name": "Contract Testing", 
                "score": 19, 
                "max": 25,
                "confidence": "high",
                "evidence": ["API contracts tested"],
                "gaps": []
              },
              { 
                "name": "Observability", 
                "score": 19, 
                "max": 25,
                "confidence": "high",
                "evidence": ["Monitoring in place"],
                "gaps": []
              }
            ]
          }
        },
        "criticalFailures": [],
        "strengths": [],
        "gaps": [],
        "recommendations": [],
        "triangleDiagnosis": {
          "feedbackScore": 80,
          "understandingScore": 70,
          "confidenceScore": 75,
          "cycleHealth": "virtuous",
          "pattern": "balanced",
          "weakestPrinciple": "understanding",
          "intervention": "Improve documentation and domain modeling"
        },
        "methodology": {
          "filesAnalyzed": 100,
          "testFilesFound": 20,
          "testFilesAnalyzed": 20,
          "adrsCounted": 5,
          "adrsAnalyzed": 5,
          "coverageReportPresent": true,
          "confidenceNotes": ["Based on comprehensive analysis"]
        },
        "referencedMethods": []
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

    # Verify the report is retrievable
    When I GET "/api/v1/reports/{reportId}"
    Then the response status should be 200
    And the value at "overallScore" should equal "75"

@hybrid @assessment-coaching @CAP-017 @US-059
Feature: AI Assessment Coaching
  As an Engineering Team Lead (@UT-001)
  I want an AI coaching chat that understands my FOE assessment results
  So that I can get contextual advice on improving my team's engineering practices

  Background:
    # Create a report so the chat has context
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": "bdd-coaching-test",
        "branch": "main",
        "overallScore": 55,
        "maturityLevel": "emerging",
        "dimensions": {
          "understanding": { "score": 60, "subscores": {} },
          "feedback": { "score": 50, "subscores": {} },
          "confidence": { "score": 45, "subscores": {} }
        },
        "topStrengths": [{ "title": "Good documentation", "dimension": "understanding" }],
        "topGaps": [{ "title": "Low test coverage", "dimension": "confidence", "priority": "high" }],
        "triangleDiagnosis": { "understanding": 60, "feedback": 50, "confidence": 45 }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

  @smoke
  Scenario: FOE Projects chat tab is accessible
    When I navigate to "/strategy/foe-projects/chat"
    Then I wait for the page to load
    Then I should see text "Chat"

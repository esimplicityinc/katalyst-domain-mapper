@hybrid @foe-projects @CAP-016 @US-056 @US-057 @US-058
Feature: FOE Project Management
  As an Engineering Team Lead (@UT-001)
  I want to browse, search, and select FOE assessment projects
  So that I can review team performance across multiple repositories

  Background:
    # Create a scan report so project list is non-empty
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repository": "bdd-project-mgmt-test",
        "branch": "main",
        "overallScore": 72,
        "maturityLevel": "practicing",
        "dimensions": {
          "understanding": { "score": 70, "subscores": {} },
          "feedback": { "score": 75, "subscores": {} },
          "confidence": { "score": 68, "subscores": {} }
        },
        "topStrengths": [],
        "topGaps": [],
        "triangleDiagnosis": { "understanding": 70, "feedback": 75, "confidence": 68 }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportId"
    Given I register cleanup DELETE "/api/v1/reports/{reportId}"

  @smoke
  Scenario: FOE Projects page loads with project grid
    When I navigate to "/strategy/foe-projects"
    Then I wait for the page to load
    Then I should see text "FOE Projects"

  Scenario: Scanner tab is accessible for uploading reports
    When I navigate to "/strategy/foe-projects/scanner"
    Then I wait for the page to load
    Then I should see text "Scanner"

  Scenario: Project detail tabs render correctly
    When I navigate to "/strategy/foe-projects/overview"
    Then I wait for the page to load
    Then I should see text "Overview"

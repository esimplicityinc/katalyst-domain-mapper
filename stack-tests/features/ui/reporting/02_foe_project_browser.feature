@ui @foe-scanner @ROAD-030 @CAP-001
Feature: FOE Project Browser & Persistent Report Selection
  As an Engineering Team Lead
  I want to browse and manage multiple FOE project reports with persistent selection
  So that I can track engineering maturity across multiple repositories and return to my work seamlessly

  Background:
    # Seed test data: 3 FOE reports (projects)
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repositoryName": "alpha-service",
        "repositoryUrl": "https://github.com/test-org/alpha-service",
        "scanDate": "2026-02-10T10:00:00Z",
        "overallScore": 75,
        "maturityLevel": "Practicing",
        "dimensions": {
          "understanding": {"score": 70, "confidence": "high", "subscores": []},
          "feedback": {"score": 80, "confidence": "high", "subscores": []},
          "confidence": {"score": 75, "confidence": "medium", "subscores": []}
        },
        "triangleDiagnosis": {"cycleHealth": "virtuous", "weakestPrinciple": null, "intervention": null},
        "topStrengths": [{"area": "testing", "evidence": "95% test coverage"}],
        "topGaps": [{"area": "documentation", "severity": "medium", "title": "Missing ADRs"}],
        "recommendations": [],
        "methodology": {"filesAnalyzed": 100}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "projectAlphaId"
    And I register cleanup DELETE "/api/v1/reports/{projectAlphaId}"

    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repositoryName": "beta-platform",
        "repositoryUrl": "https://github.com/test-org/beta-platform",
        "scanDate": "2026-02-15T14:30:00Z",
        "overallScore": 45,
        "maturityLevel": "Emerging",
        "dimensions": {
          "understanding": {"score": 40, "confidence": "medium", "subscores": []},
          "feedback": {"score": 50, "confidence": "medium", "subscores": []},
          "confidence": {"score": 45, "confidence": "low", "subscores": []}
        },
        "triangleDiagnosis": {"cycleHealth": "at-risk", "weakestPrinciple": "confidence", "intervention": "Invest in test automation"},
        "topStrengths": [{"area": "ci-cd", "evidence": "5 minute build"}],
        "topGaps": [{"area": "testing", "severity": "high", "title": "No automated tests"}],
        "recommendations": [],
        "methodology": {"filesAnalyzed": 50}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "projectBetaId"
    And I register cleanup DELETE "/api/v1/reports/{projectBetaId}"

    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "repositoryName": "gamma-api",
        "repositoryUrl": "https://github.com/test-org/gamma-api",
        "scanDate": "2026-02-17T09:15:00Z",
        "overallScore": 88,
        "maturityLevel": "Optimized",
        "dimensions": {
          "understanding": {"score": 85, "confidence": "high", "subscores": []},
          "feedback": {"score": 90, "confidence": "high", "subscores": []},
          "confidence": {"score": 88, "confidence": "high", "subscores": []}
        },
        "triangleDiagnosis": {"cycleHealth": "virtuous", "weakestPrinciple": null, "intervention": null},
        "topStrengths": [{"area": "architecture", "evidence": "Clean hexagonal architecture"}],
        "topGaps": [],
        "recommendations": [],
        "methodology": {"filesAnalyzed": 150}
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "projectGammaId"
    And I register cleanup DELETE "/api/v1/reports/{projectGammaId}"

  # ==========================================
  # PROJECT LIST VIEW (8 scenarios)
  # ==========================================

  @smoke @project-list
  Scenario: Navigate to project list and see all projects
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    Then I should see text "FOE Project Browser"
    And I should see text "alpha-service"
    And I should see text "beta-platform"
    And I should see text "gamma-api"
    And I should see text "Practicing"
    And I should see text "Emerging"
    And I should see text "Optimized"

  @project-list
  Scenario: Project cards display correct metadata
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    Then I should see text "alpha-service"
    And I should see text "75"
    And I should see text "Practicing"
    And I should see text "2026-02-10"

  @project-list @search
  Scenario: Search for project by name filters list
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    When I fill in "search" with "alpha"
    Then I should see text "alpha-service"
    And I should not see text "beta-platform"
    And I should not see text "gamma-api"

  @project-list @search
  Scenario: Search with no matches shows empty state
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    When I fill in "search" with "nonexistent-project"
    Then I should see text "No projects found"

  @project-list @sorting
  Scenario: Sort projects by score descending
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    When I click the button "Sort by Score"
    Then the first project card should show "gamma-api"
    And the last project card should show "beta-platform"

  @project-list @sorting
  Scenario: Sort projects by date descending
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    When I click the button "Sort by Date"
    Then the first project card should show "gamma-api"
    And the last project card should show "alpha-service"

  @project-list @navigation
  Scenario: Click project card navigates to project detail
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    When I click the element "[data-testid='project-card-alpha-service']"
    Then the URL should contain "/testing/reports/"
    And the URL should contain "overview"
    And I should see text "alpha-service"

  @project-list @upload
  Scenario: Upload new report button is accessible
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    Then I should see text "Upload New Report"
    When I click the button "Upload New Report"
    Then I should see text "Upload FOE Report"

  # ==========================================
  # PROJECT DETAIL & TABS (6 scenarios)
  # ==========================================

  @smoke @project-detail @tabs
  Scenario: Navigate to project detail shows overview tab by default
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    Then I should see text "alpha-service"
    And I should see text "Overall Score"
    And I should see text "75"
    And I should see text "Practicing"
    And the element "[data-testid='tab-overview']" should have class "active"

  @project-detail @tabs
  Scenario: Click Dimensions tab shows dimension cards
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    When I click the element "[data-testid='tab-dimensions']"
    Then the URL should contain "/dimensions"
    And I should see text "Understanding"
    And I should see text "Feedback"
    And I should see text "Confidence"
    And I should see text "70"
    And I should see text "80"
    And I should see text "75"

  @project-detail @tabs
  Scenario: Click Triangle tab shows cognitive triangle diagram
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    When I click the element "[data-testid='tab-triangle']"
    Then the URL should contain "/triangle"
    And I should see text "Cognitive Triangle"
    And the element "[data-testid='triangle-diagram']" should be visible

  @project-detail @tabs
  Scenario: Click Strengths tab shows findings table
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    When I click the element "[data-testid='tab-strengths']"
    Then the URL should contain "/strengths"
    And I should see text "Top Strengths"
    And I should see text "95% test coverage"

  @project-detail @tabs
  Scenario: Click Gaps tab shows gaps table
    Given I navigate to "/testing/reports/{projectBetaId}/overview"
    Then I wait for the page to load
    When I click the element "[data-testid='tab-gaps']"
    Then the URL should contain "/gaps"
    And I should see text "Top Gaps"
    And I should see text "No automated tests"

  @project-detail @tabs @navigation
  Scenario: Switch Project button returns to project list
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    When I click the button "Switch Project"
    Then the URL should contain "/testing/reports"
    And the URL should not contain "overview"
    And I should see text "FOE Project Browser"

  # ==========================================
  # PERSISTENCE & STATE (4 scenarios)
  # ==========================================

  @persistence @smoke
  Scenario: Selected project persists to localStorage
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    Then localStorage key "foe:selectedProjectId" should equal "{projectAlphaId}"

  @persistence
  Scenario: Reload page restores last selected project
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    When I reload the page
    Then I should see text "alpha-service"
    And the URL should contain "{projectAlphaId}"

  @persistence @tabs
  Scenario: Tab selection persists in URL for deep linking
    Given I navigate to "/testing/reports/{projectAlphaId}/dimensions"
    Then I wait for the page to load
    Then I should see text "Understanding"
    And the element "[data-testid='tab-dimensions']" should have class "active"
    When I copy the URL
    And I navigate to the copied URL in a new tab
    Then I should see text "Understanding"
    And the element "[data-testid='tab-dimensions']" should have class "active"

  @persistence
  Scenario: Browser back/forward navigates through tabs correctly
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    When I click the element "[data-testid='tab-dimensions']"
    Then the URL should contain "/dimensions"
    When I go back in the browser
    Then the URL should contain "/overview"
    And I should see text "Overall Score"

  # ==========================================
  # LEGACY ROUTES (2 scenarios)
  # ==========================================

  @legacy @navigation
  Scenario: Legacy /testing/reports route redirects to project list
    Given I navigate to "/testing/reports"
    Then I wait for the page to load
    Then I should see text "FOE Project Browser"
    And I should see text "alpha-service"

  @legacy @navigation
  Scenario: Navigate to project ID without tab redirects to overview
    Given I navigate to "/testing/reports/{projectAlphaId}"
    Then I wait for the page to load
    Then the URL should contain "/overview"
    And I should see text "Overall Score"

  # ==========================================
  # EDGE CASES (4 scenarios)
  # ==========================================

  @edge-case @error
  Scenario: Navigate to invalid project ID shows 404 error
    Given I navigate to "/testing/reports/invalid-project-id-12345/overview"
    Then I wait for the page to load
    Then I should see text "Project not found"
    And I should see text "Return to Project List"

  @edge-case @error
  Scenario: Deleted project in localStorage falls back to most recent
    Given I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    # Simulate project deletion
    When I DELETE "/api/v1/reports/{projectAlphaId}"
    Then the response status should be 204
    When I navigate to "/testing/reports"
    Then I wait for the page to load
    # Should fall back to most recent existing project (gamma-api, latest scan date)
    Then I should see text "gamma-api"
    And I should not see text "alpha-service"

  @edge-case @error @retry
  Scenario: API failure shows error with retry button
    Given the API endpoint "/api/v1/reports" returns 500 error
    When I navigate to "/testing/reports"
    Then I wait for the page to load
    Then I should see text "Failed to load projects"
    And I should see text "Retry"
    When I click the button "Retry"
    Then the API should be called again

  @edge-case @mobile @a11y
  Scenario: Mobile viewport displays horizontal scrolling tabs
    Given I am on a mobile device with width 375px
    When I navigate to "/testing/reports/{projectAlphaId}/overview"
    Then I wait for the page to load
    Then the element "[data-testid='tabs-container']" should have CSS property "overflow-x" equal to "scroll"
    And all tab buttons should be accessible via horizontal scroll
    When I swipe left on tabs
    Then the "Gaps" tab should become visible

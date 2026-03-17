@hybrid @foe-scanner @ROAD-030 @CAP-001 @US-056 @US-058
Feature: FOE Project Browser & Report Viewer
  As an Engineering Team Lead
  I want to browse FOE project reports and navigate between tabs
  So that I can track engineering maturity across multiple repositories

  Background:
    # Seed test data via the scanner report format (auto-normalized by the API)
    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-10T10:00:00Z",
        "repository": {
          "name": "alpha-service",
          "path": "/repo/alpha",
          "techStack": ["TypeScript", "React"],
          "monorepo": false
        },
        "dimensions": {
          "feedback": {
            "score": 80, "maxScore": 100,
            "subscores": {"pipeline-speed": {"score": 20, "max": 25, "confidence": "high"}, "test-coverage": {"score": 20, "max": 25, "confidence": "high"}, "deploy-frequency": {"score": 20, "max": 25, "confidence": "medium"}, "learning-cycles": {"score": 20, "max": 25, "confidence": "high"}},
            "findings": [], "gaps": []
          },
          "understanding": {
            "score": 70, "maxScore": 100,
            "subscores": {"architecture": {"score": 18, "max": 25, "confidence": "high"}, "documentation": {"score": 17, "max": 25, "confidence": "medium"}, "domain-model": {"score": 18, "max": 25, "confidence": "high"}, "system-clarity": {"score": 17, "max": 25, "confidence": "medium"}},
            "findings": [], "gaps": []
          },
          "confidence": {
            "score": 75, "maxScore": 100,
            "subscores": {"test-automation": {"score": 19, "max": 25, "confidence": "high"}, "static-analysis": {"score": 19, "max": 25, "confidence": "high"}, "contract-testing": {"score": 18, "max": 25, "confidence": "medium"}, "stability": {"score": 19, "max": 25, "confidence": "high"}},
            "findings": [], "gaps": []
          }
        },
        "triangleDiagnosis": {
          "cycleHealth": "virtuous",
          "weakestDimension": "understanding",
          "weakestScore": 70,
          "pattern": "Balanced growth",
          "intervention": "Continue current approach",
          "belowMinimum": []
        },
        "overallScore": 75,
        "maturityLevel": "Practicing",
        "topStrengths": [{"area": "testing", "score": 19, "reason": "95% test coverage"}],
        "topGaps": [{"area": "documentation", "score": 17, "reason": "Missing ADRs"}],
        "methodology": {
          "scanDuration": "2m 30s",
          "agentsUsed": ["ci", "tests", "arch", "domain", "docs"],
          "filesAnalyzed": 100,
          "confidenceLevel": "high"
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportAlphaId"
    And I register cleanup DELETE "/api/v1/reports/{reportAlphaId}"

    When I POST "/api/v1/reports" with JSON body:
      """
      {
        "version": "1.0.0",
        "generated": "2026-02-15T14:30:00Z",
        "repository": {
          "name": "beta-platform",
          "path": "/repo/beta",
          "techStack": ["Java", "Spring Boot"],
          "monorepo": true
        },
        "dimensions": {
          "feedback": {
            "score": 50, "maxScore": 100,
            "subscores": {"pipeline-speed": {"score": 13, "max": 25, "confidence": "medium"}, "test-coverage": {"score": 12, "max": 25, "confidence": "low"}, "deploy-frequency": {"score": 13, "max": 25, "confidence": "medium"}, "learning-cycles": {"score": 12, "max": 25, "confidence": "low"}},
            "findings": [], "gaps": [{"area": "testing", "currentState": "No automated tests", "hypothesis": "Team lacks testing culture", "recommendation": "Start with unit tests", "impact": "high"}]
          },
          "understanding": {
            "score": 40, "maxScore": 100,
            "subscores": {"architecture": {"score": 10, "max": 25, "confidence": "medium"}, "documentation": {"score": 10, "max": 25, "confidence": "low"}, "domain-model": {"score": 10, "max": 25, "confidence": "medium"}, "system-clarity": {"score": 10, "max": 25, "confidence": "low"}},
            "findings": [], "gaps": []
          },
          "confidence": {
            "score": 45, "maxScore": 100,
            "subscores": {"test-automation": {"score": 11, "max": 25, "confidence": "low"}, "static-analysis": {"score": 12, "max": 25, "confidence": "medium"}, "contract-testing": {"score": 11, "max": 25, "confidence": "low"}, "stability": {"score": 11, "max": 25, "confidence": "low"}},
            "findings": [], "gaps": []
          }
        },
        "triangleDiagnosis": {
          "cycleHealth": "at-risk",
          "weakestDimension": "understanding",
          "weakestScore": 40,
          "pattern": "Understanding deficit",
          "intervention": "Invest in documentation and domain modeling",
          "belowMinimum": ["understanding"]
        },
        "overallScore": 45,
        "maturityLevel": "Emerging",
        "topStrengths": [{"area": "ci-cd", "score": 13, "reason": "5 minute build pipeline"}],
        "topGaps": [{"area": "testing", "score": 11, "reason": "No automated tests found"}],
        "methodology": {
          "scanDuration": "1m 45s",
          "agentsUsed": ["ci", "tests", "arch", "domain", "docs"],
          "filesAnalyzed": 50,
          "confidenceLevel": "medium"
        }
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "reportBetaId"
    And I register cleanup DELETE "/api/v1/reports/{reportBetaId}"

  # ==========================================
  # PROJECT LIST VIEW (via Switch Project)
  # ==========================================

  @smoke @project-list
  Scenario: Switch Project button opens project list with all projects
    Given I navigate to "/strategy/foe-projects/scanner"
    Then I wait for the page to load
    When I click the button "Switch Project"
    Then I should see text "FOE Projects"
    And I should see text "alpha-service"
    And I should see text "beta-platform"

  @project-list
  Scenario: Project list displays maturity level badges
    Given I navigate to "/strategy/foe-projects/scanner"
    Then I wait for the page to load
    When I click the button "Switch Project"
    Then I should see text "Practicing"
    And I should see text "Emerging"

  @project-list @search
  Scenario: Search filters projects by name
    Given I navigate to "/strategy/foe-projects/scanner"
    Then I wait for the page to load
    When I click the button "Switch Project"
    When I fill the placeholder "Search projects..." with "alpha"
    Then I should see text "alpha-service"
    And I should not see text "beta-platform"

  @project-list @search
  Scenario: Search with no matches shows empty message
    Given I navigate to "/strategy/foe-projects/scanner"
    Then I wait for the page to load
    When I click the button "Switch Project"
    When I fill the placeholder "Search projects..." with "nonexistent-project-xyz"
    Then I should see text "No projects match"

  # ==========================================
  # TAB NAVIGATION
  # ==========================================

  @smoke @tabs
  Scenario: Default tab is Scanner (upload page)
    Given I navigate to "/strategy/foe-projects"
    Then I wait for the page to load
    Then the URL should contain "/scanner"

  @tabs
  Scenario: Navigate to Overview tab shows report content
    Given I navigate to "/strategy/foe-projects/overview"
    Then I wait for the page to load
    Then the URL should contain "/overview"

  @tabs
  Scenario: Navigate to Dimensions tab shows dimension names
    Given I navigate to "/strategy/foe-projects/dimensions"
    Then I wait for the page to load
    Then the URL should contain "/dimensions"

  @tabs
  Scenario: Navigate to Triangle tab shows cognitive triangle
    Given I navigate to "/strategy/foe-projects/triangle"
    Then I wait for the page to load
    Then I should see text "Triangle"

  @tabs
  Scenario: Navigate to Strengths tab
    Given I navigate to "/strategy/foe-projects/strengths"
    Then I wait for the page to load
    Then I should see text "Strength"

  @tabs
  Scenario: Navigate to Gaps tab
    Given I navigate to "/strategy/foe-projects/gaps"
    Then I wait for the page to load
    Then I should see text "Gap"

  # ==========================================
  # LEGACY ROUTES
  # ==========================================

  @legacy @navigation
  Scenario: Legacy /reports/projects route redirects to FOE Projects
    Given I navigate to "/reports/projects"
    Then I wait for the page to load
    Then the URL should contain "/strategy/foe-projects"

  @legacy @navigation
  Scenario: Legacy /reports route redirects to FOE Projects Scanner
    Given I navigate to "/reports"
    Then I wait for the page to load
    Then the URL should contain "/strategy/foe-projects"

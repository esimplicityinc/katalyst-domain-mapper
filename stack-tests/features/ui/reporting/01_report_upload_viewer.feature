@ui @report-gen @ROAD-001 @CAP-001
Feature: FOE Report Upload & Viewer
  As an Engineering Team Lead
  I want to upload and view FOE scan reports in the web interface
  So that I can visualize engineering maturity across Understanding, Feedback, and Confidence

  @smoke
  Scenario: Load the report upload page
    Given I navigate to "/"
    Then I wait for the page to load
    Then I should see text "FOE"

  Scenario: Report viewer displays dimension information
    Given I navigate to "/"
    Then I wait for the page to load
    Then I should see text "Upload"

  @wip @dashboard @ROAD-009 @CAP-002
  Scenario: Governance dashboard shows road item Kanban
    Given I navigate to "/governance"
    Then I wait for the page to load
    Then I should see text "Road Items"
    And I should see text "Implementing"
    And I should see text "Proposed"

  @wip @context-map @ROAD-009 @CAP-002
  Scenario: DDD context map displays bounded contexts
    Given I navigate to "/context-map"
    Then I wait for the page to load
    Then I should see text "Bounded Contexts"

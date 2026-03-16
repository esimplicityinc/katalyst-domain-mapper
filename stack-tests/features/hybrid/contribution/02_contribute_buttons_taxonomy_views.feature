@hybrid @contribution @plan04
Feature: Per-Item Contribute Buttons on Taxonomy and User Type Views
  As a Team Lead
  I want Contribute buttons on capability, user type, and user story views
  So that I can quickly contribute items of the correct type

  # ── Capability Tree View ─────────────────────────────────────────────────

  @smoke
  Scenario: Capability tree view shows a Contributions button
    Given I navigate to "/design/architecture/capabilities"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: Capability Contributions button opens panel filtered to capability
    Given I navigate to "/design/architecture/capabilities"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "capability"

  # ── User Type List View ──────────────────────────────────────────────────

  @smoke
  Scenario: User type list view shows a Contributions button
    Given I navigate to "/design/user-types/list"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: User type Contributions button opens panel filtered to user-type
    Given I navigate to "/design/user-types/list"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "user-type"

  # ── User Story Board View ───────────────────────────────────────────────

  @smoke
  Scenario: User story board view shows a Contributions button
    Given I navigate to "/design/user-types/stories"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: User story Contributions button opens panel filtered to user-story
    Given I navigate to "/design/user-types/stories"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "user-story"

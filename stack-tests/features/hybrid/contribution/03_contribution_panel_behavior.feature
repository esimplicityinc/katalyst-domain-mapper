@hybrid @contribution @plan04
Feature: Contribution Panel Slide-Out Behavior
  As a contributor
  I want the contribution panel to open, close, and filter correctly
  So that I can efficiently manage contributions for specific item types

  Background:
    # Create a domain model so domain views have data to render
    Given I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Panel Behavior Test Domain",
        "description": "Domain model for testing panel behavior"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "payments",
        "title": "Payments",
        "responsibility": "Handles payment processing",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200

  # ── Panel Open / Close ───────────────────────────────────────────────────

  Scenario: Contribution panel opens as a slide-out overlay
    Given I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    When I click the button "Contributions"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should be visible
    And I should see text "Queue"
    And I should see text "Chat"

  Scenario: Contribution panel closes via close button
    Given I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    When I click the button "Contributions"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should be visible
    When I click the element "button[aria-label='Close contributions panel']"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should not be visible

  Scenario: Contribution panel closes on Escape key
    Given I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    When I click the button "Contributions"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should be visible
    Then I "press" "Escape"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should not be visible

  # ── Type Filter Sync ─────────────────────────────────────────────────────

  Scenario: Opening from Context Map pre-selects Bounded Context in type dropdown
    Given I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should be visible
    And the element "select[aria-label='Filter by type']" should have value "bounded-context"

  Scenario: Opening from Aggregates pre-selects Aggregate in type dropdown
    Given I navigate to "/design/business-domain/aggregates"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should be visible
    And the element "select[aria-label='Filter by type']" should have value "aggregate"

  # ── Queue and Chat tabs ──────────────────────────────────────────────────

  Scenario: Panel defaults to Queue tab being active
    Given I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    When I click the button "Contributions"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should be visible
    And the "Queue" tab should be active

  Scenario: Switching to Chat tab shows AI assistant
    Given I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    When I click the button "Contributions"
    Then the element "[role='dialog'][aria-label='Contributions panel']" should be visible
    When I click the "Chat" tab
    Then I should see text "AI Assistant"

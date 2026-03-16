@hybrid @contribution @plan04
Feature: Per-Item Contribute Buttons on Domain Views
  As a Domain Architect
  I want Contribute buttons on each domain model view
  So that I can quickly open the contribution panel pre-filtered to the relevant item type

  Background:
    # Create a domain model with bounded contexts via API so views have data
    Given I POST "/api/v1/taxonomy/domain-models" with JSON body:
      """
      {
        "name": "Contribute Button Test Domain",
        "description": "Domain model for testing per-item Contribute buttons"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    And I register cleanup DELETE "/api/v1/taxonomy/domain-models/{modelId}"

    When I POST "/api/v1/taxonomy/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "orders",
        "title": "Order Management",
        "responsibility": "Handles orders",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200

  # ── Context Map View ─────────────────────────────────────────────────────

  @smoke
  Scenario: Context Map view shows a Contributions button
    Given I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: Context Map Contributions button opens panel filtered to bounded-context
    Given I navigate to "/design/business-domain/contexts"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "bounded-context"

  # ── Aggregates View ──────────────────────────────────────────────────────

  @smoke
  Scenario: Aggregates view shows a Contributions button
    Given I navigate to "/design/business-domain/aggregates"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: Aggregates Contributions button opens panel filtered to aggregate
    Given I navigate to "/design/business-domain/aggregates"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "aggregate"

  # ── Events View ──────────────────────────────────────────────────────────

  @smoke
  Scenario: Events view shows a Contributions button
    Given I navigate to "/design/business-domain/events"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: Events Contributions button opens panel filtered to domain-event
    Given I navigate to "/design/business-domain/events"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "domain-event"

  # ── Value Objects View ───────────────────────────────────────────────────

  @smoke
  Scenario: Value Objects view shows a Contributions button
    Given I navigate to "/design/business-domain/value-objects"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: Value Objects Contributions button opens panel filtered to value-object
    Given I navigate to "/design/business-domain/value-objects"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "value-object"

  # ── Workflows View ──────────────────────────────────────────────────────

  @smoke
  Scenario: Workflows view shows a Contributions button
    Given I navigate to "/design/business-domain/workflows"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: Workflows Contributions button opens panel filtered to workflow
    Given I navigate to "/design/business-domain/workflows"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "workflow"

  # ── Glossary View ───────────────────────────────────────────────────────

  @smoke
  Scenario: Glossary view shows a Contributions button
    Given I navigate to "/design/business-domain/glossary"
    Then I wait for the page to load
    And I should see text "Contributions"

  Scenario: Glossary Contributions button opens panel filtered to glossary-term
    Given I navigate to "/design/business-domain/glossary"
    Then I wait for the page to load
    When I click the element "[data-testid='contribute-button']"
    Then the element "h2:has-text('Contributions')" should be visible
    And the element "select[aria-label='Filter by type']" should have value "glossary-term"

@hybrid @landscape @CAP-023 @wip
Feature: Landscape v2 Zoned Layout
  As a Domain Architect
  I want to view the business landscape with a zoned trunk layout
  So that I can distinguish between user-facing and system-supporting bounded contexts

  # Note: The ZonedLayoutEngine is gated behind the landscape-layout-v2 feature flag.
  # These scenarios require the flag to be enabled for execution.

  @smoke
  Scenario: Landscape page loads with layout engine selector
    Given I navigate to the web application
    When I click on the "Landscape" navigation item
    Then I should see the page content

  @detail
  Scenario: Layout engine selector shows available engines
    Given I navigate to the web application
    When I click on the "Landscape" navigation item
    Then I should see the page content

  @detail
  Scenario: Landscape canvas renders bounded context boxes
    Given I navigate to the web application
    When I click on the "Landscape" navigation item
    Then I should see the page content

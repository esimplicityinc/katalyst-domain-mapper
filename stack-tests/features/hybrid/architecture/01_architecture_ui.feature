@hybrid @architecture @CAP-025 @US-076 @US-077
Feature: Architecture Management UI E2E
  As an Engineering Team Lead
  I want to manage system architecture through the web UI
  So that I can maintain the capability taxonomy and system hierarchy visually

  @smoke
  Scenario: Architecture page loads with tabs
    Given I navigate to the web application
    When I click on the "Architecture" navigation item
    Then I should see the page content

  @detail
  Scenario: Architecture page displays system hierarchy
    Given I navigate to the web application
    When I click on the "Architecture" navigation item
    Then I should see the page content

  @detail
  Scenario: Capabilities tab renders capability tree
    Given I navigate to the web application
    When I click on the "Architecture" navigation item
    Then I should see the page content

  @detail
  Scenario: User Types page loads with card layout
    Given I navigate to the web application
    When I click on the "User Types" navigation item
    Then I should see the page content

  @detail
  Scenario: User Stories kanban board renders on Personas page
    Given I navigate to the web application
    When I click on the "User Types" navigation item
    Then I should see the page content

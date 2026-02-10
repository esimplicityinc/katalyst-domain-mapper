@ui @ddd-modeling @ROAD-016
Feature: Interactive Context Map Diagram
  As a Domain Architect (@PER-007)
  I want to see bounded contexts as an interactive SVG diagram
  So that I can visualize system topology and relationships at a glance

  Background:
    Given I navigate to "/mapper/contexts"
    Then I wait for the page to load

  @smoke
  Scenario: SVG context map diagram renders on the page
    Then I should see text "Context Map"
    And I should see text "Diagram"

  Scenario: Bounded contexts render as SVG nodes
    Then I should see text "Scanning"
    And I should see text "Governance"
    And I should see text "Logging"

  Scenario: Nodes are color-coded by subdomain type
    Then I should see text "Core"
    And I should see text "Supporting"
    And I should see text "Generic"

  Scenario: Legend shows subdomain type colors
    Then I should see text "Legend"
    And I should see text "Core"
    And I should see text "Supporting"
    And I should see text "Generic"

  Scenario: Context map has view toggle between list and diagram
    Then I should see text "Diagram"
    And I should see text "List"

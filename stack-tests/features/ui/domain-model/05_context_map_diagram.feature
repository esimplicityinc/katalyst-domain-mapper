@ui @ddd-modeling @ROAD-016 @wip
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
    And I should see text "No bounded contexts to display"

  Scenario: Context map has view toggle between list and diagram
    Then I should see text "Diagram"
    And I should see text "List"

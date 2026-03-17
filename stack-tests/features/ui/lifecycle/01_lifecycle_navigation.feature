@ui @lifecycle-nav @CAP-018 @US-060 @US-061 @US-062
Feature: Lifecycle Navigation System
  As a Non-Technical Stakeholder (@UT-006)
  I want to navigate documentation organized by delivery lifecycle stages
  So that I can find information in context of where it applies in the delivery process

  @smoke
  Scenario: Sidebar shows lifecycle navigation stages
    When I navigate to "/design"
    Then I wait for the page to load
    Then I should see text "Design"

  Scenario: Strategy stage is navigable
    When I navigate to "/strategy"
    Then I wait for the page to load
    Then I should see text "Strategy"

  Scenario: Organization section is navigable
    When I navigate to "/organization"
    Then I wait for the page to load
    Then I should see text "Organization"

  Scenario: Design stage shows business domain navigation
    When I navigate to "/design"
    Then I wait for the page to load
    Then I should see text "Business Domain"

  Scenario: Legacy paths redirect to new lifecycle paths
    When I navigate to "/reports"
    Then I wait for the page to load
    Then the URL should contain "/strategy/foe-projects"

Feature: Organization Intelligence Navigation (ROAD-049)
  As a user of the Katalyst Domain Mapper web application
  I want to navigate through Organization intelligence views in the sidebar
  So that I can access team, people, and adoption information

  Background:
    Given the Katalyst web application is running on "http://localhost:3002"

  # ============================================================
  # Organization Section - Sidebar Navigation
  # ============================================================

  @ui @ROAD-049 @smoke @navigation @organization
  Scenario: Homepage displays Organization navigation section
    When I navigate to the web app homepage
    Then I should see "Organization" navigation item

  @ui @ROAD-049 @navigation @organization
  Scenario: Organization section shows child navigation items
    Given I am on the web app homepage
    Then I should see "Overview" navigation item
    And I should see "Teams" navigation item
    And I should see "People" navigation item
    And I should see "Adoption" navigation item

  # ============================================================
  # Organization Landing Page
  # ============================================================

  @ui @ROAD-049 @navigation @organization
  Scenario: User navigates to Organization landing page
    Given I am on the web app homepage
    When I click the "Organization" navigation item
    Then I should see the Organization landing page

  @ui @ROAD-049 @content @organization
  Scenario: Organization landing page shows tool cards
    When I navigate to "/organization"
    Then I should see "Organization Map" on the page
    And I should see "Teams" on the page
    And I should see "People" on the page
    And I should see "Adoption Heatmap" on the page

  # ============================================================
  # Organization Child Pages
  # ============================================================

  @ui @ROAD-049 @navigation @organization @teams
  Scenario: User navigates to Teams page
    Given I am on the web app homepage
    When I navigate to "/organization/teams"
    Then I should see the Teams page
    And I should see "Teams" on the page

  @ui @ROAD-049 @navigation @organization @people
  Scenario: User navigates to People page
    Given I am on the web app homepage
    When I navigate to "/organization/people"
    Then I should see the People page
    And I should see "People" on the page

  @ui @ROAD-049 @navigation @organization @adoption
  Scenario: User navigates to Adoption Heatmap page
    Given I am on the web app homepage
    When I navigate to "/organization/adoption"
    Then I should see the Adoption Heatmap page
    And I should see "Adoption Heatmap" on the page

  # ============================================================
  # Value Streams Section - Under Strategy
  # ============================================================

  @ui @ROAD-049 @navigation @strategy @value-streams
  Scenario: Strategy section shows Value Streams navigation items
    Given I am on the web app homepage
    Then I should see "User Type Journeys" navigation item
    And I should see "Outcome Traceability" navigation item

  @ui @ROAD-049 @navigation @strategy @value-streams
  Scenario: User navigates to User Type Journeys page
    Given I am on the web app homepage
    When I navigate to "/strategy/value-streams/journeys"
    Then I should see the User Type Journeys page
    And I should see "User Type Journey" on the page

  @ui @ROAD-049 @navigation @strategy @value-streams
  Scenario: User navigates to Outcome Traceability page
    Given I am on the web app homepage
    When I navigate to "/strategy/value-streams/outcomes"
    Then I should see the Outcome Traceability page
    And I should see "Outcome Traceability" on the page

  # ============================================================
  # Strategy Landing Page - Value Streams Cards
  # ============================================================

  @ui @ROAD-049 @content @strategy @value-streams
  Scenario: Strategy landing page shows Value Streams section
    When I navigate to "/strategy"
    Then I should see "Value Streams" on the page
    And I should see "User Type Journeys" on the page
    And I should see "Outcome Traceability" on the page

  # ============================================================
  # Direct URL Access
  # ============================================================

  @ui @ROAD-049 @smoke @direct-access
  Scenario: Direct URLs to Organization pages work
    When I navigate directly to "http://localhost:3002/organization"
    Then the page should load successfully
    And I should not see a 404 error
    When I navigate directly to "http://localhost:3002/organization/teams"
    Then the page should load successfully
    When I navigate directly to "http://localhost:3002/organization/people"
    Then the page should load successfully
    When I navigate directly to "http://localhost:3002/organization/adoption"
    Then the page should load successfully

  @ui @ROAD-049 @smoke @direct-access
  Scenario: Direct URLs to Value Streams pages work
    When I navigate directly to "http://localhost:3002/strategy/value-streams/journeys"
    Then the page should load successfully
    And I should not see a 404 error
    When I navigate directly to "http://localhost:3002/strategy/value-streams/outcomes"
    Then the page should load successfully

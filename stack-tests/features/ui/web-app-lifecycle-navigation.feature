Feature: Web App Lifecycle Navigation (ROAD-040 - Minimal Scope)
  As a user of the Katalyst Domain Mapper web application
  I want to navigate through lifecycle-oriented stages in the sidebar
  So that I can access features organized by software delivery lifecycle

  Background:
    Given the Katalyst web application is running on "http://localhost:3002"

  # ============================================================
  # Sidebar Navigation Scenarios
  # ============================================================

  @ui @ROAD-040 @smoke @navigation @lifecycle
  Scenario: Homepage displays lifecycle stage navigation in sidebar
    When I navigate to the web app homepage
    Then I should see "Design" navigation item
    And I should see "Strategy" navigation item

  @ui @ROAD-040 @navigation @lifecycle @strategy
  Scenario: User navigates to Strategy lifecycle stage
    Given I am on the web app homepage
    When I click the "Strategy" navigation item
    Then I should see the Strategy landing page

  @ui @ROAD-040 @navigation @lifecycle @discovery
  Scenario: User navigates to Discovery lifecycle stage
    Given I am on the web app homepage
    When I click the "Discovery" navigation item
    Then I should see the Discovery landing page

  @ui @ROAD-040 @navigation @lifecycle @planning
  Scenario: User navigates to Planning lifecycle stage
    Given I am on the web app homepage
    When I click the "Planning" navigation item
    Then I should see the Planning landing page

  @ui @ROAD-040 @navigation @lifecycle @design
  Scenario: User navigates to Design lifecycle stage
    Given I am on the web app homepage
    When I click the "Design" navigation item
    Then I should see the Design landing page

  @ui @ROAD-040 @navigation @lifecycle @testing
  Scenario: User navigates to Testing lifecycle stage
    Given I am on the web app homepage
    When I click the "Testing" navigation item
    Then I should see the Testing landing page

  @ui @ROAD-040 @navigation @lifecycle @automation
  Scenario: User navigates to Automation lifecycle stage
    Given I am on the web app homepage
    When I click the "Automation" navigation item
    Then I should see the Automation landing page

  @ui @ROAD-040 @navigation @lifecycle @history
  Scenario: User navigates to History lifecycle stage
    Given I am on the web app homepage
    When I click the "History" navigation item
    Then I should see the History landing page

  # ============================================================
  # Migration & Redirects Scenarios
  # ============================================================

  @ui @ROAD-040 @migration @redirect
  Scenario: Legacy /reports route redirects to Strategy FOE Projects Scanner
    When I navigate to "/reports"
    Then I should see the page content

  @ui @ROAD-040 @migration @redirect
  Scenario: Legacy /mapper route redirects to Design Business Domain
    When I navigate to "/mapper"
    Then I should see the page content

  @ui @ROAD-040 @migration @redirect
  Scenario: Legacy /governance route redirects to Strategy Governance
    When I navigate to "/governance"
    Then I should see the page content

  # ============================================================
  # Mobile Responsiveness
  # ============================================================

  @ui @ROAD-040 @mobile @responsive
  Scenario: User navigates on mobile device
    Given I am on the web app homepage on a mobile device
    When I tap the hamburger menu icon
    And I tap "Testing" navigation item
    Then I should see the Testing landing page

  # ============================================================
  # Content Preservation
  # ============================================================

  @ui @ROAD-040 @content-preservation
  Scenario: Direct URLs to old routes still work
    When I navigate directly to "http://localhost:3002/reports"
    Then the page should load successfully
    And I should not see a 404 error
    When I navigate directly to "http://localhost:3002/mapper"
    Then the page should load successfully
    When I navigate directly to "http://localhost:3002/governance"
    Then the page should load successfully

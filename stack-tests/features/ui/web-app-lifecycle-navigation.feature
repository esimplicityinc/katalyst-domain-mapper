Feature: Web App Lifecycle Navigation (ROAD-040 - Minimal Scope)
  As a user of the Katalyst Domain Mapper web application
  I want to navigate through 7 lifecycle-oriented stages
  So that I can access features organized by software delivery lifecycle

  Background:
    Given the Katalyst web application is running on "http://localhost:3002"

  # ============================================================
  # Navigation Restructure Scenarios (7 scenarios)
  # ============================================================

  @ui @ROAD-040 @smoke @navigation @lifecycle
  Scenario: Homepage displays 7 lifecycle stage navigation
    When I navigate to the web app homepage
    Then I should see 7 lifecycle stages in the navigation sidebar
    And I should see "Strategy" navigation item
    And I should see "Discovery" navigation item
    And I should see "Planning" navigation item
    And I should see "Design" navigation item
    And I should see "Testing" navigation item
    And I should see "Automation" navigation item
    And I should see "History" navigation item

  @ui @ROAD-040 @navigation @lifecycle @strategy
  Scenario: User navigates to Strategy lifecycle stage
    Given I am on the web app homepage
    When I click the "Strategy" navigation item
    Then I should navigate to "/strategy"
    And I should see the Strategy landing page
    And the "Strategy" navigation item should be highlighted as active

  @ui @ROAD-040 @navigation @lifecycle @discovery
  Scenario: User navigates to Discovery lifecycle stage
    Given I am on the web app homepage
    When I click the "Discovery" navigation item
    Then I should navigate to "/discovery"
    And I should see the Discovery landing page
    And the "Discovery" navigation item should be highlighted as active

  @ui @ROAD-040 @navigation @lifecycle @planning
  Scenario: User navigates to Planning lifecycle stage
    Given I am on the web app homepage
    When I click the "Planning" navigation item
    Then I should navigate to "/planning"
    And I should see the Planning landing page
    And the "Planning" navigation item should be highlighted as active

  @ui @ROAD-040 @navigation @lifecycle @design
  Scenario: User navigates to Design lifecycle stage
    Given I am on the web app homepage
    When I click the "Design" navigation item
    Then I should navigate to "/design"
    And I should see the Design landing page
    And the "Design" navigation item should be highlighted as active

  @ui @ROAD-040 @navigation @lifecycle @testing
  Scenario: User navigates to Testing lifecycle stage
    Given I am on the web app homepage
    When I click the "Testing" navigation item
    Then I should navigate to "/testing"
    And I should see the Testing landing page
    And the "Testing" navigation item should be highlighted as active

  @ui @ROAD-040 @navigation @lifecycle @automation
  Scenario: User navigates to Automation lifecycle stage
    Given I am on the web app homepage
    When I click the "Automation" navigation item
    Then I should navigate to "/automation"
    And I should see the Automation landing page
    And the "Automation" navigation item should be highlighted as active

  @ui @ROAD-040 @navigation @lifecycle @history
  Scenario: User navigates to History lifecycle stage
    Given I am on the web app homepage
    When I click the "History" navigation item
    Then I should navigate to "/history"
    And I should see the History landing page
    And the "History" navigation item should be highlighted as active

  # ============================================================
  # Mobile Responsiveness Scenarios (3 scenarios)
  # ============================================================

  @ui @ROAD-040 @mobile @responsive
  Scenario: Mobile navigation displays hamburger menu
    Given I am on the web app homepage on a mobile device
    Then I should see a hamburger menu icon
    And the navigation sidebar should be hidden by default

  @ui @ROAD-040 @mobile @responsive
  Scenario: User opens mobile navigation menu
    Given I am on the web app homepage on a mobile device
    When I tap the hamburger menu icon
    Then the navigation sidebar should slide open
    And I should see all 7 lifecycle stages
    When I tap outside the sidebar
    Then the navigation sidebar should close

  @ui @ROAD-040 @mobile @responsive
  Scenario: User navigates on mobile device
    Given I am on the web app homepage on a mobile device
    When I tap the hamburger menu icon
    And I tap "Testing" navigation item
    Then I should navigate to "/testing"
    And the navigation sidebar should automatically close
    And the mobile header should display the current section

  # ============================================================
  # Accessibility Scenarios (5 scenarios)
  # ============================================================

  @ui @ROAD-040 @a11y @keyboard-nav
  Scenario: Keyboard navigation through lifecycle stages
    Given I am on the web app homepage
    Then all navigation items should be keyboard accessible
    When I focus on the navigation
    And I press Tab repeatedly
    Then focus should move through navigation items

  @ui @ROAD-040 @a11y @screen-reader
  Scenario: Screen reader announces navigation structure
    Given I am on the web app homepage with screen reader enabled
    When I navigate to the sidebar navigation
    Then the screen reader should announce "Main navigation"
    And each navigation item should have a descriptive label
    And the active navigation item should be announced as "current page"

  @ui @ROAD-040 @a11y @aria-labels
  Scenario: Navigation items have proper ARIA attributes
    Given I am on the web app homepage
    Then each navigation item should have an "aria-label" attribute
    And the hamburger menu button should have "aria-label" set to "Open sidebar menu"
    And the close button should have "aria-label" set to "Close sidebar"
    And the navigation should have "role" set to "navigation"

  @ui @ROAD-040 @a11y @focus-visible
  Scenario: Focus indicators are clearly visible
    Given I am on the web app homepage
    When I use keyboard navigation
    Then focused elements should display a clear focus ring
    And the focus ring should meet WCAG 2.1 AA contrast requirements
    And focus should never be lost or hidden

  @ui @ROAD-040 @a11y @wcag
  Scenario: Navigation meets WCAG 2.1 AA compliance
    Given I am on the web app homepage
    When I run accessibility checks on the navigation
    Then there should be no WCAG 2.1 AA violations
    And all interactive elements should be keyboard accessible
    And all text should meet minimum contrast ratios (4.5:1 for normal text)

  # ============================================================
  # Migration & Redirects Scenarios (3 scenarios)
  # ============================================================

  @ui @ROAD-040 @migration @redirect
  Scenario: Legacy /reports route redirects to Strategy FOE Scanner
    When I navigate to "/reports"
    Then I should be automatically redirected to "/strategy/foe-scanner"
    And I should see the Flow Optimized Scanner page

  @ui @ROAD-040 @migration @redirect
  Scenario: Legacy /mapper route redirects to Design Business Domain
    When I navigate to "/mapper"
    Then I should be automatically redirected to "/design/business-domain"
    And I should see the Business Domain page

  @ui @ROAD-040 @migration @redirect
  Scenario: Legacy /governance route redirects to Strategy Governance Dashboard
    When I navigate to "/governance"
    Then I should be automatically redirected to "/strategy/governance"
    And I should see the Governance Dashboard page

  # ============================================================
  # Performance Scenarios (2 scenarios)
  # ============================================================

  @ui @ROAD-040 @performance @load-time
  Scenario: Navigation loads quickly
    Given I am on the web app homepage
    When I measure the navigation render time
    Then the navigation should be visible within 300ms
    And the First Contentful Paint should be less than 1.5 seconds

  @ui @ROAD-040 @performance @interaction
  Scenario: Navigation interactions are responsive
    Given I am on the web app homepage
    When I click any navigation item
    Then the route should change within 100ms
    And the active state should update immediately
    And there should be no visible lag or delay

  # ============================================================
  # Content Preservation Scenarios (3 scenarios)
  # ============================================================

  @ui @ROAD-040 @content-preservation
  Scenario: Existing pages remain accessible through new navigation
    Given I am on the web app homepage
    When I navigate to "Strategy" lifecycle stage
    Then I should see the FOE Scanner and Governance Dashboard tools
    When I navigate to "Design" lifecycle stage
    Then I should see the Business Domain tool

  @ui @ROAD-040 @content-preservation
  Scenario: No functionality is lost in migration
    Given I am on the web app homepage
    When I navigate to "/strategy/foe-scanner"
    Then I should be able to upload a scan report
    When I navigate to "/design/business-domain"
    Then I should be able to view domain models
    When I navigate to "/strategy/governance"
    Then I should be able to view governance metrics

  @ui @ROAD-040 @content-preservation
  Scenario: Direct URLs to old routes still work
    When I navigate directly to "http://localhost:3002/reports"
    Then the page should load successfully (with redirect)
    And I should not see a 404 error
    When I navigate directly to "http://localhost:3002/mapper"
    Then the page should load successfully (with redirect to /design/business-domain)
    When I navigate directly to "http://localhost:3002/governance"
    Then the page should load successfully (with redirect)

  # ============================================================
  # Dark Mode Scenarios (2 scenarios)
  # ============================================================

  @ui @ROAD-040 @dark-mode
  Scenario: Dark mode styling applies to navigation
    Given I am on the web app homepage
    When I enable dark mode
    Then the navigation sidebar should have dark mode styling
    And navigation items should be readable in dark mode
    And the active navigation item should be clearly visible in dark mode
    And all icons should be visible in dark mode

  @ui @ROAD-040 @dark-mode
  Scenario: Navigation respects system dark mode preference
    Given my system is set to dark mode
    When I open the web app homepage
    Then the navigation should automatically use dark mode styling
    And color contrast should meet WCAG 2.1 AA requirements in dark mode

  # ============================================================
  # Edge Cases & Error Handling (2 scenarios)
  # ============================================================

  @ui @ROAD-040 @edge-case
  Scenario: Navigation handles unknown routes gracefully
    When I navigate to "/unknown-route"
    Then I should be redirected to the homepage
    And the navigation should still function correctly

  @ui @ROAD-040 @edge-case @rapid-nav
  Scenario: Rapidly clicking navigation items doesn't cause issues
    Given I am on the web app homepage
    When I rapidly click "Strategy", "Discovery", "Testing" in quick succession
    Then the navigation should handle all clicks gracefully
    And I should end up on the "Testing" page
    And no JavaScript errors should occur
    And the active navigation state should be correct

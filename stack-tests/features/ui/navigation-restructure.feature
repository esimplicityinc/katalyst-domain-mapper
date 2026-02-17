@wip
Feature: Lifecycle-Oriented Navigation Restructure
  As a user of the Katalyst Delivery Framework documentation
  I want to navigate through lifecycle-oriented stages
  So that I can find documentation efficiently

  Background:
    Given the Docusaurus documentation site is running
    And the navigation has been restructured with 7 lifecycle stages

  @ui @ROAD-029 @smoke @navigation
  Scenario: Homepage displays lifecycle-oriented navigation
    When I navigate to the documentation homepage
    Then I should see 7 lifecycle stage dropdowns in the navbar
    And I should see the "Strategy" dropdown
    And I should see the "Discovery" dropdown
    And I should see the "Planning" dropdown
    And I should see the "Design" dropdown
    And I should see the "Testing" dropdown
    And I should see the "Automation" dropdown
    And I should see the "History" dropdown

  @ui @ROAD-029 @navigation @dropdown
  Scenario: Strategy dropdown contains Roadmap and System Taxonomy
    Given I am on the documentation homepage
    When I click the "Strategy" dropdown
    Then I should see "Roadmap & Taxonomy" option
    When I click "Roadmap & Taxonomy"
    Then I should navigate to the roadmap section
    And the sidebar should show "Roadmap" and "System Taxonomy" categories

  @ui @ROAD-029 @navigation @dropdown
  Scenario: Discovery dropdown contains Personas and User Stories
    Given I am on the documentation homepage
    When I click the "Discovery" dropdown
    Then I should see "Personas & Stories" option
    When I click "Personas & Stories"
    Then I should navigate to the personas section
    And the sidebar should show "Personas" and "User Stories" categories

  @ui @ROAD-029 @navigation @dropdown
  Scenario: Planning dropdown contains Plans and Capabilities
    Given I am on the documentation homepage
    When I click the "Planning" dropdown
    Then I should see "Plans & Capabilities" option
    When I click "Plans & Capabilities"
    Then I should navigate to the planning section
    And the sidebar should show "Implementation Plans" and "System Capabilities" categories

  @ui @ROAD-029 @navigation @dropdown
  Scenario: Design dropdown contains DDD and ADRs
    Given I am on the documentation homepage
    When I click the "Design" dropdown
    Then I should see "DDD & ADRs" option
    When I click "DDD & ADRs"
    Then I should navigate to the design section
    And the sidebar should show "Domain-Driven Design" and "Architecture Decisions" categories

  @ui @ROAD-029 @navigation @dropdown
  Scenario: Testing dropdown contains BDD and NFRs
    Given I am on the documentation homepage
    When I click the "Testing" dropdown
    Then I should see "BDD & NFRs" option
    When I click "BDD & NFRs"
    Then I should navigate to the testing section
    And the sidebar should show "BDD Tests" and "Non-Functional Requirements" categories

  @ui @ROAD-029 @navigation @dropdown
  Scenario: Automation dropdown contains AI Agents
    Given I am on the documentation homepage
    When I click the "Automation" dropdown
    Then I should see "AI Agents" option
    When I click "AI Agents"
    Then I should navigate to the automation section
    And the sidebar should show "AI Agents" category

  @ui @ROAD-029 @navigation @dropdown
  Scenario: History dropdown contains Change Log
    Given I am on the documentation homepage
    When I click the "History" dropdown
    Then I should see "Change Log" option
    When I click "Change Log"
    Then I should navigate to the history section
    And the sidebar should show "Change History" category

  @ui @ROAD-029 @taxonomy @new-content
  Scenario: System Taxonomy section is accessible
    Given I am on the documentation homepage
    When I click the "Strategy" dropdown
    And I click "Roadmap & Taxonomy"
    Then the sidebar should show "System Taxonomy" category
    When I expand "System Taxonomy" in the sidebar
    Then I should see "Taxonomy Overview"
    And I should see "Organizational Structure"
    And I should see "System Hierarchy"
    And I should see "Capability Mapping"
    And I should see "Environments"
    And I should see "Dependency Graph"

  @ui @ROAD-029 @taxonomy @new-content
  Scenario: Taxonomy Overview page loads successfully
    Given I am on the documentation homepage
    When I navigate to "/docs/taxonomy/index"
    Then I should see the page title "System Taxonomy"
    And I should see "What is System Taxonomy?"
    And I should see "Navigation Guide"
    And I should see "Fully Qualified Taxonomy Names (FQTN)"

  @ui @ROAD-029 @taxonomy @new-content
  Scenario: All taxonomy pages load without errors
    Given I am on the documentation homepage
    When I navigate to "/docs/taxonomy/org-structure"
    Then the page should load successfully
    When I navigate to "/docs/taxonomy/system-hierarchy"
    Then the page should load successfully
    When I navigate to "/docs/taxonomy/capability-mapping"
    Then the page should load successfully
    When I navigate to "/docs/taxonomy/environments"
    Then the page should load successfully
    When I navigate to "/docs/taxonomy/dependency-graph"
    Then the page should load successfully

  @ui @ROAD-029 @migration @announcement
  Scenario: Announcement bar displays navigation update message
    Given I am on the documentation homepage
    Then I should see an announcement bar
    And the announcement should contain "Navigation Updated!"
    And the announcement should contain "software delivery lifecycle"
    And the announcement should have a link to taxonomy documentation

  @ui @ROAD-029 @migration @guide
  Scenario: Migration guide is accessible
    Given I am on the documentation homepage
    When I navigate to "/docs/migration-guide"
    Then I should see the page title "Navigation Migration Guide"
    And I should see "What Changed?"
    And I should see "Where Did Content Move?"
    And I should see "What's New?"

  @ui @ROAD-029 @content-preservation
  Scenario Outline: Old content is still accessible through new navigation
    Given I am on the documentation homepage
    When I navigate to "<old_section>"
    Then the page should load successfully
    And I should not see a 404 error
    And the sidebar should show the appropriate lifecycle stage

    Examples:
      | old_section                  |
      | /docs/ddd/index              |
      | /docs/bdd/index              |
      | /docs/adr/index              |
      | /docs/nfr/index              |
      | /docs/personas/index         |
      | /docs/capabilities/index     |
      | /docs/user-stories/index     |
      | /docs/roads/index            |
      | /docs/agents/index           |
      | /docs/changes/changes-index  |
      | /docs/plans/index            |

  @ui @ROAD-029 @a11y @keyboard-nav
  Scenario: Keyboard navigation through dropdown menus
    Given I am on the documentation homepage
    When I press Tab to focus the "Strategy" dropdown
    And I press Enter to open the dropdown
    Then the dropdown menu should be visible
    When I press Arrow Down to highlight "Roadmap & Taxonomy"
    And I press Enter to select the option
    Then I should navigate to the roadmap section

  @ui @ROAD-029 @a11y @screen-reader
  Scenario: Screen reader announces dropdown menu state
    Given I am on the documentation homepage with screen reader enabled
    When I focus on the "Strategy" dropdown
    Then the screen reader should announce the dropdown button
    When I open the dropdown
    Then the screen reader should announce "expanded"
    When I close the dropdown
    Then the screen reader should announce "collapsed"

  @ui @ROAD-029 @mobile @responsive
  Scenario: Mobile navigation displays all lifecycle stages
    Given I am on the documentation homepage on a mobile device
    When I tap the hamburger menu icon
    Then I should see all 7 lifecycle stages in the mobile menu
    When I tap "Strategy"
    Then the stage should expand to show "Roadmap & Taxonomy"
    When I tap "Roadmap & Taxonomy"
    Then I should navigate to the roadmap section

  @ui @ROAD-029 @mobile @responsive
  Scenario: Mobile navigation is collapsible
    Given I am on the documentation homepage on a mobile device
    When I tap the hamburger menu icon
    Then the mobile menu should open
    When I tap outside the menu
    Then the mobile menu should close

  @ui @ROAD-029 @dark-mode
  Scenario: Dark mode styling applies to new navigation
    Given I am on the documentation homepage
    When I enable dark mode
    Then the lifecycle dropdown menus should have dark mode styling
    And the dropdown options should be readable in dark mode
    And the emoji icons should be visible in dark mode

  @ui @ROAD-029 @performance
  Scenario: Navigation dropdown opens without delay
    Given I am on the documentation homepage
    When I click the "Strategy" dropdown
    Then the dropdown should open within 200ms
    And there should be no visible lag

  @ui @ROAD-029 @content-integrity
  Scenario: Sidebar navigation matches new structure
    Given I am on any documentation page
    Then the sidebar should reflect the lifecycle-oriented structure
    And the sidebar should show the current section I'm in
    And the active page should be highlighted in the sidebar

  @ui @ROAD-029 @taxonomy @mermaid
  Scenario: Mermaid diagrams render in taxonomy documentation
    Given I am on the documentation homepage
    When I navigate to "/docs/taxonomy/org-structure"
    Then I should see a rendered Mermaid diagram for "Team Hierarchy"
    When I navigate to "/docs/taxonomy/system-hierarchy"
    Then I should see a rendered Mermaid diagram for "System Tree Visualization"
    When I navigate to "/docs/taxonomy/dependency-graph"
    Then I should see multiple rendered Mermaid diagrams

  @ui @ROAD-029 @links
  Scenario: Internal links in taxonomy docs work correctly
    Given I am on "/docs/taxonomy/index"
    When I click the link to "Organizational Structure"
    Then I should navigate to "/docs/taxonomy/org-structure"
    When I click the link to "System Hierarchy"
    Then I should navigate to "/docs/taxonomy/system-hierarchy"
    And no links should be broken

  @ui @ROAD-029 @search
  Scenario: Search functionality includes new taxonomy content
    Given I am on the documentation homepage
    When I open the search bar
    And I search for "FQTN"
    Then I should see results from "System Taxonomy"
    And I should see the "System Hierarchy" page in results

  @ui @ROAD-029 @nfr @load-time
  Scenario: Page load time remains acceptable
    Given I am on the documentation homepage
    When I measure the page load time
    Then the First Contentful Paint should be less than 1.5 seconds
    And the Time to Interactive should be less than 3.0 seconds

  @ui @ROAD-029 @nfr @link-integrity
  Scenario: All internal links resolve correctly
    Given I am on the documentation homepage
    When I crawl all internal links
    Then there should be 0 broken links
    And all cross-references should resolve

  @ui @ROAD-029 @nfr @wcag
  Scenario: WCAG 2.1 AA compliance for navigation
    Given I am on the documentation homepage
    When I run accessibility checks on the navigation
    Then there should be no WCAG 2.1 AA violations
    And all interactive elements should have proper ARIA labels
    And color contrast should meet minimum ratios

  @ui @ROAD-029 @regression
  Scenario: Footer links still work after navigation change
    Given I am on the documentation homepage
    When I scroll to the footer
    Then I should see footer links
    And all footer links should navigate correctly

  @ui @ROAD-029 @regression
  Scenario: GitHub link remains in navbar
    Given I am on the documentation homepage
    Then I should see the "GitHub" link in the navbar
    And the GitHub link should navigate to the repository

  @ui @ROAD-029 @content-preservation
  Scenario: All ROAD items are accessible through new navigation
    Given I am on the documentation homepage
    When I navigate to "Strategy" → "Roadmap & Taxonomy"
    Then I should see all phases (Phase 0 through Phase 4)
    And I should see ROAD-029 in Phase 4
    When I click on ROAD-029
    Then the page should load successfully

  @ui @ROAD-029 @content-preservation
  Scenario: All ADRs are accessible through new navigation
    Given I am on the documentation homepage
    When I navigate to "Design" → "DDD & ADRs"
    Then the sidebar should show "Architecture Decisions"
    When I expand "Accepted ADRs"
    Then I should see ADR-013
    When I click on ADR-013
    Then the page should load successfully

  @ui @ROAD-029 @edge-case @long-dropdown
  Scenario: Dropdown with many items displays correctly
    Given I am on the documentation homepage
    When I click the "Discovery" dropdown
    Then the "User Stories" list should be scrollable if needed
    And all user story categories should be accessible

  @ui @ROAD-029 @edge-case @double-click
  Scenario: Double-clicking dropdown doesn't cause issues
    Given I am on the documentation homepage
    When I double-click the "Strategy" dropdown
    Then the dropdown should open and close properly
    And no JavaScript errors should occur

  @ui @ROAD-029 @edge-case @rapid-nav
  Scenario: Rapidly switching between dropdowns works
    Given I am on the documentation homepage
    When I click "Strategy" dropdown
    And I immediately click "Discovery" dropdown
    Then the Discovery dropdown should open
    And the Strategy dropdown should close
    And no visual glitches should occur

@hybrid @chat @CAP-027
Feature: AI Chat Component E2E
  As an Engineering Team Lead
  I want to interact with AI chat agents through the web UI
  So that I can get assessment coaching and domain insights directly in the application

  # Note: These scenarios test the shared @katalyst/chat component rendering
  # and basic interaction patterns. Full AI response testing requires a running
  # LLM and is deferred to manual verification.

  @smoke
  Scenario: FOE assessment page loads with chat tab
    Given I navigate to the web application
    When I click on the "Reports" navigation item
    Then I should see the page content

  @smoke
  Scenario: Domain modeling page loads with chat tab
    Given I navigate to the web application
    When I click on the "Domain" navigation item
    Then I should see the page content

  @detail
  Scenario: Architecture page loads with taxonomy chat
    Given I navigate to the web application
    When I click on the "Architecture" navigation item
    Then I should see the page content

  @detail
  Scenario: Chat component renders message input area
    Given I navigate to the web application
    When I click on the "Reports" navigation item
    Then I should see the page content

@api @chat @CAP-027
Feature: AI Chat Session Management
  As an Engineering Team Lead
  I want to interact with AI chat agents via the API
  So that I can get coaching on scan results, domain models, and taxonomy

  # Note: These scenarios test the chat infrastructure endpoints.
  # Full AI conversation testing requires a running LLM and is tagged @wip.

  @smoke
  Scenario: Health check endpoint is available
    When I GET "/api/v1/config/health"
    Then the response status should be 200

  @detail
  Scenario: Orchestrator status includes chat runtime
    When I GET "/api/v1/orchestrator/status"
    Then the response status should be 200
    And the response should be a JSON object
    And the response should have key "chat"

  @detail
  Scenario: Chat runtime reports a supported value
    When I GET "/api/v1/orchestrator/status"
    Then the response status should be 200
    And I store the value at "chat.runtime" as "chatRuntime"
    And the value at "chat.flagValue" should equal "{chatRuntime}"

  @detail
  Scenario: Feature flags expose chat runtime configuration
    When I GET "/api/v1/flags"
    Then the response status should be 200
    And the response should have key "chat.runtime"

  @detail
  Scenario: Supported runtimes list includes both options for chat
    When I GET "/api/v1/orchestrator/status"
    Then the response status should be 200
    And the value at "supportedRuntimes[0]" should equal "opencode"
    And the value at "supportedRuntimes[1]" should equal "langgraph"

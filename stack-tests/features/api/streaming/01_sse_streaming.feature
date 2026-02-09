@api @sse-streaming @ROAD-015 @CAP-008 @wip
Feature: SSE Streaming for Agent Responses
  As a Platform Engineer
  I want to stream agent responses via Server-Sent Events
  So that clients receive output immediately as the agent generates it

  Background:
    Given I am authenticated as an admin via API

  @smoke @stream
  Scenario: Open an SSE stream for a scan session
    # Start a scan to get a session ID
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo"
      }
      """
    Then the response status should be 202
    And I store the value at "sessionId" as "sessionId"

    # Open SSE stream
    When I GET "/api/v1/stream/{sessionId}"
    Then the response content type should contain "text/event-stream"

  @events @chunk
  Scenario: Receive agent chunk events
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo"
      }
      """
    Then the response status should be 202
    And I store the value at "sessionId" as "sessionId"

    When I subscribe to SSE stream "/api/v1/stream/{sessionId}"
    Then I should receive an SSE event of type "agent:chunk" within 30 seconds
    And the event data should contain "content"

  @events @status
  Scenario: Receive agent status transition events
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo"
      }
      """
    Then the response status should be 202
    And I store the value at "sessionId" as "sessionId"

    When I subscribe to SSE stream "/api/v1/stream/{sessionId}"
    Then I should receive an SSE event of type "agent:status" within 60 seconds
    And the event data should contain "phase"

  @events @complete
  Scenario: Receive agent complete event with final result
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo"
      }
      """
    Then the response status should be 202
    And I store the value at "sessionId" as "sessionId"

    When I subscribe to SSE stream "/api/v1/stream/{sessionId}"
    Then I should eventually receive an SSE event of type "agent:complete"
    And the event data should contain "result"

  @reconnection
  Scenario: Reconnect and resume from last event ID
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo"
      }
      """
    Then the response status should be 202
    And I store the value at "sessionId" as "sessionId"

    When I subscribe to SSE stream "/api/v1/stream/{sessionId}"
    And I receive an SSE event and store its ID as "lastEventId"
    And I disconnect from the SSE stream
    And I subscribe to SSE stream "/api/v1/stream/{sessionId}" with Last-Event-ID "{lastEventId}"
    Then I should receive SSE events starting after "{lastEventId}"

  @heartbeat
  Scenario: Receive heartbeat keep-alive events
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo"
      }
      """
    Then the response status should be 202
    And I store the value at "sessionId" as "sessionId"

    When I subscribe to SSE stream "/api/v1/stream/{sessionId}"
    Then I should receive a heartbeat event within 20 seconds

  @error
  Scenario: Receive error event for invalid session
    When I subscribe to SSE stream "/api/v1/stream/nonexistent-session"
    Then I should receive an SSE event of type "agent:error"
    And the event data should contain "message"

  @validation
  Scenario: Reject unauthenticated SSE connections
    When I GET "/api/v1/stream/any-session" without authentication
    Then the response status should be 401

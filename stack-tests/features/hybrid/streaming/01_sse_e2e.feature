@hybrid @sse-streaming @ROAD-015 @CAP-008 @CAP-001 @wip
Feature: SSE Streaming End-to-End
  As an Engineering Team Lead
  I want to see live agent output in the web UI during a scan
  So that I get immediate feedback instead of waiting for the full scan to complete

  @e2e @live-output
  Scenario: Stream scan output to UI in real-time
    # API: Start a scan
    Given I am authenticated as an admin via API
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo"
      }
      """
    Then the response status should be 202
    And I store the value at "sessionId" as "sessionId"

    # UI: Navigate to the live scan view
    Given I navigate to "/scans/{sessionId}/live"
    Then I should see text "Scanning"

    # UI: Verify streaming output appears
    Then I should see text "Agent" within 30 seconds
    And the element ".stream-output" should be visible
    And I should see text that updates dynamically

  @e2e @progress
  Scenario: View scan progress indicator and final report
    # API: Start a scan
    Given I am authenticated as an admin via API
    When I POST "/api/v1/scans" with JSON body:
      """
      {
        "repositoryUrl": "https://github.com/example/repo"
      }
      """
    Then the response status should be 202
    And I store the value at "sessionId" as "sessionId"

    # UI: Navigate to the live scan view
    Given I navigate to "/scans/{sessionId}/live"

    # UI: Verify progress indicator shows agent phases
    Then I should see a progress indicator
    And the progress indicator should update as agents complete

    # UI: Verify final report renders on completion
    Then I should eventually see text "Report"
    And I should see text "Understanding"
    And I should see text "Feedback"
    And I should see text "Confidence"

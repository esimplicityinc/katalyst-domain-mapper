@api @gov-validation @ROAD-002 @CAP-002 @wip
Feature: Governance State Machine Transitions
  As an AI Agent
  I want the API to enforce valid governance state transitions
  So that road items only advance when governance gates are satisfied

  @transitions
  Scenario Outline: Validate governance state machine transitions
    When I POST "/api/v1/governance/validate-transition" with JSON body:
      """
      {
        "roadId": "ROAD-TEST",
        "currentStatus": "<current>",
        "targetStatus": "<target>",
        "governance": {
          "adrs": {"validated": <adr_validated>},
          "bdd": {"status": "<bdd_status>"},
          "nfrs": {"status": "<nfr_status>"}
        }
      }
      """
    Then the response status should be <status>

    Examples:
      | current       | target          | adr_validated | bdd_status | nfr_status | status |
      | proposed      | adr_validated   | true          | draft      | pending    | 200    |
      | proposed      | adr_validated   | false         | draft      | pending    | 400    |
      | adr_validated | bdd_pending     | true          | draft      | pending    | 200    |
      | proposed      | bdd_complete    | false         | draft      | pending    | 400    |
      | bdd_complete  | implementing    | true          | approved   | pending    | 200    |
      | implementing  | nfr_validating  | true          | approved   | pending    | 200    |
      | nfr_validating| complete        | true          | approved   | pass       | 200    |
      | nfr_validating| complete        | true          | approved   | fail       | 400    |
      | proposed      | complete        | false         | draft      | pending    | 400    |

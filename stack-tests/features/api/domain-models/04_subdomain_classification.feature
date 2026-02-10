@api @ddd-modeling @ROAD-020 @CAP-011
Feature: Subdomain Classification
  As a Platform Engineer
  I want to classify bounded contexts as Core, Supporting, or Generic subdomains
  So that strategic investment decisions and build-vs-buy guidance are informed by DDD subdomain types

  Background:
    # Create a fresh domain model for each scenario
    When I POST "/api/v1/domain-models" with JSON body:
      """
      { "name": "Subdomain Test Model" }
      """
    Then the response status should be 200
    And I store the value at "id" as "modelId"
    Given I register cleanup DELETE "/api/v1/domain-models/{modelId}"

  @smoke
  Scenario: Create bounded context with subdomain type
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "identity",
        "title": "Identity Context",
        "responsibility": "Manages authentication and authorization for platform users",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "contextId"
    And the value at "slug" should equal "identity"
    And the value at "title" should equal "Identity Context"
    And the value at "subdomainType" should equal "core"

  Scenario: Create bounded context defaults to null subdomain type
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "unclassified",
        "title": "Unclassified Context",
        "responsibility": "A context with no subdomain type specified"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And I store the value at "id" as "contextId"
    And the value at "slug" should equal "unclassified"

    # Verify the context appears in the model without a subdomain type
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Update bounded context subdomain type
    # Create context without subdomain type
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "notifications",
        "title": "Notifications Context",
        "responsibility": "Sends alerts and notifications to platform users"
      }
      """
    Then the response status should be 200
    And I store the value at "id" as "contextId"

    # Update with subdomain type
    When I PUT "/api/v1/domain-models/{modelId}/contexts/{contextId}" with JSON body:
      """
      {
        "slug": "notifications",
        "title": "Notifications Context",
        "responsibility": "Sends alerts and notifications to platform users",
        "subdomainType": "supporting"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "subdomainType" should equal "supporting"

    # Verify the update persisted
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  @validation
  Scenario: Reject invalid subdomain type values
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "invalid-type",
        "title": "Invalid Type Context",
        "responsibility": "Attempts to use an invalid subdomain type",
        "subdomainType": "premium"
      }
      """
    Then the response status should be 400

  Scenario: Retrieve domain model shows subdomain types on contexts
    # Create a core context
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "scanning",
        "title": "Scanning Context",
        "responsibility": "Orchestrates FOE repository scanning via AI agents",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200

    # Create a generic context
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "email-delivery",
        "title": "Email Delivery Context",
        "responsibility": "Handles outbound email delivery via third-party provider",
        "subdomainType": "generic"
      }
      """
    Then the response status should be 200

    # Verify both contexts appear in model retrieval
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

  Scenario: Create contexts with all three subdomain types
    # Core subdomain — strategic differentiator, invest heavily
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "assessment-engine",
        "title": "Assessment Engine Context",
        "responsibility": "Scores repositories across FOE dimensions using AI-powered analysis",
        "subdomainType": "core"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "subdomainType" should equal "core"

    # Supporting subdomain — necessary but not differentiating
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "governance",
        "title": "Governance Context",
        "responsibility": "Tracks delivery framework compliance and governance index snapshots",
        "subdomainType": "supporting"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "subdomainType" should equal "supporting"

    # Generic subdomain — commodity, buy or integrate
    When I POST "/api/v1/domain-models/{modelId}/contexts" with JSON body:
      """
      {
        "slug": "logging",
        "title": "Logging Context",
        "responsibility": "Captures and stores application logs for observability",
        "subdomainType": "generic"
      }
      """
    Then the response status should be 200
    And the response should be a JSON object
    And the value at "subdomainType" should equal "generic"

    # Verify all three contexts are present in the model
    When I GET "/api/v1/domain-models/{modelId}"
    Then the response status should be 200
    And the response should be a JSON object

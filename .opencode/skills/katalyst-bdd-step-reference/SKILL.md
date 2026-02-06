---
name: katalyst-bdd-step-reference
description: Complete reference of all built-in Katalyst BDD step definitions for API, UI, TUI, hybrid, and shared steps. Includes step syntax, parameters, examples, variable interpolation, and cleanup patterns.
license: SEE LICENSE IN LICENSE
compatibility: opencode
metadata:
  framework: katalyst-bdd
  audience: developers
---

# Katalyst BDD Step Reference

## Step Registration

```typescript
import {
  registerApiSteps,
  registerUiSteps,
  registerTuiSteps,
  registerSharedSteps,
} from '@esimplicity/stack-tests/steps';

registerApiSteps(test);      // Auth + HTTP + Assertions
registerUiSteps(test);       // Navigation + Clicks + Forms + Assertions
registerTuiSteps(test);      // Terminal interaction
registerSharedSteps(test);   // Variables + Cleanup
```

---

## API Steps (tag: `@api` or `@hybrid`)

### Authentication

| Step | Description |
|------|-------------|
| `Given I am authenticated as an admin via API` | POST credentials to login endpoint, extract `access_token`, set `Authorization: Bearer <token>` in world.headers. Uses env vars: `DEFAULT_ADMIN_USERNAME` / `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`, `API_AUTH_LOGIN_PATH` |
| `Given I am authenticated as a user via API` | Standard user auth. Uses env vars: `DEFAULT_USER_USERNAME` / `NON_ADMIN_USERNAME`, `DEFAULT_USER_PASSWORD` / `NON_ADMIN_PASSWORD`, `API_AUTH_LOGIN_PATH` |
| `Given I set bearer token from variable {string}` | Set Bearer token from a stored variable. Example: `Given I set bearer token from variable "token"` |

### HTTP Requests

All HTTP steps update the world state with: `lastResponse`, `lastStatus`, `lastText`, `lastJson`, `lastHeaders`, `lastContentType`.

| Step | Description |
|------|-------------|
| `When I GET {string}` | Send GET request. Path supports `{variable}` interpolation. Example: `When I GET "/users/{userId}"` |
| `When I DELETE {string}` | Send DELETE request. Example: `When I DELETE "/users/{userId}"` |
| `When I POST {string} with JSON body:` | Send POST with JSON doc string body. Body supports `{variable}` interpolation |
| `When I PUT {string} with JSON body:` | Send PUT with JSON doc string body |
| `When I PATCH {string} with JSON body:` | Send PATCH with JSON doc string body |

#### HTTP Request Example

```gherkin
When I POST "/users" with JSON body:
  """
  {
    "email": "{email}",
    "name": "Test User",
    "role": "member"
  }
  """
```

### Response Assertions

| Step | Description |
|------|-------------|
| `Then the response status should be {int}` | Assert HTTP status code. Example: `Then the response status should be 201` |
| `Then the response should be a JSON object` | Assert response is a JSON object |
| `Then the response should be a JSON array` | Assert response is a JSON array |
| `Then the value at {string} should equal {string}` | Assert JSONPath value equals expected. Supports `{var}` interpolation |
| `Then the value at {string} should contain {string}` | Assert JSONPath value contains substring |
| `Then the value at {string} should match {string}` | Assert JSONPath value matches regex pattern |
| `And I store the value at {string} as {string}` | Store JSONPath value in a variable |

### JSONPath Syntax

- `prop` -- Direct property: `the value at "email"`
- `prop.nested` -- Nested property: `the value at "user.name"`
- `arr[0]` -- Array index: `the value at "items[0]"`
- `arr[0].prop` -- Combined: `the value at "items[0].id"`

### API Complete Example

```gherkin
@api
Feature: User API

  Background:
    Given I am authenticated as an admin via API

  Scenario: Complete CRUD flow
    Given I generate a UUID and store as "uuid"
    Given I set variable "email" to "test-{uuid}@example.com"

    # Create
    When I POST "/users" with JSON body:
      """
      { "email": "{email}", "name": "Test User", "role": "member" }
      """
    Then the response status should be 201
    And the response should be a JSON object
    And I store the value at "id" as "userId"
    And the value at "email" should equal "{email}"

    # Read
    When I GET "/users/{userId}"
    Then the response status should be 200
    And the value at "name" should equal "Test User"

    # Update
    When I PATCH "/users/{userId}" with JSON body:
      """
      { "name": "Updated User" }
      """
    Then the response status should be 200
    And the value at "name" should equal "Updated User"

    # Delete
    When I DELETE "/users/{userId}"
    Then the response status should be 204

  Scenario: List users
    When I GET "/users"
    Then the response status should be 200
    And the response should be a JSON array

  Scenario: Handle not found
    When I GET "/users/nonexistent-id"
    Then the response status should be 404
```

---

## UI Steps (tag: `@ui` or `@hybrid`)

### Navigation

| Step | Description |
|------|-------------|
| `Given I navigate to {string}` | Go to URL path. Example: `Given I navigate to "/login"` |
| `Given I open {string} page` | Open page |
| `When I go back in the browser` | Browser back |
| `When I reload the page` | Refresh page |

### Clicking

| Step | Description |
|------|-------------|
| `When I click the button {string}` | Click button by accessible name. Example: `When I click the button "Sign In"` |
| `When I click the {string} button` | Click button (alternate syntax). Example: `When I click the "Submit" button` |
| `When I click the link {string}` | Click link by text. Example: `When I click the link "Forgot Password"` |
| `When I click the element {string}` | Click by CSS selector. Example: `When I click the element ".dropdown-toggle"` |

### Form Input

| Step | Description |
|------|-------------|
| `When I fill the field {string} with {string}` | Fill input by label. Example: `When I fill the field "Email" with "test@example.com"` |
| `When I fill in {string} with {string}` | Fill by label (alt syntax). Example: `When I fill in "username" with "testuser"` |
| `When I fill the placeholder {string} with {string}` | Fill by placeholder text |
| `When I select {string} from dropdown {string}` | Select dropdown option. Example: `When I select "Admin" from dropdown "Role"` |
| `When I fill the form:` | Fill multiple fields via data table (see below) |

#### Fill Form Data Table Example

```gherkin
When I fill the form:
  | field    | value            |
  | Email    | test@example.com |
  | Name     | Test User        |
  | Password | secret123        |
```

### Assertions

| Step | Description |
|------|-------------|
| `Then I should see text {string}` | Assert visible text on page |
| `Then the URL should contain {string}` | Assert URL contains string |
| `Then I should be on page {string}` | Assert URL (alt syntax) |
| `Then the element {string} should be visible` | Assert element visible (CSS selector) |
| `Then the element {string} should not be visible` | Assert element hidden |
| `Then the element {string} should have value {string}` | Assert input value |
| `Then the element {string} should be checked` | Assert checkbox checked |
| `Then the element {string} should not be checked` | Assert checkbox unchecked |

### Waiting

| Step | Description |
|------|-------------|
| `Then I wait {string} seconds` | Wait fixed time (avoid in production tests) |
| `Then I wait for the page to load` | Wait for Playwright load states |

### Debugging

| Step | Description |
|------|-------------|
| `When I pause for debugging` | Open Playwright Inspector |
| `Then I log the current URL` | Print current URL to console |
| `Then I print visible text` | Print page text to console |
| `Then I save a screenshot as {string}` | Capture screenshot to file |

### UI Example

```gherkin
@ui
Feature: Login Flow

  Scenario: Successful login
    Given I navigate to "/login"
    When I fill in "username" with "testuser"
    And I fill in "password" with "secret123"
    And I click the button "Sign In"
    Then I should see text "Welcome"
    And the URL should contain "/dashboard"

  Scenario: Form validation
    Given I navigate to "/register"
    When I click the button "Submit"
    Then I should see text "Email is required"
    And the element "#email-error" should be visible
```

---

## TUI Steps (tag: `@tui`)

**Prerequisite:** tmux must be installed (`brew install tmux` on macOS, `sudo apt-get install tmux` on Ubuntu).

| Step | Description |
|------|-------------|
| `When I spawn the terminal with {string}` | Start terminal process with command |
| `When I type {string} in terminal` | Type text into terminal |
| `When I press Enter in terminal` | Press Enter key |
| `When I press {string} in terminal` | Press any key (e.g., `"ArrowDown"`, `"Tab"`, `"Escape"`) |
| `When I send Ctrl+C to terminal` | Send interrupt signal |
| `Then I should see {string} in terminal` | Assert text visible in terminal output |
| `Then the terminal should contain text matching {string}` | Assert regex match in terminal output |
| `Then the terminal output should not be empty` | Assert terminal has produced output |
| `Then the terminal process should exit` | Assert process has ended |
| `Then the terminal process should exit with code {int}` | Assert specific exit code |

### TUI Example

```gherkin
@tui
Feature: CLI Tool

  Scenario: Interactive prompt
    When I spawn the terminal with "node cli.js"
    Then I should see "Enter your name:" in terminal
    When I type "John" in terminal
    And I press Enter in terminal
    Then I should see "Hello, John!" in terminal
    And the terminal process should exit with code 0

  Scenario: Cancel with Ctrl+C
    When I spawn the terminal with "node cli.js"
    Then I should see "Enter your name:" in terminal
    When I send Ctrl+C to terminal
    Then the terminal process should exit
```

---

## Shared Steps (all tags)

### Variable Management

| Step | Description |
|------|-------------|
| `Given I set variable {string} to {string}` | Set a variable. Supports interpolation: `"user-{uuid}@test.com"` |
| `Given I generate a UUID and store as {string}` | Generate UUID v4 and store. Example: `Given I generate a UUID and store as "uniqueId"` |
| `Given I set header {string} to {string}` | Set request header. Supports interpolation. Example: `Given I set header "X-API-Key" to "my-key"` |
| `Then the variable {string} should equal {string}` | Assert variable value |

### Cleanup Registration

| Step | Description |
|------|-------------|
| `Given I register cleanup DELETE {string}` | Register DELETE cleanup. Example: `Given I register cleanup DELETE "/users/{userId}"` |
| `Given I register cleanup POST {string}` | Register POST cleanup |
| `Given I register cleanup PATCH {string}` | Register PATCH cleanup |
| `Given I register cleanup PUT {string}` | Register PUT cleanup |
| `Given I disable cleanup` | Disable automatic cleanup for this scenario |

### Cleanup Behavior

- Cleanup items execute in **reverse order** (LIFO -- last registered runs first)
- Requests are authenticated with admin credentials automatically
- Token is cached across tests; refreshes on 401/403
- Errors are logged but **do not fail** the test
- 404 responses are silently ignored (resource already deleted)
- All cleanup items are attempted even if some fail

### Cleanup Ordering for Parent-Child Resources

```gherkin
# Create parent first
When I POST "/teams" with JSON body: ...
Then I store the value at "id" as "teamId"

# Create child
When I POST "/teams/{teamId}/members" with JSON body: ...
Then I store the value at "id" as "memberId"

# Register cleanup -- child first due to LIFO
Given I register cleanup DELETE "/teams/{teamId}/members/{memberId}"
Given I register cleanup DELETE "/teams/{teamId}"
# Execution: DELETE member first, then DELETE team
```

---

## Variable Interpolation

Variables use `{varName}` syntax and work everywhere:

| Context | Example |
|---------|---------|
| API paths | `When I GET "/users/{userId}"` |
| Request bodies | `"email": "{email}"` |
| Assertions | `Then the value at "id" should equal "{expectedId}"` |
| Headers | `Given I set header "Authorization" to "Bearer {token}"` |
| Cleanup paths | `Given I register cleanup DELETE "/users/{userId}"` |
| Variable values | `Given I set variable "email" to "user-{uuid}@test.com"` |

### Chaining Variables

```gherkin
Given I generate a UUID and store as "uuid"
Given I set variable "email" to "user-{uuid}@test.com"
# Result: email = "user-550e8400-e29b-41d4-a716-446655440000@test.com"
```

---

## Tag Requirements Summary

| Tag | API Steps | UI Steps | TUI Steps | Shared Steps |
|-----|-----------|----------|-----------|--------------|
| `@api` | Yes | No | No | Yes |
| `@ui` | No | Yes | No | Yes |
| `@tui` | No | No | Yes | Yes |
| `@hybrid` | Yes | Yes | No | Yes |

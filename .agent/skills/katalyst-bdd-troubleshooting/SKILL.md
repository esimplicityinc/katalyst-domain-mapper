---
name: katalyst-bdd-troubleshooting
description: Debug and fix common Katalyst BDD issues. Covers element not found errors, authentication failures, timing/synchronization problems, variable interpolation, environment configuration, cleanup behavior, and CI/CD failures.
license: SEE LICENSE IN LICENSE
compatibility: opencode
metadata:
  framework: katalyst-bdd
  audience: developers
---

# Katalyst BDD Troubleshooting Guide

## Quick Diagnosis

| Symptom | Likely Cause | Jump To |
|---------|-------------|---------|
| "Element not found" | Selector mismatch or timing | [Element Not Found](#element-not-found) |
| Authentication fails silently | Missing env vars | [Authentication Failures](#authentication-failures) |
| Variable shows `{varName}` literally | Interpolation issue | [Variable Interpolation](#variable-interpolation-issues) |
| Step not recognized | Wrong tag or missing registration | [Step Not Found](#step-not-found) |
| Cleanup not running | Registration issue | [Cleanup Issues](#cleanup-issues) |
| Tests pass locally, fail in CI | Environment/headless config | [CI/CD Failures](#cicd-failures) |
| Module not found error | Installation issue | [Installation Errors](#installation-errors) |
| JSON parse error in request body | Malformed doc string | [JSON Body Errors](#json-body-errors) |

---

## Element Not Found

### Symptoms
- `Error: locator.click: Error: No element matches selector`
- `Timeout waiting for selector`
- `Element is not visible`

### Solutions

**1. Use accessible names instead of CSS selectors**

```gherkin
# Bad -- fragile CSS selector
When I click the element "#btn-submit-form-1"

# Good -- accessible name
When I click the button "Submit"
```

**2. Check element visibility**

```gherkin
# Debug: check what's on the page
Then I print visible text
Then I save a screenshot as "debug-state.png"
Then I log the current URL
```

**3. Wait for page to load**

```gherkin
Given I navigate to "/dashboard"
Then I wait for the page to load
Then I should see text "Dashboard"
```

**4. Check if element is inside an iframe or shadow DOM**

Playwright's default locators don't pierce iframes. You may need a custom step or adapter.

**5. Verify you're on the right page**

```gherkin
Then the URL should contain "/expected-path"
Then I log the current URL
```

---

## Authentication Failures

### Symptoms
- 401 Unauthorized responses
- Empty or undefined Bearer token
- "Login failed" in test output

### Solutions

**1. Check all required environment variables**

| Variable | Used For |
|----------|----------|
| `DEFAULT_ADMIN_USERNAME` or `DEFAULT_ADMIN_EMAIL` | Admin login |
| `DEFAULT_ADMIN_PASSWORD` | Admin password |
| `DEFAULT_USER_USERNAME` or `NON_ADMIN_USERNAME` | Standard user login |
| `DEFAULT_USER_PASSWORD` or `NON_ADMIN_PASSWORD` | Standard user password |
| `API_AUTH_LOGIN_PATH` | Login endpoint path (e.g., `/auth/login`) |

**2. Verify .env file is loaded**

Create or check your `.env` file:

```env
DEFAULT_ADMIN_USERNAME=admin@example.com
DEFAULT_ADMIN_PASSWORD=adminpass123
DEFAULT_USER_USERNAME=user@example.com
DEFAULT_USER_PASSWORD=userpass123
API_AUTH_LOGIN_PATH=/auth/login
```

**3. Check the login endpoint response format**

The auth adapter expects `access_token` in the JSON response:

```json
{ "access_token": "eyJhbG..." }
```

If your API returns a different field name, create a custom AuthAdapter.

**4. Token caching issues**

Auth tokens are cached. If the token expires mid-test:
- The cleanup system auto-refreshes on 401/403
- For test steps, re-authenticate: `Given I am authenticated as an admin via API`

---

## Variable Interpolation Issues

### Symptoms
- Literal `{varName}` appears in requests instead of the value
- "Variable not found" or undefined values
- Assertions fail with interpolated values

### Solutions

**1. Ensure variable is stored before use**

```gherkin
# Wrong order -- userId not set yet
When I GET "/users/{userId}"
Then I store the value at "id" as "userId"

# Correct order
When I POST "/users" with JSON body: ...
Then I store the value at "id" as "userId"
When I GET "/users/{userId}"
```

**2. Check variable name spelling**

Variable names are case-sensitive:

```gherkin
# These are different variables
Then I store the value at "id" as "userId"
When I GET "/users/{UserId}"  # WRONG -- capital U
When I GET "/users/{userId}"  # Correct
```

**3. Verify interpolation syntax**

Use curly braces with no spaces:

```gherkin
# Correct
When I GET "/users/{userId}"
Given I set variable "email" to "test-{uuid}@example.com"

# Wrong
When I GET "/users/{ userId }"
When I GET "/users/$userId"
```

**4. Check JSONPath for store operations**

```gherkin
# Direct property
Then I store the value at "id" as "userId"

# Nested property
Then I store the value at "data.user.id" as "userId"

# Array index
Then I store the value at "items[0].id" as "firstItemId"
```

---

## Step Not Found

### Symptoms
- "Step 'xxx' is not defined"
- "No matching step definition found"
- Step shows as pending/undefined

### Solutions

**1. Check tag requirements**

Steps are scoped to tags. API steps require `@api` or `@hybrid`:

```gherkin
# Wrong -- @ui tag doesn't have API steps
@ui
Scenario: This won't work
  When I GET "/users"  # API step not available with @ui tag

# Correct
@api
Scenario: This works
  When I GET "/users"
```

| Tag | API Steps | UI Steps | TUI Steps | Shared Steps |
|-----|-----------|----------|-----------|--------------|
| `@api` | Yes | No | No | Yes |
| `@ui` | No | Yes | No | Yes |
| `@tui` | No | No | Yes | Yes |
| `@hybrid` | Yes | Yes | No | Yes |

**2. Check step registration in steps.ts**

```typescript
import { registerApiSteps, registerUiSteps, registerSharedSteps } from '@esimplicity/stack-tests/steps';

registerApiSteps(test);    // Must be called for API steps
registerUiSteps(test);     // Must be called for UI steps
registerSharedSteps(test); // Must be called for shared/cleanup steps
```

**3. Regenerate after adding new feature files**

```bash
npm run gen
```

**4. Generate stubs for custom steps**

```bash
npm run gen:stubs
```

---

## Cleanup Issues

### Symptoms
- Resources not cleaned up after tests
- 401 errors during cleanup
- Cleanup deleting in wrong order

### Solutions

**1. Verify cleanup is registered**

```gherkin
# Must register cleanup explicitly
When I POST "/users" with JSON body: ...
Then I store the value at "id" as "userId"
Given I register cleanup DELETE "/users/{userId}"  # Required!
```

**2. LIFO ordering for parent-child resources**

Cleanup runs in reverse registration order:

```gherkin
# Register child cleanup BEFORE parent
Given I register cleanup DELETE "/teams/{teamId}/members/{memberId}"  # Runs 1st
Given I register cleanup DELETE "/teams/{teamId}"                     # Runs 2nd
```

**3. Cleanup auth failures**

Cleanup uses admin credentials. Ensure these env vars are set:
- `DEFAULT_ADMIN_USERNAME`
- `DEFAULT_ADMIN_PASSWORD`
- `API_AUTH_LOGIN_PATH`

**4. Debugging cleanup**

```gherkin
# Temporarily disable cleanup to inspect state
Given I disable cleanup
```

**5. Check cleanup behavior settings**

| Variable | Default | Description |
|----------|---------|-------------|
| `CLEANUP_ALLOW_ALL` | `'false'` | Enable heuristic cleanup |
| `CLEANUP_RULES` | - | JSON array of custom rules |

---

## JSON Body Errors

### Symptoms
- "Unexpected token" in JSON parsing
- 400 Bad Request with valid-looking JSON
- Request body empty

### Solutions

**1. Validate JSON syntax in doc strings**

```gherkin
# Doc strings use triple quotes
When I POST "/users" with JSON body:
  """
  {
    "email": "test@example.com",
    "name": "Test User"
  }
  """
```

**2. Check variable interpolation in JSON**

Variables in JSON bodies must produce valid JSON:

```gherkin
# Good -- variable produces a string
"email": "{email}"

# Potential issue -- if variable contains quotes
# Use variables that produce clean string values
```

**3. Ensure proper indentation**

The doc string content should be valid JSON. Indentation inside `"""` is preserved.

---

## CI/CD Failures

### Symptoms
- Tests pass locally but fail in CI
- Browser launch errors
- Timeout errors in CI

### Solutions

**1. Install Playwright browsers in CI**

```yaml
# GitHub Actions
- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium
```

**2. Ensure headless mode**

Playwright runs headless by default. If you've overridden this:

```typescript
// playwright.config.ts
use: {
  headless: true,  // Ensure this for CI
}
```

**3. Set environment variables as secrets**

```yaml
# GitHub Actions
env:
  DEFAULT_ADMIN_USERNAME: ${{ secrets.ADMIN_USERNAME }}
  DEFAULT_ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
  API_AUTH_LOGIN_PATH: /auth/login
```

**4. Increase timeouts for CI**

```typescript
// playwright.config.ts
timeout: process.env.CI ? 60000 : 30000,
expect: {
  timeout: process.env.CI ? 10000 : 5000,
},
```

**5. Generate tests before running**

```yaml
- name: Generate and run tests
  run: |
    npm run gen
    npm test
```

---

## Installation Errors

### "Cannot find module '@esimplicity/stack-tests'"

```bash
# Verify installation
npm install -D @esimplicity/stack-tests

# Check it's in node_modules
ls node_modules/@esimplicity/stack-tests
```

### "tui-tester is not installed"

TUI testing is optional:

```bash
npm install -D tui-tester
```

Also ensure tmux is installed:

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt-get install tmux

# Verify
tmux -V
```

### TypeScript Errors

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "types": ["node", "@playwright/test"]
  }
}
```

---

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DEFAULT_ADMIN_USERNAME` | For auth | Admin login username |
| `DEFAULT_ADMIN_EMAIL` | Alt for above | Admin email (fallback) |
| `DEFAULT_ADMIN_PASSWORD` | For auth | Admin password |
| `DEFAULT_USER_USERNAME` | For user auth | Standard user username |
| `NON_ADMIN_USERNAME` | Alt for above | Non-admin username (fallback) |
| `DEFAULT_USER_PASSWORD` | For user auth | Standard user password |
| `NON_ADMIN_PASSWORD` | Alt for above | Non-admin password (fallback) |
| `API_AUTH_LOGIN_PATH` | For auth | Login endpoint path |
| `CLEANUP_ALLOW_ALL` | No | Enable heuristic cleanup (`'false'` default) |
| `CLEANUP_RULES` | No | JSON array of custom cleanup rules |

---

## Debugging Tools

Use these steps to inspect state during test development:

```gherkin
# Pause and open Playwright Inspector
When I pause for debugging

# Print current URL
Then I log the current URL

# Print all visible text on page
Then I print visible text

# Take a screenshot
Then I save a screenshot as "debug-{step-name}.png"
```

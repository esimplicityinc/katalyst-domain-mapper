---
name: katalyst-bdd-architecture
description: Katalyst BDD framework internals. Covers the ports and adapters pattern, creating custom ports, implementing custom adapters, writing custom step definitions, createBddTest dependency injection, and extending the framework.
license: SEE LICENSE IN LICENSE
compatibility: opencode
metadata:
  framework: katalyst-bdd
  audience: developers
---

# Katalyst BDD Architecture Guide

## Framework Architecture

Katalyst BDD is built on the **Ports and Adapters** (Hexagonal) architecture pattern. This separates the **what** (port interfaces) from the **how** (adapter implementations), enabling clean test code that's easy to extend and maintain.

### Layer Responsibilities

```
Test Layer         Feature files (.feature) + Step definitions
    |
Domain Layer       World state, variable interpolation, test lifecycle
    |
Port Layer         Interface contracts (ApiPort, UiPort, TuiPort, AuthPort, CleanupPort)
    |
Adapter Layer      Technology-specific implementations
    |
Infrastructure     Playwright (browser/HTTP), tui-tester/tmux, external services
```

### Why Ports and Adapters?

| Benefit | Description |
|---------|-------------|
| **Testability** | Mock ports for unit testing step logic |
| **Flexibility** | Swap implementations without changing tests |
| **Clarity** | Clear boundaries between layers |
| **Reusability** | Same steps work with different adapters |

---

## Built-in Ports

### ApiPort

Handles HTTP API interactions:

```typescript
interface ApiPort {
  sendJson(
    method: ApiMethod,       // 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResult>;

  sendForm(
    method: 'POST' | 'PUT' | 'PATCH',
    path: string,
    form: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<ApiResult>;
}
```

`ApiResult` contains: `status`, `json`, `text`, `headers`, `contentType`, `response`.

### UiPort

Handles browser UI interactions:

```typescript
interface UiPort {
  goto(path: string): Promise<void>;
  clickButton(name: string): Promise<void>;
  clickLink(text: string): Promise<void>;
  clickElement(selector: string): Promise<void>;
  fillLabel(label: string, value: string): Promise<void>;
  fillPlaceholder(placeholder: string, value: string): Promise<void>;
  selectOption(label: string, value: string): Promise<void>;
  expectText(text: string): Promise<void>;
  expectUrlContains(text: string): Promise<void>;
  expectVisible(selector: string): Promise<void>;
  expectNotVisible(selector: string): Promise<void>;
  expectValue(selector: string, value: string): Promise<void>;
  expectChecked(selector: string): Promise<void>;
  expectNotChecked(selector: string): Promise<void>;
  goBack(): Promise<void>;
  reload(): Promise<void>;
  waitForPageLoad(): Promise<void>;
  screenshot(name: string): Promise<void>;
  pause(): Promise<void>;
  logUrl(): Promise<void>;
  printVisibleText(): Promise<void>;
}
```

### TuiPort

Handles terminal UI interactions:

```typescript
interface TuiPort {
  start(command: string): Promise<void>;
  stop(): Promise<void>;
  typeText(text: string): Promise<void>;
  pressKey(key: string): Promise<void>;
  pressEnter(): Promise<void>;
  sendCtrlC(): Promise<void>;
  expectText(text: string): Promise<void>;
  expectMatch(pattern: string): Promise<void>;
  expectNotEmpty(): Promise<void>;
  expectExit(): Promise<void>;
  expectExitCode(code: number): Promise<void>;
}
```

### AuthPort

Handles authentication across layers:

```typescript
interface AuthPort {
  apiLoginAsAdmin(world: World): Promise<void>;
  apiLoginAsUser(world: World): Promise<void>;
  uiLoginAsAdmin(world: World): Promise<void>;
  uiLoginAsUser(world: World): Promise<void>;
}
```

### CleanupPort

Handles resource cleanup:

```typescript
interface CleanupPort {
  registerFromVar(world: World, varName: string, id: unknown): void;
}
```

---

## Built-in Adapters

| Adapter | Implements | Technology |
|---------|-----------|------------|
| `PlaywrightApiAdapter` | `ApiPort` | Playwright APIRequestContext |
| `PlaywrightUiAdapter` | `UiPort` | Playwright Page |
| `UniversalAuthAdapter` | `AuthPort` | Uses ApiPort + UiPort for login flows |
| `DefaultCleanupAdapter` | `CleanupPort` | Heuristic cleanup based on variable naming |

---

## Dependency Injection with createBddTest

The `createBddTest` function wires ports, adapters, and world state:

```typescript
import { createBddTest } from '@esimplicity/stack-tests';

// Use all defaults
const test = createBddTest();

// Customize specific adapters
const test = createBddTest({
  createApi: ({ apiRequest }) => new PlaywrightApiAdapter(apiRequest),
  createUi: ({ page }) => new PlaywrightUiAdapter(page),
  createAuth: ({ api, ui }) => new UniversalAuthAdapter({ api, ui }),
  createCleanup: () => new DefaultCleanupAdapter(),
});
```

### Available Factory Parameters

| Factory | Parameters Available |
|---------|---------------------|
| `createApi` | `{ apiRequest }` -- Playwright APIRequestContext |
| `createUi` | `{ page }` -- Playwright Page |
| `createAuth` | `{ api, ui }` -- Instantiated ApiPort and UiPort |
| `createCleanup` | None |

---

## Creating Custom Adapters

### Example: Custom API Adapter (Axios)

```typescript
import { ApiPort, ApiResult, ApiMethod } from '@esimplicity/stack-tests';
import axios, { AxiosInstance } from 'axios';

class AxiosApiAdapter implements ApiPort {
  constructor(private client: AxiosInstance) {}

  async sendJson(
    method: ApiMethod,
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<ApiResult> {
    const response = await this.client.request({
      method,
      url: path,
      data: body,
      headers,
      validateStatus: () => true, // Don't throw on non-2xx
    });

    return {
      status: response.status,
      json: response.data,
      text: JSON.stringify(response.data),
      headers: response.headers as Record<string, string>,
      contentType: response.headers['content-type'] || '',
      response: response as any,
    };
  }

  async sendForm(method: any, path: string, form: Record<string, string>, headers?: Record<string, string>): Promise<ApiResult> {
    // Implement form submission with axios
    const formData = new URLSearchParams(form);
    return this.sendJson(method, path, formData, {
      ...headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  }
}
```

### Register Custom Adapter

```typescript
import { createBddTest } from '@esimplicity/stack-tests';
import axios from 'axios';

const test = createBddTest({
  createApi: () => new AxiosApiAdapter(
    axios.create({ baseURL: process.env.API_BASE_URL })
  ),
});
```

### Example: Custom Auth Adapter

```typescript
import { AuthPort, World } from '@esimplicity/stack-tests';

class MyAuthAdapter implements AuthPort {
  constructor(private api: ApiPort, private ui: UiPort) {}

  async apiLoginAsAdmin(world: World): Promise<void> {
    const result = await this.api.sendJson('POST', '/auth/login', {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    // Custom token extraction
    const token = (result.json as any).data.accessToken;
    world.headers['Authorization'] = `Bearer ${token}`;
  }

  async apiLoginAsUser(world: World): Promise<void> {
    // Similar but with user credentials
  }

  async uiLoginAsAdmin(world: World): Promise<void> {
    await this.ui.goto('/login');
    await this.ui.fillLabel('Email', process.env.ADMIN_EMAIL!);
    await this.ui.fillLabel('Password', process.env.ADMIN_PASSWORD!);
    await this.ui.clickButton('Sign In');
    await this.ui.expectUrlContains('/dashboard');
  }

  async uiLoginAsUser(world: World): Promise<void> {
    // Similar but with user credentials
  }
}
```

### Example: Custom Cleanup Adapter

```typescript
import { CleanupPort, World } from '@esimplicity/stack-tests';

class CustomCleanupAdapter implements CleanupPort {
  private rules: Array<{ pattern: RegExp; method: string; path: string }>;

  constructor(opts: { rules: typeof CustomCleanupAdapter.prototype.rules }) {
    this.rules = opts.rules;
  }

  registerFromVar(world: World, varName: string, id: unknown): void {
    for (const rule of this.rules) {
      if (rule.pattern.test(varName)) {
        world.cleanupItems.push({
          method: rule.method,
          path: rule.path.replace('{id}', String(id)),
        });
        return;
      }
    }
  }
}

// Usage
const test = createBddTest({
  createCleanup: () => new CustomCleanupAdapter({
    rules: [
      { pattern: /userId/i, method: 'DELETE', path: '/admin/users/{id}' },
      { pattern: /teamId/i, method: 'DELETE', path: '/admin/teams/{id}' },
    ],
  }),
});
```

---

## Creating Custom Step Definitions

### Basic Custom Step File

```typescript
// features/steps/custom/user.steps.ts
import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures';
import { interpolate } from '@esimplicity/stack-tests';

const { Given, When, Then } = createBdd(test);

Given('a user exists with email {string}', { tags: '@api' },
  async ({ api, world }, email: string) => {
    const resolvedEmail = interpolate(email, world.vars);

    const result = await api.sendJson('POST', '/admin/users', {
      email: resolvedEmail,
      password: 'TestPassword123',
      role: 'member',
    }, world.headers);

    if (result.status !== 201) {
      throw new Error(`Failed to create user: ${result.status}\n${result.text}`);
    }

    const userId = (result.json as any).id;
    world.vars['userId'] = String(userId);
    world.vars['userEmail'] = resolvedEmail;
  }
);
```

### Register Custom Steps

```typescript
// features/steps/steps.ts
import { test } from './fixtures';
import { registerApiSteps, registerUiSteps, registerSharedSteps } from '@esimplicity/stack-tests/steps';

// Built-in steps
registerApiSteps(test);
registerUiSteps(test);
registerSharedSteps(test);

// Custom steps (auto-register via createBdd import)
import './custom/user.steps';
import './custom/order.steps';
import './custom/payment.steps';

export { test };
```

### Step Parameter Types

| Type | Syntax | Example |
|------|--------|---------|
| String | `{string}` | `'I click button {string}'` -> receives `string` |
| Integer | `{int}` | `'I see {int} items'` -> receives `number` |
| Float | `{float}` | `'total is {float}'` -> receives `number` |
| Doc String | (implicit) | Triple-quoted block after step -> receives `string` |
| Data Table | (implicit) | Pipe-delimited table -> receives `DataTable` |

### Tag-Scoped Steps

```typescript
// Only available in @api scenarios
When('I call the API', { tags: '@api' }, async ({ api }) => { /* ... */ });

// Only in @ui scenarios
When('I click submit', { tags: '@ui' }, async ({ ui }) => { /* ... */ });

// Multiple tags
When('I verify data', { tags: '@api or @hybrid' }, async ({ api, world }) => { /* ... */ });

// Universal (no tag restriction)
Given('I set context', async ({ world }) => { world.vars['ctx'] = 'active'; });
```

### Using Framework Utilities

```typescript
import {
  interpolate,    // Replace {var} with values from world.vars
  selectPath,     // Extract value from JSON by path (e.g., "data.user.id")
  registerCleanup // Register cleanup item on world
} from '@esimplicity/stack-tests';

When('I create and verify a user', { tags: '@api' },
  async ({ api, world }) => {
    const email = `test-${Date.now()}@example.com`;

    const createResult = await api.sendJson('POST', '/users', {
      email,
      password: 'Test123',
    }, world.headers);
    expect(createResult.status).toBe(201);

    const userId = selectPath(createResult.json, 'id');
    world.vars['createdUserId'] = String(userId);

    // Register cleanup programmatically
    registerCleanup(world, { method: 'DELETE', path: `/users/${userId}` });

    // Verify
    const getResult = await api.sendJson('GET', `/users/${userId}`, undefined, world.headers);
    expect(getResult.status).toBe(200);
    expect(selectPath(getResult.json, 'email')).toBe(email);
  }
);
```

### Doc String Steps

```typescript
When('I create a user with details:', { tags: '@api' },
  async ({ api, world }, docString: string) => {
    const details = JSON.parse(docString);
    const interpolatedDetails = Object.fromEntries(
      Object.entries(details).map(([k, v]) =>
        [k, interpolate(String(v), world.vars)]
      )
    );
    await api.sendJson('POST', '/users', interpolatedDetails, world.headers);
  }
);
```

### Data Table Steps

```typescript
When('I create users:', { tags: '@api' },
  async ({ api, world }, dataTable) => {
    const rows = dataTable.hashes(); // Array of { column: value }

    for (const row of rows) {
      await api.sendJson('POST', '/users', {
        email: interpolate(row.email, world.vars),
        name: interpolate(row.name, world.vars),
        role: row.role,
      }, world.headers);
    }
  }
);
```

Usage in feature:

```gherkin
When I create users:
  | email          | name     | role   |
  | u1@test.com    | User One | member |
  | u2@test.com    | User Two | admin  |
```

---

## Unit Testing Custom Steps

Extract step logic into testable functions:

```typescript
// features/steps/custom/user.logic.ts
export async function createUser(
  api: ApiPort,
  world: World,
  email: string
): Promise<string> {
  const result = await api.sendJson('POST', '/admin/users', {
    email,
    password: 'TestPassword123',
    role: 'member',
  }, world.headers);

  if (result.status !== 201) {
    throw new Error(`Failed: ${result.status}`);
  }

  const userId = String((result.json as any).id);
  world.vars['userId'] = userId;
  return userId;
}
```

```typescript
// features/steps/custom/__tests__/user.logic.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createUser } from '../user.logic';

describe('createUser', () => {
  it('should create user and store ID', async () => {
    const mockApi = {
      sendJson: vi.fn().mockResolvedValue({
        status: 201,
        json: { id: '123' },
      }),
    } as any;
    const world = { vars: {}, headers: {} } as any;

    const userId = await createUser(mockApi, world, 'test@example.com');

    expect(userId).toBe('123');
    expect(world.vars['userId']).toBe('123');
    expect(mockApi.sendJson).toHaveBeenCalledWith(
      'POST', '/admin/users',
      expect.objectContaining({ email: 'test@example.com' }),
      {}
    );
  });
});
```

---

## Extending the Framework

### Adding a New Port

1. Define interface in a ports file
2. Create adapter implementing the interface
3. Add factory option to `createBddTest`
4. Create step definitions using the new port

### Adding a New Adapter

1. Implement existing port interface
2. Register via `createBddTest` options
3. No changes to step definitions needed

### Cross-Layer Steps (Hybrid)

```typescript
When('I create a user and verify in UI', { tags: '@hybrid' },
  async ({ api, ui, world }) => {
    // API: Create user
    const result = await api.sendJson('POST', '/users', {
      email: 'newuser@test.com',
      name: 'New User',
    }, world.headers);

    const userId = (result.json as any).id;
    world.vars['userId'] = String(userId);

    // UI: Verify user appears
    await ui.goto('/admin/users');
    await ui.expectText('newuser@test.com');
  }
);
```

---

## Full Documentation

- Architecture: https://esimplicityinc.github.io/katalyst-bdd-test/docs/concepts/architecture
- Custom Adapters: https://esimplicityinc.github.io/katalyst-bdd-test/docs/guides/custom-adapters
- Custom Steps: https://esimplicityinc.github.io/katalyst-bdd-test/docs/guides/custom-steps
- Contributing: https://esimplicityinc.github.io/katalyst-bdd-test/docs/contributing/

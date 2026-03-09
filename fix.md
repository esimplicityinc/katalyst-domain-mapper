# Fix: Make cleanup auth optional in @esimplicity/stack-tests

## Problem

The `world` fixture in `src/fixtures.ts` unconditionally calls `getAdminHeaders()` before every cleanup request. For APIs that have no authentication, this produces a `console.warn` on every scenario that registers cleanup items:

```
cleanup auth failed: 404 Not Found
```

The function is private (not exported), hardcoded in the fixture teardown loop, and offers no opt-out. Pointing `API_AUTH_LOGIN_PATH` at an endpoint that returns 200 just trades the warning for:

```
cleanup auth missing access_token in response
```

There is no way for a consumer to say "my API doesn't need auth for cleanup."

## Root Cause

`getAdminHeaders` in `src/fixtures.ts:23-107` always attempts authentication via one of two modes (Keycloak or form-POST). The cleanup execution loop at line 166 always calls it:

```typescript
const adminHeaders = await getAdminHeaders(apiRequest);
```

There is no guard, no env var, and no adapter/port for cleanup auth. The only consumer-facing escape hatch is `skipCleanup`, which skips cleanup entirely -- not just auth.

## Proposed Fix

### Option A: `CLEANUP_AUTH` env var (minimal, non-breaking)

Add a single env var check at the top of `getAdminHeaders`:

```typescript
async function getAdminHeaders(request: APIRequestContext): Promise<Record<string, string>> {
  // Allow consumers to disable cleanup auth entirely
  const cleanupAuth = process.env.CLEANUP_AUTH ?? 'auto';
  if (cleanupAuth === 'none') return {};

  if (cachedAdminToken) return { Authorization: `Bearer ${cachedAdminToken}` };
  // ... rest unchanged
}
```

Consumer usage:

```env
# .env
CLEANUP_AUTH=none
```

Values:
- `auto` (default) -- current behavior, try /auth/login or Keycloak
- `none` -- skip auth, return empty headers, no warnings

This is the smallest change. No new types, no API surface change, fully backward compatible.

### Option B: `CleanupAuthPort` adapter (follows existing patterns)

The framework already uses the ports-and-adapters pattern for `ApiPort`, `UiPort`, `AuthPort`, and `CleanupPort`. Cleanup auth is the only piece that isn't pluggable.

#### 1. Define the port

```typescript
// src/ports/cleanup-auth.port.ts
import type { APIRequestContext } from '@playwright/test';

export interface CleanupAuthPort {
  getHeaders(request: APIRequestContext): Promise<Record<string, string>>;
}
```

#### 2. Extract current logic into the default adapter

```typescript
// src/adapters/cleanup-auth/default-cleanup-auth.adapter.ts
import type { APIRequestContext } from '@playwright/test';
import type { CleanupAuthPort } from '../../ports/cleanup-auth.port';

export class DefaultCleanupAuthAdapter implements CleanupAuthPort {
  private cachedToken?: string;
  private cachedRoles?: string;

  async getHeaders(request: APIRequestContext): Promise<Record<string, string>> {
    // ... move existing getAdminHeaders logic here
  }
}
```

#### 3. Add a no-op adapter for auth-free APIs

```typescript
// src/adapters/cleanup-auth/noop-cleanup-auth.adapter.ts
import type { CleanupAuthPort } from '../../ports/cleanup-auth.port';

export class NoopCleanupAuthAdapter implements CleanupAuthPort {
  async getHeaders(): Promise<Record<string, string>> {
    return {};
  }
}
```

#### 4. Wire it into `createBddTest` options

```typescript
export type CreateBddTestOptions = {
  createApi?: (ctx: CreateContext) => ApiPort;
  createUi?: (ctx: CreateContext) => UiPort;
  createAuth?: (ctx: CreateContext & { api: ApiPort; ui: UiPort }) => AuthPort;
  createCleanup?: (ctx: CreateContext) => CleanupPort;
  createCleanupAuth?: (ctx: CreateContext) => CleanupAuthPort;  // <-- new
  createTui?: TuiFactory;
  worldFactory?: () => World;
};
```

Default:

```typescript
const {
  createCleanupAuth = () => {
    const auth = process.env.CLEANUP_AUTH ?? 'auto';
    return auth === 'none'
      ? new NoopCleanupAuthAdapter()
      : new DefaultCleanupAuthAdapter();
  },
  // ...
} = options;
```

#### 5. Replace hardcoded call in fixture teardown

```diff
- const adminHeaders = await getAdminHeaders(apiRequest);
+ const adminHeaders = await cleanupAuth.getHeaders(apiRequest);
```

Where `cleanupAuth` is a fixture provided by `createCleanupAuth`.

### Recommendation

**Do both.** Option A is a 5-line env var guard that unblocks consumers immediately. Option B refactors cleanup auth into the same adapter pattern the framework uses everywhere else, making it composable.

Option A can ship first as a patch. Option B is a minor version bump.

## Consumer Impact

### Before (katalyst-domain-mapper)

Every BDD scenario with cleanup items logs:
```
cleanup auth failed: 404 Not Found
```

153 BDD scenarios, ~80 of which register cleanup = ~80 warnings per run.

### After

```env
# stack-tests/.env
CLEANUP_AUTH=none
```

Zero warnings. Cleanup DELETEs still fire, still succeed (API is open).

## Files to Change

| File | Change |
|------|--------|
| `src/fixtures.ts` | Add `CLEANUP_AUTH=none` guard in `getAdminHeaders` (Option A) |
| `src/ports/cleanup-auth.port.ts` | New file: `CleanupAuthPort` interface (Option B) |
| `src/adapters/cleanup-auth/default-cleanup-auth.adapter.ts` | New file: extract existing logic (Option B) |
| `src/adapters/cleanup-auth/noop-cleanup-auth.adapter.ts` | New file: no-op adapter (Option B) |
| `src/fixtures.ts` | Add `createCleanupAuth` option, wire fixture (Option B) |
| `src/index.ts` | Export new port and adapters (Option B) |
| `README.md` | Document `CLEANUP_AUTH` env var and `createCleanupAuth` option |

## Related

- `cachedAdminToken` module-level cache should move into the adapter instance (Option B handles this naturally)
- The 401 retry gap (cleanup items that get 401 are skipped, not retried) is a separate issue but could be addressed in the adapter refactor

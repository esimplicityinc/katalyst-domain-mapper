import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

// Custom step for accepting multiple status codes
Then('the response status should be one of:', async ({ world }, dataTable) => {
  const expectedStatuses = dataTable.raw().map((row: string[]) => parseInt(row[0], 10));
  const actualStatus = world.lastResponse?.status();
  
  if (!expectedStatuses.includes(actualStatus)) {
    throw new Error(
      `Expected status to be one of ${expectedStatuses.join(', ')}, but got ${actualStatus}`
    );
  }
});

// Custom step for waiting N seconds
Then('I wait for {int} seconds', async ({}, seconds: number) => {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

// Custom step for verifying Domain Models page is visible
Then('I should see the Domain Models page', async ({ page }) => {
  await page.waitForURL(/\/taxonomy\/domain-models/, { timeout: 10_000 });
});

// Custom step for verifying page loaded with redirect
Then(
  'the page should load successfully \\(with redirect to \\/taxonomy\\/domain-models)',
  async ({ page }) => {
    await page.waitForURL(/\/taxonomy\/domain-models/, { timeout: 10_000 });
  },
);

// ── Type-assertion steps for JSON response values ──────────────────────────

// Helper: resolve a dot-path against a JSON object.
// Tries the full key as a literal property first (handles keys like "scan.runtime"),
// then falls back to standard dot-separated traversal.
function resolveJsonPath(json: Record<string, unknown>, path: string): unknown {
  // 1. Try literal key first (e.g. "scan.runtime" as a single property name)
  if (path in json) return json[path];
  // 2. Fall back to dot-separated traversal (e.g. "chat.runtime" → json.chat.runtime)
  return path.split('.').reduce<unknown>((obj, k) => (obj as Record<string, unknown>)?.[k], json);
}

Then('the response should have key {string}', async ({ world }, key: string) => {
  const json = world.lastJson;
  if (!json || typeof json !== 'object' || !(key in json)) {
    throw new Error(`Expected response to have key "${key}", but it was missing`);
  }
});

Then('the value at {string} should be a boolean', async ({ world }, path: string) => {
  const json = world.lastJson as Record<string, unknown>;
  const value = resolveJsonPath(json, path);
  if (typeof value !== 'boolean') {
    throw new Error(`Expected value at "${path}" to be a boolean, got ${typeof value}`);
  }
});

Then('the value at {string} should be a string', async ({ world }, path: string) => {
  const json = world.lastJson as Record<string, unknown>;
  const value = resolveJsonPath(json, path);
  if (typeof value !== 'string') {
    throw new Error(`Expected value at "${path}" to be a string, got ${typeof value}`);
  }
});

Then('the value at {string} should be a number', async ({ world }, path: string) => {
  const json = world.lastJson as Record<string, unknown>;
  const value = resolveJsonPath(json, path);
  if (typeof value !== 'number') {
    throw new Error(`Expected value at "${path}" to be a number, got ${typeof value}`);
  }
});

// ── Generic navigation / content steps (used by chat & architecture features) ──

Given('I navigate to the web application', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

When('I click on the {string} navigation item', async ({ page }, itemName: string) => {
  const navItem = page.locator(
    `nav a:has-text("${itemName}"), [role="navigation"] a:has-text("${itemName}"), nav button:has-text("${itemName}")`,
  ).first();
  await navItem.click();
  await page.waitForLoadState('networkidle');
});

Then('I should see the page content', async ({ page }) => {
  const main = page.locator('main, [role="main"]').first();
  await expect(main).toBeVisible({ timeout: 10_000 });
});

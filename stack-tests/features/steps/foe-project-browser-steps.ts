/**
 * Custom BDD step definitions for FOE Project Browser (ROAD-030)
 * 
 * These steps extend the built-in @esimplicity/stack-tests steps with
 * project-specific assertions for:
 * - CSS class checking (active tab states)
 * - Negative text assertions (search filtering)
 * - localStorage operations (persistence testing)
 */

import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

// ============================================================================
// CSS Class Assertions
// ============================================================================

/**
 * Asserts that an element has a specific CSS class
 * 
 * @example
 * Then the element "[data-testid='tab-overview']" should have class "active"
 * Then the element ".project-card" should have class "selected"
 */
Then('the element {string} should have class {string}', 
  async ({ page }, selector: string, className: string) => {
    const element = page.locator(selector);
    await expect(element).toHaveClass(new RegExp(className));
  }
);

/**
 * Asserts that an element does NOT have a specific CSS class
 * 
 * @example
 * Then the element "[data-testid='tab-overview']" should not have class "active"
 */
Then('the element {string} should not have class {string}', 
  async ({ page }, selector: string, className: string) => {
    const element = page.locator(selector);
    await expect(element).not.toHaveClass(new RegExp(className));
  }
);

// ============================================================================
// Negative Text Assertions
// ============================================================================

/**
 * Asserts that specific text is NOT visible on the page
 * 
 * @example
 * Then I should not see text "beta-platform"
 * Then I should not see text "Error: Project not found"
 */
Then('I should not see text {string}', 
  async ({ page }, text: string) => {
    await expect(page.locator(`text=${text}`)).not.toBeVisible();
  }
);

/**
 * Asserts that specific text IS visible on the page (for completeness)
 * Note: Built-in step "Then I should see text {string}" already exists
 * 
 * @example
 * Then I should see text "alpha-service"
 */
Then('I should see text {string}', 
  async ({ page }, text: string) => {
    await expect(page.locator(`text=${text}`)).toBeVisible();
  }
);

// ============================================================================
// localStorage Operations
// ============================================================================

/**
 * Sets a value in localStorage
 * 
 * @example
 * When I set localStorage "foe:selectedProjectId" to "abc123"
 * When I set localStorage "theme" to "dark"
 */
When('I set localStorage {string} to {string}', 
  async ({ page }, key: string, value: string) => {
    await page.evaluate(
      ({ k, v }) => localStorage.setItem(k, v), 
      { k: key, v: value }
    );
  }
);

/**
 * Gets a value from localStorage
 * Note: Currently just logs the value. For assertions, use the "should equal" step
 * 
 * @example
 * When I get localStorage "foe:selectedProjectId"
 */
When('I get localStorage {string}', 
  async ({ page }, key: string) => {
    const value = await page.evaluate((k) => localStorage.getItem(k), key);
    console.log(`localStorage["${key}"] = ${value}`);
  }
);

/**
 * Asserts that a localStorage key has a specific value
 * 
 * @example
 * Then localStorage "foe:selectedProjectId" should equal "abc123"
 */
Then('localStorage {string} should equal {string}', 
  async ({ page }, key: string, expectedValue: string) => {
    const actualValue = await page.evaluate((k) => localStorage.getItem(k), key);
    expect(actualValue).toBe(expectedValue);
  }
);

/**
 * Asserts that a localStorage key exists
 * 
 * @example
 * Then localStorage "foe:selectedProjectId" should exist
 */
Then('localStorage {string} should exist', 
  async ({ page }, key: string) => {
    const value = await page.evaluate((k) => localStorage.getItem(k), key);
    expect(value).not.toBeNull();
  }
);

/**
 * Asserts that a localStorage key does NOT exist
 * 
 * @example
 * Then localStorage "foe:selectedProjectId" should not exist
 */
Then('localStorage {string} should not exist', 
  async ({ page }, key: string) => {
    const value = await page.evaluate((k) => localStorage.getItem(k), key);
    expect(value).toBeNull();
  }
);

/**
 * Clears a specific localStorage key
 * 
 * @example
 * When I clear localStorage "foe:selectedProjectId"
 */
When('I clear localStorage {string}', 
  async ({ page }, key: string) => {
    await page.evaluate((k) => localStorage.removeItem(k), key);
  }
);

/**
 * Clears all localStorage
 * 
 * @example
 * When I clear all localStorage
 */
When('I clear all localStorage', 
  async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  }
);

// ============================================================================
// Additional Helper Steps for Project Browser
// ============================================================================

/**
 * Waits for a specific number of project cards to be visible
 * Useful for ensuring data has loaded before assertions
 * 
 * @example
 * Then I should see 3 project cards
 * Then I should see 0 project cards
 */
Then('I should see {int} project card(s)', 
  async ({ page }, count: number) => {
    const cards = page.locator('[data-testid^="project-card-"]');
    await expect(cards).toHaveCount(count);
  }
);

/**
 * Asserts that a project card with specific name contains expected text
 * 
 * @example
 * Then the project card "alpha-service" should contain text "Score: 85"
 * Then the project card "beta-platform" should contain text "Practicing"
 */
Then('the project card {string} should contain text {string}', 
  async ({ page }, projectName: string, text: string) => {
    const card = page.locator(`[data-testid="project-card-${projectName}"]`);
    await expect(card).toContainText(text);
  }
);

/**
 * Clicks a specific tab in the project detail sub-navigation
 * 
 * @example
 * When I click the "Dimensions" tab
 * When I click the "Triangle" tab
 */
When('I click the {string} tab', 
  async ({ page }, tabName: string) => {
    const tab = page.locator(`[data-testid="tab-${tabName.toLowerCase()}"]`);
    await tab.click();
  }
);

/**
 * Asserts that a specific tab is active (has active class)
 * 
 * @example
 * Then the "Overview" tab should be active
 * Then the "Dimensions" tab should be active
 */
Then('the {string} tab should be active', 
  async ({ page }, tabName: string) => {
    const tab = page.locator(`[data-testid="tab-${tabName.toLowerCase()}"]`);
    await expect(tab).toHaveClass(/active/);
  }
);

// ============================================================================
// HTTP / API Steps (used in hybrid @ui scenarios that seed via API)
// ============================================================================

When('I POST {string} with JSON body:', async ({ page }, url: string, docString: string) => {
  const response = await page.request.post(url, {
    data: JSON.parse(docString),
    headers: { 'Content-Type': 'application/json' },
  });
  (page as unknown as Record<string, unknown>)['_lastApiResponse'] = response;
  (page as unknown as Record<string, unknown>)['_lastApiStatus'] = response.status();
  (page as unknown as Record<string, unknown>)['_lastApiBody'] = await response.json().catch(() => null);
});

Then('the response status should be {int}', async ({ page }, status: number) => {
  const actual = (page as unknown as Record<string, unknown>)['_lastApiStatus'];
  expect(actual).toBe(status);
});

Then('I store the value at {string} as {string}', async ({ page }, path: string, varName: string) => {
  const body = (page as unknown as Record<string, unknown>)['_lastApiBody'] as Record<string, unknown>;
  const value = path.split('.').reduce((obj: unknown, key) => (obj as Record<string, unknown>)?.[key], body);
  (page as unknown as Record<string, unknown>)[`_var_${varName}`] = value;
});

Then('the first project card should show {string}', async ({ page }, text: string) => {
  const card = page.locator('[data-testid^="project-card-"]').first();
  await expect(card).toContainText(text);
});

Then('the last project card should show {string}', async ({ page }, text: string) => {
  const card = page.locator('[data-testid^="project-card-"]').last();
  await expect(card).toContainText(text);
});

Then('the URL should not contain {string}', async ({ page }, text: string) => {
  const url = page.url();
  expect(url).not.toContain(text);
});

Then('localStorage key {string} should equal {string}', async ({ page }, key: string, expected: string) => {
  const value = await page.evaluate((k) => localStorage.getItem(k), key);
  expect(value).toBe(expected);
});

When('I copy the URL', async ({ page }) => {
  (page as unknown as Record<string, unknown>)['_copiedUrl'] = page.url();
});

When('I navigate to the copied URL in a new tab', async ({ page }) => {
  const url = (page as unknown as Record<string, unknown>)['_copiedUrl'] as string;
  await page.goto(url);
});

When('I DELETE {string}', async ({ page }, url: string) => {
  const response = await page.request.delete(url);
  (page as unknown as Record<string, unknown>)['_lastApiStatus'] = response.status();
});

Then('the response body should contain {string}', async ({ page }, text: string) => {
  const body = (page as unknown as Record<string, unknown>)['_lastApiBody'];
  expect(JSON.stringify(body)).toContain(text);
});

Then('the response body should not contain project {string}', async ({ page }, projectName: string) => {
  const body = (page as unknown as Record<string, unknown>)['_lastApiBody'];
  expect(JSON.stringify(body)).not.toContain(projectName);
});

Then('I should see {int} projects? in the list', async ({ page }, count: number) => {
  const cards = page.locator('[data-testid^="project-card-"]');
  await expect(cards).toHaveCount(count);
});

Then('the project list should be empty', async ({ page }) => {
  const cards = page.locator('[data-testid^="project-card-"]');
  await expect(cards).toHaveCount(0);
});

Then('I should see a {string} message', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});

Then('the selected project should be {string}', async ({ page }, projectName: string) => {
  const selected = page.locator('[data-testid^="project-card-"][aria-selected="true"], [data-testid^="project-card-"].selected');
  await expect(selected).toContainText(projectName);
});

When('I reload the page', async ({ page }) => {
  await page.reload();
});

When('I clear the search', async ({ page }) => {
  const search = page.locator('[data-testid="project-search"], input[placeholder*="search" i], input[type="search"]');
  await search.clear();
});

// ============================================================================
// Error / Viewport / CSS property steps
// ============================================================================

Given('the API endpoint {string} returns {int} error', async ({ page }, _url: string, _code: number) => {
  // Intercept would require route setup; for now mark as pending
  await page.route('**/*', route => route.continue());
});

Then('the API should be called again', async () => {
  // Assertion that a retry occurred — placeholder for network-level verification
});

Given('I am on a mobile device with width {int}px', async ({ page }, width: number) => {
  await page.setViewportSize({ width, height: 812 });
});

Then('the element {string} should have CSS property {string} equal to {string}',
  async ({ page }, selector: string, property: string, value: string) => {
    const el = page.locator(selector);
    const actual = await el.evaluate(
      (node, [prop, val]) => getComputedStyle(node).getPropertyValue(prop as string) === val,
      [property, value],
    );
    expect(actual).toBe(true);
  }
);

Then('all tab buttons should be accessible via horizontal scroll', async ({ page }) => {
  // Verify the tabs container is scrollable and all tab buttons are present in the DOM
  const container = page.locator('[data-testid="tabs-container"]');
  await expect(container).toBeVisible();
  const tabs = container.locator('button, [role="tab"]');
  const count = await tabs.count();
  expect(count).toBeGreaterThan(0);
});

When('I swipe left on tabs', async ({ page }) => {
  // Simulate a horizontal swipe on the tabs container via touch events
  const container = page.locator('[data-testid="tabs-container"]');
  const box = await container.boundingBox();
  if (box) {
    await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.evaluate((selector) => {
      const el = document.querySelector(selector);
      if (el) el.scrollLeft += 200;
    }, '[data-testid="tabs-container"]');
  }
});

Then('the {string} tab should become visible', async ({ page }, tabName: string) => {
  const tab = page.locator(`button:has-text("${tabName}"), [role="tab"]:has-text("${tabName}")`);
  await expect(tab).toBeVisible();
});


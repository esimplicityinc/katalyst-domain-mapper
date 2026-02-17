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

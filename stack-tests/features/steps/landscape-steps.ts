/**
 * Custom BDD step definitions for Business Landscape visualization (CAP-023, ROAD-044)
 *
 * These steps extend the built-in @esimplicity/stack-tests steps with
 * landscape-specific assertions.
 *
 * The BusinessLandscapePage renders: a header with "Business Landscape" h1, 
 * stat counts (systems, contexts, events, capabilities), and an SVG canvas.
 * There is no interactive layout-engine toolbar on this standalone page.
 */

import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';
import { expect } from '@playwright/test';

const { Then } = createBdd(test);

// ── Heading Assertion ─────────────────────────────────────────────────────────

/**
 * Asserts that the landscape page header is visible.
 *
 * @example
 * Then I should see the landscape page heading
 */
Then('I should see the landscape page heading', async ({ page }) => {
  await expect(page.getByText('Business Landscape', { exact: false }).first()).toBeVisible();
});

/**
 * Asserts the landscape is not in an error state.
 *
 * @example
 * Then the landscape should not show an error
 */
Then('the landscape should not show an error', async ({ page }) => {
  const errorText = page.getByText('Error Loading Landscape', { exact: false });
  await expect(errorText).not.toBeVisible();
});

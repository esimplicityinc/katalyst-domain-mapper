import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';
import { expect } from '@playwright/test';

const { Then } = createBdd(test);

// ============================================================================
// Organization Intelligence Navigation Steps (ROAD-049)
// ============================================================================

// ---- Landing Page Assertions ----

Then('I should see the Organization landing page', async ({ page }) => {
  await expect(page).toHaveURL(/\/organization/);
  await page.waitForTimeout(500);
  // Verify key content on the Organization landing page
  await expect(page.locator('h1:has-text("Organization")')).toBeVisible({ timeout: 5000 });
});

Then('I should see the Teams page', async ({ page }) => {
  await expect(page).toHaveURL(/\/organization\/teams/);
  await page.waitForTimeout(500);
  await expect(page.locator('h1:has-text("Teams")')).toBeVisible({ timeout: 5000 });
});

Then('I should see the People page', async ({ page }) => {
  await expect(page).toHaveURL(/\/organization\/people/);
  await page.waitForTimeout(500);
  await expect(page.locator('h1:has-text("People")')).toBeVisible({ timeout: 5000 });
});

Then('I should see the Adoption Heatmap page', async ({ page }) => {
  await expect(page).toHaveURL(/\/organization\/adoption/);
  await page.waitForTimeout(500);
  await expect(page.locator('h1:has-text("Adoption Heatmap")')).toBeVisible({ timeout: 5000 });
});

Then('I should see the User Type Journeys page', async ({ page }) => {
  await expect(page).toHaveURL(/\/strategy\/value-streams\/journeys/);
  await page.waitForTimeout(500);
  await expect(page.locator('h1:has-text("User Type Journey")')).toBeVisible({ timeout: 5000 });
});

Then('I should see the Outcome Traceability page', async ({ page }) => {
  await expect(page).toHaveURL(/\/strategy\/value-streams\/outcomes/);
  await page.waitForTimeout(500);
  await expect(page.locator('h1:has-text("Outcome Traceability")')).toBeVisible({ timeout: 5000 });
});

// ---- Content Assertion ----

Then('I should see {string} on the page', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible({ timeout: 5000 });
});

export { test };

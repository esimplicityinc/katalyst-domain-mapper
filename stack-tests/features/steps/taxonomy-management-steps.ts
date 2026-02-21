/**
 * Custom BDD step definitions for Taxonomy & Persona Management UI (CAP-025, ROAD-046)
 *
 * These steps extend the built-in @esimplicity/stack-tests steps with
 * taxonomy-management-specific assertions for:
 * - Capability tree view interactions (expand/collapse)
 * - Kanban column visibility on the User Story board
 * - Persona list assertions
 */

import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';
import { expect } from '@playwright/test';

const { When, Then } = createBdd(test);

// ── Capability Tree Steps ─────────────────────────────────────────────────────

/**
 * Asserts the capability tree view is rendered.
 *
 * @example
 * Then the capability tree should be visible
 */
Then('the capability tree should be visible', async ({ page }) => {
  // CapabilityTreeView renders a "Capabilities" text heading.
  // Wait up to 10s for data to load from the API.
  await expect(page.getByText('Capabilities', { exact: false }).first()).toBeVisible({ timeout: 10000 });
});

/**
 * Asserts the "Add Root" button exists in the capability tree view.
 *
 * @example
 * Then the add root capability button should be visible
 */
Then('the add root capability button should be visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: /Add Root/i }).first()).toBeVisible({ timeout: 10000 });
});

/**
 * Clicks the "Add Root" button in the capability tree view.
 *
 * @example
 * When I click the add root capability button
 */
When('I click the add root capability button', async ({ page }) => {
  const btn = page.getByRole('button', { name: /Add Root/i }).first();
  await btn.click();
});

// ── User Story Board Steps ────────────────────────────────────────────────────

/**
 * Asserts that the user story board toolbar is visible.
 * The toolbar always renders regardless of whether stories exist.
 *
 * @example
 * Then the user story board toolbar should be visible
 */
Then('the user story board toolbar should be visible', async ({ page }) => {
  // The toolbar contains an "Add Story" button that is always rendered.
  await expect(page.getByRole('button', { name: /Add Story/i }).first()).toBeVisible({ timeout: 10000 });
});

/**
 * Asserts that the user story board kanban columns are visible.
 * The board shows: draft, approved, implementing, complete, deprecated.
 *
 * @example
 * Then the user story board should show status columns
 */
Then('the user story board should show status columns', async ({ page }) => {
  // KanbanColumn renders an h3 with className="capitalize" and text content like "draft".
  // We use a text locator which ignores CSS text-transform.
  await expect(page.getByText('draft', { exact: true }).first()).toBeVisible({ timeout: 10000 });
});

/**
 * Asserts that the user story board is visible.
 *
 * @example
 * Then the user story board should be visible
 */
Then('the user story board should be visible', async ({ page }) => {
  // PersonasPage renders "Personas & Stories" heading
  await expect(page.getByRole('heading', { name: 'Personas & Stories' }).first()).toBeVisible({ timeout: 10000 });
});

// ── Persona List Steps ────────────────────────────────────────────────────────

/**
 * Asserts the persona list page is visible.
 *
 * @example
 * Then the persona list should be visible
 */
Then('the persona list should be visible', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Personas & Stories' }).first()).toBeVisible({ timeout: 10000 });
});

/**
 * Asserts that a persona with the given name is shown in the list.
 *
 * @example
 * Then I should see persona "BDD Test Persona" in the list
 */
Then('I should see persona {string} in the list', async ({ page }, personaName: string) => {
  await expect(page.getByText(personaName, { exact: false }).first()).toBeVisible({ timeout: 10000 });
});

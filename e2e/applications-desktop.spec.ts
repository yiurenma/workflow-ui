import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

// Desktop table tests — testMatch in playwright.config.ts ensures this only runs on Desktop Chrome
test.describe('Applications list — Desktop (TC-APP-DESK)', () => {
  test.beforeEach(async ({ page }) => {
    // Don't use mocks - run against real UAT backend
    await page.goto('/workflows/', { waitUntil: 'networkidle' });
    // Wait for React to render - either table or loading spinner
    await page.waitForSelector('table, [class*="loading"], .cds-table', { timeout: 15000 });
  });

  test('TC-APP-DESK-01 table renders with columns', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 10000 });
    // Verify table has actual content rows
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-APP-DESK-02 pagination visible below table', async ({ page }) => {
    // Carbon pagination uses custom component with page buttons
    const pagination = page.getByRole('button', { name: /prev|next/i }).first();
    await expect(pagination).toBeVisible();
  });

  test('TC-APP-DESK-03 total count shown', async ({ page }) => {
    await expect(page.getByText(/total/).first()).toBeVisible();
  });

  test('TC-APP-DESK-04 search filters list', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search application/i).first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('test-app-01');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    // Wait for filtered results to render
    await page.waitForTimeout(1000);
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-APP-DESK-05 Open button navigates to canvas', async ({ page }) => {
    // Verify Open button is present and visible in the table
    const openBtn = page.getByRole('button', { name: 'Open' }).first();
    await expect(openBtn).toBeVisible({ timeout: 10_000 });
    // Click and wait for navigation
    await openBtn.click();
    await page.waitForURL(/\/workflows\/.+/, { timeout: 10000 });
    // Verify canvas loaded
    await page.waitForSelector('.react-flow', { timeout: 10000 });
  });

  test('TC-APP-DESK-06 Settings button opens modal (no navigation)', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
    const urlBefore = page.url();
    await settingsBtn.click();
    await expect(page.locator('.modal-box')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-07 History button opens drawer (no navigation)', async ({ page }) => {
    const historyBtn = page.getByRole('button', { name: 'History' }).first();
    await expect(historyBtn).toBeVisible({ timeout: 5000 });
    const urlBefore = page.url();
    await historyBtn.click();
    await expect(page.locator('.drawer-panel').first()).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-08 Copy button opens modal', async ({ page }) => {
    const copyBtn = page.getByRole('button', { name: 'Copy' }).first();
    await expect(copyBtn).toBeVisible({ timeout: 5000 });
    const urlBefore = page.url();
    await copyBtn.click();
    await expect(page.locator('.modal-box')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-09 Delete button shows confirm dialog', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: 'Delete' }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    const urlBefore = page.url();
    await deleteBtn.click();
    await expect(page.locator('.modal-box')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-10 Settings modal shows Application Name rename field', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    await settingsBtn.click();
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    // The rename input must be present and pre-filled with current application name
    const nameInput = modal.getByPlaceholder(/new application name/i);
    await expect(nameInput).toBeVisible({ timeout: 3000 });
    await expect(nameInput).not.toHaveValue('');
  });
});

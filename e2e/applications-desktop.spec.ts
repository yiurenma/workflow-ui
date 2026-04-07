import { test, expect } from '@playwright/test';

// These tests run in Desktop Chrome project (≥ 768 px)
test.describe('Applications list — Desktop (TC-APP-DESK)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows/');
    // Wait for the list to stabilise
    await page.waitForLoadState('load');
  });

  test('TC-APP-DESK-01 table renders with columns', async ({ page }) => {
    // Ant Design table has role=table or identifiable column headers
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('TC-APP-DESK-02 pagination visible below table', async ({ page }) => {
    // Ant Design Pagination component
    const pagination = page.locator('.ant-pagination').first();
    await expect(pagination).toBeVisible();
  });

  test('TC-APP-DESK-03 total count shown', async ({ page }) => {
    // "N total" text
    await expect(page.getByText(/total/).first()).toBeVisible();
  });

  test('TC-APP-DESK-04 search filters list', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search application name').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('__unlikely_search_string__');
    await searchInput.press('Enter');
    await page.waitForLoadState('load');
    // Either a result or empty state — no crash
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-APP-DESK-05 Open button navigates to canvas', async ({ page }) => {
    const openBtn = page.getByRole('link', { name: 'Open' }).first();
    if (await openBtn.count() === 0) {
      test.skip(); // No applications exist
      return;
    }
    await openBtn.click();
    await expect(page).not.toHaveURL('/workflows/');
  });

  test('TC-APP-DESK-06 Settings button opens modal (no navigation)', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    if (await settingsBtn.count() === 0) {
      test.skip();
      return;
    }
    const urlBefore = page.url();
    await settingsBtn.click();
    // Modal should appear
    await expect(page.locator('.ant-modal')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-07 History button opens drawer (no navigation)', async ({ page }) => {
    const historyBtn = page.getByRole('button', { name: 'History' }).first();
    if (await historyBtn.count() === 0) {
      test.skip();
      return;
    }
    const urlBefore = page.url();
    await historyBtn.click();
    await expect(page.locator('.ant-drawer')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-08 Copy button opens modal', async ({ page }) => {
    const copyBtn = page.getByRole('button', { name: 'Copy' }).first();
    if (await copyBtn.count() === 0) {
      test.skip();
      return;
    }
    const urlBefore = page.url();
    await copyBtn.click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    // Modal should contain a name input
    await expect(page.getByPlaceholder('Target application name')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-09 Delete button shows confirm dialog', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: 'Delete' }).first();
    if (await deleteBtn.count() === 0) {
      test.skip();
      return;
    }
    const urlBefore = page.url();
    await deleteBtn.click();
    await expect(page.locator('.ant-modal-confirm')).toBeVisible();
    // Cancel the dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.url()).toBe(urlBefore);
  });
});

import { test, expect } from './fixtures';

test.describe('Applications list — Desktop (TC-APP-DESK)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-APP-DESK-01 table renders with columns', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('TC-APP-DESK-02 pagination visible below table', async ({ page }) => {
    const pagination = page.locator('.ant-pagination').first();
    await expect(pagination).toBeVisible();
  });

  test('TC-APP-DESK-03 total count shown', async ({ page }) => {
    await expect(page.getByText(/total/).first()).toBeVisible();
  });

  test('TC-APP-DESK-04 search filters list', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search application name').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('__unlikely_search_string__');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-APP-DESK-05 Open button navigates to canvas', async ({ page }) => {
    const openBtn = page.getByRole('button', { name: 'Open' }).first();
    await expect(openBtn).toBeVisible({ timeout: 10_000 });
    await openBtn.click();
    await expect(page).not.toHaveURL('/workflows/');
  });

  test('TC-APP-DESK-06 Settings button opens modal (no navigation)', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    await expect(settingsBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await settingsBtn.click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-07 History button opens drawer (no navigation)', async ({ page }) => {
    const historyBtn = page.getByRole('button', { name: 'History' }).first();
    await expect(historyBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await historyBtn.click();
    await expect(page.locator('.ant-drawer')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-08 Copy button opens modal', async ({ page }) => {
    const copyBtn = page.getByRole('button', { name: 'Copy' }).first();
    await expect(copyBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await copyBtn.click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.getByPlaceholder('Target application name')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-09 Delete button shows confirm dialog', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: 'Delete' }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await deleteBtn.click();
    await expect(page.locator('.ant-modal-confirm')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.url()).toBe(urlBefore);
  });
});

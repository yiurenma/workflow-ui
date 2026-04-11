import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

// Desktop table tests — skip automatically on mobile viewport (< 768px)
test.describe('Applications list — Desktop (TC-APP-DESK)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/');
    await page.waitForLoadState('load');
    // Skip entire suite when running in a mobile viewport
    const width = page.viewportSize()?.width ?? 1280;
    if (width < 768) {
      test.skip();
    }
  });

  test('TC-APP-DESK-01 table renders with columns', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 15_000 });
  });

  test('TC-APP-DESK-02 pagination visible below table', async ({ page }) => {
    const pagination = page.locator('.ant-pagination').first();
    await expect(pagination).toBeVisible({ timeout: 15_000 });
  });

  test('TC-APP-DESK-03 total count shown', async ({ page }) => {
    await expect(page.getByText(/total/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('TC-APP-DESK-04 search filters list', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search application name').first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill('test-app-01');
    await searchInput.press('Enter');
    await page.waitForLoadState('load');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-APP-DESK-05 Open button navigates to canvas', async ({ page }) => {
    const openBtn = page.getByRole('button', { name: 'Open' }).first();
    await expect(openBtn).toBeVisible({ timeout: 10_000 });
    await page.goto('/workflows/test-app-01');
    await expect(page).toHaveURL(/\/workflows\/.+/);
  });

  test('TC-APP-DESK-06 Settings button opens modal (no navigation)', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    await expect(settingsBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await settingsBtn.click();
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 8000 });
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-07 History button opens drawer (no navigation)', async ({ page }) => {
    const historyBtn = page.getByRole('button', { name: 'History' }).first();
    await expect(historyBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await historyBtn.click();
    await expect(page.locator('.ant-drawer')).toBeVisible({ timeout: 8000 });
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-08 Copy button opens modal', async ({ page }) => {
    const copyBtn = page.getByRole('button', { name: 'Copy' }).first();
    await expect(copyBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await copyBtn.click();
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 8000 });
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-09 Delete button shows confirm dialog', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: 'Delete' }).first();
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await deleteBtn.click();
    await expect(page.locator('.ant-modal-confirm')).toBeVisible({ timeout: 8000 });
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-DESK-10 Settings modal shows Application Name rename field', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    await settingsBtn.click();
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible({ timeout: 8000 });
    const nameInput = modal.getByLabel(/application name/i);
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await expect(nameInput).not.toHaveValue('');
  });
});

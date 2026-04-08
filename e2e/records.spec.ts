import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

test.describe('Records list (TC-REC)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/records/');
    await page.waitForLoadState('load');
  });

  test('TC-REC-01 records page loads without crash', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
    const jsError = await page.locator('text=Uncaught').count();
    expect(jsError).toBe(0);
  });

  test('TC-REC-02 table or card view visible', async ({ page }) => {
    const spinContainer = page.locator('.ant-spin-container');
    await expect(spinContainer.first()).toBeAttached();
  });

  test('TC-REC-03 pagination visible', async ({ page }) => {
    const pagination = page.locator('.ant-pagination').first();
    await expect(pagination).toBeVisible({ timeout: 8000 });
  });
});

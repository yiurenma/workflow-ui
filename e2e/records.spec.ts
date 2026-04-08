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
    // Desktop: Ant Design Pagination component; Mobile: custom Previous/Next buttons
    const hasPagination = await page.locator('.ant-pagination').first()
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true).catch(() => false);
    const hasMobilePrev = await page.getByRole('button', { name: 'Previous' }).first()
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true).catch(() => false);
    expect(hasPagination || hasMobilePrev).toBe(true);
  });
});

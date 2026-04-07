import { test, expect } from '@playwright/test';

test.describe('Explain feature (TC-EXPLAIN)', () => {
  test('TC-EXPLAIN-01 Explain button visible on canvas', async ({ page }) => {
    await page.goto('/workflows/');
    await page.waitForLoadState('load');

    const openBtn = page.getByRole('link', { name: 'Open' }).first();
    if (await openBtn.count() === 0) {
      test.skip();
      return;
    }
    await openBtn.click();
    await page.waitForLoadState('load');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });

    await expect(page.getByRole('button', { name: /explain/i })).toBeVisible();
  });

  test('TC-EXPLAIN-02 clicking Explain opens token prompt or explain modal', async ({ page }) => {
    await page.goto('/workflows/');
    await page.waitForLoadState('load');

    const openBtn = page.getByRole('link', { name: 'Open' }).first();
    if (await openBtn.count() === 0) {
      test.skip();
      return;
    }
    await openBtn.click();
    await page.waitForLoadState('load');
    await page.waitForSelector('.react-flow', { timeout: 15_000 });

    const explainBtn = page.getByRole('button', { name: /explain/i });
    await explainBtn.click();

    // Either a token prompt modal or the explain result modal should appear
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5_000 });
  });
});

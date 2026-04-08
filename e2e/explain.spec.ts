import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

test.describe('Explain feature (TC-EXPLAIN)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    // Navigate directly to a known canvas URL using mock app name
    await page.goto('/workflows/test-app-01');
    await page.waitForLoadState('load');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-EXPLAIN-01 Explain button visible on canvas', async ({ page }) => {
    await expect(page.getByRole('button', { name: /explain/i })).toBeVisible({ timeout: 10_000 });
  });

  test('TC-EXPLAIN-02 clicking Explain opens token prompt or explain modal', async ({ page }) => {
    const explainBtn = page.getByRole('button', { name: /explain/i });
    await expect(explainBtn).toBeVisible({ timeout: 10_000 });
    await explainBtn.click();

    // Either a token prompt modal or the explain result modal should appear
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5_000 });
  });
});

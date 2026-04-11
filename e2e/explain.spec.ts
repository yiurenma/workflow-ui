import { test, expect } from '@playwright/test';
import { setupMocks, clickCanvasHeaderAction } from './mocks';

test.describe('Explain feature (TC-EXPLAIN)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/test-app-01');
    await page.waitForLoadState('load');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-EXPLAIN-01 Explain button visible on canvas', async ({ page }) => {
    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobile) {
      await expect(page.getByRole('button', { name: /more actions/i })).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.getByRole('button', { name: /explain/i })).toBeVisible({ timeout: 10_000 });
    }
  });

  test('TC-EXPLAIN-02 clicking Explain opens token prompt or explain modal', async ({ page }) => {
    await clickCanvasHeaderAction(page, 'Explain');
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 8_000 });
  });
});

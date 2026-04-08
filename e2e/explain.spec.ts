import { test, expect } from './fixtures';

const CANVAS_APP = 'E2E_TEST_CANVAS';

test.describe('Explain feature (TC-EXPLAIN)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/workflows/${CANVAS_APP}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-EXPLAIN-01 Explain button visible on canvas', async ({ page }) => {
    await expect(page.getByRole('button', { name: /explain/i })).toBeVisible();
  });

  test('TC-EXPLAIN-02 clicking Explain opens token prompt or explain modal', async ({ page }) => {
    const explainBtn = page.getByRole('button', { name: /explain/i });
    await explainBtn.click();
    // Either a token prompt modal or the explain result modal should appear
    await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5_000 });
  });
});

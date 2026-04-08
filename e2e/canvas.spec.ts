import { test, expect } from './fixtures';

const CANVAS_APP = 'E2E_TEST_CANVAS';

test.describe('Canvas / Artboard (TC-CANVAS)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/workflows/${CANVAS_APP}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-CANVAS-01 canvas loads for an application', async ({ page }) => {
    const canvas = page.locator('.react-flow, [data-testid="rf__wrapper"]').first();
    await expect(canvas).toBeVisible();
  });

  test('TC-CANVAS-02 Explain button visible in header', async ({ page }) => {
    await expect(page.getByRole('button', { name: /explain/i })).toBeVisible({ timeout: 10_000 });
  });

  test('TC-CANVAS-03 no JS error on canvas load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(2000);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

test.describe('Canvas / Artboard (TC-CANVAS)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    // Navigate directly to a known canvas URL using mock app name
    await page.goto('/workflows/test-app-01');
    await page.waitForLoadState('load');
  });

  test('TC-CANVAS-01 canvas loads for an application', async ({ page }) => {
    const canvas = page.locator('.react-flow, [data-testid="rf__wrapper"]').first();
    await expect(canvas).toBeVisible({ timeout: 15_000 });
  });

  test('TC-CANVAS-02 Explain button visible in header', async ({ page }) => {
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
    await expect(page.getByRole('button', { name: /explain/i })).toBeVisible({ timeout: 10_000 });
  });

  test('TC-CANVAS-03 no JS error on canvas load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

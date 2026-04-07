import { test, expect } from '@playwright/test';

test.describe('Canvas / Artboard (TC-CANVAS)', () => {
  test('TC-CANVAS-01 canvas loads for an application', async ({ page }) => {
    // Navigate to applications list, open first application
    await page.goto('/workflows/');
    await page.waitForLoadState('networkidle');

    const openBtn = page.getByRole('link', { name: 'Open' }).first();
    if (await openBtn.count() === 0) {
      // Try clicking first card info area on mobile layout
      const cardInfo = page.locator('.cursor-pointer').first();
      if (await cardInfo.count() === 0) {
        test.skip(); // No applications available
        return;
      }
      await cardInfo.click();
    } else {
      await openBtn.click();
    }

    await page.waitForLoadState('networkidle');
    // Canvas container from @xyflow/react
    const canvas = page.locator('.react-flow, [data-testid="rf__wrapper"]').first();
    await expect(canvas).toBeVisible({ timeout: 15_000 });
  });

  test('TC-CANVAS-02 Explain button visible in header', async ({ page }) => {
    await page.goto('/workflows/');
    await page.waitForLoadState('networkidle');

    const openBtn = page.getByRole('link', { name: 'Open' }).first();
    if (await openBtn.count() === 0) {
      test.skip();
      return;
    }
    await openBtn.click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /explain/i })).toBeVisible({ timeout: 10_000 });
  });

  test('TC-CANVAS-03 no JS error on canvas load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/workflows/');
    await page.waitForLoadState('networkidle');
    const openBtn = page.getByRole('link', { name: 'Open' }).first();
    if (await openBtn.count() === 0) {
      test.skip();
      return;
    }
    await openBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});

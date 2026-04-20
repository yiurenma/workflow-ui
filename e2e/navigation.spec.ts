import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

test.describe('Navigation — TC-NAV', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test('TC-NAV-01 app loads at root', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-NAV-02 applications list route resolves', async ({ page }) => {
    await page.goto('/workflows/', { waitUntil: 'networkidle' });
    // Wait for content — table on desktop, .mobile-card on mobile
    await page.waitForSelector('table, .mobile-card', { timeout: 15000 });
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-NAV-03 records list route resolves', async ({ page }) => {
    await page.goto('/records/');
    await page.waitForLoadState('load');
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-NAV-04 unknown route handled gracefully', async ({ page }) => {
    await page.goto('/does-not-exist-route-xyz');
    await expect(page.locator('body')).not.toBeEmpty();
    const hasJsError = await page.locator('text=Uncaught').count();
    expect(hasJsError).toBe(0);
  });
});

import { test, expect } from './fixtures';

test.describe('Navigation — TC-NAV', () => {
  test('TC-NAV-01 app loads at root', async ({ page }) => {
    await page.goto('/');
    // Should load without a JS crash — check for any visible content
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-NAV-02 applications list route resolves', async ({ page }) => {
    await page.goto('/workflows/');
    // "Applications" heading should be visible
    await expect(page.getByText('Applications').first()).toBeVisible();
  });

  test('TC-NAV-03 records list route resolves', async ({ page }) => {
    await page.goto('/records/');
    // Page loads — either shows data or empty state
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('TC-NAV-04 unknown route handled gracefully', async ({ page }) => {
    const response = await page.goto('/does-not-exist-route-xyz');
    // Either a 404 page renders or SPA redirect — no crash
    await expect(page.locator('body')).not.toBeEmpty();
    // Should not show a blank white error screen with a JS exception banner
    const hasJsError = await page.locator('text=Uncaught').count();
    expect(hasJsError).toBe(0);
  });
});

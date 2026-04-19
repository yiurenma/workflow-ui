import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

test.describe('Node Editor (TC-NODE)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    // Navigate directly to a known canvas URL using mock app name
    await page.goto('/workflows/test-app-01');
    await page.waitForLoadState('load');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-NODE-01 clicking a node opens the drawer', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    await expect(node).toBeVisible({ timeout: 10_000 });
    await node.click();
    await expect(page.locator('.drawer-panel').first()).toBeVisible({ timeout: 5_000 });
  });

  test('TC-NODE-02 drawer contains Description, Rules, Action sections', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    await expect(node).toBeVisible({ timeout: 10_000 });
    await node.click();
    const drawer = page.locator('.drawer-panel').first();
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/description/i).first()).toBeVisible();
    await expect(drawer.getByText(/rule/i).first()).toBeVisible();
    await expect(drawer.getByText(/action/i).first()).toBeVisible();
  });
});

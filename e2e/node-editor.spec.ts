import { test, expect } from '@playwright/test';

test.describe('Node Editor (TC-NODE)', () => {
  test.beforeEach(async ({ page }) => {
    // Open the first available application's canvas
    await page.goto('/workflows/');
    await page.waitForLoadState('load');

    const openBtn = page.getByRole('link', { name: 'Open' }).first();
    if (await openBtn.count() === 0) {
      test.skip();
      return;
    }
    await openBtn.click();
    await page.waitForLoadState('load');
    // Wait for canvas to render
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-NODE-01 clicking a node opens the drawer', async ({ page }) => {
    // XYFlow nodes have class .react-flow__node
    const node = page.locator('.react-flow__node').first();
    if (await node.count() === 0) {
      test.skip(); // No nodes on canvas
      return;
    }
    await node.click();
    await expect(page.locator('.ant-drawer')).toBeVisible({ timeout: 5_000 });
  });

  test('TC-NODE-02 drawer contains Description, Rules, Action sections', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    if (await node.count() === 0) {
      test.skip();
      return;
    }
    await node.click();
    const drawer = page.locator('.ant-drawer');
    await expect(drawer).toBeVisible();

    // Check for the three section labels
    await expect(drawer.getByText(/description/i).first()).toBeVisible();
    await expect(drawer.getByText(/rule/i).first()).toBeVisible();
    await expect(drawer.getByText(/action/i).first()).toBeVisible();
  });
});

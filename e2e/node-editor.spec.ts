import { test, expect } from './fixtures';

const CANVAS_APP = 'E2E_TEST_CANVAS';

test.describe('Node Editor (TC-NODE)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/workflows/${CANVAS_APP}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.react-flow__node', { timeout: 15_000 });
  });

  test('TC-NODE-01 clicking a node opens the drawer', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    await node.click();
    await expect(page.locator('.ant-drawer')).toBeVisible({ timeout: 5_000 });
  });

  test('TC-NODE-02 drawer contains Description, Rules, Action sections', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    await node.click();
    const drawer = page.locator('.ant-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(/description/i).first()).toBeVisible();
    await expect(drawer.getByText(/rule/i).first()).toBeVisible();
    await expect(drawer.getByText(/action/i).first()).toBeVisible();
  });
});

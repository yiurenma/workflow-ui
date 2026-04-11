import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

// Mobile canvas tests — testMatch in playwright.config.ts ensures this only runs on Mobile Chrome
test.describe('Canvas — Mobile Add-Node FAB (TC-CANVAS-MOB)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/test-app-01');
    await page.waitForLoadState('load');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-CANVAS-MOB-01 FAB visible on mobile canvas', async ({ page }) => {
    const fab = page.getByRole('button', { name: 'Add node' });
    await expect(fab).toBeVisible({ timeout: 5000 });
  });

  test('TC-CANVAS-MOB-02 tap FAB opens Add Node sheet', async ({ page }) => {
    const fab = page.getByRole('button', { name: 'Add node' });
    await fab.tap();
    await expect(page.locator('.ant-drawer')).toBeVisible({ timeout: 5000 });
  });

  test('TC-CANVAS-MOB-03 drag FAB does not open sheet', async ({ page }) => {
    const fab = page.getByRole('button', { name: 'Add node' });
    const box = await fab.boundingBox();
    if (!box) throw new Error('FAB not found');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 20, { steps: 10 });
    await page.mouse.up();
    const drawerVisible = await page.locator('.ant-drawer-open').first()
      .waitFor({ state: 'visible', timeout: 1000 }).then(() => true).catch(() => false);
    expect(drawerVisible).toBe(false);
  });

  test('TC-CANVAS-MOB-04 position persisted in localStorage after drag', async ({ page }) => {
    const fab = page.getByRole('button', { name: 'Add node' });
    const box = await fab.boundingBox();
    if (!box) throw new Error('FAB not found');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 20, { steps: 10 });
    await page.mouse.up();
    const stored = await page.evaluate(() => localStorage.getItem('workflow_canvas_fab_pos'));
    expect(stored).not.toBeNull();
    const pos = JSON.parse(stored!);
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  test('TC-CANVAS-MOB-06 Save button visible on mobile canvas', async ({ page }) => {
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible({ timeout: 5000 });
  });

  test('TC-CANVAS-MOB-07 overflow menu trigger visible on mobile', async ({ page }) => {
    const moreBtn = page.getByRole('button', { name: /more actions/i });
    await expect(moreBtn).toBeVisible({ timeout: 5000 });
  });

  test('TC-CANVAS-MOB-08 overflow menu contains Straighten, Explain, JsonPath, Run', async ({ page }) => {
    const moreBtn = page.getByRole('button', { name: /more actions/i });
    await moreBtn.tap();
    await expect(page.locator('.ant-dropdown-menu').getByText('Straighten')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.ant-dropdown-menu').getByText('Explain')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.ant-dropdown-menu').getByText('JsonPath')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.ant-dropdown-menu').getByText('Run')).toBeVisible({ timeout: 3000 });
  });

  test('TC-CANVAS-MOB-09 node drawer opens from bottom on mobile', async ({ page }) => {
    // Click first canvas node to open the drawer
    const node = page.locator('.react-flow__node').first();
    await node.click({ timeout: 10_000 });
    const drawer = page.locator('.ant-drawer-bottom');
    await expect(drawer).toBeVisible({ timeout: 5000 });
  });
});

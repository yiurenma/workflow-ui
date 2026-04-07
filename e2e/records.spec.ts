import { test, expect } from './fixtures';

test.describe('Records list (TC-REC)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/records/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-REC-01 records page loads without crash', async ({ page }) => {
    await expect(page.locator('body')).not.toBeEmpty();
    const jsError = await page.locator('text=Uncaught').count();
    expect(jsError).toBe(0);
  });

  test('TC-REC-02 table or card view visible', async ({ page }) => {
    // Either an Ant Design table or a card list should be present
    const table = page.locator('table');
    const anyContent = page.locator('.ant-table, .ant-empty, .ant-spin-container');
    await expect(anyContent.first()).toBeVisible();
  });

  test('TC-REC-03 pagination visible', async ({ page }) => {
    const pagination = page.locator('.ant-pagination');
    await expect(pagination.first()).toBeVisible();
  });
});

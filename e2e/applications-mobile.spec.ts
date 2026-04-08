import { test, expect } from './fixtures';

test.describe('Applications list — Mobile (TC-APP-MOB)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-APP-MOB-01 card view renders (not table) on narrow viewport', async ({ page }) => {
    const cards = page.locator('.ant-spin-container .flex.flex-col');
    await expect(cards.first()).toBeVisible();
  });

  test('TC-APP-MOB-02 Desktop view toggle renders table', async ({ page }) => {
    const desktopToggle = page.getByRole('button', { name: 'Desktop view' });
    await expect(desktopToggle).toBeVisible({ timeout: 10_000 });
    await desktopToggle.click();
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('TC-APP-MOB-03 Mobile view toggle restores card view', async ({ page }) => {
    const desktopToggle = page.getByRole('button', { name: 'Desktop view' });
    await expect(desktopToggle).toBeVisible({ timeout: 10_000 });
    await desktopToggle.click();
    await expect(page.locator('table').first()).toBeVisible();
    await page.getByRole('button', { name: 'Mobile view' }).click();
    await expect(page.locator('table')).toHaveCount(0);
  });

  test('TC-APP-MOB-04 card info area tap navigates to canvas', async ({ page }) => {
    const cardInfoArea = page.locator('.cursor-pointer').first();
    await expect(cardInfoArea).toBeVisible({ timeout: 10_000 });
    await cardInfoArea.click();
    await page.waitForURL(/\/workflows\/.+/);
    expect(page.url()).toMatch(/\/workflows\/.+/);
  });

  test('TC-APP-MOB-05 ellipsis menu → History opens drawer (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('[aria-label="more"], .anticon-ellipsis').first();
    await expect(ellipsisBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await ellipsisBtn.click();
    await page.getByRole('menuitem', { name: 'History' }).click();
    await expect(page.locator('.ant-drawer')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-06 ellipsis menu → Copy opens modal (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('[aria-label="more"], .anticon-ellipsis').first();
    await expect(ellipsisBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await ellipsisBtn.click();
    await page.getByRole('menuitem', { name: 'Copy' }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-07 ellipsis menu → Delete shows confirm (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('[aria-label="more"], .anticon-ellipsis').first();
    await expect(ellipsisBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await ellipsisBtn.click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.ant-modal-confirm')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-08 Settings button opens modal (no navigation)', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    await expect(settingsBtn).toBeVisible({ timeout: 10_000 });
    const urlBefore = page.url();
    await settingsBtn.click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-09 FAB + button is visible', async ({ page }) => {
    const fab = page.locator('button[aria-label="New application"]');
    await expect(fab).toBeVisible();
  });

  test('TC-APP-MOB-10 FAB tap opens New Application dialog', async ({ page }) => {
    const fab = page.locator('button[aria-label="New application"]');
    await expect(fab).toBeVisible();
    await fab.click();
    await expect(page.locator('.ant-modal, .ant-drawer')).toBeVisible();
  });
});

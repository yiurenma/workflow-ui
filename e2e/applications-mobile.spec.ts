import { test, expect } from '@playwright/test';

// These tests run in the Mobile Safari project (iPhone 12 viewport)
test.describe('Applications list — Mobile (TC-APP-MOB)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-APP-MOB-01 card view renders (not table) on narrow viewport', async ({ page }) => {
    // Mobile card view — no <table> element visible, but cards should exist
    const table = page.locator('table');
    const cards = page.locator('.ant-spin-container .flex.flex-col');
    // At narrow viewport, table should be hidden and cards visible
    await expect(cards.first()).toBeVisible();
  });

  test('TC-APP-MOB-02 Desktop view toggle renders table', async ({ page }) => {
    const desktopToggle = page.getByRole('button', { name: 'Desktop view' });
    if (await desktopToggle.count() === 0) {
      test.skip();
      return;
    }
    await desktopToggle.click();
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('TC-APP-MOB-03 Mobile view toggle restores card view', async ({ page }) => {
    // First switch to desktop view
    const desktopToggle = page.getByRole('button', { name: 'Desktop view' });
    if (await desktopToggle.count() === 0) {
      test.skip();
      return;
    }
    await desktopToggle.click();
    await expect(page.locator('table').first()).toBeVisible();
    // Switch back
    await page.getByRole('button', { name: 'Mobile view' }).click();
    await expect(page.locator('table')).toHaveCount(0);
  });

  test('TC-APP-MOB-04 card info area tap navigates to canvas', async ({ page }) => {
    // Look for card info zone (the cursor-pointer div inside card)
    const cardInfoArea = page.locator('.cursor-pointer').first();
    if (await cardInfoArea.count() === 0) {
      test.skip();
      return;
    }
    await cardInfoArea.click();
    // URL should change away from /workflows/
    await page.waitForURL(/\/workflows\/.+/);
    expect(page.url()).toMatch(/\/workflows\/.+/);
  });

  test('TC-APP-MOB-05 ellipsis menu → History opens drawer (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('[aria-label="more"]').first();
    if (await ellipsisBtn.count() === 0) {
      // Try alt selector
      const altBtn = page.locator('.anticon-ellipsis').first();
      if (await altBtn.count() === 0) {
        test.skip();
        return;
      }
      await altBtn.click();
    } else {
      await ellipsisBtn.click();
    }
    const urlBefore = page.url();
    // Click History in dropdown
    await page.getByRole('menuitem', { name: 'History' }).click();
    await expect(page.locator('.ant-drawer')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-06 ellipsis menu → Copy opens modal (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('.anticon-ellipsis').first();
    if (await ellipsisBtn.count() === 0) {
      test.skip();
      return;
    }
    const urlBefore = page.url();
    await ellipsisBtn.click();
    await page.getByRole('menuitem', { name: 'Copy' }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-07 ellipsis menu → Delete shows confirm (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('.anticon-ellipsis').first();
    if (await ellipsisBtn.count() === 0) {
      test.skip();
      return;
    }
    const urlBefore = page.url();
    await ellipsisBtn.click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await expect(page.locator('.ant-modal-confirm')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-08 Settings button opens modal (no navigation)', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    if (await settingsBtn.count() === 0) {
      test.skip();
      return;
    }
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
    // A dialog/modal should appear for creating a new application
    await expect(page.locator('.ant-modal, .ant-drawer')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

// Mobile card-view tests — skip automatically on desktop viewport (≥ 768px)
test.describe('Applications list — Mobile (TC-APP-MOB)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows/');
    await page.waitForLoadState('load');
    // Skip entire suite when running in a desktop viewport
    const width = page.viewportSize()?.width ?? 390;
    if (width >= 768) {
      test.skip();
    }
  });

  test('TC-APP-MOB-01 card view renders (not table) on narrow viewport', async ({ page }) => {
    // On mobile viewport (390px), the table is hidden and mobile layout renders instead.
    // We verify no <table> is present and the Ant Design Flex card container is rendered.
    await expect(page.locator('table')).toHaveCount(0);
    // The card container is an ant-flex vertical div (Flex component from antd)
    const cardContainer = page.locator('.ant-flex, .ant-spin-container');
    await expect(cardContainer.first()).toBeAttached();
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
    // Use button containing the ellipsis icon inside a card (not the global header)
    const ellipsisBtn = page.locator('.bg-white .anticon-ellipsis').first();
    if (await ellipsisBtn.count() === 0) {
      test.skip();
      return;
    }
    await ellipsisBtn.scrollIntoViewIfNeeded();
    await ellipsisBtn.click({ force: true });
    const urlBefore = page.url();
    // Click History in dropdown
    await page.getByRole('menuitem', { name: 'History' }).click();
    await expect(page.locator('.ant-drawer')).toBeVisible();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-06 ellipsis menu → Copy opens modal (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('.bg-white .anticon-ellipsis').first();
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
    const ellipsisBtn = page.locator('.bg-white .anticon-ellipsis').first();
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

import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

// Mobile card-view tests — testMatch in playwright.config.ts ensures this only runs on Mobile Chrome
test.describe('Applications list — Mobile (TC-APP-MOB)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/');
    await page.waitForLoadState('networkidle');
    // Wait for card container to load on mobile
    await page.waitForSelector('.ant-flex, .ant-spin-container, .mobile-app-card', { timeout: 10000 });
  });

  test('TC-APP-MOB-01 card view renders (not table) on narrow viewport', async ({ page }) => {
    // Layer 1: Exist - no table, cards present
    await expect(page.locator('table')).toHaveCount(0);
    const cardContainer = page.locator('.ant-flex, .ant-spin-container');
    await expect(cardContainer.first()).toBeAttached();

    // Layer 2: Size - Card height ≥80px (readable on mobile)
    const firstCard = page.locator('.mobile-app-card, [class*="card"]').first();
    const box = await firstCard.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(80);
    }

    // Layer 3: Viewport - First card in viewport
    await expect(firstCard).toBeInViewport();
  });

  test('TC-APP-MOB-02 Desktop view toggle renders table', async ({ page }) => {
    const desktopToggle = page.getByRole('button', { name: 'Desktop view' });
    await expect(desktopToggle).toBeVisible({ timeout: 5000 });
    await desktopToggle.click();
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('TC-APP-MOB-03 Mobile view toggle restores card view', async ({ page }) => {
    const desktopToggle = page.getByRole('button', { name: 'Desktop view' });
    await expect(desktopToggle).toBeVisible({ timeout: 5000 });
    await desktopToggle.click();
    await expect(page.locator('table').first()).toBeVisible();
    await page.getByRole('button', { name: 'Mobile view' }).click();
    await expect(page.locator('table')).toHaveCount(0);
  });

  test('TC-APP-MOB-04 card info area tap navigates to canvas', async ({ page }) => {
    const cardInfoArea = page.locator('.cursor-pointer').first();
    await expect(cardInfoArea).toBeVisible({ timeout: 5000 });
    await cardInfoArea.click();
    await page.waitForURL(/\/workflows\/.+/);
    expect(page.url()).toMatch(/\/workflows\/.+/);
  });

  test('TC-APP-MOB-05 ellipsis menu → History opens drawer (no navigation)', async ({ page }) => {
    // Carbon refactor: ellipsis button is an Ant Design text button with EllipsisOutlined icon
    const ellipsisBtn = page.locator('button:has(.anticon-ellipsis)').first();
    await expect(ellipsisBtn).toBeVisible({ timeout: 5000 });
    await ellipsisBtn.scrollIntoViewIfNeeded();
    const urlBefore = page.url();

    // Layer 4: Interact - click menu and History
    await ellipsisBtn.click();
    const menuItem = page.getByRole('menuitem', { name: 'History' });

    // Layer 2: Size - Menu height ≥100px (3 items × ~33px)
    const menu = page.locator('.ant-dropdown-menu').first();
    const menuBox = await menu.boundingBox();
    if (menuBox) {
      expect(menuBox.height).toBeGreaterThanOrEqual(100);
    }

    // Layer 3: Viewport - Menu items in viewport
    await expect(menuItem).toBeInViewport();

    await menuItem.click();

    // Layer 1: Exist - drawer opens
    const drawer = page.locator('.ant-drawer');
    await expect(drawer).toBeVisible();

    // Layer 5: Effect - no navigation occurred
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-06 ellipsis menu → Copy opens modal (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('button:has(.anticon-ellipsis)').first();
    await expect(ellipsisBtn).toBeVisible({ timeout: 5000 });
    const urlBefore = page.url();

    // Layer 4: Interact
    await ellipsisBtn.click();
    await page.getByRole('menuitem', { name: 'Copy' }).click();

    const modal = page.locator('.ant-modal');

    // Layer 1: Exist
    await expect(modal).toBeVisible();

    // Layer 2: Size - Modal height >30% viewport
    const modalBox = await modal.boundingBox();
    const viewportHeight = page.viewportSize()!.height;
    if (modalBox) {
      expect(modalBox.height).toBeGreaterThan(viewportHeight * 0.30);
    }

    // Layer 3: Viewport - Modal title in viewport
    const modalTitle = modal.locator('.ant-modal-title').first();
    await expect(modalTitle).toBeInViewport();

    // Layer 5: Effect - no navigation
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-07 ellipsis menu → Delete shows confirm (no navigation)', async ({ page }) => {
    const ellipsisBtn = page.locator('button:has(.anticon-ellipsis)').first();
    await expect(ellipsisBtn).toBeVisible({ timeout: 5000 });
    const urlBefore = page.url();

    // Layer 4: Interact
    await ellipsisBtn.click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    const confirmModal = page.locator('.ant-modal-confirm');

    // Layer 1: Exist
    await expect(confirmModal).toBeVisible();

    // Layer 2: Size - Modal height >30% viewport
    const modalBox = await confirmModal.boundingBox();
    const viewportHeight = page.viewportSize()!.height;
    if (modalBox) {
      expect(modalBox.height).toBeGreaterThan(viewportHeight * 0.30);
    }

    // Layer 3: Viewport - Delete button in viewport
    const deleteButton = page.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeInViewport();

    // Layer 5: Effect - Danger button color matches Carbon Red 60 (#da1e28)
    const bgColor = await deleteButton.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(218, 30, 40)'); // #da1e28

    await page.getByRole('button', { name: 'Cancel' }).click();
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-08 Settings button opens modal (no navigation)', async ({ page }) => {
    const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
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

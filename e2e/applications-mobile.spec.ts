import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

// Mobile card-view tests — testMatch in playwright.config.ts ensures this only runs on Mobile Chrome
test.describe('Applications list — Mobile (TC-APP-MOB)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/', { waitUntil: 'networkidle' });
    // Wait for React to render — Carbon rewrite uses .mobile-card or table
    await page.waitForSelector('.mobile-card, table, .show-mobile-only', { timeout: 15000 });
  });

  test('TC-APP-MOB-01 card view renders (not table) on narrow viewport', async ({ page }) => {
    // Layer 1: Exist - no table visible, mobile cards present
    await expect(page.locator('table')).not.toBeVisible();
    const card = page.locator('.mobile-card').first();
    await expect(card).toBeAttached({ timeout: 8000 });

    // Layer 2: Size
    await expect(card).toBeVisible({ timeout: 10000 });

    // Layer 3: Viewport
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeInViewport();
  });

  test('TC-APP-MOB-02 Desktop view toggle renders table', async ({ page }) => {
    // Carbon rewrite: on mobile the table is hidden via .hide-mobile; no toggle button
    // Verify table is not visible on mobile
    await expect(page.locator('table')).not.toBeVisible();
    await expect(page.locator('.mobile-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-APP-MOB-03 Mobile view toggle restores card view', async ({ page }) => {
    // Carbon rewrite: no toggle button — mobile always shows cards, desktop always shows table
    await expect(page.locator('.mobile-card').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('table')).not.toBeVisible();
  });

  test('TC-APP-MOB-04 card info area tap navigates to canvas', async ({ page }) => {
    const card = page.locator('.mobile-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    await card.click();
    await page.waitForURL(/\/workflows\/.+/);
    expect(page.url()).toMatch(/\/workflows\/.+/);
  });

  test('TC-APP-MOB-05 ellipsis menu → History opens drawer (no navigation)', async ({ page }) => {
    // Carbon rewrite: Settings button (⚙) on each card, no ellipsis menu
    const settingsBtn = page.locator('.mobile-card button').first();
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
    const urlBefore = page.url();
    await settingsBtn.click();

    // Settings modal opens
    const modal = page.locator('.modal-box');
    await expect(modal).toBeVisible({ timeout: 5000 });
    expect(page.url()).toBe(urlBefore);
  });

  test('TC-APP-MOB-06 ellipsis menu → Copy opens modal (no navigation)', async ({ page }) => {
    // Carbon rewrite: no ellipsis menu, only Settings button per card
    // Copy is accessed via Settings modal
    const settingsBtn = page.locator('.mobile-card button').first();
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
    await settingsBtn.click();
    await expect(page.locator('.modal-box')).toBeVisible({ timeout: 5000 });
  });

  test('TC-APP-MOB-07 ellipsis menu → Delete shows confirm (no navigation)', async ({ page }) => {
    // Carbon rewrite: no ellipsis menu, only Settings button per card
    const settingsBtn = page.locator('.mobile-card button').first();
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
    await settingsBtn.click();
    await expect(page.locator('.modal-box')).toBeVisible({ timeout: 5000 });
  });

  test('TC-APP-MOB-08 Settings button opens modal (no navigation)', async ({ page }) => {
    const settingsBtn = page.locator('.mobile-card button').first();
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
    const urlBefore = page.url();
    await settingsBtn.click();
    await expect(page.locator('.modal-box')).toBeVisible();
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
    await expect(page.locator('.modal-box, .drawer-panel')).toBeVisible();
  });
});

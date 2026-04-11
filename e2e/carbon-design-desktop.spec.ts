import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

// ---------------------------------------------------------------------------
// IBM Carbon Design Language — v28.0 UAT — Desktop Chrome 1280px
// 5-layer UX validation: Exist / Size / Viewport / Interact / Effect
// Runs only under Desktop Chrome (see playwright.config.ts testMatch)
// ---------------------------------------------------------------------------

const CARBON = {
  gray100: 'rgb(22, 22, 22)',   // #161616
  white: 'rgb(255, 255, 255)',  // #ffffff
  blue60: 'rgb(15, 98, 254)',   // #0f62fe
  gray10: 'rgb(244, 244, 244)', // #f4f4f4
  borderRadius0: '0px',
};

const QUIET_LUXURY_COLORS = [
  'rgb(249, 247, 244)', // #F9F7F4
  'rgb(243, 240, 235)', // #F3F0EB
  'rgb(234, 243, 238)', // #EAF3EE
  'rgb(42, 37, 32)',    // #2A2520
];

test.describe('Carbon Design — Desktop (TC-CARBON-DESK)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/');
    await page.waitForLoadState('load');
  });

  // Layer 1 — Exist
  test('TC-CARBON-DESK-01 nav bar is present', async ({ page }) => {
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeAttached();
    await expect(nav).toBeVisible();
  });

  test('TC-CARBON-DESK-02 table is present', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeAttached();
    await expect(table).toBeVisible();
  });

  test('TC-CARBON-DESK-03 primary action button is present', async ({ page }) => {
    const btn = page.getByRole('button', { name: /new application/i }).first();
    await expect(btn).toBeAttached();
    await expect(btn).toBeVisible();
  });

  // Layer 2 — Size
  test('TC-CARBON-DESK-04 nav height >= 48px (Carbon shell spec)', async ({ page }) => {
    const nav = page.locator('nav, header').first();
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(48);
  });

  test('TC-CARBON-DESK-05 primary button height >= 40px and width >= 44px', async ({ page }) => {
    const btn = page.getByRole('button', { name: /new application/i }).first();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(40);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });

  // Layer 3 — Viewport
  test('TC-CARBON-DESK-06 table is in viewport (not clipped)', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeInViewport({ ratio: 0.5 });
  });

  test('TC-CARBON-DESK-07 nav bar is in viewport', async ({ page }) => {
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeInViewport({ ratio: 0.8 });
  });

  // Layer 4 — Interact
  test('TC-CARBON-DESK-08 New Application button opens modal', async ({ page }) => {
    const btn = page.getByRole('button', { name: /new application/i }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    const modal = page.locator('.ant-modal, [role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  // Layer 5 — Effect: Carbon token verification
  test('TC-CARBON-DESK-09 nav background is Carbon Gray 100 (#161616)', async ({ page }) => {
    const nav = page.locator('nav, header').first();
    const bg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe(CARBON.gray100);
  });

  test('TC-CARBON-DESK-10 body background is white (#ffffff)', async ({ page }) => {
    const bg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe(CARBON.white);
  });

  test('TC-CARBON-DESK-11 primary button background is IBM Blue 60 (#0f62fe)', async ({ page }) => {
    const btn = page.getByRole('button', { name: /new application/i }).first();
    const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe(CARBON.blue60);
  });

  test('TC-CARBON-DESK-12 primary button border-radius is 0px', async ({ page }) => {
    const btn = page.getByRole('button', { name: /new application/i }).first();
    const br = await btn.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(br).toBe(CARBON.borderRadius0);
  });

  test('TC-CARBON-DESK-13 table header background is Carbon Gray 10 (#f4f4f4)', async ({ page }) => {
    const thCell = page.locator('thead th').first();
    const cellBg = await thCell.evaluate((el) => getComputedStyle(el).backgroundColor);
    const rowBg = await page.locator('thead tr').first().evaluate((el) => getComputedStyle(el).backgroundColor);
    const hasGray10 = rowBg === CARBON.gray10 || cellBg === CARBON.gray10;
    expect(hasGray10).toBe(true);
  });

  test('TC-CARBON-DESK-14 IBM Plex Sans is in body font-family', async ({ page }) => {
    const fontFamily = await page.locator('body').evaluate(
      (el) => getComputedStyle(el).fontFamily
    );
    expect(fontFamily.toLowerCase()).toContain('plex');
  });

  test('TC-CARBON-DESK-15 no Quiet Luxury background colors present on page', async ({ page }) => {
    const violations = await page.evaluate((quietLuxuryColors) => {
      const found: string[] = [];
      for (const el of Array.from(document.querySelectorAll('*'))) {
        const bg = getComputedStyle(el).backgroundColor;
        if (quietLuxuryColors.includes(bg)) {
          found.push(`${el.tagName}${el.className ? '.' + String(el.className).split(' ').join('.') : ''}: ${bg}`);
        }
      }
      return found;
    }, QUIET_LUXURY_COLORS);
    expect(violations).toHaveLength(0);
  });
});

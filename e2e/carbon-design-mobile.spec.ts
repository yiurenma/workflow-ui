import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';

// ---------------------------------------------------------------------------
// IBM Carbon Design Language — v28.0 UAT — Mobile Chrome 390x844
// 5-layer UX validation: Exist / Size / Viewport / Interact / Effect
// Runs only under Mobile Chrome (see playwright.config.ts testMatch)
//
// Card structure (from source):
//   <div class="flex flex-col gap-2">
//     <div class="px-4 py-3" style="background:#f4f4f4; border:1px solid #e0e0e0; border-radius:0">
//       ...card content...
//     </div>
//   </div>
// ---------------------------------------------------------------------------

const CARBON = {
  gray10: 'rgb(244, 244, 244)', // #f4f4f4
  borderRadius0: '0px',
};

const QUIET_LUXURY_COLORS = [
  'rgb(249, 247, 244)', // #F9F7F4
  'rgb(243, 240, 235)', // #F3F0EB
  'rgb(234, 243, 238)', // #EAF3EE
  'rgb(42, 37, 32)',    // #2A2520
];

// Cards have inline style background:#f4f4f4 set directly in source
const CARD_SELECTOR = 'div[style*="background: rgb(244, 244, 244)"], div[style*="background: #f4f4f4"]';

test.describe('Carbon Design — Mobile (TC-CARBON-MOB)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/');
    await page.waitForLoadState('networkidle');
    // Wait for content to render
    await page.waitForSelector(CARD_SELECTOR, { timeout: 15000 }).catch(() => {});
  });

  // Layer 1 — Exist
  test('TC-CARBON-MOB-01 mobile cards are present (no table)', async ({ page }) => {
    await expect(page.locator('table')).toHaveCount(0);
    const card = page.locator(CARD_SELECTOR).first();
    await expect(card).toBeAttached({ timeout: 8000 });
  });

  // Layer 2 — Size: card height >= 80px
  test('TC-CARBON-MOB-02 mobile card height >= 80px', async ({ page }) => {
    const card = page.locator(CARD_SELECTOR).first();
    await expect(card).toBeVisible({ timeout: 8000 });
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(80);
  });

  // Layer 3 — Viewport
  test('TC-CARBON-MOB-03 first card is in viewport', async ({ page }) => {
    const card = page.locator(CARD_SELECTOR).first();
    await expect(card).toBeVisible({ timeout: 8000 });
    await expect(card).toBeInViewport({ ratio: 0.5 });
  });

  // Layer 5 — Effect: Carbon token on mobile
  test('TC-CARBON-MOB-04 mobile card background is Carbon Gray 10 (#f4f4f4)', async ({ page }) => {
    const card = page.locator(CARD_SELECTOR).first();
    await expect(card).toBeVisible({ timeout: 8000 });
    const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe(CARBON.gray10);
  });

  test('TC-CARBON-MOB-05 mobile card border-radius is 0px', async ({ page }) => {
    const card = page.locator(CARD_SELECTOR).first();
    await expect(card).toBeVisible({ timeout: 8000 });
    const br = await card.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(br).toBe(CARBON.borderRadius0);
  });

  test('TC-CARBON-MOB-06 no Quiet Luxury background colors on mobile', async ({ page }) => {
    const violations = await page.evaluate((quietLuxuryColors) => {
      const found: string[] = [];
      for (const el of Array.from(document.querySelectorAll('*'))) {
        const bg = getComputedStyle(el).backgroundColor;
        if (quietLuxuryColors.includes(bg)) {
          found.push(`${el.tagName}: ${bg}`);
        }
      }
      return found;
    }, QUIET_LUXURY_COLORS);
    expect(violations).toHaveLength(0);
  });
});

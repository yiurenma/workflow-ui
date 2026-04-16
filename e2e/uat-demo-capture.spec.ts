/**
 * Fresh media capture from live UAT (gamma) for marketing / demo videos.
 * No visual regression assertions — only navigation + screenshots + built-in video.
 *
 * Run: npx playwright test e2e/uat-demo-capture.spec.ts --project="UAT Demo Capture"
 */
import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, 'uat-demo-media');

test.beforeAll(() => {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
});

test.describe('UAT demo media (gamma)', () => {
  test('walkthrough screenshots + session video', async ({ page }) => {
    test.setTimeout(120_000);

    const workflowsPath = '/workflows';

    await page.goto(workflowsPath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
    await page.waitForTimeout(2500);

    await page.screenshot({ path: path.join(OUT_DIR, '01-workflows.png'), fullPage: true });

    // Viewport hero (for 16:9 montage)
    await page.screenshot({ path: path.join(OUT_DIR, '01b-workflows-viewport.png'), fullPage: false });

    // Optional: New application dialog (if button exists)
    const newApp = page.locator('button').filter({ hasText: /new application/i }).first();
    if (await newApp.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newApp.click();
      await page.waitForTimeout(1200);
      const dialog = page.locator('[role="dialog"], .ant-modal-content').first();
      if (await dialog.isVisible({ timeout: 8000 }).catch(() => false)) {
        await page.screenshot({ path: path.join(OUT_DIR, '02-new-application-dialog.png') });
        const closeBtn = page.locator('.ant-modal-close, [aria-label="Close"]').first();
        if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
        await page.waitForTimeout(600);
      }
    }

    // Open first application → canvas
    const openBtn = page.locator('button, a').filter({ hasText: /^open$/i }).first();
    const openAlt = page.locator('td button, td a, [class*="action"] button').filter({ hasText: /open/i }).first();

    let opened = false;
    if (await openBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await openBtn.click();
      opened = true;
    } else if (await openAlt.isVisible({ timeout: 5000 }).catch(() => false)) {
      await openAlt.click();
      opened = true;
    }

    if (opened) {
      await page.waitForURL((u) => !u.pathname.endsWith('/workflows') && u.pathname !== workflowsPath, {
        timeout: 30_000,
      }).catch(() => {});
      const canvas = page.locator('.react-flow, [data-testid="rf__wrapper"]').first();
      await canvas.waitFor({ state: 'visible', timeout: 45_000 }).catch(() => {});
      await page.waitForTimeout(3500);
      await page.screenshot({ path: path.join(OUT_DIR, '03-canvas.png'), fullPage: false });
      await page.screenshot({ path: path.join(OUT_DIR, '03b-canvas-full.png'), fullPage: true });
    } else {
      console.warn('[uat-demo-capture] No Open button found — skipping canvas shots');
    }

    // Back to list for status / table framing
    await page.goto(workflowsPath, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUT_DIR, '04-workflows-return.png'), fullPage: true });

    // Settings modal (first row)
    const settingsBtn = page.locator('button, a').filter({ hasText: /settings/i }).first();
    const settingsAlt = page.locator('td button').filter({ hasText: /setting/i }).first();
    if (await settingsBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await settingsBtn.click();
    } else if (await settingsAlt.isVisible({ timeout: 4000 }).catch(() => false)) {
      await settingsAlt.click();
    } else {
      console.warn('[uat-demo-capture] No Settings button found — skipping modal shot');
    }

    await page.waitForTimeout(1200);
    const modal = page.locator('[role="dialog"], .ant-modal-content').first();
    if (await modal.isVisible({ timeout: 8000 }).catch(() => false)) {
      await page.screenshot({ path: path.join(OUT_DIR, '05-settings-modal.png') });
      const closeM = page.locator('.ant-modal-close, [aria-label="Close"]').first();
      if (await closeM.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeM.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }

    await page.waitForTimeout(500);
    // Sanity: page still alive
    await expect(page.locator('body')).toBeVisible();
  });
});

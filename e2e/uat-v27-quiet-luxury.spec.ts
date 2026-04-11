import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UAT_URL = 'https://workflow-ui-gamma.vercel.app/workflows';
const SCREENSHOT_DIR = path.join(__dirname, 'uat-v27-screenshots');

// Helper: walk up DOM to find first element with non-transparent background
const GET_EFFECTIVE_BG = `
function getEffectiveBg(el) {
  let node = el;
  while (node && node !== document.documentElement) {
    const bg = window.getComputedStyle(node).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      return { element: node.tagName + (node.className ? '.' + node.className.split(' ').slice(0,2).join('.') : ''), bg };
    }
    node = node.parentElement;
  }
  // fallback: body
  return { element: 'body', bg: window.getComputedStyle(document.body).backgroundColor };
}
`;

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

test.describe('UAT v27.0 — Quiet Luxury Visual Refactoring', () => {

  test('Step 1 — Navigation Header visual styles', async ({ page }) => {
    await page.goto(UAT_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step1-header.png'), fullPage: false });

    // Header background color — direct check on <header>
    const headerBg = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return { selector: 'none', bg: 'not found' };
      return { selector: 'header', bg: window.getComputedStyle(header).backgroundColor };
    });
    console.log('Header background:', JSON.stringify(headerBg));

    // "Workflow Studio" text font — look for logo/brand text
    const titleFont = await page.evaluate(() => {
      // Try logo link, brand text, or first h1/h2 in header
      const header = document.querySelector('header');
      if (!header) return { text: 'no header', fontFamily: 'not found' };
      const candidates = Array.from(header.querySelectorAll('a, span, h1, h2, [class*="logo"], [class*="brand"], [class*="title"]'));
      for (const el of candidates) {
        const text = el.textContent?.trim() || '';
        if (text.length > 2 && text.length < 50) {
          return { text, fontFamily: window.getComputedStyle(el).fontFamily };
        }
      }
      return { text: 'not found', fontFamily: 'not found' };
    });
    console.log('Title font:', JSON.stringify(titleFont));

    // Nav items color
    const navColor = await page.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return { selector: 'none', color: 'not found' };
      const navLinks = Array.from(header.querySelectorAll('a, [class*="menu-item"], [class*="nav-item"]'));
      for (const el of navLinks) {
        const color = window.getComputedStyle(el).color;
        if (color && color !== 'rgba(0, 0, 0, 0)') {
          return { selector: el.tagName + '.' + (el.className || '').split(' ')[0], color };
        }
      }
      return { selector: 'none', color: 'not found' };
    });
    console.log('Nav color:', JSON.stringify(navColor));

    // ASSERTIONS
    const bg = headerBg.bg;
    const isWarmBrown = bg.includes('42, 37, 32') || bg.includes('42,37,32');
    const isColdBlack = bg.includes('24, 24, 27') || bg.includes('24,24,27');
    const isDarkNavy = bg.includes('15, 15, 22') || bg.includes('15,15,22');

    expect(isColdBlack, `Header must NOT be cold black #18181B, got: ${bg}`).toBe(false);
    expect(isDarkNavy, `Header must NOT be dark navy #0F0F16, got: ${bg}`).toBe(false);
    expect(isWarmBrown, `Header must be warm dark brown #2A2520 (rgb 42,37,32), got: ${bg}`).toBe(true);

    // Nav color should be warm gold ~#C9A87C = rgb(201, 168, 124)
    const navCol = navColor.color;
    const isWarmGold = navCol.includes('201, 168, 124') || navCol.includes('201,168,124');
    console.log(`Nav color check — warm gold: ${isWarmGold}, actual: ${navCol}`);
    expect(isWarmGold, `Nav items should be warm gold #C9A87C (rgb 201,168,124), got: ${navCol}`).toBe(true);
  });

  test('Step 2 — Application List Page styles', async ({ page }) => {
    await page.goto(UAT_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step2-app-list.png'), fullPage: true });

    // Page background — walk up from body to find effective background
    const pageBg = await page.evaluate(() => {
      // Check html and body first, then layout containers
      const candidates = [
        document.documentElement,
        document.body,
        document.querySelector('.ant-layout'),
        document.querySelector('[class*="layout"]'),
        document.querySelector('[class*="page"]'),
        document.querySelector('[class*="content"]'),
      ].filter(Boolean) as Element[];

      for (const el of candidates) {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return { selector: el.tagName + '.' + (el.className || '').split(' ').slice(0,2).join('.'), bg };
        }
      }
      return { selector: 'none', bg: 'not found' };
    });
    console.log('Page background:', JSON.stringify(pageBg));

    // "Applications" heading font
    const headingFont = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, [class*="heading"], [class*="page-title"]'));
      for (const h of headings) {
        if (h.textContent && h.textContent.toLowerCase().includes('application')) {
          return { text: h.textContent.trim().substring(0, 40), fontFamily: window.getComputedStyle(h).fontFamily };
        }
      }
      return { text: 'not found', fontFamily: 'not found' };
    });
    console.log('Applications heading font:', JSON.stringify(headingFont));

    // "New application" button color
    const btnColor = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
      for (const btn of buttons) {
        const text = btn.textContent || '';
        if (text.toLowerCase().includes('new') && text.toLowerCase().includes('application')) {
          const style = window.getComputedStyle(btn);
          return { text: text.trim().substring(0, 30), bg: style.backgroundColor, color: style.color };
        }
      }
      return { text: 'not found', bg: 'not found', color: 'not found' };
    });
    console.log('New application button:', JSON.stringify(btnColor));

    // Page background should be warm cream ~#F9F7F4 = rgb(249, 247, 244)
    const bg = pageBg.bg;
    const isWarmCream = bg.includes('249, 247, 244') || bg.includes('249,247,244');
    console.log(`Page bg check — warm cream: ${isWarmCream}, actual: ${bg}`);
    expect(isWarmCream, `Page background should be warm cream #F9F7F4 (rgb 249,247,244), got: ${bg}`).toBe(true);

    // Button should be terracotta ~#7C4A3A = rgb(124, 74, 58), NOT indigo
    const btnBg = btnColor.bg;
    const isIndigo = btnBg.includes('79, 70, 229') || btnBg.includes('79,70,229');
    const isTerracotta = btnBg.includes('124, 74, 58') || btnBg.includes('124,74,58');
    console.log(`Button bg check — terracotta: ${isTerracotta}, indigo: ${isIndigo}, actual: ${btnBg}`);
    expect(isIndigo, `New application button must NOT be indigo #4F46E5, got: ${btnBg}`).toBe(false);
    expect(isTerracotta, `New application button should be terracotta #7C4A3A (rgb 124,74,58), got: ${btnBg}`).toBe(true);
  });

  test('Step 3 — Status Tags (Active tag color)', async ({ page }) => {
    await page.goto(UAT_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step3-status-tags.png'), fullPage: true });

    // Find the "Active" tag — likely a <span> or <tag> inside a table cell
    const tagStyle = await page.evaluate(() => {
      // Walk all elements, find one whose text is exactly "Active" and is a small inline element
      const allElements = Array.from(document.querySelectorAll('span, div, tag, [class*="tag"], [class*="badge"], [class*="status"]'));
      for (const el of allElements) {
        const text = el.textContent?.trim();
        if (text === 'Active' || text === 'active') {
          const style = window.getComputedStyle(el);
          const bg = style.backgroundColor;
          // If transparent, check parent
          if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
            const parent = el.parentElement;
            if (parent) {
              const parentBg = window.getComputedStyle(parent).backgroundColor;
              return {
                tag: el.tagName,
                text,
                bg: parentBg,
                color: style.color,
                note: 'bg from parent ' + parent.tagName,
              };
            }
          }
          return { tag: el.tagName, text, bg, color: style.color, note: 'direct' };
        }
      }
      return { tag: 'none', text: 'not found', bg: 'not found', color: 'not found', note: '' };
    });
    console.log('Active tag style:', JSON.stringify(tagStyle));

    // Mint green background ~#EAF3EE = rgb(234, 243, 238)
    const bg = tagStyle.bg;
    const isMintGreen = bg.includes('234, 243, 238') || bg.includes('234,243,238');
    console.log(`Active tag bg check — mint green: ${isMintGreen}, actual: ${bg}`);
    expect(isMintGreen, `Active tag should have mint green background #EAF3EE (rgb 234,243,238), got: ${bg}`).toBe(true);
  });

  test('Step 4 — Table header warm sand background', async ({ page }) => {
    await page.goto(UAT_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step4-table.png'), fullPage: true });

    // Find table header — check th elements directly, then walk up if transparent
    const tableHeaderStyle = await page.evaluate(() => {
      // Try Ant Design table header first
      const antTh = document.querySelector('.ant-table-thead th, .ant-table-thead td');
      if (antTh) {
        const bg = window.getComputedStyle(antTh).backgroundColor;
        if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return { selector: '.ant-table-thead th', bg };
        }
        // Check parent tr
        const tr = antTh.closest('tr');
        if (tr) {
          const trBg = window.getComputedStyle(tr).backgroundColor;
          if (trBg !== 'rgba(0, 0, 0, 0)' && trBg !== 'transparent') {
            return { selector: 'ant-thead tr', bg: trBg };
          }
        }
        // Check thead
        const thead = antTh.closest('thead');
        if (thead) {
          const theadBg = window.getComputedStyle(thead).backgroundColor;
          if (theadBg !== 'rgba(0, 0, 0, 0)' && theadBg !== 'transparent') {
            return { selector: 'ant-thead', bg: theadBg };
          }
        }
        // Check table
        const table = antTh.closest('table');
        if (table) {
          return { selector: 'table (fallback)', bg: window.getComputedStyle(table).backgroundColor };
        }
      }

      // Generic fallback
      const th = document.querySelector('th');
      if (th) {
        const bg = window.getComputedStyle(th).backgroundColor;
        return { selector: 'th', bg };
      }
      return { selector: 'none', bg: 'not found' };
    });
    console.log('Table header style:', JSON.stringify(tableHeaderStyle));

    // Also check via CSS custom properties / background on the th pseudo-element
    const thBgDeep = await page.evaluate(() => {
      const th = document.querySelector('.ant-table-thead th, thead th');
      if (!th) return 'no th found';
      // Check all ancestors up to table
      let node: Element | null = th;
      const results: string[] = [];
      while (node && node.tagName !== 'TABLE') {
        const bg = window.getComputedStyle(node).backgroundColor;
        results.push(`${node.tagName}.${(node.className || '').split(' ')[0]}: ${bg}`);
        node = node.parentElement;
      }
      return results.join(' | ');
    });
    console.log('TH ancestor backgrounds:', thBgDeep);

    // Warm sand ~#F3F0EB = rgb(243, 240, 235)
    const bg = tableHeaderStyle.bg;
    const isWarmSand = bg.includes('243, 240, 235') || bg.includes('243,240,235');
    const isColdGray = bg.includes('250, 250, 250') || bg.includes('250,250,250');
    console.log(`Table header bg check — warm sand: ${isWarmSand}, cold gray: ${isColdGray}, actual: ${bg}`);
    expect(isColdGray, `Table header must NOT be cold #FAFAFA, got: ${bg}`).toBe(false);
    expect(isWarmSand, `Table header should be warm sand #F3F0EB (rgb 243,240,235), got: ${bg}`).toBe(true);
  });

  test('Step 5 — Functional Regression', async ({ page }) => {
    await page.goto(UAT_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // 5a: Click "New application" — verify dialog opens
    const newAppBtn = page.locator('button').filter({ hasText: /new application/i }).first();
    await expect(newAppBtn).toBeVisible({ timeout: 5000 });
    await newAppBtn.click();
    await page.waitForTimeout(1500);

    const dialog = page.locator('[role="dialog"], .ant-modal-content').first();
    await expect(dialog).toBeVisible({ timeout: 8000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step5a-new-app-dialog.png') });
    console.log('New application dialog opened: PASS');

    // Close dialog — try close button, then Escape
    const closeBtn = page.locator('.ant-modal-close, [aria-label="Close"], button[class*="close"]').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(800);

    // 5b: Click "Open" on first application row
    // Look for Open button/link in the table
    const openBtn = page.locator('button, a').filter({ hasText: /^open$/i }).first();
    const openBtnAlt = page.locator('[class*="action"] button, td button, td a').filter({ hasText: /open/i }).first();

    let openClicked = false;
    if (await openBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await openBtn.click();
      openClicked = true;
    } else if (await openBtnAlt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await openBtnAlt.click();
      openClicked = true;
    }

    if (openClicked) {
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      console.log('After clicking Open, URL:', currentUrl);
      const isCanvasPage = currentUrl !== UAT_URL && (currentUrl.includes('/canvas') || currentUrl.includes('/workflow') || currentUrl.includes('/app'));
      expect(isCanvasPage, `Expected canvas page after clicking Open, got: ${currentUrl}`).toBe(true);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step5b-canvas.png') });
      console.log('Canvas page loaded: PASS');
    } else {
      console.log('Open button not found — skipping canvas navigation check');
    }

    // Navigate back
    await page.goto(UAT_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 5c: Click "Settings" on first application
    const settingsBtn = page.locator('button, a').filter({ hasText: /settings/i }).first();
    const settingsBtnAlt = page.locator('[class*="action"] button, td button').filter({ hasText: /setting/i }).first();

    let settingsClicked = false;
    if (await settingsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await settingsBtn.click();
      settingsClicked = true;
    } else if (await settingsBtnAlt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await settingsBtnAlt.click();
      settingsClicked = true;
    }

    if (settingsClicked) {
      await page.waitForTimeout(1500);
      const settingsModal = page.locator('[role="dialog"], .ant-modal-content').first();
      await expect(settingsModal).toBeVisible({ timeout: 8000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step5c-settings-modal.png') });
      console.log('Settings modal opened: PASS');

      const closeSettings = page.locator('.ant-modal-close, [aria-label="Close"]').first();
      if (await closeSettings.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeSettings.click();
      } else {
        await page.keyboard.press('Escape');
      }
    } else {
      console.log('Settings button not found — skipping settings modal check');
    }

    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'step5-final.png') });
  });

});

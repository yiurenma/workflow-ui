# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: applications-mobile.spec.ts >> Applications list — Mobile (TC-APP-MOB) >> TC-APP-MOB-10 FAB tap opens New Application dialog
- Location: e2e/applications-mobile.spec.ts:119:3

# Error details

```
Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/workflows/
Call log:
  - navigating to "https://workflow-ui-gamma.vercel.app/workflows/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // These tests run in the Mobile Safari project (iPhone 12 viewport)
  4   | test.describe('Applications list — Mobile (TC-APP-MOB)', () => {
  5   |   test.beforeEach(async ({ page }) => {
> 6   |     await page.goto('/workflows/');
      |                ^ Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/workflows/
  7   |     await page.waitForLoadState('networkidle');
  8   |   });
  9   | 
  10  |   test('TC-APP-MOB-01 card view renders (not table) on narrow viewport', async ({ page }) => {
  11  |     // Mobile card view — no <table> element visible, but cards should exist
  12  |     const table = page.locator('table');
  13  |     const cards = page.locator('.ant-spin-container .flex.flex-col');
  14  |     // At narrow viewport, table should be hidden and cards visible
  15  |     await expect(cards.first()).toBeVisible();
  16  |   });
  17  | 
  18  |   test('TC-APP-MOB-02 Desktop view toggle renders table', async ({ page }) => {
  19  |     const desktopToggle = page.getByRole('button', { name: 'Desktop view' });
  20  |     if (await desktopToggle.count() === 0) {
  21  |       test.skip();
  22  |       return;
  23  |     }
  24  |     await desktopToggle.click();
  25  |     await expect(page.locator('table').first()).toBeVisible();
  26  |   });
  27  | 
  28  |   test('TC-APP-MOB-03 Mobile view toggle restores card view', async ({ page }) => {
  29  |     // First switch to desktop view
  30  |     const desktopToggle = page.getByRole('button', { name: 'Desktop view' });
  31  |     if (await desktopToggle.count() === 0) {
  32  |       test.skip();
  33  |       return;
  34  |     }
  35  |     await desktopToggle.click();
  36  |     await expect(page.locator('table').first()).toBeVisible();
  37  |     // Switch back
  38  |     await page.getByRole('button', { name: 'Mobile view' }).click();
  39  |     await expect(page.locator('table')).toHaveCount(0);
  40  |   });
  41  | 
  42  |   test('TC-APP-MOB-04 card info area tap navigates to canvas', async ({ page }) => {
  43  |     // Look for card info zone (the cursor-pointer div inside card)
  44  |     const cardInfoArea = page.locator('.cursor-pointer').first();
  45  |     if (await cardInfoArea.count() === 0) {
  46  |       test.skip();
  47  |       return;
  48  |     }
  49  |     await cardInfoArea.click();
  50  |     // URL should change away from /workflows/
  51  |     await page.waitForURL(/\/workflows\/.+/);
  52  |     expect(page.url()).toMatch(/\/workflows\/.+/);
  53  |   });
  54  | 
  55  |   test('TC-APP-MOB-05 ellipsis menu → History opens drawer (no navigation)', async ({ page }) => {
  56  |     const ellipsisBtn = page.locator('[aria-label="more"]').first();
  57  |     if (await ellipsisBtn.count() === 0) {
  58  |       // Try alt selector
  59  |       const altBtn = page.locator('.anticon-ellipsis').first();
  60  |       if (await altBtn.count() === 0) {
  61  |         test.skip();
  62  |         return;
  63  |       }
  64  |       await altBtn.click();
  65  |     } else {
  66  |       await ellipsisBtn.click();
  67  |     }
  68  |     const urlBefore = page.url();
  69  |     // Click History in dropdown
  70  |     await page.getByRole('menuitem', { name: 'History' }).click();
  71  |     await expect(page.locator('.ant-drawer')).toBeVisible();
  72  |     expect(page.url()).toBe(urlBefore);
  73  |   });
  74  | 
  75  |   test('TC-APP-MOB-06 ellipsis menu → Copy opens modal (no navigation)', async ({ page }) => {
  76  |     const ellipsisBtn = page.locator('.anticon-ellipsis').first();
  77  |     if (await ellipsisBtn.count() === 0) {
  78  |       test.skip();
  79  |       return;
  80  |     }
  81  |     const urlBefore = page.url();
  82  |     await ellipsisBtn.click();
  83  |     await page.getByRole('menuitem', { name: 'Copy' }).click();
  84  |     await expect(page.locator('.ant-modal')).toBeVisible();
  85  |     expect(page.url()).toBe(urlBefore);
  86  |   });
  87  | 
  88  |   test('TC-APP-MOB-07 ellipsis menu → Delete shows confirm (no navigation)', async ({ page }) => {
  89  |     const ellipsisBtn = page.locator('.anticon-ellipsis').first();
  90  |     if (await ellipsisBtn.count() === 0) {
  91  |       test.skip();
  92  |       return;
  93  |     }
  94  |     const urlBefore = page.url();
  95  |     await ellipsisBtn.click();
  96  |     await page.getByRole('menuitem', { name: 'Delete' }).click();
  97  |     await expect(page.locator('.ant-modal-confirm')).toBeVisible();
  98  |     await page.getByRole('button', { name: 'Cancel' }).click();
  99  |     expect(page.url()).toBe(urlBefore);
  100 |   });
  101 | 
  102 |   test('TC-APP-MOB-08 Settings button opens modal (no navigation)', async ({ page }) => {
  103 |     const settingsBtn = page.getByRole('button', { name: 'Settings' }).first();
  104 |     if (await settingsBtn.count() === 0) {
  105 |       test.skip();
  106 |       return;
```
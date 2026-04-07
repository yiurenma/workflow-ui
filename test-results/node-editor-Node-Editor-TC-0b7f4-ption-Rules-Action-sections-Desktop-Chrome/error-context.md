# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: node-editor.spec.ts >> Node Editor (TC-NODE) >> TC-NODE-02 drawer contains Description, Rules, Action sections
- Location: e2e/node-editor.spec.ts:31:3

# Error details

```
Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/workflows/
Call log:
  - navigating to "https://workflow-ui-gamma.vercel.app/workflows/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Node Editor (TC-NODE)', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Open the first available application's canvas
> 6  |     await page.goto('/workflows/');
     |                ^ Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/workflows/
  7  |     await page.waitForLoadState('networkidle');
  8  | 
  9  |     const openBtn = page.getByRole('link', { name: 'Open' }).first();
  10 |     if (await openBtn.count() === 0) {
  11 |       test.skip();
  12 |       return;
  13 |     }
  14 |     await openBtn.click();
  15 |     await page.waitForLoadState('networkidle');
  16 |     // Wait for canvas to render
  17 |     await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  18 |   });
  19 | 
  20 |   test('TC-NODE-01 clicking a node opens the drawer', async ({ page }) => {
  21 |     // XYFlow nodes have class .react-flow__node
  22 |     const node = page.locator('.react-flow__node').first();
  23 |     if (await node.count() === 0) {
  24 |       test.skip(); // No nodes on canvas
  25 |       return;
  26 |     }
  27 |     await node.click();
  28 |     await expect(page.locator('.ant-drawer')).toBeVisible({ timeout: 5_000 });
  29 |   });
  30 | 
  31 |   test('TC-NODE-02 drawer contains Description, Rules, Action sections', async ({ page }) => {
  32 |     const node = page.locator('.react-flow__node').first();
  33 |     if (await node.count() === 0) {
  34 |       test.skip();
  35 |       return;
  36 |     }
  37 |     await node.click();
  38 |     const drawer = page.locator('.ant-drawer');
  39 |     await expect(drawer).toBeVisible();
  40 | 
  41 |     // Check for the three section labels
  42 |     await expect(drawer.getByText(/description/i).first()).toBeVisible();
  43 |     await expect(drawer.getByText(/rule/i).first()).toBeVisible();
  44 |     await expect(drawer.getByText(/action/i).first()).toBeVisible();
  45 |   });
  46 | });
  47 | 
```
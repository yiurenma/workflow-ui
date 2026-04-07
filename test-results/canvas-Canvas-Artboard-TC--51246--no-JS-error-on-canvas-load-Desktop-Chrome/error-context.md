# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: canvas.spec.ts >> Canvas / Artboard (TC-CANVAS) >> TC-CANVAS-03 no JS error on canvas load
- Location: e2e/canvas.spec.ts:43:3

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
  3  | test.describe('Canvas / Artboard (TC-CANVAS)', () => {
  4  |   test('TC-CANVAS-01 canvas loads for an application', async ({ page }) => {
  5  |     // Navigate to applications list, open first application
  6  |     await page.goto('/workflows/');
  7  |     await page.waitForLoadState('networkidle');
  8  | 
  9  |     const openBtn = page.getByRole('link', { name: 'Open' }).first();
  10 |     if (await openBtn.count() === 0) {
  11 |       // Try clicking first card info area on mobile layout
  12 |       const cardInfo = page.locator('.cursor-pointer').first();
  13 |       if (await cardInfo.count() === 0) {
  14 |         test.skip(); // No applications available
  15 |         return;
  16 |       }
  17 |       await cardInfo.click();
  18 |     } else {
  19 |       await openBtn.click();
  20 |     }
  21 | 
  22 |     await page.waitForLoadState('networkidle');
  23 |     // Canvas container from @xyflow/react
  24 |     const canvas = page.locator('.react-flow, [data-testid="rf__wrapper"]').first();
  25 |     await expect(canvas).toBeVisible({ timeout: 15_000 });
  26 |   });
  27 | 
  28 |   test('TC-CANVAS-02 Explain button visible in header', async ({ page }) => {
  29 |     await page.goto('/workflows/');
  30 |     await page.waitForLoadState('networkidle');
  31 | 
  32 |     const openBtn = page.getByRole('link', { name: 'Open' }).first();
  33 |     if (await openBtn.count() === 0) {
  34 |       test.skip();
  35 |       return;
  36 |     }
  37 |     await openBtn.click();
  38 |     await page.waitForLoadState('networkidle');
  39 | 
  40 |     await expect(page.getByRole('button', { name: /explain/i })).toBeVisible({ timeout: 10_000 });
  41 |   });
  42 | 
  43 |   test('TC-CANVAS-03 no JS error on canvas load', async ({ page }) => {
  44 |     const errors: string[] = [];
  45 |     page.on('pageerror', (err) => errors.push(err.message));
  46 | 
> 47 |     await page.goto('/workflows/');
     |                ^ Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/workflows/
  48 |     await page.waitForLoadState('networkidle');
  49 |     const openBtn = page.getByRole('link', { name: 'Open' }).first();
  50 |     if (await openBtn.count() === 0) {
  51 |       test.skip();
  52 |       return;
  53 |     }
  54 |     await openBtn.click();
  55 |     await page.waitForLoadState('networkidle');
  56 |     await page.waitForTimeout(2000);
  57 | 
  58 |     expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  59 |   });
  60 | });
  61 | 
```
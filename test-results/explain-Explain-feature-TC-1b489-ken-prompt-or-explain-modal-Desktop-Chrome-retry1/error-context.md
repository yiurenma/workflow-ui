# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: explain.spec.ts >> Explain feature (TC-EXPLAIN) >> TC-EXPLAIN-02 clicking Explain opens token prompt or explain modal
- Location: e2e/explain.spec.ts:20:3

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
  3  | test.describe('Explain feature (TC-EXPLAIN)', () => {
  4  |   test('TC-EXPLAIN-01 Explain button visible on canvas', async ({ page }) => {
  5  |     await page.goto('/workflows/');
  6  |     await page.waitForLoadState('networkidle');
  7  | 
  8  |     const openBtn = page.getByRole('link', { name: 'Open' }).first();
  9  |     if (await openBtn.count() === 0) {
  10 |       test.skip();
  11 |       return;
  12 |     }
  13 |     await openBtn.click();
  14 |     await page.waitForLoadState('networkidle');
  15 |     await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  16 | 
  17 |     await expect(page.getByRole('button', { name: /explain/i })).toBeVisible();
  18 |   });
  19 | 
  20 |   test('TC-EXPLAIN-02 clicking Explain opens token prompt or explain modal', async ({ page }) => {
> 21 |     await page.goto('/workflows/');
     |                ^ Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/workflows/
  22 |     await page.waitForLoadState('networkidle');
  23 | 
  24 |     const openBtn = page.getByRole('link', { name: 'Open' }).first();
  25 |     if (await openBtn.count() === 0) {
  26 |       test.skip();
  27 |       return;
  28 |     }
  29 |     await openBtn.click();
  30 |     await page.waitForLoadState('networkidle');
  31 |     await page.waitForSelector('.react-flow', { timeout: 15_000 });
  32 | 
  33 |     const explainBtn = page.getByRole('button', { name: /explain/i });
  34 |     await explainBtn.click();
  35 | 
  36 |     // Either a token prompt modal or the explain result modal should appear
  37 |     await expect(page.locator('.ant-modal')).toBeVisible({ timeout: 5_000 });
  38 |   });
  39 | });
  40 | 
```
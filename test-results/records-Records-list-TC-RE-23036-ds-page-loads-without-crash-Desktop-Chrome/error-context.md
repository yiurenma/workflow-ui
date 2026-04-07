# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: records.spec.ts >> Records list (TC-REC) >> TC-REC-01 records page loads without crash
- Location: e2e/records.spec.ts:9:3

# Error details

```
Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/records/
Call log:
  - navigating to "https://workflow-ui-gamma.vercel.app/records/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Records list (TC-REC)', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/records/');
     |                ^ Error: page.goto: net::ERR_INVALID_AUTH_CREDENTIALS at https://workflow-ui-gamma.vercel.app/records/
  6  |     await page.waitForLoadState('networkidle');
  7  |   });
  8  | 
  9  |   test('TC-REC-01 records page loads without crash', async ({ page }) => {
  10 |     await expect(page.locator('body')).not.toBeEmpty();
  11 |     const jsError = await page.locator('text=Uncaught').count();
  12 |     expect(jsError).toBe(0);
  13 |   });
  14 | 
  15 |   test('TC-REC-02 table or card view visible', async ({ page }) => {
  16 |     // Either an Ant Design table or a card list should be present
  17 |     const table = page.locator('table');
  18 |     const anyContent = page.locator('.ant-table, .ant-empty, .ant-spin-container');
  19 |     await expect(anyContent.first()).toBeVisible();
  20 |   });
  21 | 
  22 |   test('TC-REC-03 pagination visible', async ({ page }) => {
  23 |     const pagination = page.locator('.ant-pagination');
  24 |     await expect(pagination.first()).toBeVisible();
  25 |   });
  26 | });
  27 | 
```
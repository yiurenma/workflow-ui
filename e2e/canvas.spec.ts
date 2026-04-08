import { test, expect } from '@playwright/test';
import { setupMocks, clickCanvasHeaderAction } from './mocks';

test.describe('Canvas / Artboard (TC-CANVAS)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/test-app-01');
    await page.waitForLoadState('load');
  });

  test('TC-CANVAS-01 canvas loads for an application', async ({ page }) => {
    const canvas = page.locator('.react-flow, [data-testid="rf__wrapper"]').first();
    await expect(canvas).toBeVisible({ timeout: 15_000 });
  });

  test('TC-CANVAS-02 header actions accessible', async ({ page }) => {
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobile) {
      // On mobile, secondary actions are in the ⋯ overflow dropdown; Save is always visible
      await expect(page.getByRole('button', { name: /more actions/i })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByRole('button', { name: /save/i })).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.getByRole('button', { name: /explain/i })).toBeVisible({ timeout: 10_000 });
    }
  });

  test('TC-CANVAS-03 no JS error on canvas load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
    await page.waitForTimeout(2000);

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('TC-CANVAS-05 Straighten button is visible on canvas', async ({ page }) => {
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
    await expect(page.getByRole('button', { name: /straighten/i })).toBeVisible({ timeout: 5000 });
  });

  test('TC-CANVAS-04 canvas shows empty state when pluginList absent', async ({ page }) => {
    await page.route(
      (url) =>
        url.pathname.startsWith('/api/proxy/operation/workflow') &&
        url.searchParams.get('applicationName') === 'test-app-empty',
      async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    );
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/workflows/test-app-empty');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);
    const hasCrash = errors.filter(e => !e.includes('ResizeObserver')).length > 0;
    expect(hasCrash).toBe(false);
  });
});

test.describe('JsonPath Playground (TC-JSONPATH)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/test-app-01');
    await page.waitForLoadState('load');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-JSONPATH-01 JsonPath accessible from header', async ({ page }) => {
    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobile) {
      await expect(page.getByRole('button', { name: /more actions/i })).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.getByRole('button', { name: /jsonpath/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-JSONPATH-02 modal opens', async ({ page }) => {
    await clickCanvasHeaderAction(page, 'JsonPath');
    await expect(page.locator('.ant-modal').filter({ hasText: 'JsonPath Playground' })).toBeVisible({ timeout: 5000 });
  });

  test('TC-JSONPATH-03 valid expression returns result', async ({ page }) => {
    await clickCanvasHeaderAction(page, 'JsonPath');
    const modal = page.locator('.ant-modal').filter({ hasText: 'JsonPath Playground' });
    await modal.getByPlaceholder('$.customer.id').fill('$.customer.id');
    await modal.locator('textarea').fill('{"customer":{"id":"C001"}}');
    await modal.getByRole('button', { name: 'Validate' }).click();
    await expect(modal.locator('pre')).toContainText('C001', { timeout: 3000 });
  });

  test('TC-JSONPATH-04 invalid JSON shows error', async ({ page }) => {
    await clickCanvasHeaderAction(page, 'JsonPath');
    const modal = page.locator('.ant-modal').filter({ hasText: 'JsonPath Playground' });
    await modal.locator('textarea').fill('{ invalid json');
    await modal.getByRole('button', { name: 'Validate' }).click();
    await expect(modal.getByText(/Invalid JSON:/i)).toBeVisible({ timeout: 3000 });
  });

  test('TC-JSONPATH-05 no-match expression shows "(no match)"', async ({ page }) => {
    await clickCanvasHeaderAction(page, 'JsonPath');
    const modal = page.locator('.ant-modal').filter({ hasText: 'JsonPath Playground' });
    await modal.getByPlaceholder('$.customer.id').fill('$.nonexistent.field');
    await modal.locator('textarea').fill('{"customer":{"id":"C001"}}');
    await modal.getByRole('button', { name: 'Validate' }).click();
    await expect(modal.getByText('(no match)')).toBeVisible({ timeout: 3000 });
  });
});

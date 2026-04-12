import { test, expect } from '@playwright/test';
import { setupMocks } from './mocks';
import AxeBuilder from '@axe-core/playwright';

/**
 * Enhanced Node Editor tests demonstrating 5-Layer Validation Framework
 *
 * Layer 1: Existence (toBeVisible / toBeAttached)
 * Layer 2: Size sufficiency (boundingBox - mobile drawer >35% vh, desktop >200px)
 * Layer 3: Viewport visibility (toBeInViewport - content not clipped)
 * Layer 4: Interactivity (real interactions - fill/click/check, not just toBeVisible)
 * Layer 5: Effect verification (toHaveValue / toHaveURL / state changes)
 */

test.describe('Node Editor — 5-Layer Validation (TC-NODE-ENHANCED)', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
    await page.goto('/workflows/test-app-01');
    await page.waitForLoadState('load');
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15_000 });
  });

  test('TC-NODE-ENHANCED-01 Desktop drawer meets all 5 layers', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = (viewport?.width ?? 1280) < 768;

    if (isMobile) {
      test.skip();
      return;
    }

    // Trigger: click first node
    const node = page.locator('.react-flow__node').first();
    await node.click();

    const drawer = page.locator('.ant-drawer');

    // Layer 1: Existence
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Layer 2: Size sufficiency (desktop drawer should be >200px height)
    const box = await drawer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(200);

    // Layer 3: Viewport visibility - key sections must be in viewport
    const descriptionSection = drawer.getByText(/description/i).first();
    await expect(descriptionSection).toBeInViewport();

    // Layer 4: Interactivity - description input must be editable and focusable
    const descInput = drawer.locator('input, textarea').first();
    await expect(descInput).toBeEditable();
    await descInput.click();
    await expect(descInput).toBeFocused();

    // Layer 5: Effect - input accepts value
    await descInput.fill('Test node description');
    await expect(descInput).toHaveValue('Test node description');

    // Visual regression
    await expect(drawer).toHaveScreenshot('node-editor-desktop.png', {
      maxDiffPixelRatio: 0.03,
    });

    // Accessibility
    const axeResults = await new AxeBuilder({ page })
      .include('.ant-drawer')
      .analyze();
    expect(axeResults.violations).toHaveLength(0);
  });

  test('TC-NODE-ENHANCED-02 Mobile drawer meets all 5 layers', async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = (viewport?.width ?? 1280) < 768;

    if (!isMobile) {
      test.skip();
      return;
    }

    // Trigger: tap first node
    const node = page.locator('.react-flow__node').first();
    await node.tap();

    const drawer = page.locator('.ant-drawer-bottom');

    // Layer 1: Existence
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Layer 2: Size sufficiency (mobile drawer >35% viewport height)
    const box = await drawer.boundingBox();
    const vh = viewport!.height;
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(vh * 0.35);

    // Layer 3: Viewport visibility - Description section must be in viewport
    const descriptionSection = drawer.getByText(/description/i).first();
    await expect(descriptionSection).toBeInViewport();

    // Layer 4: Interactivity - first input must be editable
    const firstInput = drawer.locator('input, textarea').first();
    await expect(firstInput).toBeEditable();
    await firstInput.tap();
    await expect(firstInput).toBeFocused();

    // Layer 5: Effect - input accepts value
    await firstInput.fill('Mobile test description');
    await expect(firstInput).toHaveValue('Mobile test description');

    // Visual regression
    await expect(drawer).toHaveScreenshot('node-editor-mobile.png', {
      maxDiffPixelRatio: 0.03,
    });

    // Accessibility - touch targets must be ≥44px
    const axeResults = await new AxeBuilder({ page })
      .include('.ant-drawer-bottom')
      .analyze();
    expect(axeResults.violations).toHaveLength(0);
  });

  test('TC-NODE-ENHANCED-03 Three-panel layout all sections in viewport', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    await node.click();

    const drawer = page.locator('.ant-drawer');
    await expect(drawer).toBeVisible();

    // Layer 3: All three sections must be in viewport (not clipped)
    const description = drawer.getByText(/description/i).first();
    const rules = drawer.getByText(/rule/i).first();
    const action = drawer.getByText(/action/i).first();

    await expect(description).toBeInViewport();
    await expect(rules).toBeInViewport();
    await expect(action).toBeInViewport();
  });

  test('TC-NODE-ENHANCED-04 Rules section JSON input actionable', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    await node.click();

    const drawer = page.locator('.ant-drawer');
    await expect(drawer).toBeVisible();

    // Find Rules section textarea
    const rulesSection = drawer.locator('textarea').nth(1); // Assuming Rules is second textarea

    // Layer 4: Must be editable and accept JSON
    await expect(rulesSection).toBeEditable();
    await rulesSection.click();
    await expect(rulesSection).toBeFocused();

    // Layer 5: Accepts JSON input
    const testJson = '{"path": "$.customer.id", "operator": "equals", "value": "C001"}';
    await rulesSection.fill(testJson);
    await expect(rulesSection).toHaveValue(testJson);
  });

  test('TC-NODE-ENHANCED-05 Close drawer returns to canvas', async ({ page }) => {
    const node = page.locator('.react-flow__node').first();
    await node.click();

    // Wait for content wrapper to be visible (outer .ant-drawer stays in DOM always)
    const contentWrapper = page.locator('.ant-drawer-content-wrapper');
    await expect(contentWrapper).toBeVisible({ timeout: 5000 });

    // Use custom close button (aria-label="Close") — Ant Design internal .ant-drawer-close
    // is hidden via closable={false} in v29.0
    const customCloseBtn = page.locator('.ant-drawer [aria-label="Close"]');
    const customCloseBtnVisible = await customCloseBtn.isVisible().catch(() => false);
    if (customCloseBtnVisible) {
      await customCloseBtn.click();
    } else {
      // Fallback: canvas pane click
      const vw = page.viewportSize()!.width;
      const vh = page.viewportSize()!.height;
      await page.mouse.click(vw * 0.3, vh * 0.5);
    }

    // Layer 5: Drawer content wrapper closes — allow animation time
    await expect(contentWrapper).not.toBeVisible({ timeout: 8000 });

    // Canvas still visible
    const canvas = page.locator('.react-flow, [data-testid="rf__wrapper"]').first();
    await expect(canvas).toBeVisible();
  });
});

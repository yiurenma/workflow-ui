import { expect, Locator, Page } from '@playwright/test';

/**
 * 5-Layer UX Validation Framework
 *
 * Layer 1: Existence (toBeVisible / toBeAttached)
 * Layer 2: Size sufficiency (boundingBox)
 * Layer 3: Viewport visibility (toBeInViewport)
 * Layer 4: Interactivity (real interactions)
 * Layer 5: Effect verification (computed styles / state changes)
 */

export async function validateLayer1Exist(locator: Locator, name: string) {
  await expect(locator).toBeVisible({ timeout: 5000 });
}

export async function validateLayer2Size(
  locator: Locator,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();

  if (minWidth !== undefined) {
    expect(box!.width).toBeGreaterThanOrEqual(minWidth);
  }
  if (minHeight !== undefined) {
    expect(box!.height).toBeGreaterThanOrEqual(minHeight);
  }
  if (maxWidth !== undefined) {
    expect(box!.width).toBeLessThanOrEqual(maxWidth);
  }
  if (maxHeight !== undefined) {
    expect(box!.height).toBeLessThanOrEqual(maxHeight);
  }
}

export async function validateLayer3Viewport(page: Page, locator: Locator) {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();

  // Check element is within viewport bounds
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
}

export async function validateLayer4Interact(locator: Locator) {
  await expect(locator).toBeEnabled();
  await locator.click();
  // Caller verifies expected effect
}

export async function validateLayer5Effect(
  locator: Locator,
  property: string,
  expectedValue: string
) {
  const computed = await locator.evaluate(
    (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
    property
  );
  expect(computed).toBe(expectedValue);
}

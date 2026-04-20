import { test, expect } from '@playwright/test';

// E2E tests for v39.0 — Import Plugin Type Validation Alignment
// Tests VALID_PLUGIN_TYPES fix: ["CONSUMER", "CONSUMERWITHOUTERROR", "IFELSE", "MESSAGE", "FUNCTION_V2", "FUNCTION_V3"]
test.describe('Canvas Import Plugin Types v39.0 — Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Navigate to first application's canvas
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10000 });

    const openButton = firstRow.getByRole('button', { name: 'Open' });
    await openButton.click();

    // Wait for canvas to load
    await page.waitForURL(/\/workflows\/.+/, { timeout: 10000 });
    await page.waitForSelector('.react-flow, [data-testid="rf__wrapper"]', { timeout: 15000 });
    await page.waitForTimeout(2000);
  });

  test('TC-IMPORT-TYPES-01: Validate CONSUMER type acceptance', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Layer 1: Existence
    const textarea = modal.locator('textarea').first();
    await expect(textarea).toBeVisible();

    // Layer 4: Interactable
    await expect(textarea).toBeEditable();
    await textarea.fill(JSON.stringify({
      pluginList: [{
        id: 1,
        description: "HTTP Consumer",
        linkingIdOfRuleListAndAction: "rule-1",
        ruleList: [{ key: "$.data", remark: "Data exists" }],
        action: { type: "CONSUMER", provider: "http", remark: "GET /api/data" },
        uiMap: { id: "node-1", type: "CONSUMER", position: { x: 100, y: 100 } }
      }],
      uiMapList: []
    }));

    await page.waitForTimeout(1500);

    // Layer 5: Effect — validation passes
    const successAlert = modal.getByText(/Valid workflow/i);
    await expect(successAlert).toBeVisible({ timeout: 3000 });
    await expect(successAlert).toContainText('1 node');
    await expect(successAlert).toContainText('0 edge');

    // Verify no error about invalid plugin type
    const errorAlert = modal.getByText(/Validation failed/i);
    await expect(errorAlert).not.toBeVisible();
  });

  test('TC-IMPORT-TYPES-02: Validate CONSUMERWITHOUTERROR type acceptance', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    const textarea = modal.locator('textarea').first();
    await textarea.fill(JSON.stringify({
      pluginList: [{
        id: 1,
        description: "HTTP Consumer Without Error",
        linkingIdOfRuleListAndAction: "rule-1",
        ruleList: [{ key: "$.retry", remark: "Retry flag" }],
        action: { type: "CONSUMERWITHOUTERROR", provider: "http", remark: "POST /api/submit" },
        uiMap: { id: "node-1", type: "CONSUMERWITHOUTERROR", position: { x: 100, y: 100 } }
      }],
      uiMapList: []
    }));

    await page.waitForTimeout(1500);

    const successAlert = modal.getByText(/Valid workflow/i);
    await expect(successAlert).toBeVisible({ timeout: 3000 });
    await expect(successAlert).toContainText('1 node');
    await expect(successAlert).toContainText('0 edge');
  });

  test('TC-IMPORT-TYPES-03: Validate IFELSE type acceptance', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    const textarea = modal.locator('textarea').first();
    await textarea.fill(JSON.stringify({
      pluginList: [{
        id: 1,
        description: "Conditional Logic",
        linkingIdOfRuleListAndAction: "rule-1",
        ruleList: [{ key: "$.amount", remark: "Amount exists" }],
        action: { type: "IFELSE", provider: "logic", remark: "$.amount > 100" },
        uiMap: { id: "node-1", type: "IFELSE", position: { x: 100, y: 100 } }
      }],
      uiMapList: []
    }));

    await page.waitForTimeout(1500);

    const successAlert = modal.getByText(/Valid workflow/i);
    await expect(successAlert).toBeVisible({ timeout: 3000 });
    await expect(successAlert).toContainText('1 node');
  });

  test('TC-IMPORT-TYPES-04: Validate MESSAGE type acceptance', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    const textarea = modal.locator('textarea').first();
    await textarea.fill(JSON.stringify({
      pluginList: [{
        id: 1,
        description: "Send Message",
        linkingIdOfRuleListAndAction: "rule-1",
        ruleList: [{ key: "$.notify", remark: "Notify flag" }],
        action: { type: "MESSAGE", provider: "notification", remark: "Send email" },
        uiMap: { id: "node-1", type: "MESSAGE", position: { x: 100, y: 100 } }
      }],
      uiMapList: []
    }));

    await page.waitForTimeout(1500);

    const successAlert = modal.getByText(/Valid workflow/i);
    await expect(successAlert).toBeVisible({ timeout: 3000 });
    await expect(successAlert).toContainText('1 node');
  });

  test('TC-IMPORT-TYPES-05: Validate FUNCTION_V2 type acceptance', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    const textarea = modal.locator('textarea').first();
    await textarea.fill(JSON.stringify({
      pluginList: [{
        id: 1,
        description: "Function V2",
        linkingIdOfRuleListAndAction: "rule-1",
        ruleList: [{ key: "$.process", remark: "Process flag" }],
        action: { type: "FUNCTION_V2", provider: "compute", remark: "Calculate total" },
        uiMap: { id: "node-1", type: "FUNCTION_V2", position: { x: 100, y: 100 } }
      }],
      uiMapList: []
    }));

    await page.waitForTimeout(1500);

    const successAlert = modal.getByText(/Valid workflow/i);
    await expect(successAlert).toBeVisible({ timeout: 3000 });
    await expect(successAlert).toContainText('1 node');
  });

  test('TC-IMPORT-TYPES-06: Validate FUNCTION_V3 type acceptance', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    const textarea = modal.locator('textarea').first();
    await textarea.fill(JSON.stringify({
      pluginList: [{
        id: 1,
        description: "Function V3",
        linkingIdOfRuleListAndAction: "rule-1",
        ruleList: [{ key: "$.finalize", remark: "Finalize flag" }],
        action: { type: "FUNCTION_V3", provider: "compute", remark: "Finalize result" },
        uiMap: { id: "node-1", type: "FUNCTION_V3", position: { x: 100, y: 100 } }
      }],
      uiMapList: []
    }));

    await page.waitForTimeout(1500);

    const successAlert = modal.getByText(/Valid workflow/i);
    await expect(successAlert).toBeVisible({ timeout: 3000 });
    await expect(successAlert).toContainText('1 node');
  });

  test('TC-IMPORT-TYPES-07: Reject HTTP_CALL (UI-only enum name)', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    const textarea = modal.locator('textarea').first();
    await textarea.fill(JSON.stringify({
      pluginList: [{
        id: 1,
        description: "HTTP Call",
        action: { type: "HTTP_CALL", provider: "http" },
        uiMap: { id: "node-1", type: "HTTP_CALL", position: { x: 100, y: 100 } }
      }],
      uiMapList: []
    }));

    await page.waitForTimeout(1500);

    // Layer 5: Effect — validation fails
    const errorAlert = modal.getByText(/Validation failed/i);
    await expect(errorAlert).toBeVisible({ timeout: 3000 });
    await expect(errorAlert).toContainText('Invalid plugin type');
    await expect(errorAlert).toContainText('HTTP_CALL');

    // Verify Apply button is disabled
    const applyButton = modal.locator('.modal-box-footer').getByRole('button', { name: 'Apply to Canvas' });
    await expect(applyButton).toBeDisabled();
  });

  test('TC-IMPORT-TYPES-08: Reject LOGIC (UI-only enum name)', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    const textarea = modal.locator('textarea').first();
    await textarea.fill(JSON.stringify({
      pluginList: [{
        id: 1,
        description: "Logic Node",
        action: { type: "LOGIC", provider: "logic" },
        uiMap: { id: "node-1", type: "LOGIC", position: { x: 100, y: 100 } }
      }],
      uiMapList: []
    }));

    await page.waitForTimeout(1500);

    const errorAlert = modal.getByText(/Validation failed/i);
    await expect(errorAlert).toBeVisible({ timeout: 3000 });
    await expect(errorAlert).toContainText('Invalid plugin type');
    await expect(errorAlert).toContainText('LOGIC');

    const applyButton = modal.locator('.modal-box-footer').getByRole('button', { name: 'Apply to Canvas' });
    await expect(applyButton).toBeDisabled();
  });

  test('TC-IMPORT-TYPES-09: Help text shows correct plugin types', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Layer 1: Existence — expand "What belongs here?" section
    const whatBelongsCollapse = modal.locator('details').filter({ hasText: 'What belongs here?' });
    await expect(whatBelongsCollapse).toBeVisible();

    // Layer 4: Interactable — click to expand
    const collapseHeader = whatBelongsCollapse.locator('summary');
    await collapseHeader.click();
    await page.waitForTimeout(500);

    // Layer 5: Effect — verify help text content
    const collapseContent = whatBelongsCollapse.locator('details > div');
    await expect(collapseContent).toBeVisible();

    // Verify all 6 valid types are listed
    await expect(collapseContent).toContainText('CONSUMER');
    await expect(collapseContent).toContainText('CONSUMERWITHOUTERROR');
    await expect(collapseContent).toContainText('IFELSE');
    await expect(collapseContent).toContainText('MESSAGE');
    await expect(collapseContent).toContainText('FUNCTION_V2');
    await expect(collapseContent).toContainText('FUNCTION_V3');

    // Verify HTTP_CALL and LOGIC are NOT shown
    const contentText = await collapseContent.textContent();
    expect(contentText).not.toContain('HTTP_CALL');
    expect(contentText).not.toContain('LOGIC');
  });

  test('TC-IMPORT-TYPES-11: Mixed-type workflow import', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import' });
    await importButton.click();

    const modal = page.locator('.modal-box').filter({ hasText: 'Import Workflow from JSON' });
    await expect(modal).toBeVisible({ timeout: 5000 });

    const textarea = modal.locator('textarea').first();
    await textarea.fill(JSON.stringify({
      pluginList: [
        {
          id: 1,
          description: "Consumer Node",
          action: { type: "CONSUMER", provider: "http" },
          uiMap: { id: "node-1", type: "CONSUMER", position: { x: 100, y: 100 } }
        },
        {
          id: 2,
          description: "IfElse Node",
          action: { type: "IFELSE", provider: "logic" },
          uiMap: { id: "node-2", type: "IFELSE", position: { x: 300, y: 100 } }
        },
        {
          id: 3,
          description: "Function V2 Node",
          action: { type: "FUNCTION_V2", provider: "compute" },
          uiMap: { id: "node-3", type: "FUNCTION_V2", position: { x: 500, y: 100 } }
        }
      ],
      uiMapList: [
        { source: "node-1", target: "node-2" },
        { source: "node-2", target: "node-3" }
      ]
    }));

    await page.waitForTimeout(1500);

    const successAlert = modal.getByText(/Valid workflow/i);
    await expect(successAlert).toBeVisible({ timeout: 3000 });
    await expect(successAlert).toContainText('3 node');
    await expect(successAlert).toContainText('2 edge');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Canvas Import - IFELSE Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://workflow-ui-gamma.vercel.app/workflows');

    // Create or select an application
    const appCards = page.locator('[data-testid="app-card"]');
    const appCount = await appCards.count();

    if (appCount === 0) {
      await page.getByRole('button', { name: /new application/i }).click();
      await page.getByPlaceholder(/application name/i).fill('IFELSE Test App');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForURL(/\/workflows\/.+/);
    } else {
      await appCards.first().click();
      await page.waitForURL(/\/workflows\/.+/);
    }
  });

  test('TC-VAL-IFELSE-01: Single IFELSE with TRUE/FALSE branches', async ({ page }) => {
    const testData = {
      pluginList: [
        {
          id: 'HTTP_1',
          description: 'Fetch data',
          action: { type: 'CONSUMER', provider: 'http' }
        },
        {
          id: 'IFELSE_1',
          description: 'Check amount',
          ruleList: [{ key: '$.data.amount', remark: 'Amount > 100' }],
          action: { type: 'IFELSE', logic: { condition: '$.data.amount > 100' } }
        },
        {
          id: 'MSG_1',
          description: 'High amount message',
          action: { type: 'MESSAGE', provider: 'email' }
        },
        {
          id: 'MSG_2',
          description: 'Low amount message',
          action: { type: 'MESSAGE', provider: 'sms' }
        }
      ],
      uiMapList: [
        { id: 'e1', source: 'HTTP_1', target: 'IFELSE_1' },
        { id: 'e2', source: 'IFELSE_1_true', target: 'MSG_1' },
        { id: 'e3', source: 'IFELSE_1_false', target: 'MSG_2' }
      ]
    };

    // Click Import button
    await page.getByRole('button', { name: /import/i }).click();

    // Wait for modal
    await expect(page.getByText(/import workflow from json/i)).toBeVisible();

    // Paste JSON
    await page.locator('textarea').fill(JSON.stringify(testData, null, 2));

    // Verify validation passes
    const validText = page.getByText(/valid workflow/i);
    await expect(validText).toBeVisible({ timeout: 5000 });
    await expect(validText).toContainText(/4 node/i);
    await expect(validText).toContainText(/3 edge/i);

    // Verify no errors about IFELSE branches
    const errorText = page.getByText(/validation failed/i);
    await expect(errorText).not.toBeVisible();

    // Apply button should be enabled
    const applyButton = page.getByRole('button', { name: /apply/i });
    await expect(applyButton).toBeEnabled();

    // Apply to canvas
    await applyButton.click();

    // Verify canvas renders nodes
    await expect(page.locator('[data-id="HTTP_1"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-id="IFELSE_1"]')).toBeVisible();
    await expect(page.locator('[data-id="MSG_1"]')).toBeVisible();
    await expect(page.locator('[data-id="MSG_2"]')).toBeVisible();
  });

  test('TC-VAL-IFELSE-02: Multiple IFELSE nodes', async ({ page }) => {
    const testData = {
      pluginList: [
        { id: 'HTTP_1', description: 'Fetch', action: { type: 'CONSUMER' } },
        { id: 'IFELSE_1', description: 'Check 1', action: { type: 'IFELSE' } },
        { id: 'IFELSE_2', description: 'Check 2', action: { type: 'IFELSE' } },
        { id: 'MSG_1', description: 'Message 1', action: { type: 'MESSAGE' } },
        { id: 'MSG_2', description: 'Message 2', action: { type: 'MESSAGE' } }
      ],
      uiMapList: [
        { id: 'e1', source: 'HTTP_1', target: 'IFELSE_1' },
        { id: 'e2', source: 'IFELSE_1_true', target: 'IFELSE_2' },
        { id: 'e3', source: 'IFELSE_1_false', target: 'MSG_2' },
        { id: 'e4', source: 'IFELSE_2_true', target: 'MSG_1' },
        { id: 'e5', source: 'IFELSE_2_false', target: 'MSG_2' }
      ]
    };

    await page.getByRole('button', { name: /import/i }).click();
    await page.locator('textarea').fill(JSON.stringify(testData));

    const validText = page.getByText(/valid workflow/i);
    await expect(validText).toBeVisible({ timeout: 5000 });
    await expect(validText).toContainText(/5 node/i);
    await expect(validText).toContainText(/5 edge/i);
    await expect(page.getByRole('button', { name: /apply/i })).toBeEnabled();
  });

  test('TC-VAL-IFELSE-03: Case-insensitive branch suffixes', async ({ page }) => {
    const testData = {
      pluginList: [
        { id: 'IFELSE_1', description: 'Check', action: { type: 'IFELSE' } },
        { id: 'MSG_1', description: 'Message', action: { type: 'MESSAGE' } }
      ],
      uiMapList: [
        { id: 'e1', source: 'IFELSE_1_TRUE', target: 'MSG_1' },
        { id: 'e2', source: 'IFELSE_1_false', target: 'MSG_1' }
      ]
    };

    await page.getByRole('button', { name: /import/i }).click();
    await page.locator('textarea').fill(JSON.stringify(testData));

    await expect(page.getByText(/valid workflow/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /apply/i })).toBeEnabled();
  });

  test('TC-VAL-IFELSE-04: Orphan IFELSE branch fails validation', async ({ page }) => {
    const testData = {
      pluginList: [
        { id: 'MSG_1', description: 'Message', action: { type: 'MESSAGE' } }
      ],
      uiMapList: [
        { id: 'e1', source: 'IFELSE_1_true', target: 'MSG_1' }
      ]
    };

    await page.getByRole('button', { name: /import/i }).click();
    await page.locator('textarea').fill(JSON.stringify(testData));

    await expect(page.getByText(/validation failed/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/IFELSE_1_true.*does not exist/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /apply/i })).toBeDisabled();
  });

  test('TC-VAL-IFELSE-05: Branch reference to non-IFELSE node fails', async ({ page }) => {
    const testData = {
      pluginList: [
        { id: 'HTTP_1', description: 'Fetch', action: { type: 'CONSUMER' } },
        { id: 'MSG_1', description: 'Message', action: { type: 'MESSAGE' } }
      ],
      uiMapList: [
        { id: 'e1', source: 'HTTP_1_true', target: 'MSG_1' }
      ]
    };

    await page.getByRole('button', { name: /import/i }).click();
    await page.locator('textarea').fill(JSON.stringify(testData));

    await expect(page.getByText(/validation failed/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/HTTP_1_true.*does not exist/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /apply/i })).toBeDisabled();
  });

  test('TC-VAL-IFELSE-09: Non-IFELSE missing node still fails', async ({ page }) => {
    const testData = {
      pluginList: [
        { id: 'HTTP_1', description: 'Fetch', action: { type: 'CONSUMER' } }
      ],
      uiMapList: [
        { id: 'e1', source: 'HTTP_1', target: 'MSG_999' }
      ]
    };

    await page.getByRole('button', { name: /import/i }).click();
    await page.locator('textarea').fill(JSON.stringify(testData));

    await expect(page.getByText(/validation failed/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/MSG_999.*does not exist/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /apply/i })).toBeDisabled();
  });
});

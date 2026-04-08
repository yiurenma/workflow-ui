import { test as base } from '@playwright/test';

const OPERATION_API = 'https://workflow-operation-api-n9sbp.ondigitalocean.app/api';

export const CANVAS_APP = 'E2E_TEST_CANVAS';

/**
 * Global test setup - ensures test data exists before running tests
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await ensureTestApplications();
    await use(page);
  },
});

export { expect } from '@playwright/test';

async function appExists(applicationName: string): Promise<boolean> {
  try {
    const res = await fetch(`${OPERATION_API}/workflow/entity-setting?applicationName=${encodeURIComponent(applicationName)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return (data.totalElements ?? 0) > 0;
  } catch {
    return false;
  }
}

async function getTemplateWorkflow(): Promise<any> {
  const response = await fetch(`${OPERATION_API}/workflow?applicationName=UK_DRFI_1`);
  if (response.ok) {
    const data = await response.json();
    return { pluginList: data.pluginList || [], uiMapList: data.uiMapList || [] };
  }
  return { pluginList: [], uiMapList: [] };
}

async function createTestApplication(applicationName: string, withWorkflow = false): Promise<void> {
  if (await appExists(applicationName)) {
    console.log(`  ${applicationName} already exists`);
    return;
  }
  const workflow = withWorkflow ? await getTemplateWorkflow() : { pluginList: [], uiMapList: [] };
  try {
    const response = await fetch(
      `${OPERATION_API}/workflow?applicationName=${encodeURIComponent(applicationName)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(workflow) }
    );
    if (response.ok) {
      console.log(`✓ Created ${applicationName}`);
    } else {
      console.warn(`Failed to create ${applicationName}: ${response.status}`);
    }
  } catch (error) {
    console.warn(`Error creating ${applicationName}:`, error);
  }
}

async function ensureTestApplications(): Promise<void> {
  await createTestApplication('E2E_TEST_APP_1', false);
  await createTestApplication('E2E_TEST_APP_2', false);
  // Canvas app cloned from UK_DRFI_1 — has real nodes for node-editor & explain tests
  await createTestApplication(CANVAS_APP, true);
}

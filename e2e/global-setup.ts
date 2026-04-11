import { FullConfig } from '@playwright/test';

const OPERATION_API = 'https://workflow-operation-api-n9sbp.ondigitalocean.app/api';

export const CANVAS_APP = 'E2E_TEST_CANVAS';
export const TEST_APP_1 = 'E2E_TEST_APP_1';

async function appExists(applicationName: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${OPERATION_API}/workflow/entity-setting?applicationName=${encodeURIComponent(applicationName)}`
    );
    if (!res.ok) return false;
    const data = await res.json();
    return (data.totalElements ?? 0) > 0;
  } catch {
    return false;
  }
}

async function getTemplateWorkflow(): Promise<{ pluginList: any[]; uiMapList: any[] }> {
  try {
    const response = await fetch(`${OPERATION_API}/workflow?applicationName=UK_DRFI_1`);
    if (response.ok) {
      const data = await response.json();
      return { pluginList: data.pluginList ?? [], uiMapList: data.uiMapList ?? [] };
    }
  } catch {
    // fallback to empty
  }
  return { pluginList: [], uiMapList: [] };
}

async function createTestApplication(applicationName: string, withWorkflow = false): Promise<void> {
  if (await appExists(applicationName)) {
    console.log(`  [setup] ${applicationName} already exists`);
    return;
  }
  const workflow = withWorkflow ? await getTemplateWorkflow() : { pluginList: [], uiMapList: [] };
  const response = await fetch(
    `${OPERATION_API}/workflow?applicationName=${encodeURIComponent(applicationName)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(workflow) }
  );
  if (response.ok) {
    console.log(`  [setup] ✓ Created ${applicationName}`);
  } else {
    console.warn(`  [setup] Failed to create ${applicationName}: ${response.status}`);
  }
}

export default async function globalSetup(_config: FullConfig) {
  console.log('[global-setup] Ensuring UAT test applications exist...');
  await createTestApplication(TEST_APP_1, false);
  await createTestApplication(CANVAS_APP, true);
  console.log('[global-setup] Done.');
}

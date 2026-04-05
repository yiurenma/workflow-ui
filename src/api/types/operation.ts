/**
 * Shapes aligned with workflow-operation-api (Spring Data + WorkFlow DTOs).
 */

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first?: boolean;
  last?: boolean;
}

export interface WorkflowEntitySettingRow {
  id?: number;
  applicationName: string;
  enabled?: boolean;
  asyncMode?: boolean;
  retry?: boolean;
  tracking?: boolean;
  ignoreDuplicateRecordError?: boolean;
  region?: string;
  eimId?: string;
  defaultServiceAccount?: string;
  retryProperties?: string;
  createdDate?: string;
  /** Auditing field name from workflow-operation-api (Jackson) */
  createdDateTime?: string;
  lastModifiedDate?: string;
  lastModifiedDateTime?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface EntitySettingPatch {
  enabled?: boolean;
  asyncMode?: boolean;
  retry?: boolean;
  tracking?: boolean;
  ignoreDuplicateRecordError?: boolean;
  eimId?: string;
  defaultServiceAccount?: string;
  region?: string;
  retryProperties?: string;
}

export interface WorkflowRecord {
  id: number;
  applicationName?: string;
  requestCorrelationId?: string;
  transactionConfirmationNumber?: string;
  trackingNumber?: string;
  customerId?: string;
  overallStatus?: string;
  retryTimes?: number;
  originWorkflowRecordId?: number;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

export interface WorkflowRecordDetail {
  record: WorkflowRecord;
  children: WorkflowRecord[];
}

export interface HistoryRevision {
  revisionNumber?: number;
  revisionInstant?: string;
  revisionType?: string;
  entity?: WorkflowEntitySettingRow & { workflow?: string };
}

export interface BackendWorkflowRule {
  key?: string;
  remark?: string;
  id?: number;
  [key: string]: unknown;
}

export interface BackendWorkflowType {
  type?: string;
  provider?: string;
  remark?: string;
  httpRequestMethod?: string;
  httpRequestUrlWithQueryParameter?: unknown;
  internalHttpRequestUrlWithQueryParameter?: unknown;
  httpRequestHeaders?: unknown;
  httpRequestBody?: unknown;
  elseLogic?: unknown;
  trackingNumberSchemaInHttpResponse?: unknown;
  [key: string]: unknown;
}

/** Plugin step in API (not React Flow Plugin enum). */
export interface BackendPlugin {
  id?: number;
  description?: string;
  linkingIdOfRuleListAndAction?: string;
  ruleList?: BackendWorkflowRule[];
  action?: BackendWorkflowType;
  uiMap?: unknown;
}

export interface WorkFlow {
  pluginList?: BackendPlugin[];
  uiMapList?: unknown[];
}

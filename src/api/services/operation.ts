import {
  defaultHeaders,
  handleApiError,
  joinApiUrl,
  OPERATION_API_BASE,
} from '../config';
import type {
  EntitySettingPatch,
  HistoryRevision,
  SpringPage,
  WorkFlow,
  WorkflowEntitySettingRow,
  WorkflowRecord,
  WorkflowRecordDetail,
} from '../types';

const json = (path: string, init?: RequestInit) =>
  fetch(joinApiUrl(OPERATION_API_BASE, path), {
    ...init,
    headers: { ...defaultHeaders, ...init?.headers },
  });

export const operationApi = {
  listEntitySettings: async (params: {
    page?: number;
    size?: number;
    applicationName?: string;
    sort?: string;
  }): Promise<SpringPage<WorkflowEntitySettingRow>> => {
    const sp = new URLSearchParams();
    if (params.page != null) sp.set('page', String(params.page));
    if (params.size != null) sp.set('size', String(params.size));
    if (params.sort) sp.set('sort', params.sort);
    if (params.applicationName) sp.set('applicationName', params.applicationName);
    const q = sp.toString();
    const path = `/workflow/entity-setting${q ? `?${q}` : ''}`;
    const response = await json(path);
    if (!response.ok) return handleApiError(response);
    return response.json();
  },

  getWorkflow: async (applicationName: string): Promise<WorkFlow> => {
    const response = await json(
      `/workflow?${new URLSearchParams({ applicationName }).toString()}`
    );
    if (!response.ok) return handleApiError(response);
    return response.json();
  },

  saveWorkflow: async (
    applicationName: string,
    body: WorkFlow
  ): Promise<WorkFlow> => {
    const response = await json(
      `/workflow?${new URLSearchParams({ applicationName }).toString()}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) return handleApiError(response);
    return response.json();
  },

  deleteWorkflow: async (applicationName: string): Promise<void> => {
    const response = await json(
      `/workflow?${new URLSearchParams({ applicationName }).toString()}`,
      { method: 'DELETE' }
    );
    if (!response.ok && response.status !== 204) {
      return handleApiError(response);
    }
  },

  createEmptyApplication: async (applicationName: string): Promise<WorkFlow> => {
    const empty: WorkFlow = { pluginList: [], uiMapList: [] };
    return operationApi.saveWorkflow(applicationName, empty);
  },

  patchEntitySetting: async (
    applicationName: string,
    patch: EntitySettingPatch
  ): Promise<WorkflowEntitySettingRow> => {
    const response = await json(
      `/workflow/entity-setting?${new URLSearchParams({ applicationName }).toString()}`,
      { method: 'PATCH', body: JSON.stringify(patch) }
    );
    if (!response.ok) return handleApiError(response);
    return response.json();
  },

  getEntitySettingHistory: async (
    applicationName: string,
    page = 0,
    size = 20
  ): Promise<SpringPage<HistoryRevision>> => {
    const sp = new URLSearchParams({ applicationName, page: String(page), size: String(size) });
    const response = await json(`/workflow/entity-setting/history?${sp.toString()}`);
    if (!response.ok) return handleApiError(response);
    return response.json();
  },

  listRecords: async (params: {
    applicationName?: string;
    overallStatus?: string;
    transactionConfirmationNumber?: string;
    trackingNumber?: string;
    customerId?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }): Promise<SpringPage<WorkflowRecord>> => {
    const sp = new URLSearchParams();
    if (params.applicationName) sp.set('applicationName', params.applicationName);
    if (params.overallStatus) sp.set('overallStatus', params.overallStatus);
    if (params.transactionConfirmationNumber) sp.set('transactionConfirmationNumber', params.transactionConfirmationNumber);
    if (params.trackingNumber) sp.set('trackingNumber', params.trackingNumber);
    if (params.customerId) sp.set('customerId', params.customerId);
    if (params.from) sp.set('from', params.from);
    if (params.to) sp.set('to', params.to);
    if (params.page != null) sp.set('page', String(params.page));
    if (params.size != null) sp.set('size', String(params.size));
    const response = await json(`/workflow/records?${sp.toString()}`);
    if (!response.ok) return handleApiError(response);
    return response.json();
  },

  getRecord: async (id: number): Promise<WorkflowRecordDetail> => {
    const response = await json(`/workflow/records/${id}`);
    if (!response.ok) return handleApiError(response);
    return response.json();
  },

  autoCopyWorkflow: async (
    fromApplicationName: string,
    toApplicationName: string
  ): Promise<void> => {
    const sp = new URLSearchParams({ fromApplicationName, toApplicationName });
    const response = await json(`/workflow/autoCopy?${sp.toString()}`, {
      method: 'POST',
    });
    if (!response.ok) return handleApiError(response);
  },
};

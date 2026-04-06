import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { operationApi } from '../services/operation';
import type { EntitySettingPatch, WorkFlow } from '../types';
import { createQueryKey } from '../config';

const KEYS = {
  apps: () => createQueryKey('applications'),
  appsList: (p: Record<string, unknown>) => createQueryKey('applications', p),
  workflow: (applicationName: string) => createQueryKey('workflow', { applicationName }),
  history: (applicationName: string, page: number) => createQueryKey('history', { applicationName, page }),
  records: (p: Record<string, unknown>) => createQueryKey('records', p),
  record: (id: number) => createQueryKey('record', { id }),
};

export const useEntitySettings = (params: {
  page?: number;
  size?: number;
  applicationName?: string;
  sort?: string;
}) => {
  return useQuery({
    queryKey: KEYS.appsList(params as Record<string, unknown>),
    queryFn: () => operationApi.listEntitySettings(params),
  });
};

export const useWorkflowQuery = (applicationName: string) => {
  return useQuery({
    queryKey: KEYS.workflow(applicationName),
    queryFn: () => operationApi.getWorkflow(applicationName),
    enabled: !!applicationName,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationName: string) =>
      operationApi.createEmptyApplication(applicationName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.apps() });
    },
  });
};

export const useSaveWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicationName,
      workFlow,
    }: {
      applicationName: string;
      workFlow: WorkFlow;
    }) => operationApi.saveWorkflow(applicationName, workFlow),
    onSuccess: (_, { applicationName }) => {
      queryClient.invalidateQueries({ queryKey: KEYS.workflow(applicationName) });
      queryClient.invalidateQueries({ queryKey: KEYS.apps() });
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationName: string) =>
      operationApi.deleteWorkflow(applicationName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.apps() });
    },
  });
};

export const usePatchEntitySetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationName, patch }: { applicationName: string; patch: EntitySettingPatch }) =>
      operationApi.patchEntitySetting(applicationName, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.apps() });
    },
  });
};

export const useEntitySettingHistory = (applicationName: string, page: number) => {
  return useQuery({
    queryKey: KEYS.history(applicationName, page),
    queryFn: () => operationApi.getEntitySettingHistory(applicationName, page),
    enabled: !!applicationName,
  });
};

export const useWorkflowRecords = (params: {
  applicationName?: string;
  overallStatus?: string;
  transactionConfirmationNumber?: string;
  trackingNumber?: string;
  customerId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: KEYS.records(params as Record<string, unknown>),
    queryFn: () => operationApi.listRecords(params),
  });
};

export const useWorkflowRecordDetail = (id: number | null) => {
  return useQuery({
    queryKey: KEYS.record(id ?? 0),
    queryFn: () => operationApi.getRecord(id!),
    enabled: id != null,
  });
};

export const useAutoCopyWorkflow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fromApplicationName,
      toApplicationName,
    }: {
      fromApplicationName: string;
      toApplicationName: string;
    }) => operationApi.autoCopyWorkflow(fromApplicationName, toApplicationName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.apps() });
    },
  });
};

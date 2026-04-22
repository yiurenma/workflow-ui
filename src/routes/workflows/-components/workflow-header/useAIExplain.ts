import { useState, useCallback, useEffect } from "react";
import type { WorkFlow } from "@/api/types";
import { callAI } from "@/services/aiService";
import { buildExplainPrompt } from "@/utils/workflowExplainer";
import { isValidToken, getStoredToken, saveToken, clearToken as clearStoredToken } from "@/utils/tokenStorage";
import { useGitHubDeviceFlow } from "./useGitHubDeviceFlow";

export type UseAIExplainReturn = {
  explainOpen: boolean;
  explainLoading: boolean;
  explainResult: string | null;
  deviceFlowOpen: boolean;
  tokenPromptOpen: boolean;
  tokenInput: string;
  deviceFlow: ReturnType<typeof useGitHubDeviceFlow>;
  setTokenInput: (v: string) => void;
  setExplainOpen: (v: boolean) => void;
  setDeviceFlowOpen: (v: boolean) => void;
  setTokenPromptOpen: (v: boolean) => void;
  explainFlow: (getWorkflow: () => WorkFlow | null, applicationName: string) => void;
  runExplain: (token: string, getWorkflow: () => WorkFlow | null, applicationName: string) => Promise<void>;
  openManualTokenModal: () => void;
  saveTokenAndExplain: (getWorkflow: () => WorkFlow | null, applicationName: string) => void;
  cancelDeviceFlow: () => void;
  clearToken: () => void;
};

type UseAIExplainOptions = {
  onError?: (msg: string) => void;
  onInfo?: (msg: string) => void;
};

export function useAIExplain(options?: UseAIExplainOptions): UseAIExplainReturn {
  const { onError, onInfo } = options ?? {};

  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainResult, setExplainResult] = useState<string | null>(null);
  const [deviceFlowOpen, setDeviceFlowOpen] = useState(false);
  const [tokenPromptOpen, setTokenPromptOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [pendingExplain, setPendingExplain] = useState<{
    getWorkflow: () => WorkFlow | null;
    applicationName: string;
  } | null>(null);

  const runExplain = useCallback(async (
    token: string,
    getWorkflow: () => WorkFlow | null,
    applicationName: string
  ) => {
    const current = getWorkflow();
    if (!current) {
      onError?.("No workflow data available");
      return;
    }
    setExplainResult(null);
    setExplainOpen(true);
    setExplainLoading(true);
    try {
      const prompt = buildExplainPrompt(applicationName, current);
      const result = await callAI(token, prompt);
      setExplainResult(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setExplainResult(`Error: ${msg}`);
      onError?.("AI explain failed");
    } finally {
      setExplainLoading(false);
    }
  }, [onError]);

  const handleOAuthSuccess = useCallback((token: string) => {
    saveToken(token);
    setDeviceFlowOpen(false);
  }, []);

  const deviceFlow = useGitHubDeviceFlow(handleOAuthSuccess);

  // Handle pending explain after successful device flow auth
  useEffect(() => {
    if (!deviceFlowOpen && pendingExplain) {
      const token = getStoredToken();
      if (isValidToken(token)) {
        runExplain(token!, pendingExplain.getWorkflow, pendingExplain.applicationName);
        setPendingExplain(null);
      }
    }
  }, [deviceFlowOpen, pendingExplain, runExplain]);

  const explainFlow = useCallback((
    getWorkflow: () => WorkFlow | null,
    applicationName: string
  ) => {
    const token = getStoredToken();
    if (!isValidToken(token)) {
      setPendingExplain({ getWorkflow, applicationName });
      setDeviceFlowOpen(true);
      deviceFlow.start();
      return;
    }
    runExplain(token!, getWorkflow, applicationName);
  }, [deviceFlow, runExplain]);

  const openManualTokenModal = useCallback(() => {
    deviceFlow.cancel();
    setDeviceFlowOpen(false);
    setTokenInput("");
    setPendingExplain(null);
    setTokenPromptOpen(true);
  }, [deviceFlow]);

  const saveTokenAndExplain = useCallback((
    getWorkflow: () => WorkFlow | null,
    applicationName: string
  ) => {
    const t = tokenInput.trim();
    if (!t) {
      onError?.("Please enter a token");
      return;
    }
    saveToken(t);
    setTokenPromptOpen(false);
    setPendingExplain(null);
    runExplain(t, getWorkflow, applicationName);
  }, [tokenInput, runExplain, onError]);

  const cancelDeviceFlow = useCallback(() => {
    deviceFlow.cancel();
    setDeviceFlowOpen(false);
    setPendingExplain(null);
  }, [deviceFlow]);

  const clearToken = useCallback(() => {
    clearStoredToken();
    setPendingExplain(null);
    onInfo?.("AI token cleared");
  }, [onInfo]);

  return {
    explainOpen,
    explainLoading,
    explainResult,
    deviceFlowOpen,
    tokenPromptOpen,
    tokenInput,
    deviceFlow,
    setTokenInput,
    setExplainOpen,
    setDeviceFlowOpen,
    setTokenPromptOpen,
    explainFlow,
    runExplain,
    openManualTokenModal,
    saveTokenAndExplain,
    cancelDeviceFlow,
    clearToken,
  }
}

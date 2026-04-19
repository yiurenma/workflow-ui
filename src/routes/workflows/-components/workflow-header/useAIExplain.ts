import { useState, useCallback } from "react";
import { message } from "antd";
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

export function useAIExplain(): UseAIExplainReturn {
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainResult, setExplainResult] = useState<string | null>(null);
  const [deviceFlowOpen, setDeviceFlowOpen] = useState(false);
  const [tokenPromptOpen, setTokenPromptOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  const handleOAuthSuccess = useCallback((token: string) => {
    saveToken(token);
    setDeviceFlowOpen(false);
  }, []);

  const deviceFlow = useGitHubDeviceFlow(handleOAuthSuccess);

  const runExplain = useCallback(async (
    token: string,
    getWorkflow: () => WorkFlow | null,
    applicationName: string
  ) => {
    const current = getWorkflow();
    if (!current) {
      message.error("No workflow data available");
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
      message.error("AI explain failed");
    } finally {
      setExplainLoading(false);
    }
  }, []);

  const explainFlow = useCallback((
    getWorkflow: () => WorkFlow | null,
    applicationName: string
  ) => {
    const token = getStoredToken();
    if (!isValidToken(token)) {
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
    setTokenPromptOpen(true);
  }, [deviceFlow]);

  const saveTokenAndExplain = useCallback((
    getWorkflow: () => WorkFlow | null,
    applicationName: string
  ) => {
    const t = tokenInput.trim();
    if (!t) {
      message.error("Please enter a token");
      return;
    }
    saveToken(t);
    setTokenPromptOpen(false);
    runExplain(t, getWorkflow, applicationName);
  }, [tokenInput, runExplain]);

  const cancelDeviceFlow = useCallback(() => {
    deviceFlow.cancel();
    setDeviceFlowOpen(false);
  }, [deviceFlow]);

  const clearToken = useCallback(() => {
    clearStoredToken();
    message.info("AI token cleared");
  }, []);

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
  };
}

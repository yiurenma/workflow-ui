import { ArrowLeftOutlined, BulbOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Flex, Space, Button, message, Modal, Input, Typography } from "antd";
import type { WorkFlow } from "@/api/types";
import { useSaveWorkflow } from "@/api/hooks/workflow";
import { onlineApi } from "@/api/services/online";
import React, { useState } from "react";

const { TextArea } = Input;

type WorkflowHeaderProps = {
  applicationName: string;
  workFlow?: WorkFlow;
  isLoading?: boolean;
  onSave?: () => WorkFlow | null;
};

const defaultRunBody = `{\n  "messageInformation": {}\n}`;

const AI_TOKEN_KEY = "ai_explain_token";

function buildExplainPrompt(applicationName: string, workFlow: WorkFlow): string {
  const steps = (workFlow.pluginList ?? []).map((plugin, i) => {
    const type = plugin.action?.type ?? "UNKNOWN";
    const desc = plugin.description ?? `Step ${i + 1}`;
    const rulesCount = plugin.ruleList?.length ?? 0;
    const linkingId = plugin.linkingIdOfRuleListAndAction ?? "";
    const url = plugin.action?.httpRequestUrlWithQueryParameter
      ? JSON.stringify(plugin.action.httpRequestUrlWithQueryParameter)
      : null;
    return `  ${i + 1}. [${type}] ${desc} (linkingId: ${linkingId}, rules: ${rulesCount})${url ? ` → ${url}` : ""}`;
  });

  return `You are an expert software architect. Explain the following workflow pipeline clearly and concisely for a developer.

Application: "${applicationName}"
Total steps: ${steps.length}

Steps:
${steps.join("\n") || "  (no steps configured yet)"}

Provide:
1. A 1-sentence summary of what this workflow does end-to-end
2. A brief description of each step and its role in the pipeline
3. How data flows through the steps (what gets enriched or transformed)
4. Any notable patterns or potential concerns you observe

Be concise — use plain language, no jargon. Format with numbered sections.`;
}

async function callAI(token: string, prompt: string): Promise<string> {
  // Detect token type by prefix
  const isAnthropic = token.startsWith("sk-ant-");
  const isGitHub = token.startsWith("ghp_") || token.startsWith("ghu_") || token.startsWith("ghs_");

  if (isAnthropic) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": token,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text ?? "(no response)";
  }

  if (isGitHub) {
    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GitHub Models API error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "(no response)";
  }

  throw new Error("Unrecognised token format. Use an Anthropic key (sk-ant-…) or a GitHub token (ghp_… / ghu_…).");
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  applicationName,
  workFlow,
  isLoading,
  onSave,
}) => {
  const saveWorkflow = useSaveWorkflow();
  const [runOpen, setRunOpen] = useState(false);
  const [runBody, setRunBody] = useState(defaultRunBody);
  const [confirmationNumber, setConfirmationNumber] = useState("test-confirmation");
  const [runResult, setRunResult] = useState<string | null>(null);
  const [runLoading, setRunLoading] = useState(false);

  // Explain state
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainResult, setExplainResult] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenPromptOpen, setTokenPromptOpen] = useState(false);

  const saveFlow = async () => {
    if (!workFlow) {
      message.error("No workflow data to save");
      return;
    }

    try {
      const merged = onSave ? onSave() : null;
      const payload = merged ?? workFlow;
      await saveWorkflow.mutateAsync({
        applicationName,
        workFlow: payload,
      });
      message.success("Workflow saved successfully");
    } catch (error) {
      console.error("Failed to save workflow:", error);
      message.error("Failed to save workflow");
    }
  };

  const runFlow = () => {
    setRunResult(null);
    setRunOpen(true);
  };

  const executeRun = async () => {
    setRunLoading(true);
    setRunResult(null);
    try {
      const res = await onlineApi.postWorkflow({
        applicationName,
        confirmationNumber,
        body: runBody,
      });
      const text = await res.text();
      setRunResult(text.slice(0, 8000));
      message.success("Request completed");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setRunResult(msg);
      message.error("Online API request failed");
    } finally {
      setRunLoading(false);
    }
  };

  const explainFlow = () => {
    const token = localStorage.getItem(AI_TOKEN_KEY);
    if (!token) {
      setTokenInput("");
      setTokenPromptOpen(true);
      return;
    }
    runExplain(token);
  };

  const saveTokenAndExplain = () => {
    const t = tokenInput.trim();
    if (!t) {
      message.error("Please enter a token");
      return;
    }
    localStorage.setItem(AI_TOKEN_KEY, t);
    setTokenPromptOpen(false);
    runExplain(t);
  };

  const runExplain = async (token: string) => {
    const current = onSave ? onSave() : workFlow;
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
  };

  const clearToken = () => {
    localStorage.removeItem(AI_TOKEN_KEY);
    message.info("AI token cleared");
  };

  return (
    <>
      <Flex
        align="center"
        justify={"space-between"}
        gap={"middle"}
        className="py-2 px-4 border-b border-zinc-200 bg-white"
        style={{ minHeight: 44 }}
      >
        <Space size={"middle"}>
          <Link to={`/workflows`}>
            <ArrowLeftOutlined className="text-zinc-400 hover:text-zinc-700 transition-colors" />
          </Link>
          <div className="flex flex-col">
            <span className="font-semibold text-[13px] text-zinc-800 tracking-tight">
              {isLoading ? "Loading..." : applicationName}
            </span>
          </div>
        </Space>
        <Space size={"small"}>
          <Button
            size="small"
            icon={<BulbOutlined />}
            onClick={explainFlow}
            disabled={isLoading}
            className="text-xs font-medium text-amber-600 border-amber-300 hover:border-amber-400 hover:text-amber-700"
          >
            Explain
          </Button>
          <Button size="small" onClick={() => runFlow()} disabled={isLoading}
            className="text-xs font-medium text-zinc-600 border-zinc-300 hover:border-zinc-400 hover:text-zinc-800">
            Run
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={saveFlow}
            disabled={isLoading || saveWorkflow.isPending}
            loading={saveWorkflow.isPending}
            className="text-xs font-medium"
          >
            Save
          </Button>
        </Space>
      </Flex>

      {/* Token setup modal */}
      <Modal
        title="Set AI Token"
        open={tokenPromptOpen}
        onCancel={() => setTokenPromptOpen(false)}
        onOk={saveTokenAndExplain}
        okText="Save & Explain"
        width={480}
      >
        <Typography.Paragraph type="secondary" className="text-sm">
          Enter an <strong>Anthropic API key</strong> (<code>sk-ant-…</code>) or a{" "}
          <strong>GitHub personal access token</strong> (<code>ghp_…</code> / <code>ghu_…</code>)
          with GitHub Models access. Stored in <code>localStorage</code> — never sent to this server.
        </Typography.Paragraph>
        <Input.Password
          placeholder="sk-ant-… or ghp_…"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onPressEnter={saveTokenAndExplain}
          autoFocus
        />
      </Modal>

      {/* Explain result modal */}
      <Modal
        title={
          <Space>
            <BulbOutlined className="text-amber-500" />
            <span>AI Workflow Explainer — {applicationName}</span>
          </Space>
        }
        open={explainOpen}
        onCancel={() => setExplainOpen(false)}
        footer={
          <Space>
            <Button size="small" onClick={clearToken} type="text" className="text-zinc-400 text-xs">
              Clear token
            </Button>
            <Button onClick={() => setExplainOpen(false)}>Close</Button>
          </Space>
        }
        width={680}
      >
        {explainLoading ? (
          <div className="py-10 text-center text-zinc-400 text-sm">
            Analysing workflow with AI…
          </div>
        ) : explainResult ? (
          <pre className="whitespace-pre-wrap text-sm text-zinc-700 leading-relaxed font-sans">
            {explainResult}
          </pre>
        ) : null}
      </Modal>

      <Modal
        title="Run against Online API"
        open={runOpen}
        onCancel={() => setRunOpen(false)}
        onOk={executeRun}
        okText="Send POST /api/workflow"
        confirmLoading={runLoading}
        width={640}
      >
        <Typography.Paragraph type="secondary" className="text-sm">
          Sends <code>POST</code> to the online service with query{" "}
          <code>applicationName</code>, optional <code>confirmationNumber</code>, and header{" "}
          <code>X-Request-Correlation-Id</code> (generated per request).
        </Typography.Paragraph>
        <div className="mb-2">
          <Typography.Text className="text-xs text-slate-500">confirmationNumber</Typography.Text>
          <Input
            value={confirmationNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmationNumber(e.target.value)
            }
            className="mt-1"
          />
        </div>
        <div className="mb-2">
          <Typography.Text className="text-xs text-slate-500">Body (JSON or XML)</Typography.Text>
          <TextArea
            rows={10}
            value={runBody}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setRunBody(e.target.value)
            }
            className="mt-1 font-mono text-sm"
          />
        </div>
        {runResult && (
          <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-xs">
            {runResult}
          </pre>
        )}
      </Modal>
    </>
  );
};

export default WorkflowHeader;

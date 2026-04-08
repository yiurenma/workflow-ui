import { ArrowLeftOutlined, BulbOutlined, EllipsisOutlined, GithubOutlined, LoadingOutlined, RobotOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Dropdown, Flex, Space, Button, message, Modal, Input, Typography } from "antd";
import type { WorkFlow } from "@/api/types";
import { useSaveWorkflow } from "@/api/hooks/workflow";
import { onlineApi } from "@/api/services/online";
import React, { useState } from "react";
import { useGitHubDeviceFlow } from "./useGitHubDeviceFlow";
import { SimpleMarkdown } from "./SimpleMarkdown";
import { JsonPathModal } from "./JsonPathModal";
import { WorkflowGeneratorModal } from "./WorkflowGeneratorModal";
import { useIsMobile } from "@/hooks/useIsMobile";

const { TextArea } = Input;

type WorkflowHeaderProps = {
  applicationName: string;
  workFlow?: WorkFlow;
  isLoading?: boolean;
  onSave?: () => WorkFlow | null;
  onWorkflowGenerated?: (workflow: WorkFlow) => void;
  onStraighten?: () => void;
};

const defaultRunBody = `{\n  "messageInformation": {}\n}`;

const AI_TOKEN_KEY = "ai_explain_token";

function isValidToken(token: string | null): boolean {
  if (!token) return false;
  return (
    token.startsWith("sk-ant-") ||
    token.startsWith("ghp_") ||
    token.startsWith("github_pat_") ||
    token.startsWith("gho_") ||
    token.startsWith("ghu_") ||
    token.startsWith("ghs_")
  );
}

function truncate(value: unknown, maxLen = 500): string {
  if (value === undefined || value === null) return "(none)";
  const s = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return s.length > maxLen ? s.slice(0, maxLen) + " …[truncated]" : s;
}

function buildExplainPrompt(applicationName: string, workFlow: WorkFlow): string {
  const steps = (workFlow.pluginList ?? []).map((plugin, i) => {
    const action = plugin.action;
    const type = action?.type ?? "UNKNOWN";
    const desc = plugin.description ?? `Step ${i + 1}`;
    const provider = action?.provider ?? "(none)";
    const method = action?.httpRequestMethod ?? "";
    const url = action?.httpRequestUrlWithQueryParameter
      ? truncate(action.httpRequestUrlWithQueryParameter, 300)
      : "";
    const body = action?.httpRequestBody ? truncate(action.httpRequestBody) : "";
    const elseLogic = action?.elseLogic ? truncate(action.elseLogic) : "";

    const rulesBlock =
      (plugin.ruleList ?? []).length === 0
        ? "    (no rules — always executes)"
        : (plugin.ruleList ?? [])
            .map(
              (r, ri) =>
                `    ${ri + 1}. JSONPath: ${r.key ?? "(empty)"}${r.remark ? `\n       Meaning: ${r.remark}` : ""}`
            )
            .join("\n");

    const actionBlock = [
      `    type: ${type}`,
      `    provider: ${provider}`,
      method ? `    method: ${method}` : "",
      url ? `    url: ${url}` : "",
      body ? `    request body: ${body}` : "",
      elseLogic ? `    logic/payload: ${elseLogic}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `### Step ${i + 1} — ${desc}

  Rules (all must match for this step to execute):
${rulesBlock}

  Action:
${actionBlock}`;
  });

  return `You are an expert software architect. Explain the following workflow pipeline to a developer or business analyst.

Application: "${applicationName}"
Total steps: ${steps.length}

${steps.join("\n\n") || "  (no steps configured yet)"}

---

Please provide the following, formatted in Markdown with ## headings and bullet lists:

## Summary
One sentence describing what this workflow does end-to-end.

## Step-by-Step Explanation
For each step:
- Explain what it does in plain English
- Explain what each **rule** means — what condition must be true for this step to run
- Explain what the **action** does — what system it calls, what data it sends or transforms, what the payload/logic achieves

## Data Flow
How data flows through the steps — what gets enriched, transformed, or routed.

## Observations
Any notable patterns, potential concerns, or suggestions you notice.

Use plain language. Avoid jargon. Format each step as a ## heading.`;
}

async function callAI(token: string, prompt: string, maxTokens = 1024): Promise<string> {
  // Detect token type by prefix
  const isAnthropic = token.startsWith("sk-ant-");
  const isGitHub =
    token.startsWith("ghp_") ||
    token.startsWith("github_pat_") ||
    token.startsWith("gho_") ||
    token.startsWith("ghu_") ||
    token.startsWith("ghs_");

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
        max_tokens: maxTokens,
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
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GitHub Models API error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "(no response)";
  }

  throw new Error(
    "Unrecognised token format. Use an Anthropic key (sk-ant-…) or a GitHub token (ghp_…, github_pat_…, gho_ from device login, ghu_…).",
  );
}

const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  applicationName,
  workFlow,
  isLoading,
  onSave,
  onWorkflowGenerated,
  onStraighten,
}) => {
  const isMobile = useIsMobile();
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

  // Manual token entry modal (fallback)
  const [tokenInput, setTokenInput] = useState("");
  const [tokenPromptOpen, setTokenPromptOpen] = useState(false);

  // GitHub OAuth Device Flow modal
  const [deviceFlowOpen, setDeviceFlowOpen] = useState(false);
  const [jsonPathOpen, setJsonPathOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);

  const handleOAuthSuccess = (token: string) => {
    localStorage.setItem(AI_TOKEN_KEY, token);
    setDeviceFlowOpen(false);
    runExplain(token);
  };

  const deviceFlow = useGitHubDeviceFlow(handleOAuthSuccess);

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
    if (!isValidToken(token)) {
      // No valid token — start GitHub OAuth Device Flow
      setDeviceFlowOpen(true);
      deviceFlow.start();
      return;
    }
    runExplain(token!);
  };

  const openManualTokenModal = () => {
    // Cancel Device Flow and switch to manual entry
    deviceFlow.cancel();
    setDeviceFlowOpen(false);
    setTokenInput("");
    setTokenPromptOpen(true);
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

  const cancelDeviceFlow = () => {
    deviceFlow.cancel();
    setDeviceFlowOpen(false);
  };

  const callAIForGenerator = async (prompt: string): Promise<string> => {
    const token = localStorage.getItem(AI_TOKEN_KEY);
    if (!isValidToken(token)) throw new Error("No valid AI token");
    return callAI(token!, prompt, 8192);
  };

  const handleGeneratorNeedToken = () => {
    setGeneratorOpen(false);
    setDeviceFlowOpen(true);
    deviceFlow.start();
  };

  const openGitHub = (verificationUri: string) => {
    const opened = window.open(verificationUri, "_blank");
    if (!opened) {
      // Popup blocked — show the URL as fallback (handled in modal UI)
      message.info(`Please open ${verificationUri} in your browser and enter the code.`);
    }
  };

  // Derive Device Flow modal body based on current state
  const renderDeviceFlowContent = () => {
    const { state } = deviceFlow;

    if (state.status === "requesting") {
      return (
        <div className="py-8 text-center text-zinc-400 text-sm">
          <LoadingOutlined className="mr-2" />
          Contacting GitHub…
        </div>
      );
    }

    if (state.status === "awaiting_user" || state.status === "polling") {
      const { userCode, verificationUri } = state;
      return (
        <div className="space-y-4">
          <Typography.Paragraph className="text-sm text-zinc-600">
            Enter the code below on GitHub to authorize access to GitHub Models.
          </Typography.Paragraph>
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-6 py-4 text-center">
            <div className="text-2xl font-mono font-bold tracking-widest text-amber-700 select-all">
              {userCode}
            </div>
            <div className="text-xs text-amber-500 mt-1">Click to copy</div>
          </div>
          <Button
            type="primary"
            icon={<GithubOutlined />}
            block
            onClick={() => openGitHub(verificationUri)}
          >
            Open GitHub to authorize
          </Button>
          {state.status === "polling" && (
            <div className="text-center text-xs text-zinc-400">
              <LoadingOutlined className="mr-1" />
              Waiting for authorization…
            </div>
          )}
        </div>
      );
    }

    if (state.status === "expired") {
      return (
        <div className="py-4 text-center">
          <Typography.Text type="danger" className="text-sm">
            Authorization timed out — please try again.
          </Typography.Text>
          <div className="mt-3">
            <Button onClick={() => deviceFlow.start()}>Try again</Button>
          </div>
        </div>
      );
    }

    if (state.status === "denied") {
      return (
        <div className="py-4 text-center">
          <Typography.Text type="danger" className="text-sm">
            Authorization was denied on GitHub. You can also paste a token manually.
          </Typography.Text>
        </div>
      );
    }

    if (state.status === "error") {
      return (
        <div className="py-4 text-center">
          <Typography.Text type="danger" className="text-sm">
            {state.message}
          </Typography.Text>
          <div className="mt-3">
            <Button onClick={() => deviceFlow.start()}>Try again</Button>
          </div>
        </div>
      );
    }

    return null;
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
          {isMobile ? (
            <>
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    {
                      key: "straighten",
                      label: "Straighten",
                      onClick: () => onStraighten?.(),
                      disabled: !!isLoading,
                    },
                    {
                      key: "explain",
                      label: "Explain",
                      icon: <BulbOutlined />,
                      onClick: explainFlow,
                      disabled: !!isLoading,
                    },
                    {
                      key: "generate",
                      label: "Generate",
                      icon: <RobotOutlined />,
                      onClick: () => setGeneratorOpen(true),
                    },
                    {
                      key: "jsonpath",
                      label: "JsonPath",
                      onClick: () => setJsonPathOpen(true),
                    },
                    {
                      key: "run",
                      label: "Run",
                      onClick: () => runFlow(),
                      disabled: !!isLoading,
                    },
                  ],
                }}
              >
                <Button size="small" icon={<EllipsisOutlined />} aria-label="More actions" />
              </Dropdown>
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
            </>
          ) : (
            <>
              <Button
                size="small"
                onClick={() => onStraighten?.()}
                disabled={isLoading}
                className="text-xs font-medium text-zinc-600 border-zinc-300 hover:border-zinc-400 hover:text-zinc-800"
              >
                Straighten
              </Button>
              <Button
                size="small"
                icon={<BulbOutlined />}
                onClick={explainFlow}
                disabled={isLoading}
                className="text-xs font-medium text-amber-600 border-amber-300 hover:border-amber-400 hover:text-amber-700"
              >
                Explain
              </Button>
              <Button
                size="small"
                icon={<RobotOutlined />}
                onClick={() => setGeneratorOpen(true)}
                className="text-xs font-medium text-indigo-600 border-indigo-300 hover:border-indigo-400 hover:text-indigo-700"
              >
                Generate
              </Button>
              <Button
                size="small"
                onClick={() => setJsonPathOpen(true)}
                className="text-xs font-medium text-zinc-600 border-zinc-300 hover:border-zinc-400 hover:text-zinc-800"
              >
                JsonPath
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
            </>
          )}
        </Space>
      </Flex>

      {/* GitHub OAuth Device Flow modal */}
      <Modal
        title={
          <Space>
            <GithubOutlined />
            <span>Authorize with GitHub</span>
          </Space>
        }
        open={deviceFlowOpen}
        onCancel={cancelDeviceFlow}
        footer={
          <Space>
            <Button type="link" size="small" className="text-xs text-zinc-400" onClick={openManualTokenModal}>
              Paste a token manually
            </Button>
            <Button onClick={cancelDeviceFlow}>Cancel</Button>
          </Space>
        }
        width={420}
      >
        {renderDeviceFlowContent()}
      </Modal>

      {/* Manual token entry modal (fallback) */}
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
          <strong>GitHub token</strong> (PAT <code>ghp_…</code> / fine-grained <code>github_pat_…</code>, or{" "}
          device-flow OAuth <code>gho_…</code>) with GitHub Models access. Stored in <code>localStorage</code> — never
          sent to this server.
        </Typography.Paragraph>
        <Input.Password
          placeholder="sk-ant-… or ghp_… / gho_…"
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
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <SimpleMarkdown content={explainResult} />
          </div>
        ) : null}
      </Modal>

      <JsonPathModal open={jsonPathOpen} onClose={() => setJsonPathOpen(false)} />

      <WorkflowGeneratorModal
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onGenerated={(wf) => { onWorkflowGenerated?.(wf); }}
        callAI={callAIForGenerator}
        isTokenAvailable={isValidToken(localStorage.getItem(AI_TOKEN_KEY))}
        onNeedToken={handleGeneratorNeedToken}
      />

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

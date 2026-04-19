import { ArrowLeftOutlined, BulbOutlined, EllipsisOutlined, GithubOutlined, LoadingOutlined, RobotOutlined } from "@ant-design/icons";
import { Link } from "@tanstack/react-router";
import { Dropdown, Flex, Space, Button, message, Modal, Input, Typography } from "antd";
import type { WorkFlow } from "@/api/types";
import { useSaveWorkflow } from "@/api/hooks/workflow";
import { onlineApi } from "@/api/services/online";
import React, { useState } from "react";
import { SimpleMarkdown } from "./SimpleMarkdown";
import { JsonPathModal } from "./JsonPathModal";
import { WorkflowGeneratorModal } from "./WorkflowGeneratorModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAIExplain } from "./useAIExplain";
import { isValidToken, getStoredToken } from "@/utils/tokenStorage";
import { callAIForGenerator } from "@/services/aiGeneratorService";

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
  const [jsonPathOpen, setJsonPathOpen] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);

  const aiExplain = useAIExplain();

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

  const getWorkflow = () => (onSave ? onSave() : workFlow) ?? null;

  const handleGeneratorNeedToken = () => {
    setGeneratorOpen(false);
    aiExplain.setDeviceFlowOpen(true);
    aiExplain.deviceFlow.start();
  };

  const openGitHub = (verificationUri: string) => {
    const opened = window.open(verificationUri, "_blank");
    if (!opened) {
      message.info(`Please open ${verificationUri} in your browser and enter the code.`);
    }
  };

  const renderDeviceFlowContent = () => {
    const { state } = aiExplain.deviceFlow;

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
            <Button onClick={() => aiExplain.deviceFlow.start()}>Try again</Button>
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
            <Button onClick={() => aiExplain.deviceFlow.start()}>Try again</Button>
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
        className="py-2 px-4 bg-white"
        style={{ minHeight: 44, borderBottom: "1px solid #c6c6c6" }}
      >
        <Space size={"middle"}>
          <Link to={`/workflows`}>
            <ArrowLeftOutlined style={{ color: "#525252" }} className="hover:text-[#161616] transition-colors" />
          </Link>
          <div className="flex flex-col">
            <span className="font-semibold text-[13px] tracking-[0.16px]" style={{ color: "#161616" }}>
              {isLoading ? "Loading..." : applicationName}
            </span>
          </div>
        </Space>
        <Space size={"small"}>
          {isMobile ? (
            <>
              <Dropdown
                trigger={["click"]}
                overlayClassName="carbon-dropdown"
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
                      onClick: () => aiExplain.explainFlow(getWorkflow, applicationName),
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
                className="text-xs font-medium"
                style={{ color: "#525252", borderColor: "#c6c6c6", borderRadius: 0 }}
              >
                Straighten
              </Button>
              <Button
                size="small"
                icon={<BulbOutlined />}
                onClick={() => aiExplain.explainFlow(getWorkflow, applicationName)}
                disabled={isLoading}
                className="text-xs font-medium"
                style={{ color: "#0f62fe", borderColor: "#0f62fe", borderRadius: 0 }}
              >
                Explain
              </Button>
              <Button
                size="small"
                icon={<RobotOutlined />}
                onClick={() => setGeneratorOpen(true)}
                className="text-xs font-medium"
                style={{ color: "#0f62fe", borderColor: "#0f62fe", borderRadius: 0 }}
              >
                Generate
              </Button>
              <Button
                size="small"
                onClick={() => setJsonPathOpen(true)}
                className="text-xs font-medium"
                style={{ color: "#525252", borderColor: "#c6c6c6", borderRadius: 0 }}
              >
                JsonPath
              </Button>
              <Button size="small" onClick={() => runFlow()} disabled={isLoading}
                className="text-xs font-medium"
                style={{ color: "#525252", borderColor: "#c6c6c6", borderRadius: 0 }}>
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

      <Modal
        title={
          <Space>
            <GithubOutlined />
            <span>Authorize with GitHub</span>
          </Space>
        }
        open={aiExplain.deviceFlowOpen}
        onCancel={aiExplain.cancelDeviceFlow}
        footer={
          <Space>
            <Button type="link" size="small" className="text-xs text-zinc-400" onClick={aiExplain.openManualTokenModal}>
              Paste a token manually
            </Button>
            <Button onClick={aiExplain.cancelDeviceFlow}>Cancel</Button>
          </Space>
        }
        width={420}
      >
        {renderDeviceFlowContent()}
      </Modal>

      <Modal
        title="Set AI Token"
        open={aiExplain.tokenPromptOpen}
        onCancel={() => aiExplain.setTokenPromptOpen(false)}
        onOk={() => aiExplain.saveTokenAndExplain(getWorkflow, applicationName)}
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
          value={aiExplain.tokenInput}
          onChange={(e) => aiExplain.setTokenInput(e.target.value)}
          onPressEnter={() => aiExplain.saveTokenAndExplain(getWorkflow, applicationName)}
          autoFocus
        />
      </Modal>

      <Modal
        title={
          <Space>
            <BulbOutlined className="text-amber-500" />
            <span>AI Workflow Explainer — {applicationName}</span>
          </Space>
        }
        open={aiExplain.explainOpen}
        onCancel={() => aiExplain.setExplainOpen(false)}
        footer={
          <Space>
            <Button size="small" onClick={aiExplain.clearToken} type="text" className="text-zinc-400 text-xs">
              Clear token
            </Button>
            <Button onClick={() => aiExplain.setExplainOpen(false)}>Close</Button>
          </Space>
        }
        width={680}
      >
        {aiExplain.explainLoading ? (
          <div className="py-10 text-center text-zinc-400 text-sm">
            Analysing workflow with AI…
          </div>
        ) : aiExplain.explainResult ? (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <SimpleMarkdown content={aiExplain.explainResult} />
          </div>
        ) : null}
      </Modal>

      <JsonPathModal open={jsonPathOpen} onClose={() => setJsonPathOpen(false)} />

      <WorkflowGeneratorModal
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onGenerated={(wf) => { onWorkflowGenerated?.(wf); }}
        callAI={callAIForGenerator}
        isTokenAvailable={isValidToken(getStoredToken())}
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

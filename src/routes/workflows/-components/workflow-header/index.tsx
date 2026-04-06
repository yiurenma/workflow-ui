import { ArrowLeftOutlined } from "@ant-design/icons";
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

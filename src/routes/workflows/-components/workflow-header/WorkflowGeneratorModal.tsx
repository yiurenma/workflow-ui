import React, { useState } from "react";
import { Modal, Input, Button, Typography, Space, message } from "antd";
import { RobotOutlined, LoadingOutlined } from "@ant-design/icons";
import type { WorkFlow } from "@/api/types";

export const WORKFLOW_GENERATOR_SYSTEM_PROMPT = `You are an expert workflow architect. Given a plain-English description of a business process, you output a JSON workflow definition that conforms exactly to the following schema.

Schema:
{
  "pluginList": [
    {
      "id": number,
      "description": string,
      "linkingIdOfRuleListAndAction": string,
      "ruleList": [
        { "id": number, "key": string (JSONPath expression), "remark": string }
      ],
      "action": {
        "type": "HTTP" | "IF_ELSE" | "FUNCTION" | "MESSAGE",
        "provider": string,
        "httpRequestMethod": "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        "httpRequestUrlWithQueryParameter": string,
        "httpRequestBody": string,
        "remark": string
      },
      "uiMap": { "id": string, "type": string, "position": { "x": number, "y": number } }
    }
  ],
  "uiMapList": [
    { "id": string, "source": string, "target": string, "type": "buttonEdge" }
  ]
}

Rules:
- Each plugin in pluginList must have a unique numeric id (starting at 1).
- linkingIdOfRuleListAndAction must match uiMap.id.
- uiMapList entries connect pluginList nodes using their uiMap.id values as source/target.
- Positions should be laid out top-to-bottom: x=300, y = (index * 150).
- ruleList should use realistic JSONPath expressions (e.g. $.customer.status).
- All string values must be non-empty.
- Output ONLY valid JSON. No markdown, no explanation, no code fences. Raw JSON object only.`;

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (workflow: WorkFlow) => void;
  callAI: (prompt: string) => Promise<string>;
  isTokenAvailable: boolean;
  onNeedToken: () => void;
};

export const WorkflowGeneratorModal: React.FC<Props> = ({
  open,
  onClose,
  onGenerated,
  callAI,
  isTokenAvailable,
  onNeedToken,
}) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const generate = async () => {
    if (!isTokenAvailable) {
      onNeedToken();
      return;
    }
    if (!userPrompt.trim()) {
      message.error("Please describe the workflow first");
      return;
    }

    setLoading(true);
    setRawResult(null);
    setParseError(null);

    const fullPrompt = `${WORKFLOW_GENERATOR_SYSTEM_PROMPT}\n\nUser request:\n${userPrompt.trim()}`;

    try {
      const result = await callAI(fullPrompt);
      setRawResult(result);

      // Strip possible markdown code fences if the model adds them despite instructions
      const cleaned = result.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      const parsed = JSON.parse(cleaned) as WorkFlow;

      if (!Array.isArray(parsed.pluginList)) {
        throw new Error("Generated JSON is missing pluginList array");
      }

      onGenerated(parsed);
      message.success("Workflow generated — review and save when ready");
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setParseError(`Failed to parse AI response: ${msg}`);
      message.error("Generation failed — see error below");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined className="text-indigo-500" />
          <span>AI Workflow Generator</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={generate}
            disabled={loading}
            icon={loading ? <LoadingOutlined /> : <RobotOutlined />}
          >
            {loading ? "Generating…" : "Generate"}
          </Button>
        </Space>
      }
      width={560}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle" className="mt-2">
        <Typography.Text className="text-sm text-zinc-600">
          Describe the business process in plain English. The AI will produce a draft workflow
          definition which will replace the current canvas. You can edit it before saving.
        </Typography.Text>
        <div>
          <Typography.Text className="text-xs text-slate-500">Business process description</Typography.Text>
          <Input.TextArea
            rows={6}
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="e.g. Check customer eligibility, then call the pricing service, and finally send a confirmation notification."
            className="mt-1"
            autoFocus
          />
        </div>
        {!isTokenAvailable && (
          <Typography.Text type="warning" className="text-xs">
            No AI token saved — clicking Generate will prompt you to log in with GitHub or paste a token.
          </Typography.Text>
        )}
        {parseError && (
          <Typography.Text type="danger" className="text-xs">
            {parseError}
          </Typography.Text>
        )}
        {rawResult && parseError && (
          <pre className="rounded bg-slate-50 p-2 text-xs max-h-40 overflow-auto">{rawResult}</pre>
        )}
      </Space>
    </Modal>
  );
};

import { Modal, Button, Typography, Space, Alert, Collapse } from "antd";
import { UploadOutlined, ImportOutlined } from "@ant-design/icons";
import React, { useState, useRef } from "react";
import type { WorkFlow, BackendPlugin } from "@/api/types";

interface ImportWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (workflow: WorkFlow) => void;
  hasExistingWorkflow: boolean;
}

interface ValidationError {
  path: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  summary: {
    nodeCount: number;
    edgeCount: number;
  };
}

const EXAMPLE_JSON = `{
  "pluginList": [
    {
      "id": 1,
      "description": "Fetch data",
      "linkingIdOfRuleListAndAction": "rule-1",
      "ruleList": [
        { "key": "$.data.amount", "remark": "Amount exists" }
      ],
      "action": {
        "type": "CONSUMER",
        "provider": "http",
        "remark": "GET /api/data"
      }
    },
    {
      "id": 2,
      "description": "Process result",
      "linkingIdOfRuleListAndAction": "rule-2",
      "ruleList": [
        { "key": "$.data.status", "remark": "Status exists" }
      ],
      "action": {
        "type": "FUNCTION_V2",
        "provider": "compute",
        "remark": "Calculate total"
      }
    }
  ],
  "uiMapList": [
    { "id": "edge-1", "source": "1", "target": "2" }
  ]
}`;

const VALID_PLUGIN_TYPES = [
  "CONSUMER",
  "CONSUMERWITHOUTERROR",
  "IFELSE",
  "MESSAGE",
  "FUNCTION_V2",
  "FUNCTION_V3"
];

function stripCodeFences(input: string): string {
  return input
    .replace(/^```(?:json)?\s*\n?/m, "")
    .replace(/\n?```\s*$/m, "")
    .trim();
}

function validateWorkflow(json: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    errors.push({ path: "root", message: "Must be a JSON object" });
    return { valid: false, errors, warnings, summary: { nodeCount: 0, edgeCount: 0 } };
  }

  const obj = json as Record<string, unknown>;

  if (!("pluginList" in obj)) {
    errors.push({ path: "pluginList", message: "Required field missing" });
  }
  if (!("uiMapList" in obj)) {
    errors.push({ path: "uiMapList", message: "Required field missing" });
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings, summary: { nodeCount: 0, edgeCount: 0 } };
  }

  const pluginList = obj.pluginList;
  const uiMapList = obj.uiMapList;

  if (!Array.isArray(pluginList)) {
    errors.push({ path: "pluginList", message: "Must be an array" });
  }
  if (!Array.isArray(uiMapList)) {
    errors.push({ path: "uiMapList", message: "Must be an array" });
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings, summary: { nodeCount: 0, edgeCount: 0 } };
  }

  const plugins = pluginList as BackendPlugin[];
  const edges = uiMapList as Array<{ source?: string; target?: string }>;

  // Validate plugins
  const ids: (string | number)[] = [];
  plugins.forEach((plugin, index) => {
    if (plugin.id == null) {
      errors.push({ path: `pluginList[${index}].id`, message: "Plugin ID required" });
    } else {
      ids.push(plugin.id);
    }

    if (plugin.action?.type) {
      if (!VALID_PLUGIN_TYPES.includes(plugin.action.type)) {
        errors.push({
          path: `pluginList[${index}].action.type`,
          message: `Invalid plugin type: "${plugin.action.type}" (must be one of: ${VALID_PLUGIN_TYPES.join(", ")})`,
        });
      }
    }

    if (Array.isArray(plugin.ruleList)) {
      plugin.ruleList.forEach((rule, ruleIndex) => {
        if (!rule.key) {
          errors.push({
            path: `pluginList[${index}].ruleList[${ruleIndex}].key`,
            message: "Rule key required",
          });
        }
      });
    }
  });

  // Check duplicate IDs
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) {
    errors.push({
      path: "pluginList",
      message: `Duplicate plugin IDs: ${[...new Set(duplicates)].join(", ")}`,
    });
  }

  // Validate edge references
  const pluginIds = new Set(plugins.map((p) => String(p.id)));
  edges.forEach((edge, index) => {
    if (edge.source && !pluginIds.has(String(edge.source))) {
      errors.push({
        path: `uiMapList[${index}].source`,
        message: `Edge source "${edge.source}" does not exist in pluginList`,
      });
    }
    if (edge.target && !pluginIds.has(String(edge.target))) {
      errors.push({
        path: `uiMapList[${index}].target`,
        message: `Edge target "${edge.target}" does not exist in pluginList`,
      });
    }
  });

  // Warnings: orphaned nodes
  if (edges.length > 0) {
    const connectedIds = new Set([
      ...edges.map((e) => String(e.source)),
      ...edges.map((e) => String(e.target)),
    ]);
    plugins.forEach((plugin) => {
      if (plugin.id != null && !connectedIds.has(String(plugin.id))) {
        warnings.push(`Node ${plugin.id} ("${plugin.description || "unnamed"}") has no connections`);
      }
    });
  }

  if (plugins.length > 100) {
    warnings.push(`Large workflow: ${plugins.length} nodes may impact canvas performance`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: { nodeCount: plugins.length, edgeCount: edges.length },
  };
}

export const ImportWorkflowModal: React.FC<ImportWorkflowModalProps> = ({
  open,
  onClose,
  onApply,
  hasExistingWorkflow,
}) => {
  const [jsonText, setJsonText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parsedWorkflow, setParsedWorkflow] = useState<WorkFlow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonText(value);
    setParseError(null);
    setValidation(null);
    setParsedWorkflow(null);

    if (!value.trim()) return;

    try {
      const stripped = stripCodeFences(value);
      const parsed = JSON.parse(stripped);
      const result = validateWorkflow(parsed);
      setValidation(result);
      if (result.valid) {
        setParsedWorkflow(parsed as WorkFlow);
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setJsonText(text);
      setParseError(null);
      setValidation(null);
      setParsedWorkflow(null);
      try {
        const stripped = stripCodeFences(text);
        const parsed = JSON.parse(stripped);
        const result = validateWorkflow(parsed);
        setValidation(result);
        if (result.valid) {
          setParsedWorkflow(parsed as WorkFlow);
        }
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Invalid JSON");
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-uploaded
    e.target.value = "";
  };

  const handleApply = () => {
    if (!parsedWorkflow) return;

    if (hasExistingWorkflow) {
      Modal.confirm({
        title: "Replace current workflow?",
        content: "This will replace the current canvas workflow with the imported one. This action cannot be undone.",
        okText: "Replace",
        okType: "danger",
        onOk: () => {
          onApply(parsedWorkflow);
          handleClose();
        },
      });
    } else {
      onApply(parsedWorkflow);
      handleClose();
    }
  };

  const handleClose = () => {
    setJsonText("");
    setParseError(null);
    setValidation(null);
    setParsedWorkflow(null);
    onClose();
  };

  const canApply = parsedWorkflow !== null && validation?.valid === true;

  return (
    <Modal
      title={
        <Space>
          <ImportOutlined />
          <span>Import Workflow from JSON</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={
        <Space>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="primary" onClick={handleApply} disabled={!canApply}>
            Apply to Canvas
          </Button>
        </Space>
      }
      width={640}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Typography.Paragraph style={{ color: "#525252", fontSize: 14, marginBottom: 0 }}>
          Paste or upload a JSON string representing a complete workflow. The system will validate it before replacing the canvas.
        </Typography.Paragraph>

        <Alert
          type="info"
          showIcon
          message={
            <span style={{ fontSize: 13 }}>
              This is for <strong>structured workflow JSON</strong> only — not plain English.
              Use <strong>Generate</strong> to create workflows from natural language.
            </span>
          }
          style={{ borderRadius: 0 }}
        />

        <Collapse
          size="small"
          style={{ borderRadius: 0 }}
          items={[
            {
              key: "example",
              label: "What belongs here?",
              children: (
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <Typography.Text style={{ fontSize: 13, color: "#525252" }}>
                    A valid <code>WorkFlow</code> JSON object with <code>pluginList</code> and <code>uiMapList</code> arrays — the same format the app saves. Plugin types: <code>CONSUMER</code>, <code>CONSUMERWITHOUTERROR</code>, <code>IFELSE</code>, <code>MESSAGE</code>, <code>FUNCTION_V2</code>, <code>FUNCTION_V3</code>.
                  </Typography.Text>
                  <pre
                    style={{
                      background: "#f4f4f4",
                      padding: 12,
                      fontSize: 12,
                      fontFamily: "'IBM Plex Mono', monospace",
                      overflow: "auto",
                      maxHeight: 200,
                      borderRadius: 0,
                      margin: 0,
                    }}
                  >
                    {EXAMPLE_JSON}
                  </pre>
                  <Typography.Text style={{ fontSize: 12, color: "#6f6f6f" }}>
                    Note: Save still persists to backend as usual after you apply and click Save.
                  </Typography.Text>
                </Space>
              ),
            },
          ]}
        />

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Typography.Text strong style={{ fontSize: 13 }}>Workflow JSON</Typography.Text>
            <Button
              size="small"
              icon={<UploadOutlined />}
              onClick={() => fileInputRef.current?.click()}
              style={{ borderRadius: 0 }}
            >
              Upload file
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </div>
          <textarea
            value={jsonText}
            onChange={handleTextChange}
            placeholder='Paste workflow JSON here, e.g. {"pluginList": [], "uiMapList": []}'
            style={{
              width: "100%",
              height: 200,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              padding: 12,
              border: "1px solid #c6c6c6",
              borderRadius: 0,
              resize: "vertical",
              outline: "none",
              background: "#f4f4f4",
              boxSizing: "border-box",
            }}
          />
        </div>

        {parseError && (
          <Alert
            type="error"
            showIcon
            message="JSON Parse Error"
            description={parseError}
            style={{ borderRadius: 0 }}
          />
        )}

        {validation && !validation.valid && (
          <Alert
            type="error"
            showIcon
            message={`Validation failed — ${validation.errors.length} error${validation.errors.length !== 1 ? "s" : ""}`}
            description={
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {validation.errors.map((err, i) => (
                  <li key={i} style={{ fontSize: 12 }}>
                    <code>{err.path}</code>: {err.message}
                  </li>
                ))}
              </ul>
            }
            style={{ borderRadius: 0 }}
          />
        )}

        {validation?.valid && (
          <Alert
            type="success"
            showIcon
            message={`Valid workflow — ${validation.summary.nodeCount} node${validation.summary.nodeCount !== 1 ? "s" : ""}, ${validation.summary.edgeCount} edge${validation.summary.edgeCount !== 1 ? "s" : ""}`}
            description={
              validation.warnings.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {validation.warnings.map((w, i) => (
                    <li key={i} style={{ fontSize: 12 }}>⚠ {w}</li>
                  ))}
                </ul>
              ) : undefined
            }
            style={{ borderRadius: 0 }}
          />
        )}
      </Space>
    </Modal>
  );
};

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
  summary: { nodeCount: number; edgeCount: number };
}

const EXAMPLE_JSON = `{
  "pluginList": [
    {
      "id": 1,
      "description": "Fetch data",
      "linkingIdOfRuleListAndAction": "rule-1",
      "ruleList": [{ "key": "$.data.amount", "remark": "Amount exists" }],
      "action": { "type": "CONSUMER", "provider": "http" }
    }
  ],
  "uiMapList": [{ "id": "edge-1", "source": "1", "target": "2" }]
}`;

const VALID_PLUGIN_TYPES = ["CONSUMER", "CONSUMERWITHOUTERROR", "IFELSE", "MESSAGE", "FUNCTION_V2", "FUNCTION_V3"];

function stripCodeFences(input: string): string {
  return input.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "").trim();
}

function isIFELSEBranchId(id: string, plugins: BackendPlugin[]): boolean {
  const match = id.match(/^(.+)_(true|false)$/i);
  if (!match) return false;
  const [, nodeId] = match;
  const parentNode = plugins.find((p) => String(p.id) === nodeId);
  return parentNode?.action?.type === "IFELSE";
}

function validateWorkflow(json: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    errors.push({ path: "root", message: "Must be a JSON object" });
    return { valid: false, errors, warnings, summary: { nodeCount: 0, edgeCount: 0 } };
  }

  const obj = json as Record<string, unknown>;

  if (!("pluginList" in obj)) errors.push({ path: "pluginList", message: "Required field missing" });
  if (!("uiMapList" in obj)) errors.push({ path: "uiMapList", message: "Required field missing" });
  if (errors.length > 0) return { valid: false, errors, warnings, summary: { nodeCount: 0, edgeCount: 0 } };

  const pluginList = obj.pluginList;
  const uiMapList = obj.uiMapList;

  if (!Array.isArray(pluginList)) errors.push({ path: "pluginList", message: "Must be an array" });
  if (!Array.isArray(uiMapList)) errors.push({ path: "uiMapList", message: "Must be an array" });
  if (errors.length > 0) return { valid: false, errors, warnings, summary: { nodeCount: 0, edgeCount: 0 } };

  const plugins = pluginList as BackendPlugin[];
  const edges = uiMapList as Array<{ source?: string; target?: string }>;

  const ids: (string | number)[] = [];
  plugins.forEach((plugin, index) => {
    if (plugin.id == null) {
      errors.push({ path: `pluginList[${index}].id`, message: "Plugin ID required" });
    } else {
      ids.push(plugin.id);
    }
    if (plugin.action?.type && !VALID_PLUGIN_TYPES.includes(plugin.action.type)) {
      errors.push({ path: `pluginList[${index}].action.type`, message: `Invalid plugin type: "${plugin.action.type}"` });
    }
    if (Array.isArray(plugin.ruleList)) {
      plugin.ruleList.forEach((rule, ruleIndex) => {
        if (!rule.key) errors.push({ path: `pluginList[${index}].ruleList[${ruleIndex}].key`, message: "Rule key required" });
      });
    }
  });

  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) {
    errors.push({ path: "pluginList", message: `Duplicate plugin IDs: ${[...new Set(duplicates)].join(", ")}` });
  }

  if (edges.length > 0) {
    const connectedIds = new Set([...edges.map((e) => String(e.source)), ...edges.map((e) => String(e.target))]);
    plugins.forEach((plugin) => {
      if (plugin.id != null && !connectedIds.has(String(plugin.id))) {
        warnings.push(`Node ${plugin.id} ("${plugin.description || "unnamed"}") has no connections`);
      }
    });
  }

  if (plugins.length > 100) {
    warnings.push(`Large workflow: ${plugins.length} nodes may impact canvas performance`);
  }

  return { valid: errors.length === 0, errors, warnings, summary: { nodeCount: plugins.length, edgeCount: edges.length } };
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processText = (value: string) => {
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
      if (result.valid) setParsedWorkflow(parsed as WorkFlow);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processText(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleApply = () => {
    if (!parsedWorkflow) return;
    if (hasExistingWorkflow) {
      if (!window.confirm("This will replace the current canvas workflow with the imported one. This action cannot be undone.")) return;
    }
    onApply(parsedWorkflow);
    handleClose();
  };

  const handleClose = () => {
    setJsonText(""); setParseError(null); setValidation(null); setParsedWorkflow(null);
    onClose();
  };

  const canApply = parsedWorkflow !== null && validation?.valid === true;

  if (!open) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <span className="modal-title">⬇ Import Workflow from JSON</span>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 12, lineHeight: 1.6 }}>
            Paste or upload a JSON string representing a complete workflow. The system will validate it before replacing the canvas.
          </p>

          <div style={{ background: "#edf5ff", border: "1px solid #a6c8ff", padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#0f62fe" }}>
            ℹ This is for <strong>structured workflow JSON</strong> only — not plain English. Use <strong>Generate</strong> to create workflows from natural language.
          </div>

          <details style={{ marginBottom: 16, border: "1px solid #e0e0e0" }} open={detailsOpen} onToggle={(e) => setDetailsOpen((e.currentTarget as HTMLDetailsElement).open)}>
            <summary style={{ padding: "8px 12px", background: "#f4f4f4", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#525252", userSelect: "none" }}>
              What belongs here?
            </summary>
            <div style={{ padding: 12 }}>
              <p style={{ fontSize: 12, color: "#525252", marginBottom: 8 }}>
                A valid WorkFlow JSON with <code style={{ fontFamily: '"IBM Plex Mono",monospace', background: "#f4f4f4", padding: "1px 4px" }}>pluginList</code> and <code style={{ fontFamily: '"IBM Plex Mono",monospace', background: "#f4f4f4", padding: "1px 4px" }}>uiMapList</code>. Plugin types: {VALID_PLUGIN_TYPES.join(", ")}.
              </p>
              <pre style={{ background: "#f4f4f4", padding: "10px 12px", fontSize: 11, fontFamily: '"IBM Plex Mono",monospace', overflow: "auto", maxHeight: 180, margin: 0, border: "1px solid #e0e0e0" }}>{EXAMPLE_JSON}</pre>
            </div>
          </details>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#161616" }}>Workflow JSON</span>
              <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>⬆ Upload file</button>
              <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleFileUpload} />
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => processText(e.target.value)}
              placeholder='Paste workflow JSON here…'
              style={{
                width: "100%", height: 200,
                fontFamily: '"IBM Plex Mono",monospace', fontSize: 12,
                padding: 12, border: `1px solid ${parseError ? "#da1e28" : "#c6c6c6"}`,
                resize: "vertical", outline: "none", background: "#f4f4f4",
                boxSizing: "border-box", borderRadius: 0,
              }}
            />
          </div>

          {parseError && (
            <div style={{ background: "#fff1f1", border: "1px solid #ffb3b8", padding: "10px 14px", marginBottom: 8, fontSize: 12 }}>
              <strong style={{ color: "#da1e28" }}>JSON Parse Error</strong><br />
              <span style={{ color: "#da1e28" }}>{parseError}</span>
            </div>
          )}

          {validation && !validation.valid && (
            <div style={{ background: "#fff1f1", border: "1px solid #ffb3b8", padding: "10px 14px", marginBottom: 8, fontSize: 12 }}>
              <strong style={{ color: "#da1e28" }}>Validation failed — {validation.errors.length} error{validation.errors.length !== 1 ? "s" : ""}</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                {validation.errors.map((e, i) => (
                  <li key={i}><code style={{ fontFamily: '"IBM Plex Mono",monospace' }}>{e.path}</code>: {e.message}</li>
                ))}
              </ul>
            </div>
          )}

          {validation?.valid && (
            <div style={{ background: "#defbe6", border: "1px solid #a7f0ba", padding: "10px 14px", fontSize: 12 }}>
              <strong style={{ color: "#198038" }}>✓ Valid workflow — {validation.summary.nodeCount} node{validation.summary.nodeCount !== 1 ? "s" : ""}, {validation.summary.edgeCount} edge{validation.summary.edgeCount !== 1 ? "s" : ""}</strong>
              {validation.warnings.length > 0 && (
                <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                  {validation.warnings.map((w, i) => <li key={i} style={{ fontSize: 12 }}>⚠ {w}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply} disabled={!canApply}>Apply to Canvas</button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import JSON5 from "json5";
import type { WorkFlow } from "@/api/types";
import { useToast } from "@/contexts/ToastContext";

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

Node Types and Their Purposes:
- HTTP (Consumer): Fetch data from external APIs - use for GET/POST requests to external services
- MESSAGE (Dispatch): Send messages to channels - use for notifications, webhooks, message queuing
- IF_ELSE (Condition): Branch based on conditions - use for conditional logic and routing
- FUNCTION (Transform): Transform data with logic - use for data manipulation, enrichment, calculations

Edge Connection Semantics:
- Each edge in uiMapList connects two nodes using their uiMap.id values
- source: the uiMap.id of the node where the flow starts
- target: the uiMap.id of the node where the flow goes next
- Edges define execution order: source node runs first, then target node
- First node should have no incoming edges (no other node points to it)
- All other nodes should have at least one incoming edge

Layout Guidance:
- Positions should be laid out top-to-bottom for readability: x=300, y = (index * 150)
- This creates a vertical flow that is easy to understand
- First node at y=0, second at y=150, third at y=300, etc.

Rules:
- Each plugin in pluginList must have a unique numeric id (starting at 1).
- linkingIdOfRuleListAndAction must match uiMap.id.
- uiMapList entries connect pluginList nodes using their uiMap.id values as source/target.
- ruleList should use realistic JSONPath expressions (e.g. $.customer.status).
- All string values must be non-empty.
- Output ONLY valid RFC 8259 JSON. All property names MUST be double-quoted strings. No single quotes, no unquoted keys, no trailing commas, no comments.
- No markdown, no explanation, no code fences. Raw JSON object only.`;

type Props = {
  open: boolean;
  onClose: () => void;
  onGenerated: (workflow: WorkFlow) => void;
  callAI: (prompt: string, onProgress?: (msg: string) => void) => Promise<string>;
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
  const { showToast } = useToast();
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Generating…");
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const generate = async () => {
    if (!isTokenAvailable) {
      onNeedToken();
      return;
    }
    if (!userPrompt.trim()) {
      showToast("Please describe the workflow first", "error");
      return;
    }

    setLoading(true);
    setLoadingText("Generating…");
    setRawResult(null);
    setParseError(null);

    const fullPrompt = `${WORKFLOW_GENERATOR_SYSTEM_PROMPT}\n\nUser request:\n${userPrompt.trim()}`;

    try {
      const result = await callAI(fullPrompt, (msg) => setLoadingText(msg));
      setRawResult(result);

      // Strip markdown code fences and extract the JSON object/array portion
      let cleaned = result.trim();
      // Remove leading/trailing code fences
      cleaned = cleaned.replace(/^```(?:json5?|javascript|js)?\s*/i, "").replace(/\s*```\s*$/i, "");
      // If still contains fences (multi-block), extract between first { and last }
      if (!cleaned.startsWith("{")) {
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start !== -1 && end !== -1) cleaned = cleaned.slice(start, end + 1);
      }

      // Truncation detection — response was cut off before the closing brace
      if (!cleaned.trimEnd().endsWith("}")) {
        throw new Error(
          "The AI response was cut off before it finished (token limit reached). " +
          "Try describing a simpler workflow with fewer steps, or break it into smaller parts."
        );
      }

      // Use JSON5 to parse — tolerates unquoted keys, trailing commas, comments
      const parsed = JSON5.parse(cleaned) as WorkFlow;

      if (!Array.isArray(parsed.pluginList)) {
        throw new Error("Generated JSON is missing pluginList array");
      }

      onGenerated(parsed);
      showToast("Workflow generated — review and save when ready", "success");
      onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setParseError(`Failed to parse AI response: ${msg}`);
      showToast("Generation failed — see error below", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">AI Workflow Generator</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 16, lineHeight: 1.6 }}>
            Describe the business process in plain English. The AI will produce a draft workflow
            definition which will replace the current canvas. You can edit it before saving.
          </p>
          <div className="form-group">
            <label className="cds-label">Business process description</label>
            <textarea
              className="cds-input"
              rows={6}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g. Check customer eligibility, then call the pricing service, and finally send a confirmation notification."
              autoFocus
              style={{ resize: "vertical" }}
            />
          </div>
          {loading && loadingText !== "Generating…" && (
            <div style={{ fontSize: 12, color: "#0f62fe", marginTop: 8 }}>⟳ {loadingText}</div>
          )}
          {!isTokenAvailable && !loading && (
            <div style={{ fontSize: 12, color: "#D97706", marginTop: 8 }}>
              No AI token saved — clicking Generate will prompt you to log in with GitHub or paste a token.
            </div>
          )}
          {parseError && (
            <div style={{ fontSize: 12, color: "#da1e28", marginTop: 8 }}>{parseError}</div>
          )}
          {rawResult && parseError && (
            <pre style={{ marginTop: 8, background: "#f4f4f4", padding: 12, fontSize: 11, maxHeight: 160, overflow: "auto", fontFamily: '"IBM Plex Mono",monospace' }}>
              {rawResult}
            </pre>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={generate}
            disabled={loading}
          >
            {loading ? loadingText : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

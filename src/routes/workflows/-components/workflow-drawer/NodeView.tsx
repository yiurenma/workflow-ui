import React from "react";
import { Node } from "@xyflow/react";
import type { BackendPlugin, BackendWorkflowRule, BackendWorkflowType } from "@/api/types/operation";
import NodeSection from "./NodeSection";

type NodeViewProps = {
  selectedNode: Node;
};

const NodeView: React.FC<NodeViewProps> = ({ selectedNode }) => {
  const bp = selectedNode?.data?.backendPlugin as BackendPlugin | undefined;
  const action = bp?.action as BackendWorkflowType | undefined;

  const description = (bp?.description as string | undefined) || "No description";
  const ruleList = bp?.ruleList as BackendWorkflowRule[] | undefined;

  const formatJson = (value: unknown): string => {
    if (!value) return "—";
    if (typeof value === "string") {
      try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; }
    }
    return JSON.stringify(value, null, 2);
  };

  return (
    <div>
      <NodeSection title="Node Description" subtitle="The name shown on the canvas. What is this step called?">
        <p style={{ fontSize: 13, color: "#161616", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {description}
        </p>
      </NodeSection>

      <NodeSection title="Rules" subtitle="Run only when… — conditions that must all match before this step executes.">
        {ruleList && ruleList.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ruleList.map((rule, index) => (
              <div key={index} style={{ padding: "8px 10px", background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#525252", marginBottom: 4 }}>Rule {index + 1}</div>
                <div style={{ fontSize: 12, color: "#161616", marginBottom: 2 }}>
                  Key: <code style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 11, background: "#fff", padding: "1px 4px", border: "1px solid #e0e0e0" }}>{rule.key || "—"}</code>
                </div>
                {rule.remark && (
                  <div style={{ fontSize: 12, color: "#525252" }}>Remark: {rule.remark}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#525252" }}>No rules defined</p>
        )}
      </NodeSection>

      <NodeSection title="Action" subtitle="What the system does when this step runs." variant="inset">
        {action && Object.keys(action).length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(["provider", "type", "httpRequestMethod", "httpRequestUrlWithQueryParameter", "internalHttpRequestUrlWithQueryParameter"] as const).map((key) => {
              const val = action[key as keyof typeof action];
              if (!val) return null;
              const labels: Record<string, string> = {
                provider: "Provider",
                type: "Type",
                httpRequestMethod: "HTTP Method",
                httpRequestUrlWithQueryParameter: "External URL",
                internalHttpRequestUrlWithQueryParameter: "Internal URL",
              };
              return (
                <div key={key}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#525252", marginBottom: 2 }}>{labels[key]}</div>
                  <div style={{ fontSize: 12, color: "#161616", wordBreak: "break-all" }}>{String(val)}</div>
                </div>
              );
            })}
            {(["httpRequestHeaders", "httpRequestBody", "trackingNumberSchemaInHttpResponse", "elseLogic"] as const).map((key) => {
              const val = action[key as keyof typeof action];
              if (!val) return null;
              const labels: Record<string, string> = {
                httpRequestHeaders: "Request Headers",
                httpRequestBody: "Request Body",
                trackingNumberSchemaInHttpResponse: "Response Extraction",
                elseLogic: "Logic / Payload",
              };
              return (
                <div key={key}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#525252", marginBottom: 4 }}>{labels[key]}</div>
                  <pre style={{ fontSize: 11, fontFamily: '"IBM Plex Mono",monospace', background: "#fff", border: "1px solid #e0e0e0", padding: "8px 10px", overflow: "auto", maxHeight: 160, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                    {formatJson(val)}
                  </pre>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#525252" }}>No action configured</p>
        )}
      </NodeSection>
    </div>
  );
};

export default NodeView;
